import { Role } from '../enums/roles.enum';

export interface RequestUser {
  id: string;
  email: string;
  role: Role;
  tenantId?: string; // optional — super admin may not belong to a tenant
}