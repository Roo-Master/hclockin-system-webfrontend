/**
 * Base entity with common fields
 */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Common status types
 */
export type Status = 'active' | 'inactive' | 'pending';
export type Severity = 'info' | 'warning' | 'error' | 'success';

/**
 * API response wrapper
 */
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
  success: boolean;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Filter operators
 */
export type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'between';

/**
 * Filter definition
 */
export interface Filter {
  field: string;
  operator: FilterOperator;
  value: any;
}

/**
 * Sort definition
 */
export interface Sort {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * ID type
 */
export type ID = string;

/**
 * Nullable type
 */
export type Nullable<T> = T | null;

/**
 * Optional type
 */
export type Optional<T> = T | undefined;

/**
 * Deep partial
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Deep required
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Extract keys of a specific type
 */
export type KeysOfType<T, U> = {
  [P in keyof T]: T[P] extends U ? P : never;
}[keyof T];

/**
 * Omit null and undefined
 */
export type NonNullableKeys<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

/**
 * Pick by type
 */
export type PickByType<T, U> = Pick<T, KeysOfType<T, U>>;
