import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class TenantFeatureDto {
  @IsString()
  featureKey: string;

  @IsOptional()
  featureValue?: any;

  @IsBoolean()
  isEnabled: boolean;
}

export class UpdateTenantFeaturesDto {
  features: TenantFeatureDto[];
}