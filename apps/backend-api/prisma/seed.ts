import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash('password', saltRounds);

  // Clean existing data
  await prisma.session.deleteMany();
  await prisma.authAuditLog.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.user.deleteMany();

  // Create test user with string tenantId
  await prisma.user.create({
    data: {
      email: 'test@test.com',
      passwordHash: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      role: 'HOSPITAL_ADMIN',
      tenantId: 'test-tenant',  // String, not UUID
      isActive: true,
      employmentStatus: 'ACTIVE',
    },
  });

  console.log('✅ Test user created: test@test.com / password');
  console.log('✅ Tenant ID: test-tenant');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
