import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  @Matches(/[A-Z]/, { message: 'Must contain at least one uppercase letter.' })
  @Matches(/[0-9]/, { message: 'Must contain at least one number.' })
  @Matches(/[^A-Za-z0-9]/, { message: 'Must contain at least one special character.' })
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
