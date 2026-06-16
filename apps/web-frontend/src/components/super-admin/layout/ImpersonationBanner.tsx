'use client';
// This banner renders at layout level so it's always visible during impersonation.
// It reads from a cookie/context set when impersonation starts.

export function ImpersonationBanner() {
  // TODO: read impersonation session from cookie or context
  const isImpersonating = false;
  const tenantName = '';

  if (!isImpersonating) return null;

  return (
    <div className="bg-amber-500 text-amber-950 px-6 py-2 flex items-center justify-between text-sm font-medium">
      <span>
        ⚠️ You are currently viewing as <strong>{tenantName}</strong> admin. 
        Actions taken here affect a real tenant.
      </span>
      <button
        className="bg-amber-700 text-white px-3 py-1 rounded text-xs hover:bg-amber-800"
        onClick={() => {/* TODO: call end impersonation API */}}
      >
        End Session
      </button>
    </div>
  );
}
