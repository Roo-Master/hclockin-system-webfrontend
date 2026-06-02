import { Module, forwardRef } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { AttendanceProcessorService } from './services/attendance-processor.service';
import { AttendanceWorkerService } from './services/attendance-worker.service';
import { DatabaseModule } from '../database/database.module';
import { QueueModule } from '../queue/queue.module';
import { RosterModule } from '../roster/roster.module';
import { LeaveModule } from '../leave/leave.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    DatabaseModule,
    QueueModule,
    RosterModule, // Remove forwardRef temporarily
    LeaveModule,
    NotificationsModule,
  ],
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    AttendanceProcessorService,
    AttendanceWorkerService,
  ],
  exports: [AttendanceService, AttendanceProcessorService],
})
export class AttendanceModule {}