import { Module, forwardRef } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { AttendanceProcessorService } from './services/attendance-processor.service';
import { AttendanceWorkerService } from './services/attendance-worker.service';
import { PrismaService } from '../database/prisma.service';  // Import directly
import { QueueModule } from '../queue/queue.module';
import { RosterModule } from '../roster/roster.module';
import { LeaveModule } from '../leave/leave.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    QueueModule,
    RosterModule,
    LeaveModule,
    NotificationsModule,
  ],
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    AttendanceProcessorService,
    AttendanceWorkerService,
    PrismaService,  // Add PrismaService directly
  ],
  exports: [AttendanceService, AttendanceProcessorService],
})
export class AttendanceModule {}