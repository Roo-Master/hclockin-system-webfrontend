import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ImpersonationController } from './impersonation.controller';
import { ImpersonationService } from './impersonation.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [ImpersonationController],
  providers: [ImpersonationService, PrismaService],
  exports: [ImpersonationService],
})
export class ImpersonationModule {}