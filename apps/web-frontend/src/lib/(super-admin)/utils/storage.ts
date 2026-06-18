/**
 * Safe localStorage getter
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Safe localStorage setter
 */
export function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silently fail
  }
}

/**
 * Safe localStorage remover
 */
export function removeStorageItem(key: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(key);
  } catch {
    // Silently fail
  }
}

/**
 * Safe sessionStorage getter
 */
export function getSessionItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Safe sessionStorage setter
 */
export function setSessionItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silently fail
  }
}

/**
 * Safe sessionStorage remover
 */
export function removeSessionItem(key: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.removeItem(key);
  } catch {
    // Silently fail
  }
}

/**
 * Clear all storage
 */
export function clearStorage(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch {
    // Silently fail
  }
}
