import { UserRole } from '../../employee/users/enum/user-role.enum';

export interface AuthenticatedUser {
  userId: string;
  sub: string;
  email: string;
  role: UserRole;
  deptId: string | null;
}
