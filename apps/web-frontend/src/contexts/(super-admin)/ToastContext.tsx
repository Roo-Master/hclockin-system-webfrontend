'use client';

import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  dismissible?: boolean;
}

export interface ToastOptions {
  duration?: number;
  dismissible?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, options?: ToastOptions) => void;
  showSuccess: (message: string, options?: ToastOptions) => void;
  showError: (message: string, options?: ToastOptions) => void;
  showWarning: (message: string, options?: ToastOptions) => void;
  showInfo: (message: string, options?: ToastOptions) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
  defaultDuration?: number;
  maxToasts?: number;
}

export function ToastProvider({ 
  children, 
  defaultDuration = 4000, 
  maxToasts = 5 
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', options?: ToastOptions) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const duration = options?.duration ?? defaultDuration;
      const dismissible = options?.dismissible ?? true;

      setToasts(prev => {
        // Limit max toasts
        const newToasts = [{ id, message, type, duration, dismissible }, ...prev];
        return newToasts.slice(0, maxToasts);
      });

      // Auto dismiss
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [defaultDuration, maxToasts, removeToast]
  );

  const showSuccess = useCallback(
    (message: string, options?: ToastOptions) => {
      return showToast(message, 'success', options);
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, options?: ToastOptions) => {
      return showToast(message, 'error', options);
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, options?: ToastOptions) => {
      return showToast(message, 'warning', options);
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, options?: ToastOptions) => {
      return showToast(message, 'info', options);
    },
    [showToast]
  );

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const value: ToastContextType = {
    toasts,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearAll,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// ─── Toast Container ────────────────────────────────────────────────────────

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const getToastStyles = (type: ToastType): string => {
    const base = 'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border animate-slide-in';
    
    switch (type) {
      case 'success':
        return `${base} bg-success-bg text-success border-success/30`;
      case 'error':
        return `${base} bg-danger-bg text-danger border-danger/30`;
      case 'warning':
        return `${base} bg-warning-bg text-warning border-warning/30`;
      case 'info':
        return `${base} bg-info-bg text-info border-info/30`;
      default:
        return `${base} bg-surface text-text-primary border-border`;
    }
  };

  const getIcon = (type: ToastType): string => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✗';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return '';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={getToastStyles(toast.type)}
          role="alert"
        >
          <span className="text-lg font-bold">{getIcon(toast.type)}</span>
          <span className="flex-1 text-sm">{toast.message}</span>
          {toast.dismissible && (
            <button
              onClick={() => removeToast(toast.id)}
              className="text-current opacity-50 hover:opacity-100 transition-opacity"
              aria-label="Dismiss toast"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── CSS for animations ─────────────────────────────────────────────────────

// Add this to your globals.css:
// .animate-slide-in {
//   animation: slideIn 0.3s ease-out;
// }
//
// @keyframes slideIn {
//   from {
//     opacity: 0;
//     transform: translateX(100%);
//   }
//   to {
//     opacity: 1;
//     transform: translateX(0);
//   }
// }
