import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role, { ALL_PERMISSIONS } from '../modules/role/role.model';
import User from '../modules/auth/auth.model';

dotenv.config();

const seed = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-erp';
    await mongoose.connect(uri);
    console.log('Connected to DB for seeding');

    // 1. Seed Roles
    const roles = [
      {
        name: 'Admin',
        permissions: ALL_PERMISSIONS,
        description: 'Full access to the system',
        isSystem: true,
      },
      {
        name: 'Manager',
        permissions: [
          'products:create', 'products:read', 'products:update', 'products:delete',
          'customers:create', 'customers:read', 'customers:update', 'customers:delete',
          'sales:create', 'sales:read',
          'dashboard:read'
        ],
        description: 'Can manage products, customers and sales',
        isSystem: true,
      },
      {
        name: 'Employee',
        permissions: ['products:read', 'customers:read', 'sales:create', 'sales:read', 'dashboard:read'],
        description: 'Can view products and create sales',
        isSystem: true,
      }
    ];

    for (const roleData of roles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        await Role.create(roleData);
        console.log(`Created role: ${roleData.name}`);
      } else {
        // Update permissions for system roles to ensure they match requirements
        if (existingRole.isSystem) {
          existingRole.permissions = roleData.permissions as string[];
          await existingRole.save();
          console.log(`Updated permissions for role: ${roleData.name}`);
        }
      }
    }

    // 2. Seed Admin User
    const adminRole = await Role.findOne({ name: 'Admin' });
    if (adminRole) {
      const existingAdmin = await User.findOne({ email: 'admin@minierp.com' });
      if (!existingAdmin) {
        const adminUser = new User({
          name: 'Super Admin',
          email: 'admin@minierp.com',
          password: 'password123', // Will be hashed by pre-save hook
          role: adminRole._id,
          roleName: adminRole.name,
        });
        await adminUser.save();
        console.log('Created default admin user (admin@minierp.com / password123)');
      }
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
