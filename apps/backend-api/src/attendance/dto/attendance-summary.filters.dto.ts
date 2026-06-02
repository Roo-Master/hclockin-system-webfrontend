// dto/attendance-summary-filters.dto.ts
export class AttendanceSummaryFiltersDto {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  departmentId?: string;
  page?: number;
  limit?: number;
}