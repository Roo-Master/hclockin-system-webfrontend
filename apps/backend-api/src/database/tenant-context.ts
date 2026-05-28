
import { AsyncLocalStorage } from 'async_hooks';

export const tenantStorage = new AsyncLocalStorage<string>();

/**
 * Retrieves the currently isolated hospital tenant ID from the execution context.
 * Returns undefined if called outside an isolated request context (e.g., system crons, worker threads).
 */
export function getTenantId(): string | undefined {
  return tenantStorage.getStore();
}