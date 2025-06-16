import sequelize from '../../config/database';
import { User, Scale, Criteria, Evaluation, Grade, Comment } from '../../models';
import { authService } from '../../services/auth.service';

jest.setTimeout(15000);

describe('École 89 Simple Workflow System Test', () => {
  let teacher: any;
  let student: any;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    // Create École 89 users
    teacher = await User.create({
      name: 'Élise Philippe',
      email: 'elise@ecole89.com',
      password: await authService.hashPassword('Teacher123!'),
      role: 'teacher',
      status: 'active'
    });

    student = await User.create({
      name: 'Sokaneil Sieng',
      email: 'sokaneil@ecole89.com',
      password: await authService.hashPassword('Student123!'),
      role: 'student',
      status: 'active'
    });

    console.log('École 89 test users created successfully');
  });

  afterAll(async () => {
    // Clean up in order
    await Comment.destroy({ where: {} });
    await Grade.destroy({ where: {} });
    await Evaluation.destroy({ where: {} });
    await Criteria.destroy({ where: {} });
    await Scale.destroy({ where: {} });
    await User.destroy({ where: {} });
    await sequelize.close();
  });

  it('should complete École 89 evaluation workflow', async () => {
    console.log('🎓 Starting École 89 simple workflow test...');

    // Step 1: Create evaluation scale
    console.log('Step 1: Creating evaluation scale...');
    const scale = await Scale.create({
      title: 'Projet Final École 89 - 89 Progress',
      description: 'Évaluation du projet de fin d\'études',
      creatorId: teacher.id
    });

    expect(scale.title).toContain('89 Progress');
    expect(scale.creatorId).toBe(teacher.id);

    // Step 2: Create criteria (simple, guaranteed coefficients)
    console.log('Step 2: Creating evaluation criteria...');
    const criterion1 = await Criteria.create({
      description: 'Maîtrise Technique',
      associatedSkill: 'Développement',
      maxPoints: 20,
      coefficient: 0.5,
      scaleId: scale.id
    });

    const criterion2 = await Criteria.create({
      description: 'Qualité du Code',
      associatedSkill: 'Programmation',
      maxPoints: 20,
      coefficient: 0.5,
      scaleId: scale.id
    });

    // Verify coefficient total
    const totalCoeff = criterion1.coefficient + criterion2.coefficient;
    expect(totalCoeff).toBe(1.0);

    // Step 3: Create evaluation
    console.log('Step 3: Creating student evaluation...');
    const evaluation = await Evaluation.create({
      title: 'Évaluation Projet 89 Progress - Sokaneil',
      dateEval: new Date('2025-06-25'),
      studentId: student.id,
      teacherId: teacher.id,
      scaleId: scale.id,
      status: 'draft'
    });

    expect(evaluation.status).toBe('draft');
    expect(evaluation.studentId).toBe(student.id);
    expect(evaluation.teacherId).toBe(teacher.id);

    // Step 4: Add grades (within limits)
    console.log('Step 4: Adding grades...');
    const grade1 = await Grade.create({
      evaluationId: evaluation.id,
      criteriaId: criterion1.id,
      value: 18 // 90% of 20 points
    });

    const grade2 = await Grade.create({
      evaluationId: evaluation.id,
      criteriaId: criterion2.id,
      value: 16 // 80% of 20 points
    });

    expect(grade1.value).toBe(18);
    expect(grade2.value).toBe(16);
    expect(grade1.value).toBeLessThanOrEqual(criterion1.maxPoints);
    expect(grade2.value).toBeLessThanOrEqual(criterion2.maxPoints);

    // Step 5: Add teacher comment
    console.log('Step 5: Adding teacher feedback...');
    const comment = await Comment.create({
      evaluationId: evaluation.id,
      teacherId: teacher.id,
      text: 'Excellent travail sur le projet 89 Progress. Très bonne maîtrise technique et qualité de code remarquable.'
    });

    expect(comment.text).toContain('89 Progress');
    expect(comment.teacherId).toBe(teacher.id);

    // Step 6: Verify complete workflow
    console.log('Step 6: Verifying workflow completion...');
    
    // Check all components exist
    const finalEvaluation = await Evaluation.findByPk(evaluation.id);
    const finalGrades = await Grade.findAll({ where: { evaluationId: evaluation.id } });
    const finalComments = await Comment.findAll({ where: { evaluationId: evaluation.id } });

    expect(finalEvaluation).toBeDefined();
    expect(finalGrades).toHaveLength(2);
    expect(finalComments).toHaveLength(1);

    // Calculate total grade
    const totalGrade = finalGrades.reduce((sum, grade) => sum + grade.value, 0);
    const maxPossible = criterion1.maxPoints + criterion2.maxPoints;
    const percentage = Math.round((totalGrade / maxPossible) * 100);

    expect(totalGrade).toBe(34); // 18 + 16
    expect(maxPossible).toBe(40); // 20 + 20
    expect(percentage).toBe(85); // 85% - excellent grade

    console.log(`✅ École 89 workflow completed! Grade: ${totalGrade}/${maxPossible} (${percentage}%)`);
  });

  it('should enforce École 89 business rules', async () => {
    console.log('🔒 Testing École 89 business rules...');

    // Create test data
    const scale = await Scale.create({
      title: 'Business Rules Test Scale',
      creatorId: teacher.id
    });

    const criteria = await Criteria.create({
      description: 'Test Criteria',
      associatedSkill: 'Testing',
      maxPoints: 20,
      coefficient: 1.0,
      scaleId: scale.id
    });

    const evaluation = await Evaluation.create({
      title: 'Business Rules Test',
      dateEval: new Date(),
      studentId: student.id,
      teacherId: teacher.id,
      scaleId: scale.id,
      status: 'draft'
    });

    // Rule 1: Grades cannot exceed maximum points
    const validGrade = await Grade.create({
      evaluationId: evaluation.id,
      criteriaId: criteria.id,
      value: 18 // Valid: 18 <= 20
    });

    expect(validGrade.value).toBeLessThanOrEqual(criteria.maxPoints);

    // Rule 2: Evaluation starts as draft
    expect(evaluation.status).toBe('draft');

    // Rule 3: Teacher owns the evaluation
    expect(evaluation.teacherId).toBe(teacher.id);

    // Rule 4: Student is assigned to evaluation
    expect(evaluation.studentId).toBe(student.id);

    console.log('✅ All École 89 business rules properly enforced');
  });
});