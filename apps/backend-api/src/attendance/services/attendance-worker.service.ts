import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { QueueService } from '../../queue/queue.service';
import { DatabaseService } from '../../database/database.service';
import { AttendanceProcessorService } from './attendance-processor.service';

@Injectable()
export class AttendanceWorkerService implements OnModuleInit {
  private readonly logger = new Logger(AttendanceWorkerService.name);

  constructor(
    private readonly queue: QueueService,
    private readonly db: DatabaseService,
    private readonly processor: AttendanceProcessorService,
  ) {}

  async onModuleInit() {
    await this.setupWorkers();
  }

  private async setupWorkers() {
    this.queue.process('attendance.process', async (job) => {
      const { userId, tenantId, date, retryCount } = job.data;
      try {
        const result = await this.processor.processUserDay(
          userId,
          tenantId,
          new Date(date),
        );
        return { success: true, result };
      } catch (error) {
        this.logger.error(`Failed to process ${userId} on ${date}: ${error.message}`);
        if (retryCount < 3) {
          await this.queue.add('attendance.process', {
            ...job.data,
            retryCount: retryCount + 1,
          });
        }
        throw error;
      }
    });

    this.queue.process('attendance.reprocess', async (job) => {
      const { userId, tenantId, date } = job.data;
      return this.processor.processUserDay(userId, tenantId, new Date(date));
    });

    this.queue.process('attendance.nightshift', async (job) => {
      const { userId, tenantId, shiftDate } = job.data;
      return this.processor.processNightShift(userId, tenantId, new Date(shiftDate));
    });

    this.logger.log('Attendance workers initialized');
  }
}
