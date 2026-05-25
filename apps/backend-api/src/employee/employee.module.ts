import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RolesGuard } from '../common/auth/roles.guard';
import { EmployeeController } from './employee.controller';
import { EmployeeRepository } from './employee.repository';
import { EmployeeService } from './employee.service';

@Module({
  imports: [DatabaseModule],
  controllers: [EmployeeController],
  providers: [EmployeeRepository, EmployeeService, RolesGuard]
})
export class EmployeeModule {}
