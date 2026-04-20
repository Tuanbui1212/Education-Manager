import bcrypt from 'bcryptjs';
import { UserModel } from '../models/user.model';

const ADMIN_ROLE_ID = '69a955701a7df7d94923859b';

export const seedAdmin = async () => {
  const existing = await UserModel.findOne({ email: 'admin@edu.vn' });

  if (existing) {
    console.log('✅ Admin already exists');
    return;
  }

  const password = await bcrypt.hash('admin123', 10);

  await UserModel.create({
    email: 'admin@edu.vn',
    phone: '0123456789',
    password,
    fullName: 'Super Administrator',
    roleId: ADMIN_ROLE_ID,
    status: 'ACTIVE',
    date: new Date(),
  });

  console.log('🚀 Admin created');
};
