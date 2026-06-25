import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { TenantService } from '../tenant.service';

@ValidatorConstraint({ name: 'IsSubdomainUnique', async: true })
@Injectable()
export class IsSubdomainUnique implements ValidatorConstraintInterface {
  constructor(private tenantService: TenantService) {}

  async validate(subdomain: string): Promise<boolean> {
    const tenant = await this.tenantService.findBySubdomain(subdomain);
    return !tenant;
  }

  defaultMessage(args: ValidationArguments): string {
    return `Subdomain ${args.value} is already taken`;
  }
}

@ValidatorConstraint({ name: 'IsEmailUnique', async: true })
@Injectable()
export class IsEmailUnique implements ValidatorConstraintInterface {
  constructor(private tenantService: TenantService) {}

  async validate(email: string): Promise<boolean> {
    // ✅ Now findByEmail exists on TenantService
    const tenant = await this.tenantService.findByEmail(email);
    return !tenant;
  }

  defaultMessage(args: ValidationArguments): string {
    return `Email ${args.value} is already registered`;
  }
}