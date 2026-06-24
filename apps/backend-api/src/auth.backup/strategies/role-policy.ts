import { ForbiddenException } from '@nestjs/common';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  HOSPITAL_ADMIN = 'HOSPITAL_ADMIN',
  HR_MANAGER = 'HR_MANAGER',
  DEPT_HEAD = 'DEPT_HEAD',
  SUPERVISOR = 'SUPERVISOR',
  EMPLOYEE = 'EMPLOYEE',
}

export function hasTenantWideEmployeeAccess(role: UserRole): boolean {
  return [UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.HR_MANAGER].includes(role);
}

export function hasDepartmentScopedEmployeeAccess(role: UserRole): boolean {
  return [UserRole.DEPT_HEAD, UserRole.SUPERVISOR].includes(role);
}

export function assertCanAssignRole(actorRole: UserRole, targetRole: UserRole): void {
  const roleHierarchy: Record<UserRole, UserRole[]> = {
    [UserRole.SUPER_ADMIN]: Object.values(UserRole),
    [UserRole.HOSPITAL_ADMIN]: [
      UserRole.HOSPITAL_ADMIN,
      UserRole.HR_MANAGER,
      UserRole.DEPT_HEAD,
      UserRole.SUPERVISOR,
      UserRole.EMPLOYEE,
    ],
    [UserRole.HR_MANAGER]: [UserRole.SUPERVISOR, UserRole.EMPLOYEE],
    [UserRole.DEPT_HEAD]: [UserRole.SUPERVISOR, UserRole.EMPLOYEE],
    [UserRole.SUPERVISOR]: [],
    [UserRole.EMPLOYEE]: [],
  };

  const canAssign = roleHierarchy[actorRole]?.includes(targetRole) ?? false;
  if (!canAssign) {
    throw new ForbiddenException(`Role ${actorRole} cannot assign ${targetRole}`);
  }
}
