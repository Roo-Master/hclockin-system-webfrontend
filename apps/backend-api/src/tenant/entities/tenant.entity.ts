export class Tenant {
  id: string;
  name: string;
  subdomain: string;
  licenseKey: string;
  slug: string;
  isActive: boolean;
  suspendReason?: string | null;
  suspendedAt?: Date | null;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}