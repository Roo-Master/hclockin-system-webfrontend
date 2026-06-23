import { Module } from '@nestjs/common';
import { PlatformStatsController } from './platform-stats.controller';
import { PlatformStatsService } from './platform-stats.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [PlatformStatsController],
  providers: [PlatformStatsService, PrismaService],
  exports: [PlatformStatsService],
})
export class PlatformStatsModule {}