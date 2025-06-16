import sequelize from '../../config/database';
import { User, Scale, Criteria, Evaluation, Grade, Comment } from '../../models';
import { authService } from '../../services/auth.service';
import logger from '../../utils/logger';
import { UserRole, UserStatus, EvaluationStatus } from '../../types';

async function seedDatabase() {
  try {
    // Start a transaction for database operations
    const t = await sequelize.transaction();
    
    try {
      // Force sync all tables (This will drop existing tables!)
      // Note: Sequelize sync doesn't accept transaction directly in options
      await sequelize.sync({ force: true });
      logger.info('Database synced');

      // Create users
      const [adminUser, teachers, students] = await Promise.all([
        seedAdmin(t),
        seedTeachers(t),
        seedStudents(t)
      ]);
      logger.info(`Users seeded: 1 admin, ${teachers.length} teachers, ${students.length} students`);

      // Create scales with criteria (by both admin and teachers)
      const adminScale = await seedScales([adminUser, ...teachers], t);
      logger.info('Scales and criteria seeded');

      // Create evaluations with grades and comments
      await seedEvaluations(teachers, students, adminScale, t);
      logger.info('Evaluations, grades, and comments seeded');

      // Commit the transaction
      await t.commit();
      logger.info('Database seeding completed successfully');
    } catch (error) {
      // Rollback transaction on error
      await t.rollback();
      logger.error('Error during seeding, transaction rolled back:', error);
      throw error;
    }
  } catch (error) {
    logger.error('Error setting up database transaction:', error);
    throw error;
  }
}

async function seedAdmin(transaction: any) {
  const adminData = {
    name: 'Admin User',
    email: 'admin@school.com',
    password: await authService.hashPassword('Admin@123'),
    role: 'admin' as UserRole,
    description: 'System administrator',
    status: 'active' as UserStatus
  };
  return User.create(adminData, { transaction });
}

async function seedTeachers(transaction: any) {
  const teachersData = [
    {
      name: 'John Smith',
      email: 'john.smith@school.com',
      password: await authService.hashPassword('Teacher1@123'),
      role: 'teacher' as UserRole,
      description: 'Mathematics Teacher',
      status: 'active' as UserStatus
    },
    {
      name: 'Marie Curie',
      email: 'marie.curie@school.com',
      password: await authService.hashPassword('Teacher2@123'),
      role: 'teacher' as UserRole,
      description: 'Science Teacher',
      status: 'active' as UserStatus
    }
  ];
  return User.bulkCreate(teachersData, { transaction });
}

async function seedStudents(transaction: any) {
  const studentsData = [
    {
      name: 'Alice Johnson',
      email: 'alice.j@school.com',
      password: await authService.hashPassword('Student1@123'),
      role: 'student' as UserRole,
      description: 'First year student',
      status: 'active' as UserStatus
    },
    {
      name: 'Bob Wilson',
      email: 'bob.w@school.com',
      password: await authService.hashPassword('Student2@123'),
      role: 'student' as UserRole,
      description: 'Second year student',
      status: 'active' as UserStatus
    },
    {
      name: 'Charlie Brown',
      email: 'charlie.b@school.com',
      password: await authService.hashPassword('Student3@123'),
      role: 'student' as UserRole,
      description: 'First year student',
      status: 'active' as UserStatus
    }
  ];
  return User.bulkCreate(studentsData, { transaction });
}

async function seedScales(teachers: User[], transaction: any) {
  const scalesData = [
    {
      title: 'Mathematics Mid-Term Evaluation',
      description: 'Evaluation criteria for mathematics mid-term assessment',
      creatorId: teachers[0].id,
      criteria: [
        {
          description: 'Problem Solving',
          associatedSkill: 'Analytical Thinking',
          maxPoints: 40,
          coefficient: 0.4
        },
        {
          description: 'Mathematical Concepts',
          associatedSkill: 'Knowledge',
          maxPoints: 30,
          coefficient: 0.3
        },
        {
          description: 'Presentation and Method',
          associatedSkill: 'Communication',
          maxPoints: 30,
          coefficient: 0.3
        }
      ]
    },
    {
      title: 'Science Project Evaluation',
      description: 'Evaluation criteria for science project assessment',
      creatorId: teachers[1].id,
      criteria: [
        {
          description: 'Research Methodology',
          associatedSkill: 'Research',
          maxPoints: 35,
          coefficient: 0.35
        },
        {
          description: 'Scientific Understanding',
          associatedSkill: 'Knowledge',
          maxPoints: 35,
          coefficient: 0.35
        },
        {
          description: 'Presentation Skills',
          associatedSkill: 'Communication',
          maxPoints: 30,
          coefficient: 0.3
        }
      ]
    }
  ];

  const scales = [];
  for (const scaleData of scalesData) {
    const { criteria, ...scaleInfo } = scaleData;
    const scale = await Scale.create(scaleInfo, { transaction });
    const criteriaDocs = criteria.map(c => ({ ...c, scaleId: scale.id }));
    await Criteria.bulkCreate(criteriaDocs, { transaction });
    scales.push(scale);
  }
  return scales;
}

async function seedEvaluations(teachers: User[], students: User[], scales: Scale[], transaction: any) {
  // Create evaluations
  const evaluationsData = [
    {
      title: 'Math Mid-Term 2024',
      dateEval: new Date('2024-02-15'),
      teacherId: teachers[0].id,
      studentId: students[0].id,
      scaleId: scales[0].id,
      status: 'published' as EvaluationStatus
    },
    {
      title: 'Science Project Q1',
      dateEval: new Date('2024-03-01'),
      teacherId: teachers[1].id,
      studentId: students[1].id,
      scaleId: scales[1].id,
      status: 'draft' as EvaluationStatus
    }
  ];

  for (const evalData of evaluationsData) {
    const evaluation = await Evaluation.create(evalData, { transaction });
    
    // Get criteria for the scale
    const criteria = await Criteria.findAll({
      where: { scaleId: evalData.scaleId },
      transaction
    });

    // Create grades
    const gradesData = criteria.map(criterion => ({
      evaluationId: evaluation.id,
      criteriaId: criterion.id,
      value: Math.floor(Math.random() * criterion.maxPoints)
    }));
    await Grade.bulkCreate(gradesData, { transaction });

    // Create comments
    const commentsData = [
      {
        evaluationId: evaluation.id,
        teacherId: evalData.teacherId,
        text: 'Good progress shown in this evaluation.'
      },
      {
        evaluationId: evaluation.id,
        teacherId: evalData.teacherId,
        text: 'Areas for improvement identified.'
      }
    ];
    await Comment.bulkCreate(commentsData, { transaction });
  }
}

// Execute seeder
if (require.main === module) {
  seedDatabase()
    .then(() => {
      logger.info('Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Error during seeding:', error);
      process.exit(1);
    });
}

export { seedDatabase };