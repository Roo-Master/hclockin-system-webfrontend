import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class StartImpersonationDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Reason must be at least 10 characters' })
  reason: string;
}