import { UserRole } from '../../employee/users/enum/user-role.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  deptId: string | null;
  type?: 'access' | 'refresh';
  sessionId?: string;
  iat?: number;
  exp?: number;
}
