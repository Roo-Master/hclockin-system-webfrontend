// src/attendance/jobs/sync-attendance.job.ts
import { Injectable, Logger } from '@nestjs/common';
import { AttendanceSyncService } from '../services/attendance-sync.service';

@Injectable()
export class SyncAttendanceJob {
  private readonly logger = new Logger(SyncAttendanceJob.name);

  constructor(
    private readonly attendanceSyncService: AttendanceSyncService,
  ) {}

  async execute() {
    this.logger.log('Starting attendance sync job...');
    
    try {
      // Now all these methods exist
      const biometricResult = await this.attendanceSyncService.syncWithBiometricDevices();
      this.logger.log(`Biometric sync result: ${JSON.stringify(biometricResult)}`);
      
      const hrResult = await this.attendanceSyncService.syncWithHRSystem();
      this.logger.log(`HR system sync result: ${JSON.stringify(hrResult)}`);
      
      const report = await this.attendanceSyncService.generateSyncReport();
      this.logger.log(`Sync report: ${JSON.stringify(report)}`);
      
      return {
        biometric: biometricResult,
        hrSystem: hrResult,
        report,
      };
    } catch (error) {
      this.logger.error(`Sync job failed: ${error.message}`);
      throw error;
    }
  }
}