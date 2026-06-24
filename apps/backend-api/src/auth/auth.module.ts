import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuditLogService } from '../audit/audit-log.service';
import { EmailService } from '../email/email.service';

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuditLogService,
    EmailService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
