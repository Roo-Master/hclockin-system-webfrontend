// ─── Context Exports ─────────────────────────────────────────────────────────

export { ThemeProvider, useTheme, themeStyles } from './ThemeContext';
export { AuthProvider, useAuth, AuthGuard } from './AuthContext';
export { ToastProvider, useToast } from './ToastContext';
export { 
  FeatureFlagProvider, 
  useFeatureFlagContext, 
  FeatureFlagged 
} from './FeatureFlagContext';
export { ModalProvider, useModal } from './ModalContext';

// ─── Combined Provider ──────────────────────────────────────────────────────

// This file only exports the providers and hooks.
// The AppProviders component is defined in app/providers.tsx
// to avoid JSX in type-only files.

// Impersonation
export { ImpersonationProvider, useImpersonation } from './ImpersonationContext';
