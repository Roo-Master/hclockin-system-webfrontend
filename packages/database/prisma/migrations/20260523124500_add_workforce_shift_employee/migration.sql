CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY', 'INTERN', 'LOCUM');
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED');
CREATE TYPE "ShiftScheduleType" AS ENUM ('FIXED', 'ROTATING', 'ON_CALL', 'CUSTOM');
CREATE TYPE "EmployeeShiftStatus" AS ENUM ('ACTIVE', 'ENDED', 'CANCELLED');

ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'HR_MANAGER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPERVISOR';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'EMPLOYEE';

CREATE TABLE "employees" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "department_id" UUID,
  "user_id" UUID,
  "employee_code" VARCHAR(50) NOT NULL,
  "first_name" VARCHAR(100) NOT NULL,
  "last_name" VARCHAR(100) NOT NULL,
  "email" VARCHAR(255),
  "phone" VARCHAR(50),
  "job_title" VARCHAR(120),
  "device_user_id" VARCHAR(100),
  "employment_type" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
  "employee_status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
  "emergency_contact_name" VARCHAR(150),
  "emergency_contact_phone" VARCHAR(50),
  "emergency_contact_relation" VARCHAR(80),
  "profile_photo_url" VARCHAR(500),
  "hired_at" DATE,
  "terminated_at" DATE,
  "metadata" JSONB,
  "created_by_id" UUID,
  "updated_by_id" UUID,
  "deleted_by_id" UUID,
  "deleted_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "shifts" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "department_id" UUID,
  "name" VARCHAR(120) NOT NULL,
  "code" VARCHAR(50) NOT NULL,
  "description" TEXT,
  "schedule_type" "ShiftScheduleType" NOT NULL DEFAULT 'FIXED',
  "start_time" VARCHAR(5) NOT NULL,
  "end_time" VARCHAR(5) NOT NULL,
  "is_overnight" BOOLEAN NOT NULL DEFAULT false,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "effective_from" DATE NOT NULL,
  "effective_to" DATE,
  "grace_period_minutes" INTEGER NOT NULL DEFAULT 0,
  "early_clock_in_minutes" INTEGER NOT NULL DEFAULT 0,
  "late_after_minutes" INTEGER NOT NULL DEFAULT 0,
  "early_clock_out_minutes" INTEGER NOT NULL DEFAULT 0,
  "break_minutes" INTEGER NOT NULL DEFAULT 0,
  "overtime_allowed" BOOLEAN NOT NULL DEFAULT false,
  "overtime_after_minutes" INTEGER NOT NULL DEFAULT 0,
  "rotation_pattern" JSONB,
  "metadata" JSONB,
  "created_by_id" UUID,
  "updated_by_id" UUID,
  "deleted_by_id" UUID,
  "deleted_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "employee_shifts" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "employee_id" UUID NOT NULL,
  "shift_id" UUID NOT NULL,
  "effective_from" DATE NOT NULL,
  "effective_to" DATE,
  "status" "EmployeeShiftStatus" NOT NULL DEFAULT 'ACTIVE',
  "assigned_by_id" UUID,
  "unassigned_by_id" UUID,
  "reason" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "employee_shifts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "employees_tenant_id_employee_code_key" ON "employees"("tenant_id", "employee_code");
CREATE UNIQUE INDEX "employees_tenant_id_device_user_id_key" ON "employees"("tenant_id", "device_user_id");
CREATE INDEX "employees_tenant_id_employee_status_deleted_at_idx" ON "employees"("tenant_id", "employee_status", "deleted_at");
CREATE INDEX "employees_tenant_id_department_id_deleted_at_idx" ON "employees"("tenant_id", "department_id", "deleted_at");
CREATE INDEX "employees_tenant_id_last_name_first_name_idx" ON "employees"("tenant_id", "last_name", "first_name");

CREATE UNIQUE INDEX "shifts_tenant_id_code_key" ON "shifts"("tenant_id", "code");
CREATE INDEX "shifts_tenant_id_is_active_deleted_at_idx" ON "shifts"("tenant_id", "is_active", "deleted_at");
CREATE INDEX "shifts_tenant_id_department_id_deleted_at_idx" ON "shifts"("tenant_id", "department_id", "deleted_at");
CREATE INDEX "shifts_tenant_id_effective_from_effective_to_idx" ON "shifts"("tenant_id", "effective_from", "effective_to");

CREATE INDEX "employee_shifts_tenant_id_employee_id_status_idx" ON "employee_shifts"("tenant_id", "employee_id", "status");
CREATE INDEX "employee_shifts_tenant_id_shift_id_status_idx" ON "employee_shifts"("tenant_id", "shift_id", "status");
CREATE INDEX "employee_shifts_tenant_id_effective_from_effective_to_idx" ON "employee_shifts"("tenant_id", "effective_from", "effective_to");

ALTER TABLE "employees" ADD CONSTRAINT "employees_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "employees" ADD CONSTRAINT "employees_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "employee_shifts" ADD CONSTRAINT "employee_shifts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "employee_shifts" ADD CONSTRAINT "employee_shifts_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "employee_shifts" ADD CONSTRAINT "employee_shifts_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
