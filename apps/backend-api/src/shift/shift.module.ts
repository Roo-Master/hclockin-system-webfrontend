import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ShiftRepository } from './repositories/shift.repository';
import { ShiftController } from './shift.controller';
import { ShiftService } from './shift.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ShiftController],
  providers: [ShiftService, ShiftRepository],
  exports: [ShiftService]
})
export class ShiftModule {}
