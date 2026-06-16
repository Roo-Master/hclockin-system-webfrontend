// Common hooks
export { useDebounce } from './useDebounce';
export { useLocalStorage } from './useLocalStorage';
export { useMediaQuery, useIsMobile, useIsTablet, useIsDesktop, useIsLargeDesktop } from './useMediaQuery';
export { useOnClickOutside } from './useOnClickOutside';
export { useToast } from './useToast';
export { useApi } from './useApi';

// Domain hooks (these will be created in lib/hooks)
// Export them here for easier imports
export * from '@/lib/hooks/useAuth';
export * from '@/lib/hooks/useFeatureFlags';
export * from '@/lib/hooks/useTenants';
export * from '@/lib/hooks/useBilling';
export { useAdmins } from './useAdmins';
export { useSystemMonitor } from './useSystemMonitor';
