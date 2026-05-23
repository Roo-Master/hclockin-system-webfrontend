import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateDeviceUserDto {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  deviceUserId?: string | null;
}
