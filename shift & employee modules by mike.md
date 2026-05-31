# Shift & Employee Modules By Mike

## Purpose

This document is a professional summary of the Employee Module and Shift/Roster Module work implemented for the hospital workforce management backend.

It is intentionally shorter than the full technical handbook, but it is not a shallow overview. The goal is to help teammates, reviewers, and future maintainers quickly understand:

- What was built.
- Why it was built this way.
- How the runtime flow works.
- How the modules integrate with the rest of the backend.
- What must not be broken during future changes.
- What should be checked before merging.

These modules provide the staff-management and scheduling foundation for the platform. Employee data tells the system who can work. Roster data tells the system when and where they were scheduled to work.

## Assigned Scope

### Implemented

Employee Module:

- Employee creation.
- Employee profile updates.
- Employee lifecycle management.
- Role assignment and role protection.
- Department assignment.
- Device user mapping.
- Soft delete and restore.
- Employee audit tracking.
- Server-side password hashing.
- Tenant-isolated employee queries and writes.

Shift/Roster Module:

- Shift template creation.
- Shift template listing and updates.
- Shift template deactivation.
- Employee shift assignment.
- Shift reassignment.
- Shift unassignment.
- Assignment history.
- Shift snapshot preservation.
- Serializable assignment transactions.
- Active assignment uniqueness.

Infrastructure and integration support:

- JWT guard integration.
- RBAC guard integration.
- Tenant context extraction.
- Shared DTO usage from `@chronos/types-common`.
- Shared Prisma client usage from `@chronos/database`.
- Backend bootstrap/runtime integration.
- Shared package runtime build fixes.

### Outside This Scope

The following systems are not implemented in these modules:

- Attendance processing.
- Clock-in/clock-out ingestion.
- Payroll calculation.
- Overtime calculation.
- Attendance reconciliation.
- Reporting dashboards.
- Notifications.
- Leave management.
- Scheduling AI.
- Analytics.

These are separate bounded contexts. The Employee and Roster modules provide trusted source data that those systems can consume later.

## Core Architecture

Both modules follow the same layered backend architecture:

```txt
HTTP Request
  -> JwtAuthGuard
  -> RolesGuard
  -> Controller
  -> Service
  -> Repository
  -> DatabaseService
  -> Shared Prisma Client
  -> PostgreSQL
```

This structure was used deliberately:

- Controllers stay thin and only handle HTTP routing, request extraction, guards, and delegation.
- Services contain business rules, validation, role checks, tenant access checks, and response mapping.
- Repositories own Prisma queries, transactions, tenant-scoped database writes, audit inserts, and history inserts.
- `DatabaseService` wraps the shared Prisma client so feature modules do not create their own database clients.

This keeps business rules out of controllers and keeps database implementation details out of services.

## Important Files

| File | Purpose | Why It Matters |
| ---- | ------- | -------------- |
| `apps/backend-api/src/employee/employee.module.ts` | Registers Employee controller, service, and repository. | Required for Nest dependency injection and route registration. |
| `apps/backend-api/src/employee/employee.controller.ts` | Exposes `/api/employees` routes. | Entry point for Employee HTTP requests. |
| `apps/backend-api/src/employee/employee.service.ts` | Owns employee business logic. | Enforces role rules, tenant boundaries, validation, password hashing, and audit preparation. |
| `apps/backend-api/src/employee/employee.repository.ts` | Owns employee Prisma operations. | Protects tenant-scoped reads/writes and writes audit records transactionally. |
| `apps/backend-api/src/roster/roster.module.ts` | Registers Roster controller, service, and repository. | Required for Roster runtime availability. |
| `apps/backend-api/src/roster/roster.controller.ts` | Exposes `/api/roster` routes. | Entry point for shift template and assignment requests. |
| `apps/backend-api/src/roster/roster.service.ts` | Owns roster business logic. | Validates shifts, dates, employees, departments, and scheduling permissions. |
| `apps/backend-api/src/roster/roster.repository.ts` | Owns roster Prisma operations. | Handles serializable transactions, supersession, snapshots, and assignment history. |
| `apps/backend-api/src/common/auth/role-policy.ts` | Defines role hierarchy and access helpers. | Prevents role escalation and department-scope bypasses. |
| `apps/backend-api/src/common/auth/jwt-auth.guard.ts` | Verifies JWT and populates `request.user`. | Source of authenticated user, tenant, and role context. |
| `apps/backend-api/src/common/auth/roles.guard.ts` | Enforces route-level roles. | Protects endpoints from unauthorized access. |
| `apps/backend-api/src/common/tenant/tenant-id.decorator.ts` | Extracts tenant ID from authenticated request user. | Prevents tenant spoofing through body/query/header values. |
| `apps/backend-api/src/database/database.service.ts` | Exposes shared Prisma client. | Keeps repositories using one shared database access path. |
| `packages/types-common/src/api-contracts.ts` | Shared DTOs and enums. | Keeps backend/frontend contracts aligned. |
| `packages/database/prisma/schema/user.prisma` | Employee/User and audit schema. | Supports employee lifecycle and HR auditability. |
| `packages/database/prisma/schema/roster.prisma` | Shift and roster schema. | Supports scheduling, history, and snapshots. |

## Employee Module Summary

The Employee Module manages the hospital staff register. It handles the employee record as both an HR object and a system user object.

Main responsibilities:

- Create employees under the authenticated tenant.
- Validate employee fields.
- Hash passwords server-side using bcrypt.
- Enforce who can assign which role.
- Enforce department-scoped access.
- Update employee profile and lifecycle state.
- Soft-delete employees instead of hard-deleting them.
- Restore soft-deleted employees through a controlled workflow.
- Create audit records for sensitive changes.

### Employee Routes

Key routes include:

```txt
POST   /api/employees
GET    /api/employees
GET    /api/employees/:id
PATCH  /api/employees/:id
DELETE /api/employees/:id
PATCH  /api/employees/:id/status
PATCH  /api/employees/:id/department
PATCH  /api/employees/:id/device-user
PATCH  /api/employees/:id/restore
```

All routes are protected by:

```ts
@UseGuards(JwtAuthGuard, RolesGuard)
```

The controller extracts:

- `@TenantId()` for authenticated tenant context.
- `@CurrentUser()` for authenticated actor context.
- `@Body()`, `@Query()`, and `@Param()` for request data.

The controller does not perform business logic. It delegates to `EmployeeService`.

### Employee Creation Runtime Flow

```txt
POST /api/employees
  -> JwtAuthGuard validates Bearer token
  -> request.user is populated
  -> RolesGuard checks allowed roles
  -> EmployeeController.create()
  -> EmployeeService.create()
  -> role hierarchy is checked
  -> department ownership is checked
  -> password is hashed server-side
  -> EmployeeRepository.create()
  -> Prisma transaction opens
  -> user row is inserted
  -> employee audit row is inserted
  -> transaction commits
  -> response is mapped without passwordHash
```

Why this matters:

- The tenant ID comes from the verified JWT, not the request body.
- Password hashes are never trusted from clients.
- The create audit row is written in the same transaction as the employee row.
- The response does not expose `passwordHash`.

### Employee Audit Trail

Employee changes are audited because HR actions must be traceable.

Audited actions include:

- Create.
- Profile update.
- Role change.
- Status change.
- Department change.
- Device mapping change.
- Soft delete.
- Restore.

Audit records include:

- Tenant ID.
- Employee ID.
- Actor user ID.
- Action name.
- Previous value.
- New value.
- Timestamp.

This supports HR investigations, compliance checks, payroll disputes, and security review.

## Shift/Roster Module Summary

The Shift/Roster Module manages shift definitions and planned employee schedules.

Main responsibilities:

- Create reusable shift templates.
- Define shift rules such as grace period and overtime threshold.
- Assign employees to shifts over date ranges.
- Reassign employees while preserving history.
- Unassign employees without deleting historical evidence.
- Store assignment history rows.
- Store shift snapshot fields.
- Prevent duplicate active assignments.

### Roster Routes

Key routes include:

```txt
POST /api/roster/shifts
GET  /api/roster/shifts
GET  /api/roster/shifts/:id
PATCH /api/roster/shifts/:id
DELETE /api/roster/shifts/:id
POST /api/roster/shifts/:id/assign-employees
POST /api/roster/shifts/:id/unassign-employees
```

All routes are protected by JWT and RBAC guards.

### Shift Assignment Runtime Flow

```txt
POST /api/roster/shifts/:id/assign-employees
  -> JwtAuthGuard validates token
  -> request.user provides actor and tenant
  -> RolesGuard checks scheduling permission
  -> RosterController.assignEmployees()
  -> RosterService.assignEmployees()
  -> shift template is loaded by tenant
  -> employee IDs are validated
  -> employees are confirmed to belong to tenant
  -> department access is checked
  -> date range is expanded
  -> RosterRepository.assignEmployees()
  -> serializable Prisma transaction opens
  -> existing active assignment is checked
  -> old assignment is superseded if needed
  -> new assignment is created
  -> shift snapshot fields are copied
  -> assignment history row is inserted
  -> transaction commits
  -> response is returned
```

Why this matters:

- One employee should not have two active non-cancelled assignments on the same date.
- Reassignment must preserve the old schedule for audit and payroll review.
- Shift snapshots protect historical calculations if shift templates change later.
- Serializable transactions reduce race conditions during concurrent roster edits.

## Shift Supersession Model

Roster assignments are not updated in place when the schedule changes.

Instead:

1. The old assignment is marked as superseded.
2. A new assignment is created.
3. The old assignment links to the new assignment.
4. A history row records the change.

This creates a reliable timeline:

```txt
Original Assignment
  -> supersededAt set
  -> supersededByAssignmentId points to replacement

Replacement Assignment
  -> becomes active assignment
  -> contains current shift snapshot

History Row
  -> records actor, action, old values, new values, and date
```

This is important in a hospital setting because schedule changes can affect clinical coverage, attendance reconciliation, payroll, and accountability.

## Shift Snapshots

Each roster assignment stores selected values from the shift template at the time of assignment:

- `startTimeSnapshot`
- `endTimeSnapshot`
- `gracePeriodSnapshot`
- `overtimeThresholdSnapshot`
- `overnightSnapshot`

These fields intentionally duplicate shift template data.

The reason is historical correctness. If a shift template changes next month, last month’s assignments must still reflect the rules that existed when those assignments were created.

Without snapshots:

- Payroll could be recalculated using the wrong shift rule.
- Attendance reconciliation could apply the wrong grace period.
- Night shift interpretation could change after the fact.
- Historical reports could become unreliable.

## Security And Tenant Isolation

Security is enforced in several layers:

- JWT authentication verifies the request.
- `request.user` carries authenticated user, tenant, role, and department context.
- `RolesGuard` checks route-level permissions.
- Services enforce role hierarchy and department-scoped access.
- Repositories include `tenantId` in database queries and writes.

Tenant ID must always come from authenticated context:

```txt
JWT payload
  -> JwtAuthGuard
  -> request.user.tenantId
  -> @TenantId()
  -> Service
  -> Repository
  -> Prisma where/data tenantId
```

Tenant ID must not be accepted from:

- Request body.
- Query parameters.
- Custom headers.
- Client-side state.

This protects multi-hospital SaaS isolation.

## Critical Logic That Must Not Be Broken

### Employee Module

Do not break:

- Tenant-scoped repository filters.
- Role hierarchy enforcement.
- Server-side password hashing.
- Employee audit insertion.
- Soft delete behavior.
- Restore workflow.
- Department access restrictions.
- Safe response projection that excludes `passwordHash`.

Why:

- Removing tenant filters risks cross-hospital data exposure.
- Removing role checks risks privilege escalation.
- Skipping audits makes HR changes untraceable.
- Hard deleting employees can break historical attendance, payroll, roster, and audit references.

### Shift/Roster Module

Do not break:

- Active assignment uniqueness.
- Supersession model.
- Serializable assignment transactions.
- Shift snapshot fields.
- Assignment history insertion.
- Tenant-scoped assignment queries.
- Department scheduling checks.

Why:

- Duplicate active assignments corrupt rosters.
- Updating assignments directly destroys history.
- Removing snapshots can make payroll/reconciliation inaccurate.
- Skipping history rows makes schedule changes impossible to audit.

## How These Modules Connect To Other Work

Employee Module produces:

- Employee records.
- Employment status.
- Role information.
- Department information.
- Device mappings.
- Employee audit trail.

Roster Module produces:

- Shift templates.
- Active assignments.
- Assignment history.
- Shift snapshots.

Future Attendance Module can consume:

- Employee records.
- Device mappings.
- Active assignments.
- Scheduled shift times.

Future Payroll Module can consume:

- Approved attendance outcomes.
- Shift snapshots.
- Assignment history.
- Employee employment and rate information.

Future Reporting Module can consume:

- Employee lifecycle data.
- Department staffing data.
- Roster history.
- Audit records.

My responsibility ends at employee truth and planned schedule truth. Attendance, reconciliation, payroll, reports, and notifications should consume this data rather than bypassing these modules.

## Common Integration Mistakes

### Removing Tenant Filters

Impact:

- Cross-tenant data exposure.
- Broken SaaS isolation.
- Potential data breach.

### Writing Directly To Prisma From Controllers

Impact:

- Business rules are bypassed.
- Audit writes may be skipped.
- Tenant checks may be forgotten.
- Response mapping may leak sensitive fields.

### Updating Roster Assignments In Place

Impact:

- Historical scheduling evidence is destroyed.
- Reassignment history becomes incomplete.
- Payroll and reconciliation may lose the original planned shift.

### Removing Shift Snapshots

Impact:

- Old assignments can change meaning when templates change.
- Payroll and attendance reconciliation become unreliable.

### Skipping Employee Audit Writes

Impact:

- HR lifecycle changes become untraceable.
- Security reviews cannot prove who changed what.

### Ignoring Shared Contracts

Impact:

- Frontend and backend can drift.
- DTO expectations become inconsistent.
- Runtime behavior may differ from client assumptions.

## If You Need To Change Something

### Modifying Employee Creation

Read:

- `employee.controller.ts`
- `employee.service.ts`
- `employee.repository.ts`
- `role-policy.ts`
- `api-contracts.ts`

Understand:

- Which roles can create employees.
- Which roles can assign which target roles.
- How department-scoped creation works.
- How passwords are hashed.
- How create audit rows are inserted.

Risks:

- Role escalation.
- Missing audit rows.
- Tenant leakage.
- Password handling regression.

### Modifying Employee Lifecycle

Read:

- `employee.service.ts`
- `employee.repository.ts`
- `user.prisma`

Understand:

- Soft delete is intentional.
- Restore is an explicit high-trust workflow.
- Status changes should be audited.

Risks:

- Broken historical references.
- Untraceable HR actions.
- Accidental employee reactivation.

### Modifying Shift Assignment

Read:

- `roster.controller.ts`
- `roster.service.ts`
- `roster.repository.ts`
- `roster.prisma`
- roster migration files.

Understand:

- Date expansion.
- Department scheduling checks.
- Employee schedulability checks.
- Supersession logic.
- Shift snapshot creation.
- Serializable transaction behavior.

Risks:

- Duplicate active assignments.
- Corrupt history.
- Payroll inconsistency.
- Race conditions under concurrent scheduling.

### Modifying Authentication Or RBAC

Read:

- `jwt-auth.guard.ts`
- `roles.guard.ts`
- `role-policy.ts`
- `current-user.decorator.ts`
- `tenant-id.decorator.ts`

Understand:

- `request.user` is the trusted context.
- Tenant ID must come from JWT.
- Role hierarchy is enforced beyond route-level guards.

Risks:

- Privilege escalation.
- Cross-tenant access.
- Incorrect audit actor attribution.

## Merge Checklist

Before merging:

- Pull latest main branch.
- Check for Prisma schema conflicts.
- Check for migration conflicts.
- Check shared DTO/contract changes.
- Run Prisma generate.
- Run database migrations.
- Build the Turborepo.
- Run tests or smoke checks.
- Verify `JWT_SECRET`.
- Verify `DATABASE_URL`.

Suggested commands:

```bash
npm run db:generate
npm run db:migrate
npm run build
npm run start --workspace apps/backend-api
```

Route smoke checks:

```bash
curl -i http://localhost:3000/api/employees
curl -i http://localhost:3000/api/roster/shifts
```

Expected result without a token:

```txt
HTTP/1.1 401 Unauthorized
```

That confirms the routes are registered and protected by authentication.

After merging:

- Verify Employee routes are reachable.
- Verify Roster routes are reachable.
- Verify migrations have run.
- Verify employee creation writes an audit row.
- Verify shift assignment creates assignment history.
- Verify reassignment supersedes the old assignment.
- Verify shared packages resolve at runtime.

## Common Questions

### Why use repositories?

Repositories keep Prisma access, tenant filtering, transactions, and conflict mapping in one place. This makes services easier to read and reduces the chance that future endpoints bypass important database rules.

### Why not query Prisma directly in controllers?

Controllers should not own business rules or database rules. Direct Prisma calls from controllers would bypass validation, RBAC policy, audit writes, history writes, tenant filtering discipline, and response mapping.

### Why use serializable transactions for roster assignment?

Roster assignment is concurrency-sensitive. Two planners can attempt to schedule the same employee for the same date at the same time. Serializable transactions, combined with the active-assignment uniqueness rule, protect schedule correctness.

### Why snapshot shift data?

Templates can change. Historical assignments should not change meaning when a template is edited later. Snapshots preserve the shift rules that existed at assignment time.

### Why create audit records?

Employee lifecycle changes affect HR, security, payroll, and compliance. Audit records answer who changed what, when, and from what previous state.

### Why soft delete employees?

Employee records are referenced by rosters, attendance logs, payroll data, audits, and reports. Hard deletion can break historical evidence. Soft delete removes the employee from active workflows while preserving history.

### Why tenant-filter every query?

This is a multi-tenant hospital system. Every tenant must only see and modify its own data. Tenant filtering is the main application-level enforcement for row isolation.

### Why supersede assignments instead of updating them?

Updating an assignment directly destroys evidence of the previous schedule. Supersession preserves both the old assignment and the new assignment, which is important for audits, payroll disputes, and operational accountability.

## Lessons Learned

- Repository layering increases file count, but it makes tenant filtering and transactions much easier to review.
- Service-layer business rules are easier to test and reason about than controller-level business rules.
- Assignment history cannot be reliably reconstructed after the fact if assignments are overwritten directly.
- Shift snapshots are necessary because roster templates are configuration, and configuration changes over time.
- Tenant IDs should only come from authenticated context, never from client-provided values.
- Database constraints are more trustworthy than service validation alone for critical invariants.
- Serializable transactions improve correctness but clients may need to handle retryable conflicts.
- Audit records are not extra decoration; they are part of the business requirement for HR accountability.

## Final Summary

Implemented:

- Employee Management.
- Employee Lifecycle.
- Role Controls.
- Department Assignment.
- Device Mapping.
- Audit Infrastructure.
- Shift Templates.
- Shift Assignment.
- Shift Reassignment.
- Shift Unassignment.
- Assignment History.
- Shift Snapshots.
- JWT Security Integration.
- RBAC Integration.
- Tenant Isolation.

Out of scope:

- Attendance Engine.
- Payroll Engine.
- Leave Management.
- Notifications.
- Reporting.
- Analytics.

Most important files:

- `apps/backend-api/src/employee/employee.service.ts`
- `apps/backend-api/src/employee/employee.repository.ts`
- `apps/backend-api/src/roster/roster.service.ts`
- `apps/backend-api/src/roster/roster.repository.ts`

Most important business rules:

- Tenant isolation.
- Employee audit creation.
- Assignment uniqueness.
- Assignment supersession.
- Shift snapshot preservation.
- Historical integrity.

Final goal:

The Employee and Shift/Roster modules should keep staff and scheduling data secure, tenant-isolated, auditable, and historically correct so future attendance, reconciliation, payroll, and reporting modules can safely build on top of them.
