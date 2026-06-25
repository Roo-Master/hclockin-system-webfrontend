import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateFeatureFlagsDto {
  @IsOptional()
  @IsBoolean()
  biometricSync?: boolean;

  @IsOptional()
  @IsBoolean()
  leaveManagement?: boolean;

  @IsOptional()
  @IsBoolean()
  payrollIntegration?: boolean;

  @IsOptional()
  @IsBoolean()
  overtimeTracking?: boolean;

  // Add more known flags here as the platform grows
}