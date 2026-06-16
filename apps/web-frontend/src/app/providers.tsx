'use client';

import React, { ReactNode } from 'react';
import { 
  ThemeProvider, 
  AuthProvider, 
  ToastProvider, 
  FeatureFlagProvider, 
  ModalProvider,
  ImpersonationProvider
} from '@/contexts';

interface AppProvidersProps {
  children: ReactNode;
  tenantId?: string;
}

export function AppProviders({ children, tenantId }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <ImpersonationProvider>
            <FeatureFlagProvider tenantId={tenantId}>
              <ModalProvider>
                {children}
              </ModalProvider>
            </FeatureFlagProvider>
          </ImpersonationProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

// Default export for use in app/layout.tsx
export function Providers({ children }: { children: ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}
