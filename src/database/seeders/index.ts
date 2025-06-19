import sequelize from '../../config/database';
import { User } from '../../models';
import { authService } from '../../services/auth.service';
import logger from '../../utils/logger';
import { UserRole, UserStatus } from '../../types';

async function seedDatabase() {
  try {
    console.log('🌱 Starting minimal database seeding...');
    
    // Sync database (create tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email: 'admin@school.com' } });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists, skipping creation');
      logger.info('Minimal seeding completed - admin already exists');
      return;
    }

    // Create ONE admin user
    const adminData = {
      name: 'Admin User',
      email: 'admin@school.com',
      password: await authService.hashPassword('Admin123!'),
      role: 'admin' as UserRole,
      description: 'System administrator',
      status: 'active' as UserStatus
    };

    await User.create(adminData);
    
    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@school.com');
    console.log('🔑 Password: Admin123!');
    
    logger.info('Minimal database seeding completed successfully');
    
  } catch (error) {
    logger.error('Error during minimal seeding:', error);
    throw error;
  }
}

// Run seeding
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Seeding finished!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export default seedDatabase;