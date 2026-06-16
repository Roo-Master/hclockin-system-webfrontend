'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ImpersonationContextType {
  isImpersonating: boolean;
  tenantId: string | null;
  tenantName: string | null;
  originalUserId: string | null;
  startImpersonation: (tenantId: string, tenantName: string) => Promise<void>;
  endImpersonation: () => Promise<void>;
  isLoading: boolean;
}

const ImpersonationContext = createContext<ImpersonationContextType | undefined>(undefined);

export function useImpersonation() {
  const context = useContext(ImpersonationContext);
  if (context === undefined) {
    throw new Error('useImpersonation must be used within an ImpersonationProvider');
  }
  return context;
}

interface ImpersonationProviderProps {
  children: ReactNode;
}

export function ImpersonationProvider({ children }: ImpersonationProviderProps) {
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [tenantName, setTenantName] = useState<string | null>(null);
  const [originalUserId, setOriginalUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load impersonation state from cookie/session
  useEffect(() => {
    const loadState = async () => {
      try {
        const response = await fetch('/api/auth/impersonation/status', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.isActive) {
            setIsImpersonating(true);
            setTenantId(data.tenantId);
            setTenantName(data.tenantName);
            setOriginalUserId(data.originalUserId);
          }
        }
      } catch (error) {
        // Silent fail
      }
    };

    loadState();
  }, []);

  const startImpersonation = async (tenantId: string, tenantName: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/impersonation/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setIsImpersonating(true);
        setTenantId(tenantId);
        setTenantName(tenantName);
        setOriginalUserId(data.originalUserId || null);
        return;
      } else {
        throw new Error('Failed to start impersonation');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const endImpersonation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/impersonation/end', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setIsImpersonating(false);
        setTenantId(null);
        setTenantName(null);
        setOriginalUserId(null);
        return;
      } else {
        throw new Error('Failed to end impersonation');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImpersonationContext.Provider
      value={{
        isImpersonating,
        tenantId,
        tenantName,
        originalUserId,
        startImpersonation,
        endImpersonation,
        isLoading,
      }}
    >
      {children}
    </ImpersonationContext.Provider>
  );
}
