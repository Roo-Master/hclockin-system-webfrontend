import { BadRequestException } from '@nestjs/common';
import { ApiResponsePaginated } from '@chronos/types-common';

export interface NormalizedPagination {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

export function normalizePagination(page?: unknown, limit?: unknown): NormalizedPagination {
  const normalizedPage = Number(page ?? 1);
  const normalizedLimit = Number(limit ?? 25);

  if (!Number.isInteger(normalizedPage) || normalizedPage < 1) {
    throw new BadRequestException('page must be a positive integer.');
  }

  if (!Number.isInteger(normalizedLimit) || normalizedLimit < 1 || normalizedLimit > 100) {
    throw new BadRequestException('limit must be an integer between 1 and 100.');
  }

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip: (normalizedPage - 1) * normalizedLimit,
    take: normalizedLimit,
  };
}

export function paginatedResponse<T>(
  data: T[],
  totalItems: number,
  page: number,
  limit: number,
): ApiResponsePaginated<T> {
  return {
    success: true,
    data,
    meta: {
      totalItems,
      itemCount: data.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    },
  };
}
