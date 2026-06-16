// src/attendance/attendance.module.ts
import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { AttendanceProcessorService } from './services/attendance-processor.service';
import { AttendanceWorkerService } from './services/attendance-worker.service';
import { PrismaService } from '../database/prisma.service';
import { QueueModule } from '../queue/queue.module';
import { RosterModule } from '../roster/roster.module';
import { LeaveModule } from '../leave/leave.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { QUEUE_NAMES } from '../queue/constants/queue-names.constants';
import { AttendanceQueueProcessor } from './services/attendance-queue-processor';
import { BullModule } from '@nestjs/bull';
import { DeviceModule } from '../device/device.module';   // ← add

@Module({
  imports: [
    QueueModule,
    BullModule.registerQueue({ name: QUEUE_NAMES.ATTENDANCE_PROCESSING }),
    RosterModule,
    LeaveModule,
    NotificationsModule,
    DeviceModule,                                          // ← add
  ],
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    AttendanceProcessorService,
    AttendanceWorkerService,
    PrismaService,
    AttendanceQueueProcessor,
  ],
  exports: [AttendanceService, AttendanceProcessorService],
})
export class AttendanceModule {}