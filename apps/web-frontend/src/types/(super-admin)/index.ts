// Common types
export * from './common';

// Domain types
export * from './user';
export * from './admin';
export * from './tenant';
export * from './feature-flags';
export * from './billing';
export * from './system-monitor';

// API types
export * from './api';

// ─── Utility Types ──────────────────────────────────────────────────────────

/**
 * Extract the response type from an API endpoint
 */
export type ApiResponseType<T extends keyof import('./api').ApiEndpoints, K extends keyof import('./api').ApiEndpoints[T]> = 
  import('./api').ApiEndpoints[T][K]['response'];

/**
 * Extract the request type from an API endpoint
 */
export type ApiRequestType<T extends keyof import('./api').ApiEndpoints, K extends keyof import('./api').ApiEndpoints[T]> = 
  import('./api').ApiEndpoints[T][K]['request'];

/**
 * Deep readonly
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Extract array item type
 */
export type ArrayItem<T> = T extends Array<infer U> ? U : never;

/**
 * Extract promise return type
 */
export type PromiseReturn<T> = T extends Promise<infer U> ? U : never;

/**
 * Function type
 */
export type AnyFunction = (...args: any[]) => any;

/**
 * Constructor type
 */
export type Constructor<T> = new (...args: any[]) => T;

/**
 * Key value pair
 */
export type KeyValuePair<K extends string | number | symbol = string, V = any> = {
  [P in K]: V;
};

/**
 * Maybe type
 */
export type Maybe<T> = T | null | undefined;

/**
 * Extract keys with value type
 */
export type KeysWithValue<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

/**
 * Pick keys with value type
 */
export type PickWithValue<T, V> = Pick<T, KeysWithValue<T, V>>;
