export class TenantMember {
    id: string;
    tenantId: string;
    userId: string;
    role: string;
    permissions: string[];
    joinedAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }