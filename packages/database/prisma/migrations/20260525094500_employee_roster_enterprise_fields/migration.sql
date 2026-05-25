-- Employee lifecycle metadata.
ALTER TABLE "users"
  ADD COLUMN "employment_type" VARCHAR(30) NOT NULL DEFAULT 'FULL_TIME',
  ADD COLUMN "employment_status" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN "emergency_contacts" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN "profile_metadata" JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN "deleted_at" TIMESTAMPTZ(6);

CREATE INDEX "users_tenant_id_employment_status_idx" ON "users"("tenant_id", "employment_status");
CREATE INDEX "users_tenant_id_deleted_at_idx" ON "users"("tenant_id", "deleted_at");

-- Shift reconciliation and overtime rule metadata.
ALTER TABLE "shift_templates"
  ADD COLUMN "grace_period_minutes" INTEGER NOT NULL DEFAULT 15,
  ADD COLUMN "early_clock_in_window_minutes" INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN "overtime_threshold_minutes" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "is_overnight" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "effective_from" DATE,
  ADD COLUMN "effective_to" DATE,
  ADD COLUMN "rules" JSONB NOT NULL DEFAULT '{}';

CREATE INDEX "shift_templates_tenant_id_is_active_idx" ON "shift_templates"("tenant_id", "is_active");

-- Assignment audit metadata and reassignment history.
DROP INDEX IF EXISTS "roster_assignments_user_id_date_key";

ALTER TABLE "roster_assignments"
  ADD COLUMN "effective_from" DATE,
  ADD COLUMN "effective_to" DATE,
  ADD COLUMN "assigned_by_user_id" UUID,
  ADD COLUMN "unassigned_at" TIMESTAMPTZ(6),
  ADD COLUMN "unassigned_reason" VARCHAR(255);

CREATE INDEX "roster_assignments_tenant_id_user_id_date_idx" ON "roster_assignments"("tenant_id", "user_id", "date");
CREATE INDEX "roster_assignments_tenant_id_user_id_date_status_idx" ON "roster_assignments"("tenant_id", "user_id", "date", "status");

CREATE TABLE "roster_assignment_histories" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "roster_assignment_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "previous_shift_template_id" UUID,
  "new_shift_template_id" UUID,
  "previous_department_id" UUID,
  "new_department_id" UUID,
  "previous_status" VARCHAR(30),
  "new_status" VARCHAR(30) NOT NULL,
  "effective_date" DATE NOT NULL,
  "action" VARCHAR(30) NOT NULL,
  "reason" VARCHAR(255),
  "actor_user_id" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "roster_assignment_histories_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "roster_assignment_histories_tenant_id_user_id_effective_date_idx"
  ON "roster_assignment_histories"("tenant_id", "user_id", "effective_date");

CREATE INDEX "roster_assignment_histories_roster_assignment_id_idx"
  ON "roster_assignment_histories"("roster_assignment_id");

ALTER TABLE "roster_assignment_histories"
  ADD CONSTRAINT "roster_assignment_histories_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "roster_assignment_histories"
  ADD CONSTRAINT "roster_assignment_histories_roster_assignment_id_fkey"
  FOREIGN KEY ("roster_assignment_id") REFERENCES "roster_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "roster_assignment_histories"
  ADD CONSTRAINT "roster_assignment_histories_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "roster_assignment_histories"
  ADD CONSTRAINT "roster_assignment_histories_new_shift_template_id_fkey"
  FOREIGN KEY ("new_shift_template_id") REFERENCES "shift_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
