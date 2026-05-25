import { Module } from '@nestjs/common';
import { RolesGuard } from '../common/auth/roles.guard';
import { DatabaseModule } from '../database/database.module';
import { RosterController } from './roster.controller';
import { RosterRepository } from './roster.repository';
import { RosterService } from './roster.service';

@Module({
  imports: [DatabaseModule],
  controllers: [RosterController],
  providers: [RosterRepository, RosterService, RolesGuard]
})
export class RosterModule {}
