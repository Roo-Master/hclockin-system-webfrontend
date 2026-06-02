class IngestLogDto {
  userId: string;
  deviceId: string;
  direction: 'IN' | 'OUT';
  timestamp: string; // 👈 change Date → string
  rosterAssignmentId?: string;
}

class RecalculateDto {
  startDate: string;
  endDate: string;
  userId?: string;
}