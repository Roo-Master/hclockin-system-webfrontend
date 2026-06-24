import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
  @IsString()

  @IsString()
  identifier: string; // email OR payrollNumber

  @IsString()
  @MinLength(6)
  password: string;
}