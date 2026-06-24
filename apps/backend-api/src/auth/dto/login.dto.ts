import { IsEmail, IsNotEmpty, IsUUID, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(128)
  password: string;

  @IsUUID()
  @IsNotEmpty()
  tenantId: string;
}
