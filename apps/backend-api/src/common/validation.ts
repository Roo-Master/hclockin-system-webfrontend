import { BadRequestException } from '@nestjs/common';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HH_MM_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function assertUuid(value: string, fieldName: string): void {
  if (!UUID_PATTERN.test(value)) {
    throw new BadRequestException(`${fieldName} must be a valid UUID.`);
  }
}

export function assertRequiredString(value: unknown, fieldName: string, maxLength = 255): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new BadRequestException(`${fieldName} is required.`);
  }

  const trimmed = value.trim();

  if (trimmed.length > maxLength) {
    throw new BadRequestException(`${fieldName} must not exceed ${maxLength} characters.`);
  }

  return trimmed;
}

export function assertOptionalString(value: unknown, fieldName: string, maxLength = 255): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new BadRequestException(`${fieldName} must be a string.`);
  }

  const trimmed = value.trim();

  if (trimmed.length > maxLength) {
    throw new BadRequestException(`${fieldName} must not exceed ${maxLength} characters.`);
  }

  return trimmed;
}

export function assertEnumValue<T extends Record<string, string>>(
  value: unknown,
  enumObject: T,
  fieldName: string,
): T[keyof T] {
  if (!Object.values(enumObject).includes(value as string)) {
    throw new BadRequestException(`${fieldName} is invalid.`);
  }

  return value as T[keyof T];
}

export function assertOptionalEnumValue<T extends Record<string, string>>(
  value: unknown,
  enumObject: T,
  fieldName: string,
): T[keyof T] | undefined {
  if (value === undefined) {
    return undefined;
  }

  return assertEnumValue(value, enumObject, fieldName);
}

export function assertTime(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || !HH_MM_PATTERN.test(value)) {
    throw new BadRequestException(`${fieldName} must use HH:mm 24-hour format.`);
  }

  return value;
}

export function assertOptionalNonNegativeInteger(value: unknown, fieldName: string): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const normalized = Number(value);

  if (!Number.isInteger(normalized) || normalized < 0) {
    throw new BadRequestException(`${fieldName} must be a non-negative integer.`);
  }

  return normalized;
}

export function assertOptionalNumber(value: unknown, fieldName: string): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const normalized = Number(value);

  if (!Number.isFinite(normalized) || normalized < 0) {
    throw new BadRequestException(`${fieldName} must be a non-negative number.`);
  }

  return normalized;
}

export function assertDate(value: unknown, fieldName: string): Date {
  if (typeof value !== 'string') {
    throw new BadRequestException(`${fieldName} must be an ISO date string.`);
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException(`${fieldName} must be a valid date.`);
  }

  return date;
}

export function assertOptionalDate(value: unknown, fieldName: string): Date | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return assertDate(value, fieldName);
}

export function assertUuidArray(value: unknown, fieldName: string): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new BadRequestException(`${fieldName} must contain at least one UUID.`);
  }

  const uniqueValues = [...new Set(value)];

  for (const item of uniqueValues) {
    if (typeof item !== 'string') {
      throw new BadRequestException(`${fieldName} must contain only UUID strings.`);
    }
    assertUuid(item, fieldName);
  }

  return uniqueValues;
}

export function assertPlainObject(value: unknown, fieldName: string): Record<string, unknown> | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestException(`${fieldName} must be an object.`);
  }

  return value as Record<string, unknown>;
}
