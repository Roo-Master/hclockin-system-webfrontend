import { Module } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller'; // If it exists

@Module({
  controllers: [LeaveController],
  providers: [LeaveService],
  exports: [LeaveService], // THIS IS CRITICAL - must be here
})
export class LeaveModule {}