# Employee & Shift/Roster Module Technical Ownership And Handover Guide

## Reviewer Map

This handbook is focused on the modules I was assigned to build and integrate: Employee and Shift/Roster. It is not trying to document the entire hospital workforce platform. Read it as a handover guide for teammates reviewing, merging, extending, or maintaining these modules.

For onboarding, read it top to bottom: it starts with assigned scope, then moves through implementation ownership, runtime wiring, request flow, module internals, database schema, merge guidance, and production review. For architecture defense or interview preparation, jump first to `My Assigned Scope`, `Files I Added Or Modified`, `Critical Logic That Must Not Be Broken`, `Runtime Walkthrough Of My Modules`, `Why I Chose This Design`, and `Questions Teammates Will Probably Ask`.

To reduce repetition, the handbook treats authentication, RBAC, tenant isolation, and repository layering as central reference concepts. Later sections may mention those ideas briefly, but the canonical explanations live in `Authentication & RBAC Flow`, `Multi-Tenancy Implementation`, `Dependency Injection & Provider Wiring`, and `Repository Layer Documentation`.

## My Assigned Scope

This implementation owns the Employee module and Shift/Roster module integration work. The rest of the platform may consume these modules, but this guide intentionally centers on what was implemented here.

### Implemented

Employee module:

- Employee management.
- Employee lifecycle handling.
- Employee role controls.
- Employee department assignment.
- Device mapping through `deviceUserId` / `devicePin`.
- Employee audit tracking.
- Soft delete and restore workflows.
- Server-side password hashing for employee creation.
- Tenant-safe employee queries and writes.

Shift/Roster module:

- Shift template management.
- Shift assignment.
- Shift reassignment.
- Shift unassignment.
- Assignment history.
- Shift snapshot preservation.
- Active assignment conflict protection.
- Serializable roster assignment transactions.

Cross-cutting integration:

- Tenant isolation.
- JWT security integration.
- RBAC integration.
- Shared DTO usage from `@chronos/types-common`.
- Shared Prisma client usage from `@chronos/database`.
- Runtime bootstrap and shared package resolution fixes required to make the modules reachable.

### Not Implemented: Outside My Scope

These systems are intentionally outside this module ownership boundary:

- Attendance processing.
- Clock-in ingestion.
- Payroll calculations.
- Overtime engine.
- Reconciliation engine.
- Reporting dashboards.
- Notifications.
- Leave management.
- Scheduling AI.
- Analytics.

They are excluded because they belong to separate bounded contexts. Roster answers "who was scheduled where and when." Attendance answers "what actually happened." Reconciliation compares the plan with reality. Payroll calculates money from approved evidence. Notifications deliver messages. Keeping those boundaries separate prevents the Employee and Roster modules from turning into a platform-wide catch-all.

Engineer’s Note:
The most important thing during review is to judge these modules by their ownership boundary. They create and protect the staff directory and planned schedule. They deliberately do not calculate pay, ingest biometric events, or reconcile attendance.

## Files I Added Or Modified

This table is the fastest way for a teammate to understand where the implementation lives and which files are sensitive.

| File | Purpose | Criticality |
| ---- | ------- | ----------- |
| `apps/backend-api/src/employee/employee.module.ts` | Registers Employee controller, service, repository, and imports `DatabaseModule`. | High: incorrect imports break DI and guards. |
| `apps/backend-api/src/employee/employee.controller.ts` | Exposes `/api/employees` REST endpoints and attaches JWT/RBAC guards. | High: route or guard changes can expose sensitive HR endpoints. |
| `apps/backend-api/src/employee/employee.service.ts` | Owns employee business rules, validation, role hierarchy checks, password hashing, audit metadata, and response mapping. | Critical: this is where HR/security behavior is enforced. |
| `apps/backend-api/src/employee/employee.repository.ts` | Owns tenant-scoped Prisma operations, employee projection, transactions, soft delete/restore, and audit insertion. | Critical: mistakes can break tenant isolation or auditability. |
| `apps/backend-api/src/roster/roster.module.ts` | Registers Roster controller, service, repository, and imports `DatabaseModule`. | High: incorrect module wiring makes routes/providers unavailable. |
| `apps/backend-api/src/roster/roster.controller.ts` | Exposes `/api/roster` shift-template and assignment endpoints. | High: route guard or role mistakes affect scheduling access. |
| `apps/backend-api/src/roster/roster.service.ts` | Owns shift validation, date expansion, employee schedulability, department scheduling rules, and response mapping. | Critical: this controls who can be scheduled and when. |
| `apps/backend-api/src/roster/roster.repository.ts` | Owns shift-template persistence, serializable assignment transactions, supersession, cancellation, and history insertion. | Critical: this protects schedule integrity. |
| `apps/backend-api/src/common/auth/role-policy.ts` | Defines assignable role hierarchy and tenant/department access helper functions. | Critical: incorrect role policy can cause privilege escalation. |
| `apps/backend-api/src/common/auth/roles.guard.ts` | Enforces `@Roles(...)` metadata at route level. | High: guard behavior controls endpoint authorization. |
| `apps/backend-api/src/common/tenant/tenant-id.decorator.ts` | Extracts tenant ID from authenticated `request.user`. | Critical: prevents tenant spoofing through headers/body. |
| `apps/backend-api/src/common/auth/current-user.decorator.ts` | Extracts authenticated actor from `request.user`. | High: actor identity feeds audit and assignment attribution. |
| `apps/backend-api/src/common/validation.ts` | Shared runtime validation helpers used by Employee and Roster services. | High: interface DTOs require explicit runtime validation. |
| `apps/backend-api/src/database/database.module.ts` | Provides/export `DatabaseService`, `TenantContextService`, `JwtAuthGuard`, and `RolesGuard`. | Critical: duplicate or missing providers break DI/security. |
| `apps/backend-api/src/database/database.service.ts` | Wraps shared Prisma client from `@chronos/database`. | High: repositories depend on this for DB access. |
| `apps/backend-api/src/app.module.ts` | Imports Employee/Roster modules and applies tenant middleware. | High: module graph determines runtime reachability. |
| `apps/backend-api/src/main.ts` | Bootstraps Nest, CORS, ValidationPipe, and HTTP listen. | Critical: without this the backend does not serve routes. |
| `packages/types-common/src/api-contracts.ts` | Shared DTOs/enums used by Employee/Roster controllers and services. | Critical: contract drift breaks backend/frontend integration. |
| `packages/database/prisma/schema/user.prisma` | User/Employee and EmployeeAudit schema. | Critical: schema supports employee lifecycle, uniqueness, and audit. |
| `packages/database/prisma/schema/roster.prisma` | ShiftTemplate, RosterAssignment, and RosterAssignmentHistory schema. | Critical: schema supports assignment history and snapshots. |
| `packages/database/prisma/migrations/*employee_roster_enterprise_fields*/migration.sql` | Adds employee lifecycle fields, audit table, roster metadata, history, snapshots, and active-assignment partial unique index. | Critical: missing migration breaks runtime invariants. |
| `packages/types-common/package.json`, `packages/database/package.json`, `packages/database/tsconfig.json` | Package runtime/build entrypoint fixes for shared workspace packages. | Critical: without compiled `dist` entrypoints backend startup fails. |

Before modifying any critical file, ask: does this preserve tenant isolation, auditability, role safety, and roster history?

## Critical Logic That Must Not Be Broken

### Employee Module

#### Tenant Filtering

What it protects:

- Prevents one hospital tenant from reading or mutating another hospital’s employee data.

Where it lives:

- `EmployeeRepository.list()`
- `EmployeeRepository.findByIdOrThrow()`
- `EmployeeRepository.update()`
- `EmployeeRepository.softDelete()`
- `EmployeeRepository.restore()`

Consequence of removing it:

- Cross-tenant data leakage or unauthorized mutation.

#### Role Hierarchy Enforcement

What it protects:

- Prevents privilege escalation, such as a department head creating a hospital admin.

Where it lives:

- `assertCanAssignRole()`
- `EmployeeService.create()`
- `EmployeeService.update()`

Consequence of removing it:

- Users may assign roles above their authority.

#### Audit Creation

What it protects:

- HR accountability for sensitive employee lifecycle changes.

Where it lives:

- `EmployeeRepository.create()`
- `EmployeeRepository.update()`
- `EmployeeRepository.softDelete()`
- `EmployeeRepository.restore()`

Consequence of removing it:

- Employee changes become difficult or impossible to investigate.

#### Soft Delete Logic

What it protects:

- Historical attendance, roster, payroll, and audit references.

Where it lives:

- `EmployeeService.softDelete()`
- `EmployeeRepository.softDelete()`

Consequence of replacing with hard delete:

- Foreign keys and historical reports can break.

#### Restore Workflow

What it protects:

- Prevents casual reactivation through generic status updates.

Where it lives:

- `EmployeeService.updateStatus()`
- `EmployeeService.restore()`
- `EmployeeRepository.restore()`

Consequence of weakening it:

- Terminated employees may be reactivated without the intended admin/HR workflow.

#### Department Restrictions

What it protects:

- Department-scoped users cannot create, move, or schedule staff outside their authority.

Where it lives:

- `EmployeeService.create()`
- `EmployeeService.updateDepartment()`
- `EmployeeService.resolveAccessibleDepartmentIds()`
- `EmployeeService.assertCanAccessEmployee()`

Consequence of removing it:

- Department heads/supervisors may see or mutate staff outside their department.

### Shift/Roster Module

#### Active Assignment Uniqueness

What it protects:

- One employee cannot have two active non-cancelled assignments on the same date in the same tenant.

Where it lives:

- Raw SQL partial unique index.
- `RosterRepository.assignEmployees()`.

Consequence of removing it:

- Two departments may believe they have the same employee scheduled.

#### Supersession Model

What it protects:

- Historical schedule changes.

Where it lives:

- `RosterRepository.assignEmployees()`
- `RosterRepository.unassignEmployees()`

Consequence of replacing with direct update:

- Reassignment history is lost.

#### Serializable Transactions

What it protects:

- Race conditions during concurrent roster edits.

Where it lives:

- `RosterRepository.assignEmployees()`
- `RosterRepository.unassignEmployees()`

Consequence of weakening it:

- Concurrent schedule writes may create conflicting active states.

#### Shift Snapshots

What it protects:

- Payroll/reconciliation interpretation of historical assignments.

Where it lives:

- `RosterAssignment.startTimeSnapshot`
- `RosterAssignment.endTimeSnapshot`
- `RosterAssignment.gracePeriodSnapshot`
- `RosterAssignment.overtimeThresholdSnapshot`
- `RosterAssignment.overnightSnapshot`
- `RosterRepository.assignEmployees()`

Consequence of removing it:

- Old assignments may be interpreted using today’s template rules.

#### History Creation

What it protects:

- Staffing audit trail for assignment, reassignment, and unassignment.

Where it lives:

- `RosterAssignmentHistory`
- `RosterRepository.assignEmployees()`
- `RosterRepository.unassignEmployees()`

Consequence of removing it:

- Reviewers cannot reconstruct how a roster changed.

#### Reassignment Flow

What it protects:

- Correctly closes old assignment, creates new assignment, links versions, and writes history.

Where it lives:

- `RosterRepository.assignEmployees()`

Consequence of breaking it:

- Duplicate active assignments, missing history, or disconnected supersession chains.

## 1. System Overview

This document explains the Employee module and Shift/Roster module in the hospital workforce management backend. These modules are responsible for two connected operational domains:

- Employee management: the hospital staff register, employment metadata, department assignment, role assignment, device user mapping, soft deletion, restoration, and HR audit trail.
- Shift and roster management: reusable shift templates, employee-date shift assignments, reassignment, unassignment, historical roster evidence, and scheduling controls for hospital departments.

The real-world workflow being digitized is the daily and monthly staffing process inside a hospital. HR and hospital administrators maintain the canonical employee list. Department heads and HR managers schedule employees into duty rosters for specific days and departments. A clinician may be contracted to OPD but floated to ICU for a particular day. The system must preserve that distinction because payroll, attendance reconciliation, clinical accountability, and department staffing reports depend on knowing both the employee home department and the exact department where a shift was performed.

The Employee module is the source of truth for:

- Who the employee is.
- Which tenant/hospital owns the employee.
- Which department the employee belongs to by default.
- Which role the employee has in the platform.
- Which physical biometric/device identifier maps to the employee.
- Whether the employee is active, suspended, terminated, or restored.
- Who changed sensitive employee data and what changed.

The Shift/Roster module is the source of truth for:

- What shift patterns exist for a hospital tenant.
- What operational rules apply to each shift, such as grace period and overtime threshold.
- Which employee is assigned to which department on which date.
- Whether an assignment is current, reassigned, cancelled, or historically superseded.
- What the shift template looked like at the time of assignment.

The modules are intentionally separate but closely related. Employee records provide the schedulable workforce. Roster assignments consume employee IDs, department IDs, role context, employment status, and tenant scope. The roster engine does not create employees; it relies on the Employee module and shared database schema to guarantee that only valid, tenant-owned, active staff can be scheduled.

## 2. Monorepo Architecture Overview

The repository is a Turborepo monorepo with application code under `apps/` and shared packages under `packages/`.

```txt
hospital-clockin-system
├── apps
│   ├── backend-api
│   │   └── NestJS HTTP API
│   └── web-frontend
│       └── Next.js frontend
├── packages
│   ├── database
│   │   ├── Prisma schema
│   │   ├── Prisma client wrapper
│   │   └── generated runtime package entrypoint
│   └── types-common
│       └── shared DTOs, enums, and API contracts
└── turbo.json
```

The backend application is `apps/backend-api`. It owns controllers, services, repositories, guards, decorators, and application modules. It does not define its own Prisma schema or duplicate shared DTOs for Employee or Roster. Instead, it imports:

- `@chronos/types-common` for DTOs and enums.
- `@chronos/database` for the shared Prisma client and Prisma types.

This follows the supervisor instruction:

```txt
Use schemas and datatypes defined in packages folder.
```

The shared contracts live in `packages/types-common/src/api-contracts.ts`. Employee and Roster controllers import DTOs such as `EmployeeCreateDTO`, `EmployeeQueryDTO`, `ShiftTemplateCreateDTO`, and `ShiftAssignmentCreateDTO` from that package. The Prisma schema lives in `packages/database/prisma/schema/*.prisma`, with the Employee domain in `user.prisma` and the Roster domain in `roster.prisma`.

The database package exposes a single shared Prisma client:

```txt
packages/database/src/client.ts
  -> exports db
  -> exports Prisma client types from @prisma/client
```

The backend wraps this shared client in `DatabaseService`:

```txt
Repository
  -> DatabaseService.client
  -> @chronos/database db
  -> PrismaClient
  -> PostgreSQL
```

The build wiring now treats shared packages as runtime packages:

- `packages/types-common/package.json` points `main` to `./dist/index.js`.
- `packages/database/package.json` points `main` to `./dist/index.js`.
- Both packages have `build: tsc`.
- `turbo run build` builds shared packages before dependent applications.

This matters because Node cannot safely execute TypeScript source entrypoints in production. The backend now imports compiled JavaScript from shared packages at runtime.

## 3. Complete Request Lifecycle

The implemented runtime architecture is:

```txt
HTTP Request
  -> NestJS bootstrap
  -> AppModule
  -> Module routing
  -> JwtAuthGuard
  -> RolesGuard
  -> Controller
  -> Service
  -> Repository
  -> DatabaseService
  -> Shared Prisma Client
  -> PostgreSQL
  -> Response mapping
```

Each layer has a narrow responsibility.

Controllers:

- Define routes.
- Attach guards and role metadata.
- Extract path params, query params, body, tenant ID, and current user.
- Delegate to services.

Services:

- Enforce business rules.
- Normalize and validate DTO fields.
- Apply role hierarchy and department access rules.
- Decide which repository operation is appropriate.
- Map database records to response DTOs.

Repositories:

- Own Prisma queries.
- Enforce tenant-scoped database access.
- Execute transactions.
- Translate known Prisma/database conflicts into HTTP exceptions.
- Avoid leaking sensitive fields by selecting explicit projections.

DatabaseService:

- Provides the shared Prisma client from `@chronos/database`.
- Prevents each module from creating its own Prisma client.

Shared packages:

- `@chronos/types-common` gives controllers and services the contract vocabulary.
- `@chronos/database` gives repositories the actual Prisma client.

### Employee Creation Lifecycle

```txt
POST /api/employees
  -> JwtAuthGuard verifies Bearer JWT
  -> request.user is populated
  -> TenantContextService is set
  -> RolesGuard checks create roles
  -> EmployeeController.create extracts tenant, actor, payload
  -> EmployeeService.create validates fields, role assignment, department scope
  -> bcrypt hashes raw password server-side
  -> EmployeeRepository.create opens transaction
  -> tx.user.create inserts tenant-scoped user
  -> tx.employeeAudit.create inserts CREATE audit row
  -> service maps User record to EmployeeResponseDTO
```

## Runtime Walkthrough Of My Modules

This section traces the two most important flows through the exact layers I implemented.

### Employee Creation

```txt
HTTP Request
  -> JwtAuthGuard
  -> RolesGuard
  -> EmployeeController.create()
  -> EmployeeService.create()
  -> EmployeeRepository.create()
  -> Prisma transaction
  -> User insert
  -> EmployeeAudit insert
  -> Transaction commit
  -> EmployeeResponseDTO
```

Detailed execution:

1. Client sends `POST /api/employees` with Bearer JWT and `EmployeeCreateDTO`.
2. `JwtAuthGuard` verifies the JWT signature, validates the payload, and writes `request.user`.
3. `RolesGuard` checks route metadata and confirms the actor has one of the employee-create roles.
4. `@TenantId()` extracts `request.user.tenantId`; the tenant is not accepted from the body.
5. `@CurrentUser()` extracts the authenticated actor for role checks and audit attribution.
6. `EmployeeController.create()` delegates immediately to `EmployeeService.create()`.
7. `EmployeeService.create()` validates role assignment, department ownership, department-scoped access, employee fields, and raw password.
8. The service hashes the raw password with bcrypt before persistence.
9. `EmployeeRepository.create()` opens a Prisma transaction.
10. `tx.user.create()` inserts the tenant-owned employee record.
11. `tx.employeeAudit.create()` inserts the `CREATE` audit row using the authenticated actor.
12. The transaction commits.
13. The service maps database fields to `EmployeeResponseDTO` and excludes `passwordHash`.

What teammates should preserve:

- Do not move password hashing to the client.
- Do not accept `tenantId` or `actorUserId` from the body.
- Do not create employees outside the audit transaction.
- Do not include `passwordHash` in response projections.

### Shift Assignment

```txt
HTTP Request
  -> JwtAuthGuard
  -> RolesGuard
  -> RosterController.assignEmployees()
  -> RosterService.assignEmployees()
  -> validate shift, employees, dates, department access
  -> RosterRepository.assignEmployees()
  -> Serializable transaction
  -> Existing assignment check
  -> Supersession if needed
  -> New assignment with snapshots
  -> History creation
  -> Commit
  -> RosterAssignmentResponseDTO[]
```

Detailed execution:

1. Client sends `POST /api/roster/shifts/:id/assign-employees`.
2. Guards authenticate the actor and enforce scheduling roles.
3. Controller extracts tenant, actor, shift template ID, and request body.
4. Service validates the shift template ID and loads the template by tenant.
5. Service rejects inactive templates.
6. Service validates employee UUIDs and confirms employees belong to the tenant.
7. Service validates `effectiveFrom` and `effectiveTo`.
8. Service confirms assignment dates fit inside the template effective window.
9. Service expands the date range into employee-date rows.
10. Service resolves the work department from request override or employee home department.
11. Service blocks terminated/suspended employees.
12. Service enforces department scheduling restrictions.
13. Repository opens a serializable transaction.
14. Repository looks for an existing active assignment for each tenant/user/date.
15. If one exists, repository marks it `REASSIGNED` and sets `supersededAt`.
16. Repository creates a new active `UNVERIFIED` assignment with shift snapshots.
17. Repository links the old assignment to the new assignment if reassigned.
18. Repository inserts `RosterAssignmentHistory`.
19. Transaction commits and the service returns response DTOs.

What teammates should preserve:

- Keep active assignment lookup tenant/user/date scoped.
- Keep serializable isolation for assignment mutation.
- Keep snapshot fields populated from the template.
- Keep history insertion inside the transaction.
- Keep reassignment as supersession, not in-place mutation.

## Merge Guide For Teammates

Use this checklist before merging changes that touch Employee or Shift/Roster behavior.

### Before Merging

1. Pull latest main branch.
2. Sync schema changes under `packages/database/prisma/schema`.
3. Run Prisma generate.
4. Run Prisma migrations against the target development database.
5. Verify shared contracts in `packages/types-common/src/api-contracts.ts`.
6. Build the Turborepo.
7. Run available tests or targeted smoke checks.
8. Verify environment variables, especially `JWT_SECRET` and `DATABASE_URL`.

Recommended commands:

```bash
git pull origin main
npm run db:generate
npm run db:migrate
npm run build
npm run start --workspace apps/backend-api
```

Smoke checks:

```bash
curl -i http://localhost:3000/api/employees
curl -i http://localhost:3000/api/roster/shifts
```

Unauthenticated responses should be `401 Unauthorized`, which confirms the routes are reachable and guarded.

### Common Merge Conflicts

Schema conflicts:

- Usually occur in `user.prisma`, `roster.prisma`, or migrations.
- Resolve by preserving fields required by repositories and migrations.
- Do not remove snapshot fields or audit/history relations.

DTO conflicts:

- Usually occur in `api-contracts.ts`.
- Ensure controller/service imports still match DTO names.
- Do not reintroduce `passwordHash` as an API input.

Migration conflicts:

- Preserve the partial unique index for active assignments.
- Preserve employee audit and roster history tables.
- If two migrations touch the same table, confirm resulting SQL applies cleanly on a fresh database.

Package/build conflicts:

- Shared packages must keep `main` and `types` pointed at `dist`.
- Removing shared package build scripts can reintroduce runtime import failures.

Auth/role conflicts:

- If new roles are added, update `UserRole`, `role-policy.ts`, route decorators, and JWT issuance together.
- Do not rely only on route roles when domain-specific role checks are required.

Engineer’s Note:
The highest-risk merge conflicts are migrations. If a migration is edited incorrectly, the code may compile but fail only after deployment or in a fresh environment. Always test migration application, not just TypeScript build.

## Why I Chose This Design

### Repository Pattern

I used repositories because persistence is not just simple CRUD in these modules. The repositories own tenant filters, Prisma transactions, projections, audit/history writes, and conflict mapping. This keeps controllers thin and services focused on business orchestration.

Tradeoff:

- More files and method boundaries.

Why acceptable:

- Reviewers can inspect tenant and transaction behavior in one place.
- Future maintainers can change persistence without rewriting route code.

### Service Layer Orchestration

Services own business decisions:

- Can this actor assign this role?
- Can this employee be scheduled?
- Does this department belong to the tenant?
- Is this date range valid?
- What audit metadata should be written?

This avoids pushing business rules into controllers or repositories.

### Tenant Isolation

Tenant ID flows explicitly from JWT to controller decorator to service to repository. I chose explicit method parameters over hidden global context because tenant boundaries should be visible in code review.

### Role Hierarchy

Route roles answer "who can call this endpoint?" Role policy helpers answer "what can this actor do inside the endpoint?" Both are needed. Example: a department head may call employee create, but still must not create a hospital admin.

### Audit Tables

Employee state changes are HR-sensitive. Audit rows are not optional bookkeeping; they are how the system proves who changed employment status, device mapping, department, profile, or role.

### Immutable Roster History

Roster history is preserved because staffing decisions matter operationally. A hospital may need to know not just the final shift assignment, but whether someone was reassigned, when, by whom, and why.

### Shift Snapshots

Shift templates are configuration. Configuration changes over time. Assignment snapshots preserve the rule values that existed when the schedule was created, which protects payroll and reconciliation from historical drift.

### Serializable Transactions

The roster assignment path uses serializable transactions because duplicate active assignments are worse than occasional retry conflicts. Scheduling correctness is more important than maximizing write throughput.

### Supersession Model

Supersession keeps the old assignment row and creates a replacement. It is more verbose than direct update, but it preserves evidence. That is the correct tradeoff for staffing and payroll-facing data.

## How Other Modules Will Use My Work

### Employee Module Provides

- Employee records.
- Role information.
- Department/home-base information.
- Device mapping through `devicePin`.
- Employment status.
- Active/deleted lifecycle state.
- Employee audit history.

Consumers:

- Auth can use user identity and role.
- Attendance can map biometric/device IDs to employees.
- Payroll can use employment status, hourly rate, and employee identity.
- Reporting can group staff by tenant, department, role, or status.
- Leave management can reference employees and departments.

### Shift/Roster Module Provides

- Active assignment information.
- Shift schedules.
- Assignment history.
- Shift snapshots.
- Work department per date.
- Reassignment/cancellation evidence.

Consumers:

- Attendance can compare clock-in events to scheduled shifts.
- Reconciliation can compare actual attendance against planned roster.
- Payroll can use roster snapshots and overridden rates to calculate shift-related compensation.
- Reporting can display staffing coverage by department/date.
- Notifications can alert employees or managers about assignment changes.

Integration rule:

- Other modules should consume roster evidence; they should not rewrite roster history directly. Schedule mutations should go through the Roster service/repository path so supersession, snapshots, and history are preserved.

## Questions Teammates Will Probably Ask

### Why not update assignments directly?

Because a direct update destroys the old schedule. Reassignment is an event, and the system needs to preserve it. Supersession gives us both the old assignment and the replacement.

### Why store snapshots?

Because templates change. Payroll and reconciliation need the template values from the time the assignment was created, not the current template values.

### Why use serializable transactions?

Because two planners can edit the same employee/date at the same time. Serializable transactions plus the partial unique index protect the active-assignment invariant.

### Why create audit rows?

Because employee lifecycle changes are sensitive HR actions. If role, department, device mapping, status, or deletion changes, the system must know who did it and what changed.

### Why use repositories?

Because the database layer contains important invariants: tenant filters, transactions, projections, conflict mapping, audit/history writes. Keeping those in repositories makes them easier to review and test.

### Why not query Prisma directly in controllers?

Controllers are HTTP adapters. If they query Prisma directly, routing, validation, authorization, and persistence become tangled. That makes the code harder to review safely.

### Why use tenant filtering everywhere?

Because this is a multi-tenant system. Tenant filtering is the core data boundary. Every read/write must prove which hospital owns the data.

### Why not implement payroll here?

Payroll should consume Employee and Roster evidence, not live inside Roster. Keeping payroll separate prevents scheduling logic from being mixed with financial calculations.

### Why not implement attendance here?

Roster is the planned schedule. Attendance is actual clock-in/out behavior. They are related, but they are different bounded contexts.

### Employee Update Lifecycle

```txt
PATCH /api/employees/:id
  -> Guards authenticate and authorize
  -> Controller passes tenant, actor, id, payload
  -> Service validates UUID and loads existing employee
  -> Service checks whether actor can access employee
  -> Service builds an allowed update data object
  -> Repository uses updateMany({ id, tenantId })
  -> Repository writes EmployeeAudit in same transaction
  -> Repository reloads employee with safe projection
  -> Service returns response DTO
```

### Shift Assignment Lifecycle

```txt
POST /api/roster/shifts/:id/assign-employees
  -> JwtAuthGuard verifies token and tenant
  -> RolesGuard confirms scheduling role
  -> RosterController.assignEmployees extracts tenant, actor, shift ID, body
  -> RosterService validates shift, employees, dates, department access
  -> Service expands date range into employee-date rows
  -> RosterRepository.assignEmployees opens Serializable transaction
  -> Existing active assignment is superseded if present
  -> New assignment is created with shift snapshots
  -> Assignment history row is inserted
  -> Transaction commits
  -> Service maps rows to RosterAssignmentResponseDTO[]
```

## Application Bootstrap Lifecycle

The backend starts from compiled JavaScript, not from TypeScript source. In production-style execution the command is:

```bash
node dist/main
```

That file is emitted from `apps/backend-api/src/main.ts`. The important thing to understand is that the controllers and providers do not become live simply because the files exist. Nest must bootstrap the application, inspect module metadata, create a dependency injection container, instantiate providers, register controllers, and bind an HTTP listener.

Runtime startup flow:

```txt
node dist/main.js
  -> imports AppModule
  -> bootstrap()
  -> NestFactory.create(AppModule)
  -> Nest scans AppModule metadata
  -> Nest recursively discovers imported modules
  -> Nest registers providers in the IoC container
  -> Nest creates singleton provider instances
  -> Nest resolves constructor dependencies
  -> Nest registers controllers
  -> Nest attaches middleware and guards
  -> Express HTTP adapter is created
  -> RouterExplorer maps controller methods to routes
  -> Global ValidationPipe is attached
  -> CORS is enabled
  -> app.listen(PORT)
  -> Node event loop remains alive through the HTTP server
```

### What Executes First

`main.ts` executes first. It calls:

```ts
const app = await NestFactory.create(AppModule);
```

`NestFactory.create()` is the point where Nest turns static TypeScript decorators into a runtime application graph. It reads `@Module(...)` metadata from `AppModule`, then recursively inspects each imported module:

```txt
AppModule
  -> DatabaseModule
  -> EmployeeModule
  -> RosterModule
  -> AuthModule
  -> DepartmentModule
  -> other backend modules
```

For the assigned modules, this means Nest discovers:

```txt
EmployeeModule
  controllers: [EmployeeController]
  providers: [EmployeeRepository, EmployeeService]
  imports: [DatabaseModule]

RosterModule
  controllers: [RosterController]
  providers: [RosterRepository, RosterService]
  imports: [DatabaseModule]
```

### Provider Registration And Singleton Creation

Nest registers providers from each module into its inversion-of-control container. In this codebase, providers are singleton-scoped by default. That means one `EmployeeService` instance is created for the application lifecycle, one `EmployeeRepository` instance is created, one `RosterService` instance is created, and so on.

Singleton providers are useful here because the services and repositories are stateless orchestration objects. They do not store per-request data internally. Per-request state, such as authenticated user and tenant, is passed as method arguments or stored in `TenantContextService` using AsyncLocalStorage.

### Controller Registration And Route Mapping

Once the modules are initialized, Nest registers controllers. It reads class-level and method-level decorators:

```ts
@Controller('api/employees')
@UseGuards(JwtAuthGuard, RolesGuard)
```

and route decorators:

```ts
@Post()
@Get()
@Patch(':id')
```

The router maps these to concrete HTTP endpoints:

```txt
POST   /api/employees
GET    /api/employees
PATCH  /api/employees/:id
POST   /api/roster/shifts
POST   /api/roster/shifts/:id/assign-employees
```

During verification, Nest logged these mappings at startup. This is valuable operationally because route mapping confirms that the modules are not only compiled, but actually reachable through the running HTTP server.

### Middleware, Guards, And Pipes At Runtime

`AppModule.configure()` applies `TenantContextMiddleware` to all routes. Middleware runs as part of HTTP request processing. Guards run after route resolution but before the controller method is invoked.

Runtime request order is roughly:

```txt
Express receives request
  -> Nest middleware chain
  -> Nest route matching
  -> JwtAuthGuard.canActivate()
  -> RolesGuard.canActivate()
  -> parameter decorators resolve values
  -> controller method executes
  -> service method executes
  -> repository method executes
  -> Prisma query/transaction executes
  -> controller return value is serialized
  -> HTTP response is sent
```

The global `ValidationPipe` is also attached during bootstrap. Because the current shared DTOs are interfaces, not decorated classes, the modules still use explicit validation helpers in services. The global pipe is still important for future class-based DTOs and for enforcing `whitelist`, `transform`, and `forbidNonWhitelisted` where runtime metadata exists.

### How The Application Stays Alive

Before bootstrap was implemented, `node dist/main` exited immediately because no HTTP server was created. After `await app.listen(port)`, Node has an open server handle. That server handle keeps the event loop alive and allows incoming HTTP requests to be processed.

This is the difference between "code compiles" and "backend is running":

```txt
Compile success
  -> TypeScript emitted JavaScript
  -> does not imply HTTP routes are active

Runtime bootstrap success
  -> Nest app initialized
  -> routes mapped
  -> server listening
  -> requests can reach controllers
```

## Dependency Injection & Provider Wiring

NestJS uses an inversion-of-control container. Instead of manually constructing controllers, services, and repositories with `new`, the framework reads module metadata and creates the dependency graph.

This constructor:

```ts
constructor(private readonly employeeService: EmployeeService) {}
```

does not manually create `EmployeeService`. It declares a dependency. Nest resolves it because `EmployeeService` is listed in `EmployeeModule.providers`.

### Employee Dependency Graph

```txt
AppModule
  imports EmployeeModule

EmployeeModule
  imports DatabaseModule
  controllers: EmployeeController
  providers: EmployeeService, EmployeeRepository

EmployeeController
  constructor(EmployeeService)

EmployeeService
  constructor(EmployeeRepository)

EmployeeRepository
  constructor(DatabaseService)

DatabaseService
  exposes @chronos/database db
```

Runtime resolution:

1. Nest sees `EmployeeController` in `EmployeeModule.controllers`.
2. Nest inspects the controller constructor and sees `EmployeeService`.
3. Nest finds `EmployeeService` in the same module's providers.
4. Nest creates `EmployeeService`, but first inspects its constructor.
5. Nest sees `EmployeeRepository`.
6. Nest finds `EmployeeRepository` in the same module's providers.
7. Nest creates `EmployeeRepository`, but first inspects its constructor.
8. Nest sees `DatabaseService`.
9. `DatabaseService` is exported by `DatabaseModule`, which `EmployeeModule` imports.
10. Nest injects the shared `DatabaseService` instance.

### Roster Dependency Graph

```txt
AppModule
  imports RosterModule

RosterModule
  imports DatabaseModule
  controllers: RosterController
  providers: RosterService, RosterRepository

RosterController
  constructor(RosterService)

RosterService
  constructor(RosterRepository)

RosterRepository
  constructor(DatabaseService)
```

This pattern is intentionally symmetrical with the Employee module. It makes the code predictable: controllers route, services decide, repositories persist.

### DatabaseModule As Infrastructure Boundary

`DatabaseModule` provides and exports:

```txt
DatabaseService
TenantContextService
JwtAuthGuard
RolesGuard
```

This matters because guards are referenced by controllers in feature modules. If a module uses `JwtAuthGuard` or `RolesGuard`, those guard classes must be resolvable in that module's provider context. Importing `DatabaseModule` gives Employee and Roster access to the shared guard/provider infrastructure.

`TenantContextService` is intentionally provided once through `DatabaseModule`. That avoids multiple AsyncLocalStorage instances and keeps tenant context consistent.

### Why DI Helps This Codebase

DI is not just framework ceremony here. It gives the backend practical engineering benefits:

- Controllers can be tested with mocked services.
- Services can be tested with mocked repositories.
- Repositories can be tested against a real or test Prisma client wrapper.
- The shared database client is centralized instead of recreated per module.
- Runtime wiring is declarative through modules instead of hidden in constructors.
- Replacing infrastructure later, for example swapping `DatabaseService` for a test implementation, is much easier.

The tradeoff is that provider registration must be correct. Missing imports or duplicate providers can produce runtime failures or subtle state bugs. The duplicate `TenantContextService` issue was an example of this: two providers of the same stateful AsyncLocalStorage service could split request context.

## 4. Controller Layer Documentation

Controllers are intentionally thin. They should not contain business rules, database calls, or tenant logic beyond extracting values through decorators. This keeps the HTTP boundary easy to review and prevents business decisions from being scattered across routing code.

### EmployeeController

File: `apps/backend-api/src/employee/employee.controller.ts`

Base route:

```ts
@Controller('api/employees')
@UseGuards(JwtAuthGuard, RolesGuard)
```

The base route keeps existing route semantics stable. There is no global `api` prefix in `main.ts`, so routes are exactly `/api/employees`, not `/api/api/employees`.

Class-level guards:

- `JwtAuthGuard`: verifies the token, creates `request.user`, sets tenant context.
- `RolesGuard`: reads `@Roles(...)` metadata and checks `request.user.role`.

#### POST /api/employees

Method: `create()`

Allowed roles:

- `SUPER_ADMIN`
- `HOSPITAL_ADMIN`
- `HR_MANAGER`
- `DEPT_HEAD`

Request extraction:

- `@TenantId()` returns authenticated tenant ID from `request.user.tenantId`.
- `@CurrentUser()` returns the authenticated actor.
- `@Body()` returns `EmployeeCreateDTO`.

Purpose:

- Create a new employee/user record inside the authenticated hospital tenant.
- Hash the raw password server-side.
- Create an audit row recording who created the employee.

Controller action:

```txt
EmployeeController.create
  -> EmployeeService.create(tenantId, user, payload)
```

The controller does not trust tenant ID from the body or headers. Tenant identity comes from the JWT.

#### GET /api/employees

Method: `list()`

Allowed roles:

- `SUPER_ADMIN`
- `HOSPITAL_ADMIN`
- `HR_MANAGER`
- `DEPT_HEAD`
- `SUPERVISOR`

Request extraction:

- Tenant from `@TenantId()`.
- Actor from `@CurrentUser()`.
- Filters from `@Query()`.

Purpose:

- Return a paginated employee list.
- Allow filtering by search, department, employment status, employment type, and deleted state.
- Apply department-scoped visibility for department-level actors.

#### GET /api/employees/:id

Method: `getById()`

Allowed roles:

- `SUPER_ADMIN`
- `HOSPITAL_ADMIN`
- `HR_MANAGER`
- `DEPT_HEAD`
- `SUPERVISOR`
- `EMPLOYEE`

Purpose:

- Return one employee by ID if the actor can access it.
- Employees can access their own record.
- Department-scoped actors can access records in their department.
- Tenant-wide roles can access all employees in the tenant.

#### PATCH /api/employees/:id

Method: `update()`

Allowed roles:

- `SUPER_ADMIN`
- `HOSPITAL_ADMIN`
- `HR_MANAGER`
- `DEPT_HEAD`

Purpose:

- Update profile-level employee fields.
- Optionally update role through a guarded role hierarchy path.
- Create audit evidence with before and after values.

#### DELETE /api/employees/:id

Method: `softDelete()`

Allowed roles:

- `SUPER_ADMIN`
- `HOSPITAL_ADMIN`
- `HR_MANAGER`

Purpose:

- Soft-delete an employee by setting `deletedAt`, `isActive: false`, and `employmentStatus: TERMINATED`.
- Preserve historical attendance, payroll, audit, and roster references.

#### PATCH /api/employees/:id/status

Method: `updateStatus()`

Allowed roles:

- `SUPER_ADMIN`
- `HOSPITAL_ADMIN`
- `HR_MANAGER`
- `DEPT_HEAD`

Purpose:

- Change employment status to active, inactive, suspended, or terminated.
- If terminated, mark the record deleted.
- Prevent accidental reactivation of deleted employees through the generic status endpoint.

#### PATCH /api/employees/:id/department

Method: `updateDepartment()`

Allowed roles:

- `SUPER_ADMIN`
- `HOSPITAL_ADMIN`
- `HR_MANAGER`
- `DEPT_HEAD`

Purpose:

- Move an employee to a different home department.
- Validate that the target department belongs to the same tenant.
- Prevent department heads from assigning employees outside their own department.

#### PATCH /api/employees/:id/device-user

Method: `updateDeviceUser()`

Allowed roles:

- `SUPER_ADMIN`
- `HOSPITAL_ADMIN`
- `HR_MANAGER`

Purpose:

- Update the device-side user identifier, stored as `devicePin`.
- This connects a staff member to a biometric terminal or time clock identity.

#### PATCH /api/employees/:id/restore

Method: `restore()`

Allowed roles:

- `SUPER_ADMIN`
- `HOSPITAL_ADMIN`
- `HR_MANAGER`

Purpose:

- Restore a soft-deleted employee.
- Clear `deletedAt`.
- Set `isActive` and `employmentStatus` back to active.

### RosterController

File: `apps/backend-api/src/roster/roster.controller.ts`

Base route:

```ts
@Controller('api/roster')
@UseGuards(JwtAuthGuard, RolesGuard)
```

The controller exposes shift-template and roster-assignment endpoints. It stays thin and delegates scheduling rules to `RosterService`.

#### POST /api/roster/shifts

Method: `createShiftTemplate()`

Allowed roles:

- `SUPER_ADMIN`
- `HOSPITAL_ADMIN`
- `HR_MANAGER`
- `DEPT_HEAD`

Purpose:

- Create a reusable shift template for a tenant.
- Examples: day shift, night shift, ICU long shift, locum flexible shift.

#### GET /api/roster/shifts

Method: `listShiftTemplates()`

Allowed roles:

- `SUPER_ADMIN`
- `HOSPITAL_ADMIN`
- `HR_MANAGER`
- `DEPT_HEAD`
- `SUPERVISOR`

Purpose:

- List shift templates with pagination and optional filters.
- Used by roster planning screens and administrative configuration views.

#### GET /api/roster/shifts/:id

Method: `getShiftTemplate()`

Allowed roles:

- `SUPER_ADMIN`
- `HOSPITAL_ADMIN`
- `HR_MANAGER`
- `DEPT_HEAD`
- `SUPERVISOR`
- `EMPLOYEE`

Purpose:

- Read one template by ID.
- Employees can read template definitions because assigned shifts may need display metadata.

#### PATCH /api/roster/shifts/:id

Method: `updateShiftTemplate()`

Allowed roles:

- `SUPER_ADMIN`
- `HOSPITAL_ADMIN`
- `HR_MANAGER`
- `DEPT_HEAD`

Purpose:

- Modify operational details of a template.
- Existing assignments keep snapshot fields, so updating a template does not rewrite historical shift evidence.

#### DELETE /api/roster/shifts/:id

Method: `deactivateShiftTemplate()`

Allowed roles:

- `SUPER_ADMIN`
- `HOSPITAL_ADMIN`
- `HR_MANAGER`

Purpose:

- Deactivate a template rather than deleting it.
- Keeps historical roster assignments referencing the old template intact.

#### POST /api/roster/shifts/:id/assign-employees

Method: `assignEmployees()`

Allowed roles:

- `SUPER_ADMIN`
- `HOSPITAL_ADMIN`
- `HR_MANAGER`
- `DEPT_HEAD`

Purpose:

- Assign one or more employees to a shift template over one or more dates.
- Supports bulk monthly roster generation by accepting an employee array and date range.
- Uses actor from `@CurrentUser()` so `assignedByUserId` cannot be spoofed from the request body.

#### POST /api/roster/shifts/:id/unassign-employees

Method: `unassignEmployees()`

Allowed roles:

- `SUPER_ADMIN`
- `HOSPITAL_ADMIN`
- `HR_MANAGER`
- `DEPT_HEAD`

Purpose:

- Cancel current active roster assignments for employees and dates.
- Uses a cancellation assignment record instead of hard deletion.
- Writes history rows for audit and scheduling traceability.

## 5. Service Layer Documentation

### EmployeeService

File: `apps/backend-api/src/employee/employee.service.ts`

The Employee service owns HR business logic. It validates input, checks role hierarchy, enforces department-level access, hashes credentials, builds audit metadata, and maps Prisma records into response DTOs.

#### create()

Flow:

```txt
create(tenantId, actor, payload)
  -> read departmentId
  -> resolve target role, default EMPLOYEE
  -> assert actor may assign target role
  -> validate department UUID if provided
  -> assert department belongs to tenant
  -> enforce department-scoped actor creation boundary
  -> validate raw password
  -> bcrypt.hash(password, 12)
  -> normalize employee fields
  -> repository.create(..., audit)
  -> toResponse()
```

Business rules:

- A user cannot assign a role above their authority.
- Department-scoped actors can only create employees in their own department.
- The API accepts raw password and hashes it server-side. This avoids trusting client-generated hashes.
- The response never includes `passwordHash`.

Security reasoning:

- `tenantId` is not read from the request body.
- `actorUserId` comes from `CurrentUser`, not from the client.
- Password hashing uses bcrypt with 12 salt rounds.

Audit reasoning:

- Create writes an `EmployeeAudit` row in the same transaction as `user.create`.
- The audit records actor, action `CREATE`, previous value `null`, and selected new values.

#### list()

Flow:

```txt
list(tenantId, actor, query)
  -> normalize pagination
  -> validate search and filters
  -> resolve employmentStatus and employmentType enums
  -> resolve accessibleDepartmentIds based on actor role
  -> repository.list(tenantId, filters)
  -> paginatedResponse()
```

Business rules:

- Tenant-wide roles see all tenant employees.
- Employees can only list themselves indirectly through their department constraints.
- Department heads and supervisors are restricted to their department.
- `includeDeleted` is opt-in.

#### getById()

Flow:

```txt
getById(tenantId, actor, id)
  -> assert UUID
  -> repository.findByIdOrThrow(tenantId, id)
  -> assertCanAccessEmployee(actor, employee)
  -> toResponse()
```

Business rules:

- The repository first guarantees tenant ownership.
- The service then applies actor-specific visibility rules.

#### update()

Flow:

```txt
update(tenantId, actor, id, payload)
  -> assert UUID
  -> load existing employee
  -> assert actor can access employee
  -> validate provided mutable fields
  -> optionally validate role assignment
  -> reject empty patch
  -> repository.update(..., audit)
  -> toResponse()
```

Audit behavior:

- The service captures previous values by key.
- Action is `ROLE_CHANGE` when role changes, otherwise `PROFILE_UPDATE`.
- Repository writes the audit row in the same transaction as the update.

#### updateStatus()

Flow:

```txt
updateStatus(tenantId, actor, id, payload)
  -> assert UUID
  -> validate employmentStatus enum
  -> load employee including deleted records
  -> assert actor access
  -> prevent restoring deleted employee through status endpoint
  -> update employmentStatus, isActive, and maybe deletedAt
  -> audit STATUS_CHANGE
```

Business reasoning:

- Termination and deletion are sensitive lifecycle events.
- Restore is intentionally explicit through `restore()`.

#### updateDepartment()

Flow:

```txt
updateDepartment(tenantId, actor, id, payload)
  -> assert employee UUID
  -> load existing employee
  -> assert access
  -> require departmentId field, allowing null
  -> if non-null, validate UUID and tenant ownership
  -> enforce department-scoped actor boundary
  -> update and audit DEPARTMENT_CHANGE
```

Business reasoning:

- Home department affects default employee visibility and default roster department.
- Moving employees across departments must be audited.

#### updateDeviceUser()

Flow:

```txt
updateDeviceUser(tenantId, actor, id, payload)
  -> assert employee UUID
  -> load existing employee
  -> assert access
  -> validate deviceUserId
  -> update devicePin
  -> audit DEVICE_MAPPING_CHANGE
```

Business reasoning:

- Device user mapping connects software identity to physical clock-in terminals.
- Incorrect mapping can corrupt attendance, payroll, and reconciliation.

#### softDelete()

Flow:

```txt
softDelete(tenantId, actor, id)
  -> assert UUID
  -> load existing active employee
  -> assert access
  -> repository.softDelete(tenantId, id, actor.userId)
```

Business reasoning:

- The system preserves rows for historical reporting.
- Hard deletion would break attendance logs, payslips, and roster evidence.

#### restore()

Flow:

```txt
restore(tenantId, actor, id)
  -> assert UUID
  -> require SUPER_ADMIN, HOSPITAL_ADMIN, or HR_MANAGER
  -> repository.restore(tenantId, id, actor.userId)
```

Business reasoning:

- Restoration is restricted to high-trust HR/admin roles.
- It records an audit row with lifecycle before and after values.

#### EmployeeService helper methods

`normalizeEmergencyContacts()` ensures emergency contacts are an array of objects and validates name, relationship, phone, and optional email.

`toResponse()` maps database field names to API field names:

- `payrollNumber` becomes `employeeCode`.
- `devicePin` becomes `deviceUserId`.
- Decimal hourly rate becomes a JavaScript number.
- Dates become ISO strings.

`resolveAccessibleDepartmentIds()` implements read-scope decisions.

`assertCanAccessEmployee()` enforces per-record visibility.

`pickAuditedValues()` builds a focused before-snapshot for update audit rows.

### RosterService

File: `apps/backend-api/src/roster/roster.service.ts`

The Roster service owns scheduling business logic. It validates time formats, effective dates, employee schedulability, department access, template windows, assignment expansion, and response mapping.

#### createShiftTemplate()

Flow:

```txt
createShiftTemplate(tenantId, payload)
  -> validate startTime and endTime as HH:mm
  -> reject equal start/end
  -> validate effectiveFrom and effectiveTo
  -> validate effective date order
  -> infer isOvernight if not provided
  -> default grace/early/overtime values
  -> repository.createShiftTemplate()
  -> toShiftTemplateResponse()
```

Business reasoning:

- Shift templates represent reusable duty patterns.
- Overnight is inferred when `endTime <= startTime`, for example `19:00` to `07:00`.
- Effective windows allow template changes over time without invalidating future scheduling rules.

#### listShiftTemplates()

Flow:

```txt
listShiftTemplates(tenantId, query)
  -> normalize pagination
  -> validate search
  -> validate type enum
  -> normalize isActive boolean from boolean or string query
  -> repository.listShiftTemplates()
  -> paginatedResponse()
```

Business reasoning:

- Planners need searchable, paginated template lists.
- Inactive templates can be included or filtered.

#### getShiftTemplate()

Flow:

```txt
getShiftTemplate(tenantId, id)
  -> assert UUID
  -> repository.findShiftTemplateOrThrow()
  -> toShiftTemplateResponse()
```

#### updateShiftTemplate()

Flow:

```txt
updateShiftTemplate(tenantId, id, payload)
  -> assert UUID
  -> validate each provided field
  -> reject empty update
  -> if time fields changed, load current template and recalculate overnight unless explicit
  -> if effective dates changed, load current template and validate order
  -> repository.updateShiftTemplate()
  -> toShiftTemplateResponse()
```

Business reasoning:

- Template edits affect future planning.
- Existing assignments keep their snapshot fields, so historical records remain stable.

#### deactivateShiftTemplate()

Flow:

```txt
deactivateShiftTemplate(tenantId, id)
  -> assert UUID
  -> repository.updateShiftTemplate({ isActive: false })
  -> toShiftTemplateResponse()
```

Business reasoning:

- Templates are deactivated, not deleted, because old assignments may reference them.

#### assignEmployees()

Flow:

```txt
assignEmployees(tenantId, actor, shiftTemplateId, payload)
  -> validate shiftTemplateId
  -> load tenant-scoped shift template
  -> reject inactive template
  -> validate and deduplicate employee IDs
  -> assert employees belong to tenant
  -> validate effectiveFrom/effectiveTo
  -> assert assignment range is inside template effective window
  -> expand date range
  -> validate optional overridden hourly rate and reason
  -> validate optional departmentId belongs to tenant
  -> for each employee:
       -> resolve departmentId from payload or employee home department
       -> reject employees with no department unless departmentId provided
       -> reject TERMINATED or SUSPENDED employees
       -> assert actor can schedule that department
       -> create one row per date
  -> repository.assignEmployees(serializable transaction)
  -> toRosterAssignmentResponse()
```

Business reasoning:

- Supports monthly roster modeling by expanding a date range.
- Supports floating by allowing `departmentId` override.
- Prevents scheduling employees who are terminated or suspended.
- Prevents department heads from scheduling outside their department.

#### unassignEmployees()

Flow:

```txt
unassignEmployees(tenantId, actor, shiftTemplateId, payload)
  -> validate shiftTemplateId
  -> confirm shift template belongs to tenant
  -> validate employee IDs
  -> confirm employees belong to tenant
  -> validate date range
  -> expand date range
  -> build rows with actor ID and allowed department if scoped
  -> repository.unassignEmployees(serializable transaction)
  -> toRosterAssignmentResponse()
```

Business reasoning:

- Unassignment is historical cancellation, not deletion.
- A cancellation assignment records who cancelled it, when, and why.

#### RosterService helper methods

`expandDateRange()` turns `effectiveFrom` and `effectiveTo` into individual UTC date values. It caps the range at 366 days to avoid accidental massive writes.

`crossesMidnight()` detects overnight shifts.

`assertValidShiftWindow()` rejects zero-duration templates.

`assertDateOrder()` prevents invalid effective windows.

`assertWithinTemplateEffectiveWindow()` ensures assignments do not exceed template validity.

`assertCanScheduleDepartment()` applies department scheduling scope.

`toShiftTemplateResponse()` and `toRosterAssignmentResponse()` map database records into API-safe DTO shapes.

## 6. Repository Layer Documentation

### EmployeeRepository

File: `apps/backend-api/src/employee/employee.repository.ts`

The repository owns all Employee Prisma operations. It receives already-validated business input from the service and applies database-level tenant filtering.

#### list()

Prisma operations:

- `user.findMany`
- `user.count`
- Wrapped in Prisma `$transaction([...])`

Tenant behavior:

```ts
const where = { tenantId, ...filters };
```

The transaction keeps the item list and total count consistent enough for pagination under the same Prisma request batch.

Query optimization:

- Uses indexes on `tenantId`, `tenantId + employmentStatus`, and `tenantId + deletedAt`.
- Selects only response fields through `employeeSelect()`.
- Avoids selecting `passwordHash`.

#### findByIdOrThrow()

Prisma operation:

- `user.findFirst`

Tenant behavior:

```ts
where: { id, tenantId, deletedAt: null }
```

The method optionally includes deleted records for lifecycle operations such as status update or restore.

#### assertDepartmentBelongsToTenant()

Prisma operation:

- `department.findFirst`

Purpose:

- Prevents assigning or creating employees into a department owned by another tenant.
- Returns no department data except ID.

#### create()

Prisma operations:

- Interactive `$transaction`
- `tx.user.create`
- Optional `tx.employeeAudit.create`

Tenant behavior:

- The repository writes `{ ...data, tenantId }`.
- The client cannot override tenant assignment.

Why transaction exists:

- Employee creation and audit creation must succeed or fail together.
- A created employee without a create audit row is a compliance gap.

Conflict behavior:

- Prisma `P2002` becomes `ConflictException`.
- Tenant-local unique constraints may reject duplicate email, payroll number, or device PIN.

#### update()

Prisma operations:

- `findByIdOrThrow()` preloads existing employee for audit and existence.
- Interactive `$transaction`
- `tx.user.updateMany`
- Optional `tx.employeeAudit.create`
- `tx.user.findFirstOrThrow`

Why `updateMany` is used:

Prisma `update({ where: { id } })` can only qualify by unique fields unless a compound unique exists. `updateMany` allows the write itself to include tenant scope:

```ts
where: { id, tenantId }
```

That makes the actual write tenant-qualified, not just the precheck.

#### softDelete()

Prisma operations:

- Preload existing record.
- Interactive transaction.
- `tx.user.updateMany` with `{ id, tenantId, deletedAt: null }`.
- `tx.employeeAudit.create`.
- Reload tenant-scoped employee.

Business behavior:

- Sets `deletedAt`.
- Sets `isActive` to false.
- Sets `employmentStatus` to `TERMINATED`.

Why soft delete:

- Historical attendance, payroll, roster assignments, and audits remain valid.
- Foreign keys use restrict semantics in several places, making hard deletion inappropriate.

#### restore()

Prisma operations:

- Load existing record including deleted.
- If not deleted, return existing record without writing.
- Otherwise transactionally clear `deletedAt`, restore active status, insert audit, and reload.

#### employeeSelect()

Purpose:

- Central projection for employee responses.
- Prevents returning sensitive credential material.
- Includes department display fields for client convenience.

### RosterRepository

File: `apps/backend-api/src/roster/roster.repository.ts`

The repository owns shift-template and roster-assignment persistence. It is the most transaction-sensitive part of the assigned modules.

#### listShiftTemplates()

Prisma operations:

- `shiftTemplate.findMany`
- `shiftTemplate.count`
- Wrapped in `$transaction([...])`

Tenant behavior:

```ts
where: { tenantId, ...filters }
```

Ordering:

- Active templates first.
- Name ascending.

#### findShiftTemplateOrThrow()

Prisma operation:

- `shiftTemplate.findFirst`

Tenant behavior:

```ts
where: { id: shiftTemplateId, tenantId }
```

This prevents cross-tenant template reads.

#### createShiftTemplate()

Prisma operation:

- `shiftTemplate.create`

Tenant behavior:

- Writes `{ ...data, tenantId }`.

#### updateShiftTemplate()

Prisma operations:

- `findShiftTemplateOrThrow(tenantId, id)` precheck.
- `shiftTemplate.update({ where: { id }, data })`.

Production note:

- The precheck verifies tenant ownership before update.
- Because `id` is globally unique, practical risk is low.
- A stricter future improvement would use `updateMany({ where: { id, tenantId } })` and a count check to make the write tenant-qualified like Employee updates.

#### assertEmployeesBelongToTenant()

Prisma operation:

- `user.findMany`

Tenant behavior:

```ts
where: { tenantId, id: { in: employeeIds }, deletedAt: null }
```

It returns only fields needed for scheduling decisions:

- `id`
- `departmentId`
- `employmentStatus`

#### assertDepartmentBelongsToTenant()

Prisma operation:

- `department.findFirst`

Purpose:

- Prevents scheduling into a department from another tenant.

#### assignEmployees()

Prisma operations inside serializable interactive transaction:

1. For each row, find active previous assignment:

```txt
tenantId + userId + date + supersededAt null + status not CANCELLED
```

2. If previous assignment exists, mark it:

```txt
status = REASSIGNED
supersededAt = closedAt
```

3. Create new `rosterAssignment` with:

- employee ID
- department ID
- shift template ID
- date
- overridden hourly rate
- active status `UNVERIFIED`
- effective range
- actor ID
- shift snapshot fields

4. If previous assignment existed, link it:

```txt
previous.supersededByAssignmentId = created.id
```

5. Insert `rosterAssignmentHistory` with action:

- `ASSIGNED` for new assignment.
- `REASSIGNED` when replacing an existing active assignment.

Why transaction exists:

- Superseding old assignment, creating new assignment, and writing history must be atomic.
- A partially completed reassignment could create duplicate active rosters or lose audit evidence.

Why serializable isolation:

- Prevents race conditions where two planners assign the same employee to different shifts on the same date.
- Works with the partial unique index to ensure only one active non-cancelled assignment exists for tenant/user/date.

#### unassignEmployees()

Prisma operations inside serializable transaction:

1. Find active matching assignment:

```txt
tenantId + userId + shiftTemplateId + date + optional departmentId + supersededAt null + status not CANCELLED
```

2. If not found, throw conflict.
3. Mark existing assignment superseded.
4. Create a new cancellation assignment with:

- status `CANCELLED`
- copied shift snapshots
- `unassignedAt`
- `unassignedReason`
- actor ID

5. Link original assignment to cancellation through `supersededByAssignmentId`.
6. Insert history row with action `UNASSIGNED`.

Why create a cancellation row:

- Deletion would erase operational evidence.
- A cancellation row records the fact that an assignment existed and was intentionally cancelled.

#### rethrowAssignmentConflict()

Maps Prisma error codes:

- `P2002`: uniqueness violation.
- `P2034`: transaction conflict.

into:

```txt
409 Conflict: Concurrent roster update conflict. Please retry the assignment.
```

This is appropriate for clients because serializable conflicts are usually retryable.

## 7. Prisma Schema Analysis

### User

File: `packages/database/prisma/schema/user.prisma`

The `User` model represents both authentication identity and employee HR record.

Important fields:

- `id`: UUID primary key. Used across audit, roster, attendance, payroll, and auth.
- `tenantId`: hospital tenant owner. Every employee query is tenant-scoped through this field.
- `departmentId`: home-base department. Used for visibility defaults and scheduling defaults.
- `payrollNumber`: employee code exposed through API as `employeeCode`.
- `firstName`, `lastName`: HR identity fields.
- `email`: login/contact identity. Tenant-local unique.
- `phoneNumber`: optional contact field.
- `passwordHash`: bcrypt hash stored server-side. Never returned by API projections.
- `role`: RBAC role string aligned with `UserRole`.
- `hourlyRate`: default wage rate for payroll calculations.
- `isActive`: fast operational active flag.
- `employmentType`: full-time, part-time, contract, locum, or intern.
- `employmentStatus`: active, inactive, suspended, terminated.
- `devicePin`: local biometric/time-clock identity.
- `emergencyContacts`: JSONB emergency contact list.
- `profileMetadata`: JSONB extensibility for HR metadata.
- `deletedAt`: soft-delete marker.
- `createdAt`, `updatedAt`: lifecycle timestamps.

Relationships:

- `tenant`: owner tenant.
- `department`: optional home department.
- `employeeAudits`: audit rows where this user is the employee being changed.
- `employeeAuditActions`: audit rows where this user is the actor.
- `rosterAssignments`: duty roster assignments.
- `rosterAssignmentHistories`: roster history references.

Constraints and indexes:

- `@@unique([tenantId, email])`: same email can exist in different tenant contexts, not inside one hospital.
- `@@unique([tenantId, payrollNumber])`: employee codes are tenant-local.
- `@@unique([tenantId, devicePin])`: biometric IDs are tenant-local.
- `@@index([tenantId])`: common tenant filtering.
- `@@index([departmentId])`: department roster/HR lookups.
- `@@index([tenantId, employmentStatus])`: status filters.
- `@@index([tenantId, deletedAt])`: soft-delete filters.

### EmployeeAudit

The `EmployeeAudit` model records sensitive employee lifecycle and profile changes.

Fields:

- `id`: UUID primary key.
- `tenantId`: tenant owner.
- `employeeId`: employee being changed.
- `actorUserId`: authenticated user who performed the change.
- `action`: action string such as `CREATE`, `PROFILE_UPDATE`, `ROLE_CHANGE`, `STATUS_CHANGE`, `DEPARTMENT_CHANGE`, `DEVICE_MAPPING_CHANGE`, `SOFT_DELETE`, or `RESTORE`.
- `previousValue`: JSONB before-state snapshot.
- `newValue`: JSONB after-state snapshot.
- `createdAt`: audit timestamp.

Foreign keys:

- Tenant cascades on tenant deletion.
- Employee and actor use restrict semantics to preserve audit references.

Indexes:

- `(tenantId, employeeId, createdAt)` for employee audit timelines.
- `(actorUserId, createdAt)` for actor activity investigations.

### ShiftTemplate

File: `packages/database/prisma/schema/roster.prisma`

Shift templates define reusable scheduling patterns.

Fields:

- `id`: UUID primary key.
- `tenantId`: hospital tenant owner.
- `name`: human-readable name, such as "Clinical Day Rotation".
- `type`: template category, such as `MORNING`, `AFTERNOON`, `NIGHT`, `FLEXIBLE`, or `CUSTOM`.
- `startTime`: HH:mm start time.
- `endTime`: HH:mm end time.
- `gracePeriodMinutes`: late-arrival tolerance.
- `earlyClockInWindowMinutes`: allowed early clock-in window.
- `overtimeThresholdMinutes`: threshold for overtime evaluation.
- `isOvernight`: whether the shift crosses midnight.
- `isActive`: deactivation flag.
- `effectiveFrom`, `effectiveTo`: template validity window.
- `rules`: JSONB for tenant-specific or department-specific scheduling rules.
- `createdAt`, `updatedAt`: lifecycle timestamps.

Indexes:

- `(tenantId)` for tenant filtering.
- `(tenantId, isActive)` for active template lookup.

### RosterAssignment

This model represents one employee assigned to one department on one date.

Fields:

- `id`: UUID primary key.
- `tenantId`: tenant owner.
- `userId`: employee being scheduled.
- `departmentId`: department where work happens, not necessarily home department.
- `shiftTemplateId`: template used to create assignment.
- `date`: calendar date of duty.
- `overriddenHourlyRate`: optional assignment-specific rate.
- `status`: `UNVERIFIED`, `PRESENT`, `ABSENT`, `OFF`, `REASSIGNED`, or `CANCELLED`.
- `effectiveFrom`, `effectiveTo`: range that generated or governs the assignment.
- `assignedByUserId`: actor who assigned or cancelled.
- `supersededAt`: timestamp when this assignment stopped being the active version.
- `supersededByAssignmentId`: link to replacement/cancellation assignment.
- `unassignedAt`: cancellation timestamp.
- `unassignedReason`: reason for unassignment.
- `startTimeSnapshot`: shift start at assignment time.
- `endTimeSnapshot`: shift end at assignment time.
- `gracePeriodSnapshot`: grace period at assignment time.
- `overtimeThresholdSnapshot`: overtime threshold at assignment time.
- `overnightSnapshot`: overnight flag at assignment time.
- `createdAt`, `updatedAt`: lifecycle timestamps.

Indexes:

- `(tenantId, date)` for date-based rosters.
- `(tenantId, userId, date)` for employee-day lookup.
- `(tenantId, userId, date, status)` for status-aware lookup.
- `(tenantId, userId, date, supersededAt)` for active assignment resolution.
- `(departmentId, date)` for department daily rosters.

Migration-level partial unique index:

```sql
CREATE UNIQUE INDEX "roster_assignments_one_active_assignment_key"
  ON "roster_assignments"("tenant_id", "user_id", "date")
  WHERE "superseded_at" IS NULL AND "status" <> 'CANCELLED';
```

This enforces the rule that one employee can have only one active non-cancelled assignment per tenant/date.

### RosterAssignmentHistory

The history table records assignment events.

Fields:

- `id`: UUID primary key.
- `tenantId`: tenant owner.
- `rosterAssignmentId`: assignment version created by the event.
- `userId`: scheduled employee.
- `previousShiftTemplateId`: old shift template if reassigned.
- `newShiftTemplateId`: new shift template if assigned/reassigned.
- `previousDepartmentId`: old work department if reassigned.
- `newDepartmentId`: new work department if assigned/reassigned.
- `previousStatus`: old assignment status.
- `newStatus`: new assignment status.
- `effectiveDate`: affected roster date.
- `action`: `ASSIGNED`, `REASSIGNED`, or `UNASSIGNED`.
- `reason`: optional human reason.
- `actorUserId`: authenticated actor.
- `createdAt`: event timestamp.

Indexes:

- `(tenantId, userId, effectiveDate)` for employee roster history.
- `(rosterAssignmentId)` for assignment event timeline.

## 8. Authentication & RBAC Flow

### JwtAuthGuard

File: `apps/backend-api/src/common/auth/jwt-auth.guard.ts`

The guard verifies a Bearer JWT without trusting request headers for user, role, or tenant identity.

Verification flow:

```txt
Authorization header
  -> must start with Bearer
  -> split JWT into header, payload, signature
  -> parse header as base64url JSON
  -> require alg HS256
  -> recompute HMAC SHA-256 using JWT_SECRET
  -> compare signatures using timingSafeEqual
  -> parse payload
  -> reject expired token
  -> require sub, email, tenantId, role
  -> require role to exist in UserRole enum
  -> attach request.user
  -> set TenantContextService tenantId
```

The resulting `request.user` includes:

- `userId`
- `sub`
- `email`
- `role`
- `tenantId`
- `deptId`

### RolesGuard

File: `apps/backend-api/src/common/auth/roles.guard.ts`

The guard reads route metadata created by `@Roles(...)`. If a route has no roles metadata, it allows the request. If roles exist, it requires `request.user` and checks whether `request.user.role` is included.

This guard depends on `JwtAuthGuard` running first. Controllers use:

```ts
@UseGuards(JwtAuthGuard, RolesGuard)
```

### CurrentUser decorator

File: `apps/backend-api/src/common/auth/current-user.decorator.ts`

Reads `request.user` and returns it as `AuthenticatedUser`. If missing, it throws unauthorized. Employee and Roster assignment endpoints use this to obtain the actor for audit and scheduling attribution.

### TenantId decorator

File: `apps/backend-api/src/common/tenant/tenant-id.decorator.ts`

Reads `request.user.tenantId`. It does not read `X-Tenant-ID`, query params, or request body. This prevents tenant spoofing.

### Role hierarchy

File: `apps/backend-api/src/common/auth/role-policy.ts`

Role assignment rules:

- `SUPER_ADMIN`: can assign all roles.
- `HOSPITAL_ADMIN`: can assign all except `SUPER_ADMIN`.
- `HR_MANAGER`: can assign `EMPLOYEE` and `SUPERVISOR`.
- `DEPT_HEAD`: can assign `EMPLOYEE` and `SUPERVISOR`.
- `SUPERVISOR` and `EMPLOYEE`: cannot assign roles.

Access helpers:

- `hasTenantWideEmployeeAccess`: `SUPER_ADMIN`, `HOSPITAL_ADMIN`, `HR_MANAGER`.
- `hasDepartmentScopedEmployeeAccess`: `DEPT_HEAD`, `SUPERVISOR`.

## 9. Multi-Tenancy Implementation

The application uses row-level tenant isolation in code and schema. Every employee, shift template, roster assignment, history row, and audit row has `tenantId`.

Tenant identity comes from JWT:

```txt
JWT payload.tenantId
  -> JwtAuthGuard
  -> request.user.tenantId
  -> @TenantId()
  -> service method
  -> repository method
  -> Prisma where/data tenantId
```

Examples:

Employee list:

```ts
where: {
  tenantId,
  deletedAt: null,
}
```

Employee update:

```ts
tx.user.updateMany({
  where: { id, tenantId },
  data,
})
```

Roster template lookup:

```ts
shiftTemplate.findFirst({
  where: { id: shiftTemplateId, tenantId },
})
```

Roster active assignment lookup:

```ts
where: {
  tenantId,
  userId,
  date,
  supersededAt: null,
  status: { not: 'CANCELLED' },
}
```

SaaS isolation reasoning:

- Two hospitals may use the same payroll number or device PIN.
- A department ID from one hospital must never be accepted in another hospital.
- Roster queries must never show another hospital's staff.
- Audit rows must be scoped to the hospital that owns the employee.

The `TenantContextService` also stores tenant context using AsyncLocalStorage. It is provided once through `DatabaseModule` and consumed by `JwtAuthGuard` and `TenantContextMiddleware`. The assigned modules mostly pass tenant ID explicitly, which is the clearest and safest pattern for repository methods.

## 10. Shift / Roster Engine Deep Dive

The roster engine models hospital duty rosters at the employee-date level. A monthly roster is conceptually a grid:

```txt
Rows: employees
Columns: calendar dates
Cell: shift assignment for that employee on that date
```

In the database, each populated cell is a `RosterAssignment`.

### Shift templates

A `ShiftTemplate` is the reusable definition of a work period. Examples:

- Morning shift: `07:00` to `15:00`.
- Afternoon shift: `15:00` to `23:00`.
- Night shift: `19:00` to `07:00`, overnight.
- Flexible locum shift with custom rules.

Templates carry operational rules:

- `gracePeriodMinutes`: how much lateness is tolerated before late rules trigger.
- `earlyClockInWindowMinutes`: how early an employee may clock in.
- `overtimeThresholdMinutes`: threshold used by reconciliation/payroll.
- `isOvernight`: whether attendance calculations must cross midnight.
- `effectiveFrom` and `effectiveTo`: validity period for the template.
- `rules`: JSONB escape hatch for hospital-specific policies.

### Overnight handling

The service infers overnight shifts by comparing string HH:mm values:

```txt
endTime <= startTime means crosses midnight
```

For example:

- `07:00` to `19:00`: not overnight.
- `19:00` to `07:00`: overnight.

The assignment stores `overnightSnapshot` so later template edits do not alter the historical interpretation of a worked shift.

### Assignment expansion

The API accepts a date range:

```json
{
  "employeeIds": ["..."],
  "effectiveFrom": "2026-06-01",
  "effectiveTo": "2026-06-30"
}
```

The service expands the range into individual dates. For each employee and each date, it builds one assignment row. This maps naturally to monthly roster creation. The max range is 366 days to prevent accidental bulk writes that could damage the schedule.

### Floating staff model

Hospital staff often float between departments. The schema separates:

- `User.departmentId`: home department.
- `RosterAssignment.departmentId`: actual department worked for that date.

If `departmentId` is provided in the assignment request, it overrides the employee home department for that assignment. If it is omitted, the employee home department is used. This supports scenarios such as an OPD nurse covering an ICU shift for one day.

### Active assignment determination

The current active assignment for an employee/date is:

```txt
tenantId matches
userId matches
date matches
supersededAt is null
status is not CANCELLED
```

This definition is used by repository assignment logic and backed by the partial unique index.

### Supersession model

Reassignment does not overwrite old rows. It closes the old assignment:

```txt
old.supersededAt = now
old.status = REASSIGNED
old.supersededByAssignmentId = new.id
```

Then it creates a new active assignment. This creates a linked chain of assignment versions.

### Historical snapshots

Assignment records copy shift template fields at the time of assignment:

- `startTimeSnapshot`
- `endTimeSnapshot`
- `gracePeriodSnapshot`
- `overtimeThresholdSnapshot`
- `overnightSnapshot`

This is critical because templates are configuration objects that may change. Historical payroll and attendance cannot be recalculated using today's version of last month's template.

## 11. Shift Assignment Transaction Flow

Detailed assign flow:

```txt
Assign Employee To Shift
  -> Validate shiftTemplateId as UUID
  -> Load shift template by tenant
  -> Reject inactive template
  -> Validate employeeIds as UUID array
  -> Confirm employees belong to tenant and are not deleted
  -> Validate effectiveFrom and effectiveTo
  -> Confirm date range is inside template effective window
  -> Expand date range into individual dates
  -> Resolve department per employee
  -> Reject employee with no department unless override department provided
  -> Reject TERMINATED or SUSPENDED employees
  -> Check actor can schedule department
  -> Open Serializable transaction
  -> For each employee-date row:
       -> Find active previous assignment
       -> If found, mark previous assignment REASSIGNED and superseded
       -> Create new assignment with snapshots
       -> Link previous assignment to new assignment
       -> Insert history row
  -> Commit transaction
  -> Return assignment responses
```

Why each step exists:

- UUID validation stops malformed IDs before database calls.
- Tenant-scoped template and employee checks prevent cross-hospital scheduling.
- Inactive template rejection prevents accidental use of retired shifts.
- Date window checks ensure future assignments obey template validity.
- Department resolution supports home department and floating coverage.
- Employment status checks prevent scheduling terminated or suspended staff.
- Department access checks enforce department-head boundaries.
- Serializable transaction and unique index prevent two active assignments for the same employee/date.
- History insertion preserves the scheduling decision trail.

## 12. Historical Integrity & Snapshot Strategy

Historical integrity matters because roster data feeds downstream processes:

- Attendance reconciliation.
- Payroll computation.
- Overtime evaluation.
- Department staffing reports.
- HR investigations.
- Compliance evidence.

If a shift template changes after a roster was worked, historical records must not change meaning. For example, if ICU night shift grace period changes from 0 minutes to 15 minutes, last month's lateness calculations should still use the old grace period. Snapshot fields solve this by copying important template values into the assignment at creation time.

Supersession protects history in a different way. Instead of overwriting or deleting an assignment, the system creates a new version and marks the old one superseded. This preserves:

- Original schedule.
- Replacement schedule.
- Actor who changed it.
- Reason, if provided.
- Exact date affected.
- Previous and new status/template/department.

This is especially important in hospitals because staffing decisions can have clinical and financial consequences. If a nurse was reassigned from OPD to ICU, the system needs to explain when that happened and who authorized it.

## 13. Concurrency & Transaction Safety

Roster scheduling is race-prone. Two planners may edit the same employee's calendar at nearly the same time. Without transaction safety, the system could create duplicate active assignments for one employee on one date.

Protection mechanisms:

- Serializable isolation for assignment and unassignment transactions.
- Partial unique index on active non-cancelled assignments.
- Tenant/user/date active assignment lookup.
- Supersession updates inside the same transaction as new assignment creation.
- Conflict mapping for `P2002` and `P2034`.

Race scenario prevented:

```txt
Planner A assigns employee to ICU day shift on June 1.
Planner B assigns same employee to OPD day shift on June 1 at the same time.
```

The unique index and serializable transaction ensure only one active assignment can survive. A conflict becomes HTTP 409 and the client can retry after reloading current roster state.

Unassignment uses the same pattern. It finds the active assignment, supersedes it, creates a cancellation version, and writes history in one transaction.

## 14. Audit Trail System

### EmployeeAudit

Employee audit rows are written for sensitive lifecycle operations:

- Create.
- Profile update.
- Role change.
- Status change.
- Department change.
- Device mapping change.
- Soft delete.
- Restore.

Each row stores:

- Tenant.
- Employee being changed.
- Actor performing the change.
- Action.
- Previous value JSON.
- New value JSON.
- Timestamp.

Why this matters:

- HR can investigate who changed a role or department.
- Payroll and attendance teams can understand why an employee was unavailable.
- Device mapping changes can be traced when biometric logs appear under the wrong employee.
- Termination/restoration events are visible and attributable.

### RosterAssignmentHistory

Roster history rows are written for:

- Assignment.
- Reassignment.
- Unassignment.

Each row captures old and new shift/department/status values. This supports staffing audits and schedule reconstruction.

## 15. Validation Flow

Validation exists at multiple layers.

### Global ValidationPipe

`main.ts` configures:

```ts
new ValidationPipe({
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true,
})
```

Current shared DTOs are TypeScript interfaces, so runtime class-validator decorators are limited. The modules therefore also use explicit validation helper functions.

### Validation helpers

File: `apps/backend-api/src/common/validation.ts`

Helpers:

- `assertUuid`: valid UUID.
- `assertRequiredString`: required trimmed string with max length.
- `assertOptionalString`: optional string/null handling.
- `assertEnumValue`: enum membership.
- `assertOptionalEnumValue`: optional enum membership.
- `assertTime`: HH:mm 24-hour format.
- `assertOptionalNonNegativeInteger`: non-negative integer.
- `assertOptionalNumber`: non-negative number.
- `assertDate`: YYYY-MM-DD valid calendar date.
- `assertOptionalDate`: optional/null date.
- `assertUuidArray`: non-empty deduplicated UUID array.
- `assertPlainObject`: plain JSON object.

Invalid states prevented:

- Malformed IDs.
- Invalid enum values.
- Equal shift start/end time.
- Invalid date range order.
- Assignment outside template validity.
- Negative rates or timing values.
- Empty update payloads.
- Suspended or terminated employees being scheduled.
- Department heads scheduling outside their department.
- Cross-tenant department or employee references.

## 16. File-By-File Explanation

### `apps/backend-api/src/employee/employee.module.ts`

```txt
Called by: AppModule import graph
Calls: DatabaseModule
Exports: EmployeeModule
Purpose: Registers Employee controller, service, and repository
```

Responsibilities:

- Imports `DatabaseModule` so `DatabaseService`, `JwtAuthGuard`, `RolesGuard`, and `TenantContextService` are available.
- Registers `EmployeeController`.
- Provides `EmployeeService` and `EmployeeRepository`.

### `apps/backend-api/src/employee/employee.controller.ts`

```txt
Called by: NestJS router
Calls: EmployeeService
Purpose: Exposes employee REST endpoints
Guards: JwtAuthGuard, RolesGuard
```

Responsibilities:

- Defines `/api/employees` routes.
- Applies role metadata.
- Extracts tenant and current user.
- Delegates to service.

### `apps/backend-api/src/employee/employee.service.ts`

```txt
Called by: EmployeeController
Calls: EmployeeRepository, validation helpers, role-policy helpers, bcrypt
Purpose: Owns Employee business logic
```

Responsibilities:

- Employee field validation.
- Role hierarchy enforcement.
- Department access enforcement.
- Server-side password hashing.
- Audit payload construction.
- DTO response mapping.

### `apps/backend-api/src/employee/employee.repository.ts`

```txt
Called by: EmployeeService
Calls: DatabaseService.client
Purpose: Owns Employee Prisma persistence
```

Responsibilities:

- Tenant-scoped reads and writes.
- Employee projection.
- Transactional create/update/delete/restore.
- Audit insertion.
- Unique conflict translation.

### `apps/backend-api/src/roster/roster.module.ts`

```txt
Called by: AppModule import graph
Calls: DatabaseModule
Purpose: Registers Roster controller, service, and repository
```

Responsibilities:

- Imports `DatabaseModule`.
- Registers `RosterController`.
- Provides `RosterService` and `RosterRepository`.

### `apps/backend-api/src/roster/roster.controller.ts`

```txt
Called by: NestJS router
Calls: RosterService
Purpose: Exposes shift and roster REST endpoints
Guards: JwtAuthGuard, RolesGuard
```

Responsibilities:

- Defines `/api/roster` routes.
- Extracts tenant and actor for assignment operations.
- Delegates scheduling work to service.

### `apps/backend-api/src/roster/roster.service.ts`

```txt
Called by: RosterController
Calls: RosterRepository, validation helpers, role-policy helpers
Purpose: Owns scheduling business logic
```

Responsibilities:

- Shift-template validation.
- Date-range expansion.
- Department scheduling authorization.
- Employee schedulability checks.
- Template effective window checks.
- Response mapping.

### `apps/backend-api/src/roster/roster.repository.ts`

```txt
Called by: RosterService
Calls: DatabaseService.client
Purpose: Owns Roster Prisma persistence
```

Responsibilities:

- Tenant-scoped template queries.
- Tenant-scoped employee and department assertions.
- Serializable assignment/unassignment transactions.
- Supersession and history insertion.
- Conflict translation.

### `apps/backend-api/src/database/database.module.ts`

```txt
Called by: AppModule, EmployeeModule, RosterModule
Provides: DatabaseService, TenantContextService, JwtAuthGuard, RolesGuard
Exports: Same providers
```

Purpose:

- Shared backend infrastructure module.
- Single provider source for tenant context.
- Makes guards available to feature modules.

### `apps/backend-api/src/database/database.service.ts`

```txt
Called by: Repositories
Calls: @chronos/database db
Purpose: Nest injectable wrapper around shared Prisma client
```

### `apps/backend-api/src/common/auth/jwt-auth.guard.ts`

```txt
Called by: Nest guard pipeline
Calls: TenantContextService
Purpose: Authenticates request and attaches request.user
```

### `apps/backend-api/src/common/auth/roles.guard.ts`

```txt
Called by: Nest guard pipeline after JwtAuthGuard
Calls: Reflector
Purpose: Enforces @Roles metadata
```

### `apps/backend-api/src/common/auth/roles.decorator.ts`

```txt
Called by: Controllers
Exports: Roles decorator and ROLES_KEY
Purpose: Attaches allowed role metadata to routes
```

### `apps/backend-api/src/common/auth/current-user.decorator.ts`

```txt
Called by: Controller method parameter resolution
Purpose: Returns authenticated actor from request.user
```

### `apps/backend-api/src/common/tenant/tenant-id.decorator.ts`

```txt
Called by: Controller method parameter resolution
Purpose: Returns authenticated tenant ID from request.user
```

### `apps/backend-api/src/common/auth/role-policy.ts`

```txt
Called by: EmployeeService and RosterService
Purpose: Central role hierarchy and access-scope policy helpers
```

### `apps/backend-api/src/common/validation.ts`

```txt
Called by: EmployeeService and RosterService
Purpose: Explicit runtime validation for interface-based DTO inputs
```

### `apps/backend-api/src/common/pagination.ts`

```txt
Called by: EmployeeService and RosterService
Purpose: Normalizes pagination and builds paginated API responses
```

### `packages/types-common/src/api-contracts.ts`

```txt
Called by: Backend controllers/services and frontend consumers
Purpose: Shared API contracts and enums
```

Important exports:

- `UserRole`
- `EmploymentStatus`
- `EmploymentType`
- `ShiftTemplateType`
- `RosterAssignmentStatus`
- Employee DTOs
- Shift/Roster DTOs
- `JwtPayload`

### `packages/database/src/client.ts`

```txt
Called by: DatabaseService through @chronos/database
Purpose: Shared PrismaClient singleton
```

### `packages/database/prisma/schema/user.prisma`

```txt
Purpose: Employee/User and EmployeeAudit schema
Used by: EmployeeRepository and authentication/authorization flows
```

### `packages/database/prisma/schema/roster.prisma`

```txt
Purpose: ShiftTemplate, RosterAssignment, and RosterAssignmentHistory schema
Used by: RosterRepository and downstream attendance/payroll/reconciliation
```

### `apps/backend-api/src/app.module.ts`

```txt
Called by: main.ts bootstrap
Imports: EmployeeModule, RosterModule, DatabaseModule, other backend modules
Purpose: Root Nest application module
```

### `apps/backend-api/src/main.ts`

```txt
Called by: node dist/main
Calls: NestFactory.create(AppModule)
Purpose: Runtime bootstrap
```

Runtime setup:

- Enables CORS.
- Configures global validation pipe.
- Listens on `process.env.PORT` or `3000`.
- Does not set a global `/api` prefix.

## 17. End-To-End Flow Diagrams

### Employee Creation

```txt
POST /api/employees
  -> JwtAuthGuard
  -> RolesGuard
  -> EmployeeController.create
  -> EmployeeService.create
       -> assert role assignment
       -> assert department belongs to tenant
       -> hash password
       -> build audit metadata
  -> EmployeeRepository.create
       -> tx.user.create
       -> tx.employeeAudit.create
  -> EmployeeService.toResponse
  -> HTTP response
```

### Employee Update

```txt
PATCH /api/employees/:id
  -> Guards
  -> EmployeeController.update
  -> EmployeeService.update
       -> load existing
       -> assert access
       -> validate patch
       -> build previous/new audit values
  -> EmployeeRepository.update
       -> tx.user.updateMany({ id, tenantId })
       -> tx.employeeAudit.create
       -> tx.user.findFirstOrThrow
  -> Response
```

### Employee Restore

```txt
PATCH /api/employees/:id/restore
  -> Guards
  -> EmployeeService.restore
       -> require admin/HR role
  -> EmployeeRepository.restore
       -> load including deleted
       -> tx.user.updateMany({ id, tenantId, deletedAt not null })
       -> tx.employeeAudit.create(action RESTORE)
       -> reload employee
  -> Response
```

### Shift Template Creation

```txt
POST /api/roster/shifts
  -> Guards
  -> RosterController.createShiftTemplate
  -> RosterService.createShiftTemplate
       -> validate HH:mm
       -> validate effective dates
       -> infer overnight
       -> default timing rules
  -> RosterRepository.createShiftTemplate
       -> shiftTemplate.create({ tenantId, ...data })
  -> Response
```

### Shift Assignment

```txt
POST /api/roster/shifts/:id/assign-employees
  -> Guards
  -> RosterService.assignEmployees
       -> load template
       -> validate employees
       -> validate dates
       -> expand range
       -> resolve departments
  -> RosterRepository.assignEmployees
       -> Serializable transaction
       -> create active assignments
       -> insert history rows
  -> Response
```

### Shift Reassignment

```txt
POST /api/roster/shifts/:newShiftId/assign-employees
  -> Existing active assignment found
  -> Old assignment status becomes REASSIGNED
  -> Old assignment supersededAt is set
  -> New assignment is created
  -> Old assignment links to new assignment
  -> History action is REASSIGNED
```

### Shift Unassignment

```txt
POST /api/roster/shifts/:id/unassign-employees
  -> Guards
  -> RosterService.unassignEmployees
  -> RosterRepository.unassignEmployees
       -> find active assignment
       -> mark old assignment superseded
       -> create CANCELLED assignment
       -> link old assignment to cancellation
       -> insert UNASSIGNED history
  -> Response
```

### JWT Authentication Flow

```txt
Authorization: Bearer <token>
  -> JwtAuthGuard parses token
  -> verifies HS256 signature with JWT_SECRET
  -> validates payload and role enum
  -> request.user = AuthenticatedUser
  -> TenantContextService.set({ tenantId })
  -> RolesGuard checks @Roles
  -> Controller decorators read request.user
```

### Tenant-Scoped Query Flow

```txt
JWT tenantId
  -> @TenantId()
  -> Service method argument
  -> Repository method argument
  -> Prisma where: { tenantId, ... }
  -> PostgreSQL returns only tenant-owned rows
```

## 18. Security Design Analysis

Security decisions:

- Routes are guarded by JWT and RBAC.
- Tenant ID is sourced from verified JWT, not headers or body.
- Actor ID is sourced from `request.user`, not request body.
- Passwords are accepted as raw input over HTTPS and hashed server-side.
- `passwordHash` is never selected in API responses.
- Role assignment uses explicit hierarchy rules.
- Department-scoped actors are restricted to their own departments.
- Employee updates and lifecycle operations write audit rows.
- Roster assignment uses transactions and history rows.

Tenant spoof prevention:

- `@TenantId()` reads `request.user.tenantId`.
- Repositories include `tenantId` in queries and writes.
- Department and employee assertions are tenant-scoped.

Role escalation prevention:

- `assertCanAssignRole()` prevents HR managers and department heads from assigning admin roles.
- Route-level `@Roles` blocks low-privilege actors from sensitive endpoints.

Protected routes:

- Employee and Roster controllers use class-level guards.
- Every controller method has route-level role metadata.

Compliance reasoning:

- HR and scheduling actions are attributable to authenticated actors.
- Sensitive changes store before/after values.
- Roster history preserves clinical staffing decisions.

## Request And Response Examples

The examples below use placeholder UUIDs and a placeholder JWT. They are intentionally realistic enough to be useful in Postman, integration tests, or review discussions.

Common request header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

The JWT payload must contain:

```json
{
  "sub": "11111111-1111-4111-8111-111111111111",
  "email": "hr.manager@stteresa.or.ke",
  "tenantId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  "role": "HR_MANAGER",
  "deptId": "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
}
```

### Create Employee

```http
POST /api/employees
Authorization: Bearer <jwt>
Content-Type: application/json
```

Request body:

```json
{
  "employeeCode": "STTR-305",
  "firstName": "Amina",
  "lastName": "Otieno",
  "email": "amina.otieno@stteresa.or.ke",
  "password": "TemporaryPass#2026",
  "phoneNumber": "+254700111222",
  "departmentId": "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  "deviceUserId": "2305",
  "employmentType": "FULL_TIME",
  "employmentStatus": "ACTIVE",
  "role": "EMPLOYEE",
  "hourlyRate": 520,
  "emergencyContacts": [
    {
      "name": "Grace Otieno",
      "relationship": "Sister",
      "phoneNumber": "+254700333444"
    }
  ],
  "profileMetadata": {
    "licenseNumber": "NCK-2026-991"
  }
}
```

Why fields exist:

- `employeeCode` maps to `payrollNumber` and is tenant-unique.
- `password` is raw input and is hashed server-side.
- `deviceUserId` maps to `devicePin`, the local biometric terminal identifier.
- `departmentId` is the home department.
- `role` controls platform authorization.
- `hourlyRate` feeds payroll.
- `emergencyContacts` and `profileMetadata` support HR operations without schema churn.

Success response:

```json
{
  "id": "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  "tenantId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  "employeeCode": "STTR-305",
  "firstName": "Amina",
  "lastName": "Otieno",
  "email": "amina.otieno@stteresa.or.ke",
  "phoneNumber": "+254700111222",
  "role": "EMPLOYEE",
  "departmentId": "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  "department": {
    "id": "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    "name": "Intensive Care Unit",
    "code": "ICU"
  },
  "deviceUserId": "2305",
  "employmentType": "FULL_TIME",
  "employmentStatus": "ACTIVE",
  "hourlyRate": 520,
  "emergencyContacts": [
    {
      "name": "Grace Otieno",
      "relationship": "Sister",
      "phoneNumber": "+254700333444"
    }
  ],
  "profileMetadata": {
    "licenseNumber": "NCK-2026-991"
  },
  "isActive": true,
  "deletedAt": null,
  "createdAt": "2026-05-29T08:00:00.000Z",
  "updatedAt": "2026-05-29T08:00:00.000Z"
}
```

Possible errors:

```json
{
  "message": "You are not allowed to assign this role.",
  "error": "Forbidden",
  "statusCode": 403
}
```

```json
{
  "message": "Employee code, email, or device user id already exists for this tenant.",
  "error": "Conflict",
  "statusCode": 409
}
```

### Update Employee

```http
PATCH /api/employees/cccccccc-cccc-4ccc-8ccc-cccccccccccc
Authorization: Bearer <jwt>
Content-Type: application/json
```

Request body:

```json
{
  "phoneNumber": "+254700999888",
  "hourlyRate": 560,
  "profileMetadata": {
    "licenseNumber": "NCK-2026-991",
    "skill": "Critical care"
  }
}
```

Success response contains the updated employee response DTO. The repository also writes an `EmployeeAudit` row with action `PROFILE_UPDATE`.

Common validation error:

```json
{
  "message": "At least one employee field must be provided.",
  "error": "Bad Request",
  "statusCode": 400
}
```

### Suspend Employee

```http
PATCH /api/employees/cccccccc-cccc-4ccc-8ccc-cccccccccccc/status
Authorization: Bearer <jwt>
Content-Type: application/json
```

Request body:

```json
{
  "employmentStatus": "SUSPENDED"
}
```

Success response excerpt:

```json
{
  "id": "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  "employmentStatus": "SUSPENDED",
  "isActive": false
}
```

Practical note: the service sets `isActive` to true only for `ACTIVE`. Any non-active employment status becomes operationally inactive.

### Restore Employee

```http
PATCH /api/employees/cccccccc-cccc-4ccc-8ccc-cccccccccccc/restore
Authorization: Bearer <jwt>
```

Request body: none.

Success response excerpt:

```json
{
  "id": "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  "employmentStatus": "ACTIVE",
  "isActive": true,
  "deletedAt": null
}
```

Possible RBAC error:

```json
{
  "message": "You are not allowed to restore employees.",
  "error": "Forbidden",
  "statusCode": 403
}
```

### Create Shift Template

```http
POST /api/roster/shifts
Authorization: Bearer <jwt>
Content-Type: application/json
```

Request body:

```json
{
  "name": "ICU Night Rotation",
  "type": "NIGHT",
  "startTime": "19:00",
  "endTime": "07:00",
  "gracePeriodMinutes": 0,
  "earlyClockInWindowMinutes": 30,
  "overtimeThresholdMinutes": 720,
  "effectiveFrom": "2026-06-01",
  "effectiveTo": "2026-12-31",
  "rules": {
    "requiresHandover": true,
    "minimumRestHoursAfterShift": 12
  }
}
```

Success response:

```json
{
  "id": "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
  "tenantId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  "name": "ICU Night Rotation",
  "type": "NIGHT",
  "startTime": "19:00",
  "endTime": "07:00",
  "gracePeriodMinutes": 0,
  "earlyClockInWindowMinutes": 30,
  "overtimeThresholdMinutes": 720,
  "isOvernight": true,
  "isActive": true,
  "effectiveFrom": "2026-06-01",
  "effectiveTo": "2026-12-31",
  "rules": {
    "requiresHandover": true,
    "minimumRestHoursAfterShift": 12
  },
  "createdAt": "2026-05-29T08:05:00.000Z",
  "updatedAt": "2026-05-29T08:05:00.000Z"
}
```

Validation error:

```json
{
  "message": "startTime must use HH:mm 24-hour format.",
  "error": "Bad Request",
  "statusCode": 400
}
```

### Assign Employee To Shift

```http
POST /api/roster/shifts/dddddddd-dddd-4ddd-8ddd-dddddddddddd/assign-employees
Authorization: Bearer <jwt>
Content-Type: application/json
```

Request body:

```json
{
  "employeeIds": [
    "cccccccc-cccc-4ccc-8ccc-cccccccccccc"
  ],
  "departmentId": "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  "effectiveFrom": "2026-06-01",
  "effectiveTo": "2026-06-07",
  "overriddenHourlyRate": 620,
  "reason": "ICU night coverage for June first week"
}
```

Success response:

```json
[
  {
    "id": "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
    "tenantId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    "employeeId": "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    "departmentId": "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    "shiftTemplateId": "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
    "date": "2026-06-01",
    "status": "UNVERIFIED",
    "overriddenHourlyRate": 620,
    "effectiveFrom": "2026-06-01",
    "effectiveTo": "2026-06-07",
    "assignedByUserId": "11111111-1111-4111-8111-111111111111",
    "unassignedAt": null,
    "unassignedReason": null,
    "createdAt": "2026-05-29T08:10:00.000Z",
    "updatedAt": "2026-05-29T08:10:00.000Z"
  }
]
```

The real response contains one object per generated employee-date assignment. A seven-day range for one employee returns seven assignment rows.

### Reassign Shift

Reassignment uses the same endpoint as assignment. If the employee already has an active non-cancelled assignment for that tenant/date, the repository supersedes the old row and creates a new one.

```http
POST /api/roster/shifts/ffffffff-ffff-4fff-8fff-ffffffffffff/assign-employees
Authorization: Bearer <jwt>
Content-Type: application/json
```

Request body:

```json
{
  "employeeIds": [
    "cccccccc-cccc-4ccc-8ccc-cccccccccccc"
  ],
  "departmentId": "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  "effectiveFrom": "2026-06-03",
  "effectiveTo": "2026-06-03",
  "reason": "Moved from day shift to emergency night coverage"
}
```

Repository behavior:

```txt
old assignment
  -> status = REASSIGNED
  -> supersededAt = now
  -> supersededByAssignmentId = new assignment id

new assignment
  -> status = UNVERIFIED
  -> active current assignment for employee/date

history
  -> action = REASSIGNED
```

### Unassign Shift

```http
POST /api/roster/shifts/dddddddd-dddd-4ddd-8ddd-dddddddddddd/unassign-employees
Authorization: Bearer <jwt>
Content-Type: application/json
```

Request body:

```json
{
  "employeeIds": [
    "cccccccc-cccc-4ccc-8ccc-cccccccccccc"
  ],
  "effectiveFrom": "2026-06-05",
  "effectiveTo": "2026-06-05",
  "reason": "Approved emergency leave"
}
```

Success response excerpt:

```json
[
  {
    "employeeId": "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    "shiftTemplateId": "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
    "date": "2026-06-05",
    "status": "CANCELLED",
    "unassignedAt": "2026-05-29T08:20:00.000Z",
    "unassignedReason": "Approved emergency leave"
  }
]
```

Conflict error when no matching active assignment exists:

```json
{
  "message": "One or more employees are not assigned to this shift for the requested date range.",
  "error": "Conflict",
  "statusCode": 409
}
```

## Real Database Query Examples

This section shows the database shape behind the service/repository calls. These examples are not new code; they explain what Prisma is asking PostgreSQL to do.

### Tenant-Scoped Employee Query

Prisma:

```ts
const employees = await prisma.user.findMany({
  where: {
    tenantId,
    deletedAt: null,
    employmentStatus: 'ACTIVE',
  },
  select: employeeSelect,
  orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  skip,
  take,
});
```

SQL shape:

```sql
SELECT id, tenant_id, department_id, payroll_number, first_name, last_name, email
FROM users
WHERE tenant_id = $1
  AND deleted_at IS NULL
  AND employment_status = 'ACTIVE'
ORDER BY last_name ASC, first_name ASC
LIMIT $2 OFFSET $3;
```

Why it exists:

- Lists only employees owned by the authenticated hospital.
- Excludes soft-deleted employees by default.
- Uses tenant/status/deleted indexes to avoid scanning unrelated hospital data.

### Active Assignment Lookup

Prisma:

```ts
const previousAssignment = await tx.rosterAssignment.findFirst({
  where: {
    tenantId,
    userId: row.userId,
    date: row.date,
    supersededAt: null,
    status: { not: 'CANCELLED' },
  },
  orderBy: { createdAt: 'desc' },
});
```

SQL shape:

```sql
SELECT *
FROM roster_assignments
WHERE tenant_id = $1
  AND user_id = $2
  AND date = $3
  AND superseded_at IS NULL
  AND status <> 'CANCELLED'
ORDER BY created_at DESC
LIMIT 1;
```

Why it exists:

- Determines whether the requested assignment is a new assignment or reassignment.
- Works with the partial unique index that guarantees only one active non-cancelled row for tenant/user/date.

### Supersession Update

Prisma:

```ts
await tx.rosterAssignment.updateMany({
  where: {
    id: previousAssignment.id,
    tenantId,
    supersededAt: null,
  },
  data: {
    supersededAt: closedAt,
    status: 'REASSIGNED',
  },
});
```

SQL shape:

```sql
UPDATE roster_assignments
SET superseded_at = $1,
    status = 'REASSIGNED',
    updated_at = CURRENT_TIMESTAMP
WHERE id = $2
  AND tenant_id = $3
  AND superseded_at IS NULL;
```

Why it exists:

- Closes the previous active version without deleting it.
- Tenant-qualified update prevents accidental cross-tenant writes.
- `supersededAt IS NULL` prevents rewriting already-closed assignments.

### Employee Audit Insertion Transaction

Prisma shape:

```ts
await prisma.$transaction(async (tx) => {
  const employee = await tx.user.create({
    data: { ...data, tenantId },
    select: employeeSelect,
  });

  await tx.employeeAudit.create({
    data: {
      tenantId,
      employeeId: employee.id,
      actorUserId,
      action: 'CREATE',
      previousValue: null,
      newValue,
    },
  });

  return employee;
});
```

SQL shape:

```sql
BEGIN;

INSERT INTO users (...)
VALUES (...)
RETURNING id, tenant_id, payroll_number, first_name, last_name, email;

INSERT INTO employee_audits (
  tenant_id,
  employee_id,
  actor_user_id,
  action,
  previous_value,
  new_value
) VALUES ($1, $2, $3, 'CREATE', NULL, $4);

COMMIT;
```

Why it exists:

- The employee row and audit row are one logical business operation.
- If audit insertion fails, the employee create should roll back.
- If employee creation fails due to uniqueness, no audit row should be written.

## Runtime Request Execution Walkthroughs

### Employee Creation Runtime Trace

```txt
Incoming POST /api/employees
  -> Express adapter receives the request
  -> Nest router matches EmployeeController.create
  -> TenantContextMiddleware enters AsyncLocalStorage context
  -> JwtAuthGuard verifies Authorization header
  -> JwtAuthGuard assigns request.user
  -> JwtAuthGuard sets TenantContextService tenantId
  -> RolesGuard reads @Roles metadata for create()
  -> RolesGuard confirms actor role is allowed
  -> @TenantId decorator reads request.user.tenantId
  -> @CurrentUser decorator reads request.user
  -> @Body decorator provides payload
  -> EmployeeController.create invokes singleton EmployeeService
  -> EmployeeService validates business rules
  -> bcrypt hashes password
  -> EmployeeRepository opens Prisma transaction
  -> PostgreSQL inserts user row
  -> PostgreSQL inserts employee_audits row
  -> Prisma commits transaction
  -> EmployeeService maps response DTO
  -> Nest serializes object as JSON
  -> HTTP response returned
```

### Shift Assignment Runtime Trace

```txt
Incoming POST /api/roster/shifts/:id/assign-employees
  -> Express adapter receives request
  -> Nest router matches RosterController.assignEmployees
  -> JwtAuthGuard authenticates actor and tenant
  -> RolesGuard confirms scheduling permission
  -> RosterService loads shift template
  -> RosterService validates employees and date range
  -> RosterService expands date range to employee-date rows
  -> RosterService enforces department scheduling boundary
  -> RosterRepository opens Serializable transaction
  -> For each row, repository looks for active assignment
  -> Repository supersedes old assignment when present
  -> Repository creates new assignment with snapshots
  -> Repository inserts roster history
  -> Prisma commits transaction
  -> Response array is serialized
```

### Reassignment Runtime Trace

```txt
Incoming assignment request for employee/date already assigned
  -> active assignment lookup finds previous row
  -> previous row remains in database
  -> previous row status becomes REASSIGNED
  -> previous row receives supersededAt timestamp
  -> new assignment row becomes active
  -> previous row links to new row
  -> history row records previous and new template/department/status
```

This is deliberately more work than a simple update. The extra write volume buys traceability.

## Failure And Error Flows

### JWT Failure

Where failure occurs:

- `JwtAuthGuard.verifyBearerToken()`

Examples:

- Missing `Authorization` header.
- Token is not Bearer format.
- Token has unsupported algorithm.
- Signature mismatch.
- Expired token.
- Missing tenant or role fields.

Result:

```json
{
  "message": "Bearer token is required.",
  "error": "Unauthorized",
  "statusCode": 401
}
```

Safety property:

- Controller methods never execute.
- No repository calls happen.
- No tenant ID is accepted from unverified input.

### RBAC Denial

Where failure occurs:

- `RolesGuard.canActivate()`
- `assertCanAssignRole()`
- Department access helper checks inside services.

Example:

```txt
DEPT_HEAD tries to create SUPER_ADMIN
  -> route guard allows DEPT_HEAD to hit create endpoint
  -> service role hierarchy rejects SUPER_ADMIN assignment
  -> throws ForbiddenException
```

Why both route RBAC and service RBAC exist:

- Route RBAC controls endpoint access.
- Service RBAC controls domain-specific decisions inside an endpoint.

### Validation Failure

Where failure occurs:

- Service validation helpers.

Example:

```txt
startTime = "7am"
  -> assertTime()
  -> BadRequestException
```

Result:

```json
{
  "message": "startTime must use HH:mm 24-hour format.",
  "error": "Bad Request",
  "statusCode": 400
}
```

### Transaction Rollback

Where failure occurs:

- Inside Prisma `$transaction`.

Example:

```txt
Employee create succeeds
EmployeeAudit insert fails due to actor foreign key
  -> Prisma rolls back transaction
  -> employee row is not committed
```

This protects the invariant that sensitive lifecycle operations are auditable.

### Duplicate Assignment Conflict

Where failure occurs:

- PostgreSQL partial unique index.
- Prisma serializable transaction conflict.
- `RosterRepository.rethrowAssignmentConflict()`.

Result:

```json
{
  "message": "Concurrent roster update conflict. Please retry the assignment.",
  "error": "Conflict",
  "statusCode": 409
}
```

Operational meaning:

- The client should reload the current roster and retry if appropriate.
- The system chose correctness over silently overwriting another planner's work.

### Tenant Isolation Failure Prevention

Example:

```txt
Actor from tenant A sends departmentId from tenant B
  -> service calls assertDepartmentBelongsToTenant(tenantA, departmentId)
  -> repository searches department where id = departmentId AND tenantId = tenantA
  -> no row found
  -> NotFoundException
```

The response does not reveal that the department exists in another tenant.

## Engineering Tradeoffs & Design Decisions

### Serializable Transactions vs Write Throughput

What was gained:

- Strong protection against duplicate active assignments.
- Cleaner mental model for planners: one employee, one active assignment per date.
- Safer behavior during concurrent roster edits.

What was sacrificed:

- Serializable transactions can reduce write throughput under contention.
- Conflicts may require client retry behavior.

Why acceptable:

- Hospital roster integrity is more important than maximizing write throughput. Roster writes are relatively low volume compared with attendance ingestion, and incorrect staffing records are expensive to unwind.

### Snapshot Duplication vs Normalized Storage

What was gained:

- Historical payroll and reconciliation remain stable even if templates change.
- Old assignments can be interpreted without reconstructing old template state.

What was sacrificed:

- Assignment rows duplicate several fields from `ShiftTemplate`.
- More storage per assignment.

Why acceptable:

- The duplicated fields are small. The business value of stable historical evidence is much higher than the storage savings of pure normalization.

### Shared Interface DTOs vs Runtime Validation Power

What was gained:

- Shared contracts are lightweight and easy for backend and frontend to consume.
- No duplicate DTO definitions in Employee/Roster modules.

What was sacrificed:

- Interfaces do not exist at runtime.
- `ValidationPipe` cannot enforce class-validator decorators that are not present.

Why acceptable:

- Services use explicit validation helpers. This is verbose, but it makes runtime behavior clear and avoids assuming TypeScript types protect runtime inputs.

### Repository Layer vs Direct Prisma In Services

What was gained:

- Persistence logic is centralized.
- Services remain focused on business rules.
- Tenant-scoped query patterns are easier to audit.
- Testing can mock repositories without Prisma.

What was sacrificed:

- More files and method forwarding.
- Some simple operations require more ceremony.

Why acceptable:

- In a multi-tenant HR/scheduling backend, explicit persistence boundaries pay for themselves during review and maintenance.

### Explicit Tenant Filtering vs Implicit Context-Only Filtering

What was gained:

- Every repository method shows tenant isolation in the query.
- Security reviewers can audit isolation by reading `where` clauses.
- Methods are easier to test because tenant ID is an explicit parameter.

What was sacrificed:

- Tenant ID is passed through many method signatures.

Why acceptable:

- Explicit tenant flow is safer than hidden global context for critical data boundaries. AsyncLocalStorage remains useful infrastructure, but repositories do not depend solely on it.

## Human Implementation Notes

These are the practical notes a maintainer should know. They are not conceptual architecture; they are the little implementation realities that matter later.

- Prisma cannot represent the active-assignment partial unique index directly in the Prisma schema. The project uses raw SQL migration for `WHERE superseded_at IS NULL AND status <> 'CANCELLED'`.
- Shared DTO contracts are TypeScript interfaces, which is convenient for package reuse but means service-level runtime validation is still necessary.
- Historical snapshot fields intentionally duplicate shift template values. This is not accidental denormalization; it is payroll and audit protection.
- Serializable isolation was chosen because schedule correctness matters more than write throughput for these endpoints.
- Reassignment is implemented as "close old row, create new row" rather than "update existing row." This is more verbose but keeps history honest.
- Unassignment creates a `CANCELLED` assignment row. This can feel strange at first, but it lets the system preserve cancellation evidence without deleting the original assignment.
- `RosterRepository.updateShiftTemplate()` is currently prechecked by tenant and then updated by globally unique ID. It is serviceable, but a future hardening pass should make the write itself tenant-qualified.
- The custom JWT guard is intentionally small and direct. In a larger auth system, the team may eventually move to Passport strategies or a dedicated auth package, but the current code makes the verification path easy to inspect.
- The backend uses controller-level `/api/...` route prefixes. Adding a global `app.setGlobalPrefix('api')` without changing controllers would create `/api/api/...` routes.

## Scope Boundaries & Non-Implemented Systems

The assigned implementation focuses on Employee and Shift/Roster runtime integration and domain behavior.

Implemented in scope:

- Employee management.
- Employee create/update/status/department/device/soft-delete/restore flows.
- Employee audit trail.
- Shift template creation, listing, reading, updating, and deactivation.
- Shift assignment, reassignment, and unassignment.
- Tenant isolation for assigned modules.
- RBAC and department-scoped scheduling access.
- Assignment history.
- Shift snapshot preservation.
- Serializable transaction protection for roster edits.

Not implemented here because they belong to adjacent bounded contexts:

- Attendance ingestion.
- Clock-in/clock-out processing.
- Biometric device synchronization.
- Payroll engine.
- Overtime calculation engine.
- Attendance reconciliation engine.
- Notification delivery.
- Real-time websocket scheduling updates.
- Leave management.
- Shift auto-generation or AI-assisted scheduling.
- Reporting dashboards.
- Auth login issuance and refresh-token lifecycle.

Why these are separate:

- Attendance ingestion is event/telemetry heavy and has different throughput concerns.
- Payroll has financial rules, period locking, and compliance requirements that deserve a separate bounded context.
- Reconciliation compares planned rosters with actual attendance and should consume roster evidence rather than own scheduling writes.
- Notifications and websockets are delivery mechanisms, not core scheduling truth.
- Leave management affects availability, but it is not the same as roster assignment.

Keeping these boundaries clear prevents the Roster module from becoming a "god module." The roster should answer "who was scheduled where and when?" Other modules can consume that truth.

## Implementation Caveats & Known Limitations

- Partial unique indexes require raw SQL migrations. Prisma schema files document the models, but the strongest active-assignment invariant lives in migration SQL.
- The JWT guard is custom and lightweight. It verifies HS256 tokens directly, but it does not provide the full ecosystem behavior of Passport strategies.
- DTO validation is partly manual because shared DTOs are interfaces. If class-based DTOs are introduced later, `ValidationPipe` can take on more runtime validation.
- Shift template versioning is not implemented as a separate model. Historical assignment snapshots cover already-created assignments, but future template planning/version rollout could be richer.
- Client-side retry loops for serializable conflicts are future work. The backend returns a clear 409, but user experience depends on the frontend handling it well.
- Audit action values are strings. Shared enums would reduce typos and improve reporting consistency.
- Roster assignment currently does not automatically check leave requests. That should happen in a future integration between Leave and Roster bounded contexts.
- The service rejects suspended and terminated employees for assignment, but more nuanced availability rules such as maximum weekly hours are not implemented here.
- `TenantContextMiddleware` runs before `JwtAuthGuard`, so for guarded routes the guard is the component that reliably sets tenant context after JWT verification. Repositories still receive explicit tenant IDs, which is the safer path.

## Expanded Import And Dependency Graph Notes

### `employee.controller.ts`

```txt
Imports:
  -> Nest route decorators
  -> Employee DTOs and UserRole from @chronos/types-common
  -> JwtAuthGuard, RolesGuard, Roles
  -> CurrentUser, TenantId
  -> EmployeeService

Injected dependencies:
  -> EmployeeService

Exports:
  -> EmployeeController class for EmployeeModule registration

Lifecycle timing:
  -> Instantiated during Nest application bootstrap
  -> Method invoked per matching HTTP request

Runtime usage:
  -> Does not hold request state
  -> Receives per-request data through decorators
```

### `employee.service.ts`

```txt
Imports:
  -> Nest exceptions and Injectable
  -> bcrypt
  -> Employee DTOs/enums from @chronos/types-common
  -> pagination helpers
  -> validation helpers
  -> AuthenticatedUser
  -> role policy helpers
  -> EmployeeRepository

Injected dependencies:
  -> EmployeeRepository

Called by:
  -> EmployeeController

Calls:
  -> EmployeeRepository.list()
  -> EmployeeRepository.findByIdOrThrow()
  -> EmployeeRepository.create()
  -> EmployeeRepository.update()
  -> EmployeeRepository.softDelete()
  -> EmployeeRepository.restore()

Runtime usage:
  -> Singleton provider
  -> Stateless business orchestrator
```

### `employee.repository.ts`

```txt
Imports:
  -> Nest ConflictException, Injectable, NotFoundException
  -> DatabaseService

Injected dependencies:
  -> DatabaseService

Called by:
  -> EmployeeService

Calls:
  -> Prisma user model
  -> Prisma department model
  -> Prisma employeeAudit model
  -> Prisma transactions

Runtime usage:
  -> Singleton provider
  -> Owns database access, not business policy
```

### `roster.controller.ts`

```txt
Imports:
  -> Nest route decorators
  -> Shift/Roster DTOs and UserRole
  -> AuthenticatedUser
  -> CurrentUser, TenantId
  -> JwtAuthGuard, RolesGuard, Roles
  -> RosterService

Injected dependencies:
  -> RosterService

Runtime usage:
  -> Route boundary for /api/roster
  -> Delegates scheduling decisions to service
```

### `roster.service.ts`

```txt
Imports:
  -> Nest BadRequestException and Injectable
  -> Shift/Roster DTOs and enums
  -> AuthenticatedUser
  -> role-policy helpers
  -> pagination helpers
  -> validation helpers
  -> RosterRepository

Injected dependencies:
  -> RosterRepository

Calls:
  -> RosterRepository.findShiftTemplateOrThrow()
  -> RosterRepository.assertEmployeesBelongToTenant()
  -> RosterRepository.assertDepartmentBelongsToTenant()
  -> RosterRepository.assignEmployees()
  -> RosterRepository.unassignEmployees()

Runtime usage:
  -> Singleton provider
  -> Stateless scheduling policy engine
```

### `roster.repository.ts`

```txt
Imports:
  -> Nest ConflictException, Injectable, NotFoundException
  -> DatabaseService

Injected dependencies:
  -> DatabaseService

Calls:
  -> Prisma shiftTemplate model
  -> Prisma user model
  -> Prisma department model
  -> Prisma rosterAssignment model
  -> Prisma rosterAssignmentHistory model
  -> Prisma serializable transactions

Runtime usage:
  -> Singleton provider
  -> Owns persistence, transactions, conflict mapping
```

## 19. Production-Readiness Analysis

Production-ready strengths:

- Clear Controller -> Service -> Repository layering.
- Shared DTO and Prisma packages are reused.
- Runtime bootstrap starts Nest correctly.
- Shared packages resolve from `dist`.
- Tenant context provider is single-source through `DatabaseModule`.
- Employee and Roster routes are reachable and guard-protected.
- Employee creation hashes passwords server-side.
- Employee lifecycle events are audited.
- Roster assignment uses serializable transactions.
- Active roster uniqueness is enforced by a partial unique index.
- Historical shift snapshots preserve payroll/reconciliation integrity.

Remaining limitations and future improvements:

- `RosterRepository.updateShiftTemplate()` uses a tenant precheck followed by `update({ where: { id } })`. A stricter future version should use tenant-qualified `updateMany`.
- DTOs are interfaces, so global `ValidationPipe` cannot enforce decorator-based validation for these contracts. Current services compensate with explicit validation helpers.
- Auth login issuance should be fully verified so generated JWTs contain `sub`, `email`, `tenantId`, `role`, and `deptId`.
- Roster transaction conflicts return retryable 409 responses, but clients should implement retry/reload UX.
- Some audit action names are strings. A shared enum could improve consistency.
- More automated tests should cover tenant isolation, role boundaries, reassignment races, and audit insertion.

Operational considerations:

- `JWT_SECRET` must be configured in all runtime environments.
- Database migrations must include the active assignment partial unique index.
- Prisma client generation must run after schema changes.
- Shared packages must be built before `backend-api` startup.
- For production, use process management and health checks around `node dist/main`.

## 20. Final Engineering Summary

The Employee and Shift/Roster modules implement a strong enterprise backend architecture for hospital workforce management. They follow the expected layering:

```txt
Controller
  -> Guards and decorators
  -> Service
  -> Repository
  -> DatabaseService
  -> Shared Prisma Client
  -> PostgreSQL
```

The Employee module provides tenant-scoped HR record management with role controls, department visibility rules, soft deletion, restoration, server-side password hashing, and audit trail support. It is designed to preserve workforce history rather than destructively rewriting or deleting records.

The Roster module provides shift-template configuration and employee-date scheduling. It models real hospital duty rosters by expanding date ranges into daily assignment rows, supporting department floating, preserving shift snapshots, and recording reassignment/unassignment history. Its transaction model is designed for concurrent scheduling environments where multiple planners may edit rosters at the same time.

The most important architectural strengths are:

- Explicit tenant isolation.
- Thin controllers.
- Business logic centralized in services.
- Prisma logic centralized in repositories.
- Shared contracts and schema packages.
- Guard-based authentication and authorization.
- Audit and history models for accountability.
- Snapshot strategy for historical correctness.
- Serializable transaction strategy for roster concurrency.

The main tradeoff is that the system currently relies on explicit validation helpers because shared DTOs are TypeScript interfaces rather than decorated runtime classes. That is acceptable in the current architecture, but future class-based DTOs could let the global `ValidationPipe` carry more of the validation load.

Overall, these modules are structured like production backend modules: they protect tenant boundaries, preserve historical evidence, keep domain decisions outside controllers, and use database constraints plus transactions for critical invariants. An engineer reviewing or presenting this implementation should emphasize the business reason behind each technical choice: hospitals need accurate staff identity, safe scheduling, reliable payroll evidence, and a traceable record of who changed what and when.

## 21. Final Engineering Assessment

This is the senior engineering scorecard I would give the assigned Employee and Shift/Roster implementation as it stands after the runtime integration work.

| Category | Assessment |
| --- | --- |
| Architecture | Strong. The modules follow Controller -> Service -> Repository -> DatabaseService -> Prisma. Responsibilities are separated cleanly enough for onboarding, testing, and review. |
| Security | Strong for the assigned surface. JWT and RBAC guard every route, tenant identity comes from the verified token, role escalation is blocked in service policy, and password hashing is server-side. |
| Maintainability | Strong with moderate ceremony. The repository/service split adds files, but it makes business logic and persistence logic easier to reason about separately. |
| Multi-tenancy | Strong. Tenant ID is explicit in service and repository calls, and most writes are tenant-qualified. The one hardening candidate is `RosterRepository.updateShiftTemplate()`. |
| Auditability | Strong. Employee lifecycle changes write `EmployeeAudit`, roster changes write `RosterAssignmentHistory`, and assignment rows are superseded rather than overwritten. |
| Transaction Integrity | Strong in roster assignment/unassignment and employee lifecycle writes. Serializable isolation plus the partial unique index is an enterprise-grade choice for roster correctness. |
| Scalability | Good for expected HR and roster write volume. Read-side pagination is present. Serializable transactions are correct but could become a bottleneck if bulk scheduling becomes very high volume. |
| Runtime Safety | Good. Bootstrap is real, shared packages resolve from `dist`, routes register, guards resolve, and ValidationPipe/CORS are configured. Manual DTO validation remains important. |
| Production Readiness | Good to strong. The core module integration is production-shaped. Remaining work is around broader auth issuance, tests, retry UX, leave/payroll integration, and a few hardening passes. |

### Honest Review Commentary

The implementation is strongest where the domain risk is highest: tenant isolation, role boundaries, auditability, and roster assignment integrity. Those are the parts that matter most in a hospital workforce system because mistakes can leak staff data, corrupt payroll, or misrepresent clinical coverage.

The main thing I would watch in production is not the module shape; the shape is sound. I would watch integration edges:

- Does the auth module issue JWTs with the exact payload this guard expects?
- Does the frontend retry or refresh cleanly after serializable roster conflicts?
- Do payroll and reconciliation consume snapshot fields rather than live shift-template fields?
- Do future developers preserve tenant-qualified repository patterns?
- Are raw SQL migration invariants, especially the partial unique index, present in every environment?

My overall assessment: these modules are ready as a serious enterprise backend foundation for Employee and Roster workflows. They are not a whole hospital workforce platform by themselves, but they provide the right core truth: who the staff are, where they belong, when they are scheduled, what changed, who changed it, and which tenant owns every record.

## 22. Code-Grounded Implementation Reference

This section anchors the architecture in the actual implementation. The snippets are intentionally small. The point is not to duplicate source files, but to show the exact code shapes that make the architecture real at runtime.

### Controller Guards

```ts
@Controller('api/roster')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RosterController {
  constructor(private readonly rosterService: RosterService) {}
}
```

What it does:

- Registers the controller under `/api/roster`.
- Applies JWT authentication and role authorization to every route in the class.
- Declares `RosterService` as a constructor dependency.

When it executes:

- Decorator metadata is read during Nest bootstrap.
- Guards execute per request before the controller method runs.

Why it matters:

- No Roster endpoint can accidentally bypass the authentication/authorization path unless a developer removes the class-level guard.

Engineer’s Note:
Class-level guards are a good default here because every Employee and Roster endpoint is privileged. Public endpoints should live in separate controllers rather than weakening this controller.

### Constructor Injection

```ts
constructor(private readonly employeeRepository: EmployeeRepository) {}
```

What it does:

- Tells Nest that `EmployeeService` requires an `EmployeeRepository`.
- Nest resolves the dependency from `EmployeeModule.providers`.

When it executes:

- During application bootstrap, when Nest instantiates singleton providers.

Why it matters:

- Services do not manually construct repositories.
- Tests can replace repositories with mocks.
- Runtime wiring stays declarative in modules.

### Decorator Usage

```ts
create(
  @TenantId() tenantId: string,
  @CurrentUser() user: AuthenticatedUser,
  @Body() payload: EmployeeCreateDTO,
) {
  return this.employeeService.create(tenantId, user, payload);
}
```

What it does:

- Extracts tenant ID from the authenticated JWT-backed request user.
- Extracts the actor from `request.user`.
- Extracts the request body.

Why it matters:

- The client does not supply `tenantId` or `actorUserId`.
- Tenant and actor are security context, not business input.

### JWT Verification And `request.user` Population

```ts
const payload = this.verifyBearerToken(request.headers.authorization);

request.user = {
  ...payload,
  userId: payload.sub,
  deptId: payload.deptId ?? null,
} satisfies AuthenticatedUser;

this.tenantContext.set({ tenantId: payload.tenantId });
```

What it does:

- Verifies the Bearer token.
- Normalizes JWT payload into the application’s `AuthenticatedUser` shape.
- Stores tenant context for downstream infrastructure.

Why it matters:

- Controllers and services operate on a trusted actor object.
- RBAC and tenant filtering are based on verified token claims, not request headers.

### Role Hierarchy Check

```ts
assertCanAssignRole(actor, targetRole);
```

What it does:

- Prevents actors from assigning roles above their authority.

When it executes:

- During employee creation and role update.

Why it matters:

- Route-level access alone is not enough. A department head may be allowed to create employees, but must not be able to create a hospital admin.

### Repository Tenant Filtering

```ts
const employee = await this.database.client.user.findFirst({
  where: {
    id,
    tenantId,
    ...(includeDeleted ? {} : { deletedAt: null }),
  },
  select: this.employeeSelect(),
});
```

What it does:

- Loads one employee by ID and tenant.
- Excludes soft-deleted records by default.
- Uses a projection that avoids `passwordHash`.

Why it matters:

- The query cannot return another tenant’s employee even if a valid UUID from another hospital is guessed.

### Tenant-Qualified Update

```ts
const result = await tx.user.updateMany({
  where: { id, tenantId },
  data,
});
```

What it does:

- Updates only the employee matching both ID and tenant.
- Returns a count that can be checked.

Why it matters:

- The actual database write is tenant-safe, not only the pre-read.

### Prisma Transaction With Audit Insertion

```ts
return await this.database.client.$transaction(async (tx) => {
  const employee = await tx.user.create({
    data: { ...data, tenantId },
    select: this.employeeSelect(),
  });

  await tx.employeeAudit.create({
    data: {
      tenantId,
      employeeId: employee.id,
      actorUserId: audit.actorUserId,
      action: audit.action,
      previousValue: audit.previousValue,
      newValue: audit.newValue,
    },
  });

  return employee;
});
```

What it does:

- Creates the employee and audit row atomically.

Why it matters operationally:

- HR investigations should not find an employee record with no creation evidence.
- If audit insertion fails, the employee creation rolls back.

### Active Assignment Query

```ts
const previousAssignment = await tx.rosterAssignment.findFirst({
  where: {
    tenantId,
    userId: row.userId,
    date: row.date,
    supersededAt: null,
    status: { not: 'CANCELLED' },
  },
  orderBy: { createdAt: 'desc' },
});
```

What it does:

- Finds the current active assignment for one employee on one date.

Why it matters:

- Determines whether an assignment request is a new assignment or a reassignment.
- Supports the hospital rule that one clinician cannot be actively scheduled to two departments for the same date.

### Serializable Transaction

```ts
return await this.database.client.$transaction(async (tx) => {
  // assignment mutation loop
}, { isolationLevel: 'Serializable' as any });
```

What it does:

- Runs the roster mutation at serializable isolation.

Why it matters:

- Concurrent scheduling edits should not create duplicate active assignment rows.
- PostgreSQL can abort one transaction if concurrent writes cannot be serialized safely.

Engineer’s Note:
Serializable isolation is not “free.” It can produce retryable conflicts under load. For roster writes, that is acceptable because correctness beats raw throughput.

### Supersession Update

```ts
await tx.rosterAssignment.updateMany({
  where: {
    id: previousAssignment.id,
    tenantId,
    supersededAt: null,
  },
  data: {
    supersededAt: closedAt,
    status: 'REASSIGNED',
  },
});
```

What it does:

- Closes the previous assignment version.

Why it matters:

- The old assignment remains queryable for history.
- The new assignment becomes the active current schedule.

### Partial Unique Index

```sql
CREATE UNIQUE INDEX "roster_assignments_one_active_assignment_key"
  ON "roster_assignments"("tenant_id", "user_id", "date")
  WHERE "superseded_at" IS NULL AND "status" <> 'CANCELLED';
```

What it does:

- Enforces one active non-cancelled assignment per tenant/user/date at the database layer.

Why it matters:

- Application checks are helpful, but database constraints are the last line of defense.

Engineer’s Note:
This is in raw migration SQL because Prisma schema cannot directly express this partial unique index. Anyone rebuilding migrations must preserve it.

## 23. Request Flow Visualization

### Standard Guarded Request

```txt
┌─────────────┐
│ HTTP Client │
└──────┬──────┘
       ↓
┌─────────────────┐
│ Express Adapter │
└──────┬──────────┘
       ↓
┌───────────────────────┐
│ TenantContextMiddleware│
└──────┬────────────────┘
       ↓
┌──────────────┐
│ JwtAuthGuard │
└──────┬───────┘
       ↓
┌──────────────┐
│  RolesGuard  │
└──────┬───────┘
       ↓
┌──────────────┐
│  Controller  │
└──────┬───────┘
       ↓
┌──────────────┐
│   Service    │
└──────┬───────┘
       ↓
┌──────────────┐
│  Repository  │
└──────┬───────┘
       ↓
┌──────────────┐
│  Prisma ORM  │
└──────┬───────┘
       ↓
┌──────────────┐
│ PostgreSQL   │
└──────────────┘
```

### Roster Reassignment Transaction

```txt
┌───────────────────────────────┐
│ Serializable transaction opens │
└───────────────┬───────────────┘
                ↓
┌───────────────────────────────┐
│ Find active assignment         │
│ tenant + user + date           │
└───────────────┬───────────────┘
                ↓
        ┌───────┴────────┐
        │ previous exists?│
        └───────┬────────┘
                ↓ yes
┌───────────────────────────────┐
│ Mark previous REASSIGNED       │
│ Set supersededAt               │
└───────────────┬───────────────┘
                ↓
┌───────────────────────────────┐
│ Create new active assignment   │
│ Copy shift snapshots           │
└───────────────┬───────────────┘
                ↓
┌───────────────────────────────┐
│ Link previous -> new assignment│
└───────────────┬───────────────┘
                ↓
┌───────────────────────────────┐
│ Insert history row             │
└───────────────┬───────────────┘
                ↓
┌───────────────────────────────┐
│ Commit transaction             │
└───────────────────────────────┘
```

## 24. System Execution Timelines

The timings below are illustrative. They show order of execution, not guaranteed latency. Real timings depend on network, database load, bcrypt cost, and transaction contention.

### Employee Creation Runtime Timeline

```txt
T+0ms    HTTP request received
T+1ms    Express adapter forwards request into Nest
T+2ms    TenantContextMiddleware enters request context
T+3ms    JwtAuthGuard validates Bearer token
T+5ms    request.user is populated
T+6ms    RolesGuard validates route permissions
T+7ms    @TenantId, @CurrentUser, and @Body resolve parameters
T+8ms    EmployeeController.create invoked
T+9ms    EmployeeService.create starts validation
T+12ms   Department tenant ownership checked if departmentId exists
T+15ms   bcrypt hashes raw password
T+25ms   EmployeeRepository.create opens transaction
T+30ms   users row inserted
T+32ms   employee_audits row inserted
T+35ms   Transaction committed
T+36ms   EmployeeResponseDTO mapped
T+38ms   JSON response returned
```

Operational context:

- Password hashing is intentionally the expensive part.
- The database transaction is short and contains only create + audit writes.

### Employee Update Runtime Timeline

```txt
T+0ms    PATCH request received
T+2ms    JwtAuthGuard authenticates actor
T+4ms    RolesGuard authorizes update route
T+6ms    EmployeeService.update validates employee UUID
T+9ms    Existing employee loaded by tenant
T+11ms   Service checks actor can access employee
T+13ms   Patch fields validated and normalized
T+15ms   Audit before/after payload prepared
T+18ms   Repository transaction opens
T+22ms   Tenant-qualified updateMany executes
T+24ms   Audit row inserted
T+26ms   Employee reloaded
T+28ms   Transaction committed
T+30ms   Response returned
```

Operational context:

- `updateMany` is a tenant safety choice.
- The audit row is created inside the same transaction as the update.

### Shift Assignment Runtime Timeline

```txt
T+0ms    POST assignment request received
T+2ms    JWT validated and request.user populated
T+4ms    RolesGuard confirms scheduler role
T+6ms    RosterService.assignEmployees starts
T+8ms    Shift template loaded by tenant
T+11ms   Employee IDs validated and deduplicated
T+15ms   Employees loaded and confirmed tenant-owned
T+18ms   Date range validated and expanded
T+20ms   Department scheduling access checked
T+23ms   Serializable transaction opens
T+27ms   Active assignment lookup executes
T+31ms   New assignment inserted with snapshots
T+34ms   History row inserted
T+38ms   Transaction committed
T+40ms   Response array mapped and returned
```

Operational context:

- For bulk monthly schedules, the middle of the timeline repeats per employee-date row.
- The transaction should stay focused on database mutation work, not expensive external calls.

### Reassignment Runtime Timeline

```txt
T+0ms    Assignment request for already-scheduled employee/date received
T+8ms    Service validates actor, shift, employees, date, department
T+20ms   Serializable transaction opens
T+24ms   Existing active assignment found
T+28ms   Existing assignment marked REASSIGNED and superseded
T+31ms   New assignment inserted
T+33ms   Previous assignment linked to new assignment
T+36ms   History row inserted with action REASSIGNED
T+40ms   Transaction committed
T+42ms   New assignment returned
```

Operational context:

- This preserves both the original and replacement schedule.
- During a staffing audit, the system can explain the change rather than only showing the final state.

### Unassignment Runtime Timeline

```txt
T+0ms    Unassignment request received
T+4ms    Guards authenticate and authorize
T+8ms    Service validates shift ID, employee IDs, date range
T+14ms   Rows built for each employee/date
T+18ms   Serializable transaction opens
T+22ms   Active matching assignment found
T+26ms   Existing assignment superseded
T+30ms   CANCELLED assignment row inserted
T+33ms   Original assignment linked to cancellation row
T+36ms   History row inserted with action UNASSIGNED
T+40ms   Transaction committed
T+42ms   Cancellation response returned
```

Operational context:

- A cancellation is not the absence of data; it is a recorded scheduling event.

## 25. Deep Failure Analysis

### JWT Expiry And Stale Tokens

If a token has an `exp` claim in the past, `JwtAuthGuard` rejects it before controller execution. The user sees a 401. No service validation or repository query runs.

Operationally, stale tokens are expected in long-lived browser sessions. The frontend should treat this as an authentication refresh/sign-in concern, not as a business validation failure.

### Invalid Tenant Access Attempt

Scenario:

```txt
Actor from tenant A sends employee ID or department ID from tenant B.
```

Behavior:

- JWT authenticates actor as tenant A.
- `@TenantId()` returns tenant A.
- Repository query includes `tenantId: tenantA`.
- PostgreSQL returns no row.
- Service/repository throws `NotFoundException`.

Why this is safe:

- The response does not confirm that the target record exists in tenant B.
- The failure looks like "not found for your tenant," which is the correct SaaS isolation behavior.

### RBAC Denial

RBAC failures happen in two places:

- `RolesGuard`: endpoint-level permission denial.
- Service policy helpers: domain-specific denial.

Example:

```txt
DEPT_HEAD creates employee with role HOSPITAL_ADMIN.
```

The route allows department heads to create employees, but `assertCanAssignRole()` rejects assigning a hospital-wide admin role. This is intentional layered authorization.

### Validation Failure

Validation failures are thrown as `BadRequestException`. Nest serializes them into 400 responses. Since validation runs before repository mutation, no database writes happen.

Examples:

- Invalid UUID.
- Invalid HH:mm time.
- `effectiveTo` before `effectiveFrom`.
- Empty employee update payload.
- Suspended employee scheduled to a shift.

### Transaction Rollback Propagation

Inside Prisma `$transaction`, any thrown exception rolls back all writes in that transaction.

Example:

```txt
Employee update succeeds
Audit insert fails
  -> transaction rolls back
  -> employee update is not committed
  -> HTTP error propagates through Nest exception layer
```

This is important because audit consistency is a hard requirement, not a nice-to-have.

### Concurrent Assignment Collision

Scenario:

```txt
Planner A assigns Nurse A to ICU on 2026-06-01.
Planner B assigns Nurse A to OPD on 2026-06-01 at almost the same time.
```

Possible outcomes:

- One transaction commits.
- The other transaction receives a serialization or uniqueness conflict.
- Repository maps `P2002` or `P2034` to HTTP 409.

User experience:

- The losing user should reload the roster and retry with current state.
- The system does not silently overwrite the winning assignment.

### Audit Consistency During Rollback

Employee and roster audit/history writes live inside the same transactions as the state changes they describe. If the main write fails, the audit/history row does not exist. If audit/history fails, the main write rolls back.

This avoids the two bad states:

- A state change with no audit evidence.
- Audit evidence for a state change that never committed.

## 26. Real-World Hospital Operations Context

### Payroll Disputes

If a nurse disputes overtime pay for a night shift, the system needs to reconstruct:

- Which shift was assigned.
- What the shift start/end times were at the time.
- What overtime threshold applied.
- Whether the nurse was reassigned.
- Who made the schedule change.

Snapshot fields and history rows are the technical mechanism that support this operational conversation.

### Staffing Audits

Hospitals may need to prove that a department had sufficient coverage on a specific date. Roster assignments answer:

- Which employees were scheduled.
- Which department they were assigned to work in.
- Whether assignments were cancelled or superseded.
- Who made changes.

This is why the roster engine preserves reassignment history instead of only storing the current final roster.

### HR Investigations

If an employee’s role or department changes unexpectedly, `EmployeeAudit` provides:

- Actor.
- Action.
- Before values.
- After values.
- Timestamp.

This is not just compliance polish. It is how HR distinguishes a legitimate administrative change from a configuration mistake or misuse.

### Multi-Hospital SaaS Isolation

In a multi-tenant deployment, two hospitals may use the same employee codes, department codes, or device PINs. Tenant-local uniqueness and tenant-scoped queries allow that safely. Without explicit tenant filtering, one hospital’s staff directory could leak into another hospital’s operations.

### Scheduling Conflicts

Nurse scheduling conflicts are not abstract race conditions. They can create real coverage problems. Serializable transactions and the active-assignment index prevent the system from telling two departments they both have the same nurse for the same day.

## 27. Extending The System Safely

Future engineers should preserve the shape of the architecture when adding new behavior.

### Adding A New Endpoint

Recommended path:

```txt
Controller route
  -> @Roles metadata
  -> @TenantId / @CurrentUser decorators
  -> Service method
  -> validation helpers
  -> repository method
  -> tenant-scoped Prisma query
  -> response DTO mapping
```

Do not put Prisma calls in controllers. Do not trust tenant ID from the body. Do not accept actor IDs from clients.

### Adding A New Module

Recommended module shape:

```ts
@Module({
  imports: [DatabaseModule],
  controllers: [NewDomainController],
  providers: [NewDomainService, NewDomainRepository],
})
export class NewDomainModule {}
```

This preserves:

- Guard availability.
- DatabaseService injection.
- TenantContextService single-source behavior.

### Adding New RBAC Roles

Steps:

1. Add the role to `UserRole` in `@chronos/types-common`.
2. Update role-policy helpers.
3. Update route-level `@Roles(...)` metadata.
4. Update JWT issuance to emit the new role.
5. Add tests for both allowed and denied paths.

Engineer’s Note:
Adding a role is not just adding an enum. It changes the authorization matrix and should be reviewed like a security change.

### Adding Attendance Integration

Attendance should consume roster assignments; it should not own schedule mutation. A safe integration would:

- Match biometric logs to `User.devicePin`.
- Find active roster assignment by tenant/user/date.
- Use assignment snapshots for expected shift boundaries.
- Write attendance/reconciliation records in its own bounded context.

### Adding Payroll Integration

Payroll should consume immutable roster and attendance evidence. It should not recalculate historical shifts from live templates. It should use:

- `RosterAssignment` snapshot fields.
- `overriddenHourlyRate`.
- Attendance logs.
- Reconciliation outcomes.
- Employment/payroll metadata.

### Preserving Auditability

Any future endpoint that changes employee lifecycle, access rights, assignment state, pay-impacting metadata, or attendance evidence should write audit/history records transactionally.

## 28. Focused Future Work For These Modules

This section is intentionally limited to future work that directly affects Employee or Shift/Roster ownership. Platform-wide items such as analytics, notification delivery, and payroll calculation belong in their own module plans.

### Tenant-Qualified Shift Template Updates

Current state:

- `RosterRepository.updateShiftTemplate()` prechecks tenant ownership, then updates by globally unique `id`.

Future hardening:

- Change the write to `updateMany({ where: { id, tenantId } })` and check `count`.

Why it matters:

- It would make Roster template writes match the stricter Employee repository pattern.

### Shift Template Versioning

Current state:

- Assignments preserve snapshots, but templates mutate in place.

Future improvement:

- Add a `ShiftTemplateVersion` model.
- Make assignments reference the exact template version used.

Why it matters:

- Snapshots already protect history, but explicit versions would make planned template changes easier to reason about.

### Assignment Conflict Retry Strategy

Current state:

- Backend maps `P2002` and `P2034` to 409 Conflict.

Future improvement:

- Add client retry/reload behavior.
- Potentially add a backend retry wrapper for narrow transaction conflicts.

Why it matters:

- Serializable transactions are correct, but users need a good experience when conflicts happen.

### Audit Action Enums

Current state:

- Audit/history action values are strings.

Future improvement:

- Move action names into shared enums in `@chronos/types-common`.

Why it matters:

- Reduces typo risk and makes reporting easier.

### Leave-Aware Scheduling Integration

Current state:

- Roster blocks terminated and suspended employees, but does not check leave requests.

Future improvement:

- Roster service should consult Leave module availability before assignment.

Why it matters:

- A valid employee may still be unavailable due to approved leave.

### Read Models For Monthly Rosters

Current state:

- The write model is authoritative and queryable.

Future improvement:

- Add read-optimized projections for monthly roster screens if UI performance requires it.

Why it matters:

- Monthly roster views can become read-heavy without changing the write-side integrity model.

## 29. Debugging & Operational Diagnostics

### Trace A Request

Start with the route and follow the layers:

```txt
Controller method
  -> Service method
  -> Repository method
  -> Prisma query
  -> PostgreSQL row
```

For a roster assignment bug, inspect:

- `RosterController.assignEmployees`
- `RosterService.assignEmployees`
- `RosterRepository.assignEmployees`
- `roster_assignments`
- `roster_assignment_histories`

### Debug RBAC Failures

Checklist:

- Does the JWT contain the expected `role`?
- Does the route include the expected `@Roles(...)`?
- Is the failure from `RolesGuard` or from service-level policy?
- For department-scoped actors, does `deptId` match the target department?

### Debug Tenant Issues

Checklist:

- Decode the JWT and confirm `tenantId`.
- Confirm controller uses `@TenantId()`.
- Confirm service passes tenant ID to repository.
- Confirm repository query includes `tenantId`.
- Check whether the target department/employee belongs to that tenant.

### Inspect Active Assignments

SQL:

```sql
SELECT id, tenant_id, user_id, department_id, shift_template_id, date, status,
       superseded_at, superseded_by_assignment_id
FROM roster_assignments
WHERE tenant_id = $1
  AND user_id = $2
  AND date = $3
  AND superseded_at IS NULL
  AND status <> 'CANCELLED';
```

If more than one row returns, the partial unique index is missing or was not applied.

### Inspect Assignment History

SQL:

```sql
SELECT action, previous_shift_template_id, new_shift_template_id,
       previous_department_id, new_department_id, reason, actor_user_id, created_at
FROM roster_assignment_histories
WHERE tenant_id = $1
  AND user_id = $2
  AND effective_date = $3
ORDER BY created_at ASC;
```

This explains how the current schedule got there.

### Debug Prisma Transactions

Enable Prisma query logs in development through the shared client:

```ts
new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
```

Debugging strategy:

- Reproduce with one employee/date first.
- Check whether conflict is `P2002` or `P2034`.
- Inspect active assignment rows before retrying.
- Confirm the partial unique index exists in the database.

### Request Correlation

Future production improvement:

- Generate or accept `X-Request-ID`.
- Add it to logs.
- Include it in Prisma transaction logs where possible.
- Return it in error responses.

This would make guard failures, service validation failures, and transaction conflicts much easier to trace across logs.

## 30. Operational Scaling Considerations

### Indexing Strategy

The schema indexes the common access paths:

- Employees by tenant.
- Employees by tenant/status.
- Employees by tenant/deleted state.
- Roster assignments by tenant/date.
- Roster assignments by tenant/user/date.
- Roster history by tenant/user/effective date.
- Shift templates by tenant/active state.

These indexes align with UI and operational workflows: list employees, filter active staff, view daily roster, inspect employee assignment history.

### Transaction Costs

Serializable transactions are used only for assignment mutations, not for all reads. That is intentional. Reads can scale through pagination and indexes. Writes that affect schedule correctness pay the stronger isolation cost.

Potential bottleneck:

- Bulk monthly assignment for many employees over many dates can create many rows in one transaction.

Future options:

- Chunk by department/date range.
- Use background jobs for large roster generation.
- Add retry logic for serialization conflicts.

### Audit And History Growth

Audit/history tables grow forever in a healthy system. That is the point. Operationally, this means:

- Indexes must be maintained.
- Archive strategy may be needed after retention windows.
- Reporting queries should be paginated and tenant-scoped.
- Compliance policy should decide retention, not convenience.

### Tenant Scaling

Tenant-scoped indexes support multi-hospital SaaS growth. As tenant count grows, the main risk is not query correctness but operational load:

- Connection pool saturation.
- Large tenants with heavy roster history.
- Reporting queries scanning too much history.

Future mitigations:

- Read replicas.
- Query timeouts.
- Partitioning high-growth tables by tenant or date if needed.
- Materialized read models for dashboards.

## 31. Code Evolution History

The current shape exists because a few earlier or simpler designs would not have held up well.

### Header-Based Tenant Trust Was Avoided

Earlier multi-tenant systems often accept `X-Tenant-ID`. This implementation does not use that for Employee/Roster authorization. Tenant comes from the verified JWT. That prevents a client from switching tenants by changing a header.

### Client-Provided Password Hash Was Replaced

Employee creation now accepts raw `password` and hashes server-side. Trusting client-supplied hashes is risky because the server loses control over hashing algorithm, cost factor, and credential handling policy.

### Supersession Replaced Naive Roster Updates

A naive system might update an assignment row in place:

```txt
UPDATE roster_assignments SET shift_template_id = newShift
```

That loses the original schedule. Supersession keeps the old row, creates a new row, and records the transition.

### Audit Infrastructure Was Added For HR Reality

Employee lifecycle changes affect access, payroll, department reporting, and staffing. Audit rows were added so the system can answer the human question: "Who changed this, from what, to what, and when?"

### Active Assignment Uniqueness Became A Database Rule

Application logic checks for existing assignments, but concurrent requests can still race. The partial unique index makes the database enforce the invariant even if application logic misses a case.

## 32. Architecture Defense Questions

The detailed teammate-facing answers are in `Questions Teammates Will Probably Ask`. This short section is the presentation version: the answers to keep ready during supervisor review.

| Question | Short answer |
| --- | --- |
| Why repositories? | They centralize tenant filters, projections, transactions, audit/history writes, and Prisma conflict mapping. |
| Why services? | They keep business rules out of controllers and database code. |
| Why serializable roster transactions? | Preventing duplicate active assignments is more important than maximizing write throughput. |
| Why snapshots? | Historical assignments must keep the shift rules that existed when the schedule was created. |
| Why supersession? | Reassignment is evidence; updating in place would erase the previous schedule. |
| Why audit rows? | HR-sensitive changes need actor, before, after, and timestamp evidence. |
| Why soft delete employees? | Historical roster, attendance, payroll, and audit references must remain intact. |
| Why tenant filtering everywhere? | Tenant ID is the SaaS data boundary; every query must enforce it. |
| Why not payroll here? | Payroll consumes roster/attendance evidence; it is a separate bounded context. |
| Why not attendance here? | Roster is the plan; attendance is the observed reality. |

## 33. Enterprise Readiness Assessment

### Strengths

- Strong layering and module boundaries.
- Tenant isolation is explicit and reviewable.
- Guarded routes and service-level role checks protect sensitive workflows.
- Employee credentials are hashed server-side.
- Audit and history are first-class concepts, not afterthoughts.
- Roster transactions are designed for concurrent editing.
- Snapshot strategy protects payroll and reconciliation history.
- Shared packages reduce contract drift across backend/frontend/database boundaries.

### Limitations

- DTO runtime validation remains manual because shared DTOs are interfaces.
- Shift template versioning is not yet modeled explicitly.
- Client-side retry UX for transaction conflicts is not implemented here.
- Some hardening remains around tenant-qualified template updates.
- Broader auth issuance and refresh-token flows are outside this module documentation.

### Operational Readiness

The modules are operationally credible for employee administration and schedule management. They include the important production behaviors: startup wiring, route registration, guard execution, tenant filtering, transaction rollback, and auditable state changes.

### Scalability Readiness

The read paths use pagination and tenant-oriented indexes. The write paths are intentionally conservative. For very large tenants or bulk roster generation, the likely future work is chunking, background jobs, retry loops, and read models.

### Audit Readiness

Audit readiness is strong. Employee and roster changes are traceable. The most important future improvement would be standardizing audit action enums and eventually streaming audit events to immutable storage.

### Security Maturity

Security maturity is good for the assigned modules. The most important next step is verifying the auth module’s token issuance lifecycle and adding automated tests around role and tenant boundaries.

### Maintainability Score

High. The modules are understandable because controller, service, repository, schema, and shared contracts each have clear roles. The cost is some boilerplate, but that boilerplate is buying reviewability.

### Production Maturity

Good to strong. This is not just prototype code; it has production-shaped concerns. The remaining work is less about rewriting the modules and more about operational hardening: tests, tracing, retry behavior, template versioning, and integration with adjacent systems.

Final view: the implementation is a solid enterprise foundation. It does not pretend to solve the entire hospital workforce platform, and that restraint is part of its quality. It defines the core truths for staff identity and scheduling, protects them with tenant/RBAC/audit boundaries, and leaves payroll, attendance, reconciliation, notifications, and reporting to their own bounded contexts.
