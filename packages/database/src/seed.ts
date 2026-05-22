/**
 * HOSPITAL CHRONOS SYSTEM - DATABASE SEED ENGINE
 * Location: packages/database/src/seed.ts
 * * Execution: npx ts-node src/seed.ts
 */

import { PrismaClient, UserRole, ShiftType, ShiftStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Uniform mock password hash for local development testing (corresponds to 'Password123!')
const MOCK_PASSWORD_HASH = '$2b$10$EPf9XpBPXQv9/V5VfUWhKOnm.B5rU8L156C/K2b4U63V9R8S7Z21.';

async function main() {
  console.log('⏳ Starting Hospital Chronos database seeding sequence...');

  // ==========================================
  // 1. CLEAN REPOSITORY TABLES (Order matters due to Foreign Key Constraints)
  // ==========================================
  console.log('🧹 Purging existing telemetry, settings, logs and structural tables...');
  
  // Wipe reports, leaves, and settings first to prevent dependencies hanging
  await prisma.compiledReport.deleteMany({});
  await prisma.leaveRequest.deleteMany({});
  await prisma.systemSetting.deleteMany({});
  
  // Wipe core transaction, rotation, and entity records
  await prisma.attendanceAudit.deleteMany({});
  await prisma.attendanceLog.deleteMany({});
  await prisma.rosterAssignment.deleteMany({});
  await prisma.shiftTemplate.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.tenant.deleteMany({});

  // ==========================================
  // 2. SEED TENANTS (2 Mock Hospitals)
  // ==========================================
  console.log('🏢 Seeding mock multi-tenant hospital structures...');
  
  const tenantA = await prisma.tenant.create({
    data: {
      name: 'St. Teresa Referral Hospital',
      subdomain: 'st-teresa',
      licenseKey: 'CHRONOS-LIC-TERESA-9921-X',
      isActive: true,
    },
  });

  const tenantB = await prisma.tenant.create({
    data: {
      name: 'Migori Metropolitan Hospital',
      subdomain: 'migori-metro',
      licenseKey: 'CHRONOS-LIC-METRO-4412-B',
      isActive: true,
    },
  });

  // ==========================================
  // 3. [NEW] SEED SYSTEM SETTINGS (1-to-1 Configurations)
  // ==========================================
  console.log('⚙️ Initializing global business rules and configuration JSONB matrix sheets...');
  
  await prisma.systemSetting.create({
    data: {
      tenantId: tenantA.id,
      attendanceRules: { gracePeriodMinutes: 15, halfDayLateMinutes: 60, autoDeductBreakMinutes: 30 },
      holidayCalendar: [{ date: '2026-01-01', label: 'New Year Day' }, { date: '2026-05-01', label: 'Labour Day' }],
      salaryRules: { overtimeMultiplier: 1.5, nightShiftDifferential: 1.10 }
    }
  });

  await prisma.systemSetting.create({
    data: {
      tenantId: tenantB.id,
      attendanceRules: { gracePeriodMinutes: 20, halfDayLateMinutes: 90, autoDeductBreakMinutes: 45 },
      holidayCalendar: [{ date: '2026-01-01', label: 'New Year Day' }],
      salaryRules: { overtimeMultiplier: 1.4, nightShiftDifferential: 1.15 }
    }
  });

  // ==========================================
  // 4. SEED DEPARTMENTS
  // ==========================================
  console.log('🏥 Provisioning structural clinical departments...');
  
  const deptICU = await prisma.department.create({
    data: { tenantId: tenantA.id, name: 'Intensive Care Unit', code: 'ICU' },
  });

  const deptOPD = await prisma.department.create({
    data: { tenantId: tenantA.id, name: 'Outpatient Department', code: 'OPD' },
  });

  const deptPEDS = await prisma.department.create({
    data: { tenantId: tenantB.id, name: 'Pediatrics Wing', code: 'PEDS' },
  });

  // ==========================================
  // 5. SEED SHIFT TEMPLATES (3 Standard Shifts)
  // ==========================================
  console.log('⏱️ Mapping healthcare shift rotation boundaries...');
  
  const templateMorning = await prisma.shiftTemplate.create({
    data: {
      tenantId: tenantA.id,
      name: 'Standard Clinical Morning',
      type: ShiftType.MORNING,
      startTime: '06:00',
      endTime: '14:00',
      gracePeriodMinutes: 15,
    },
  });

  const templateAfternoon = await prisma.shiftTemplate.create({
    data: {
      tenantId: tenantA.id,
      name: 'Standard Clinical Afternoon',
      type: ShiftType.AFTERNOON,
      startTime: '14:00',
      endTime: '22:00',
      gracePeriodMinutes: 15,
    },
  });

  const templateNight = await prisma.shiftTemplate.create({
    data: {
      tenantId: tenantA.id,
      name: 'Standard Clinical Night Rotation',
      type: ShiftType.NIGHT,
      startTime: '22:00',
      endTime: '06:00',
      gracePeriodMinutes: 30,
    },
  });

  const templateHorizontalMorning = await prisma.shiftTemplate.create({
    data: {
      tenantId: tenantB.id,
      name: 'Metro Morning Shift',
      type: ShiftType.MORNING,
      startTime: '07:00',
      endTime: '15:00',
      gracePeriodMinutes: 15,
    },
  });

  // ==========================================
  // 6. SEED USERS (10 Dummy Doctors / Nurses / Admins)
  // ==========================================
  console.log('👥 Creating staff identity profiles with biometric bindings...');
  
  const staffData = [
    { tenantId: tenantA.id, deptId: deptICU.id, fName: 'John', lName: 'Dr. Kiprop', role: UserRole.DEPARTMENT_HEAD, pin: '1001' },
    { tenantId: tenantA.id, deptId: deptICU.id, fName: 'Mary', lName: 'Nurse Atieno', role: UserRole.STAFF, pin: '1002' },
    { tenantId: tenantA.id, deptId: deptICU.id, fName: 'David', lName: 'Nurse Mwangi', role: UserRole.STAFF, pin: '1003' },
    { tenantId: tenantA.id, deptId: deptOPD.id, fName: 'Alice', lName: 'Dr. Ochieng', role: UserRole.DEPARTMENT_HEAD, pin: '1004' },
    { tenantId: tenantA.id, deptId: deptOPD.id, fName: 'Samuel', lName: 'Nurse Kamau', role: UserRole.STAFF, pin: '1005' },
    { tenantId: tenantA.id, deptId: deptOPD.id, fName: 'Grace', lName: 'Nurse Wanjiku', role: UserRole.STAFF, pin: '1006' },
    { tenantId: tenantA.id, deptId: deptOPD.id, fName: 'Evans', lName: 'Admin Omwamba', role: UserRole.HOSPITAL_ADMIN, pin: '1007' },
    { tenantId: tenantB.id, deptId: deptPEDS.id, fName: 'Beatrice', lName: 'Dr. Chacha', role: UserRole.DEPARTMENT_HEAD, pin: '2001' },
    { tenantId: tenantB.id, deptId: deptPEDS.id, fName: 'Peter', lName: 'Nurse Marwa', role: UserRole.STAFF, pin: '2002' },
    { tenantId: tenantB.id, deptId: deptPEDS.id, fName: 'Mercy', lName: 'Nurse Kwamboka', role: UserRole.STAFF, pin: '2003' }
  ];

  const seededUsers = [];

  for (const staff of staffData) {
    const user = await prisma.user.create({
      data: {
        tenantId: staff.tenantId,
        departmentId: staff.deptId,
        email: `${staff.fName.toLowerCase()}.${staff.lName.split(' ')[1].toLowerCase()}@chronos.local`,
        passwordHash: MOCK_PASSWORD_HASH,
        firstName: staff.fName,
        lastName: staff.lName,
        role: staff.role,
        biometricUserId: staff.pin,
        isActive: true,
      },
    });
    seededUsers.push({ ...user, departmentId: staff.deptId });
  }

  // Find your Hospital Administrator from Tenant A to assign as creator/approver
  const adminUserTenantA = seededUsers.find(u => u.tenantId === tenantA.id && u.role === UserRole.HOSPITAL_ADMIN);

  // ==========================================
  // 7. [NEW] SEED LEAVE REQUESTS
  // ==========================================
  console.log('🌴 Seeding mock employee absence history and approvals...');
  
  const leaveStart = new Date();
  leaveStart.setDate(leaveStart.getDate() + 5); // 5 days from now
  const leaveEnd = new Date();
  leaveEnd.setDate(leaveEnd.getDate() + 10); // 10 days from now

  await prisma.leaveRequest.create({
    data: {
      tenantId: tenantA.id,
      employeeId: seededUsers[2].id, // Nurse Mwangi
      leaveType: 'ANNUAL',
      startDate: leaveStart,
      endDate: leaveEnd,
      reason: 'Scheduled rest period.',
      status: 'APPROVED',
      approvedById: adminUserTenantA ? adminUserTenantA.id : null,
    },
  });

  // ==========================================
  // 8. [NEW] SEED COMPILED REPORTS
  // ==========================================
  console.log('📈 Pre-compiling analytical cached dashboard reports...');
  
  const reportRangeStart = new Date();
  reportRangeStart.setMonth(reportRangeStart.getMonth() - 1);

  if (adminUserTenantA) {
    await prisma.compiledReport.create({
      data: {
        tenantId: tenantA.id,
        reportType: 'MONTHLY_SUMMARY',
        generatedById: adminUserTenantA.id,
        dateRangeStart: reportRangeStart,
        dateRangeEnd: new Date(),
        compiledData: {
          metrics: { totalWorkingHours: 1420, activeStaffCount: 6, flaggedExceptions: 4 },
          departments: [{ name: 'Intensive Care Unit', overtimeHours: 42 }]
        },
      },
    });
  }

  // ==========================================
  // 9. SEED ROSTER ASSIGNMENTS (3 Active Shifts)
  // ==========================================
  console.log('📅 Assigning active shifts to the calendar layout...');
  
  const targetDate = new Date();
  targetDate.setHours(0, 0, 0, 0);

  await prisma.rosterAssignment.create({
    data: {
      tenantId: tenantA.id,
      userId: seededUsers[0].id, 
      departmentId: seededUsers[0].departmentId,
      shiftTemplateId: templateMorning.id,
      date: targetDate,
      status: ShiftStatus.PRESENT,
    },
  });

  await prisma.rosterAssignment.create({
    data: {
      tenantId: tenantA.id,
      userId: seededUsers[1].id,
      departmentId: seededUsers[1].departmentId,
      shiftTemplateId: templateAfternoon.id,
      date: targetDate,
      status: ShiftStatus.PRESENT,
    },
  });

  await prisma.rosterAssignment.create({
    data: {
      tenantId: tenantA.id,
      userId: seededUsers[2].id,
      departmentId: seededUsers[2].departmentId,
      shiftTemplateId: templateNight.id,
      date: targetDate,
      status: ShiftStatus.PRESENT,
    },
  });

  await prisma.rosterAssignment.create({
    data: {
      tenantId: tenantB.id,
      userId: seededUsers[7].id,
      departmentId: seededUsers[7].departmentId,
      shiftTemplateId: templateHorizontalMorning.id,
      date: targetDate,
      status: ShiftStatus.PRESENT,
    },
  });

  console.log('✅ Seeding sequence executed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Database seeding failed prematurely:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });