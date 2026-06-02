export class Attendance {
  id: string;
  userId: string;
  tenantId: string;
  firstIn: Date | null;
  lastOut: Date | null;
  status: string;
  totalHours: number | null;
  lateMinutes: number | null;
  overtimeHours: number | null;
  date: Date;
  isSynced: boolean;
  createdAt: Date;
  updatedAt: Date;
}
