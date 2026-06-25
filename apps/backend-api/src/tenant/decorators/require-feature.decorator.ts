import { SetMetadata } from '@nestjs/common';

export const RequireFeature = (...features: string[]) => {
  return SetMetadata('features', features);
};