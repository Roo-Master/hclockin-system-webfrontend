'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/contexts/(super-admin)';

interface ImpersonationSession {
  isActive: boolean;
  tenantId: string | null;
  tenantName: string | null;
  originalUserId: string | null;
  startedAt: string | null;
}

export function ImpersonationBanner() {
  const [session, setSession] = useState<ImpersonationSession>({
    isActive: false,
    tenantId: null,
    tenantName: null,
    originalUserId: null,
    startedAt: null,
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // Load impersonation session from cookie or context
  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch('/api/auth/impersonation/status', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setSession({
            isActive: data.isActive || false,
            tenantId: data.tenantId || null,
            tenantName: data.tenantName || null,
            originalUserId: data.originalUserId || null,
            startedAt: data.startedAt || null,
          });
        }
      } catch (error) {
        // Silent fail - no impersonation session
        setSession({
          isActive: false,
          tenantId: null,
          tenantName: null,
          originalUserId: null,
          startedAt: null,
        });
      }
    };

    loadSession();
  }, []);

  // End impersonation session
  const endImpersonation = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/impersonation/end', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        showToast('Impersonation session ended successfully', 'success');
        setSession({
          isActive: false,
          tenantId: null,
          tenantName: null,
          originalUserId: null,
          startedAt: null,
        });
        
        // Redirect to super admin dashboard
        window.location.href = '/dashboard';
      } else {
        const error = await response.json();
        showToast(error.message || 'Failed to end impersonation', 'error');
      }
    } catch (error) {
      showToast('Failed to end impersonation. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  if (!session.isActive) {
    return null;
  }

  return (
    <div className="bg-[#FFEDD5] border-b border-[#EA580C]/20 text-[#9A3412] px-6 py-2.5 flex items-center justify-between text-sm font-medium shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-lg" aria-hidden="true">⚠️</span>
        <span>
          You are currently viewing as <strong className="text-[#9A3412]">{session.tenantName || 'Tenant'}</strong> admin.
          Actions taken here affect a real tenant.
        </span>
        {session.startedAt && (
          <span className="text-xs text-[#9A3412]/70 font-normal">
            Started: {new Date(session.startedAt).toLocaleString()}
          </span>
        )}
      </div>
      <button
        onClick={endImpersonation}
        disabled={loading}
        className="bg-[#EA580C] text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-[#C2410C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Ending...
          </>
        ) : (
          'End Session'
        )}
      </button>
    </div>
  );
}
