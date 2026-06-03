import { ForbiddenException } from '@nestjs/common';
import { UserRole } from '@chronos/types-common';
import { AuthenticatedUser } from './authenticated-user';

const ASSIGNABLE_ROLES: Record<UserRole, UserRole[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(UserRole),
  [UserRole.HOSPITAL_ADMIN]: Object.values(UserRole).filter((role) => role !== UserRole.SUPER_ADMIN),
  [UserRole.HR_MANAGER]: [UserRole.EMPLOYEE, UserRole.SUPERVISOR],
  [UserRole.DEPT_HEAD]: [UserRole.EMPLOYEE, UserRole.SUPERVISOR],
  [UserRole.SUPERVISOR]: [],
  [UserRole.EMPLOYEE]: [],
};

export function assertCanAssignRole(actor: AuthenticatedUser, targetRole: UserRole): void {
  if (!ASSIGNABLE_ROLES[actor.role]?.includes(targetRole)) {
    throw new ForbiddenException('You are not allowed to assign this role.');
  }
}

export function hasTenantWideEmployeeAccess(role: UserRole): boolean {
  return [UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.HR_MANAGER].includes(role);
}

export function hasDepartmentScopedEmployeeAccess(role: UserRole): boolean {
  return [UserRole.DEPT_HEAD, UserRole.SUPERVISOR].includes(role);
}
