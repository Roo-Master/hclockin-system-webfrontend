'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface ModalProps {
  id: string;
  title?: string;
  description?: string;
  content: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

interface ModalContextType {
  modals: ModalProps[];
  openModal: (modal: Omit<ModalProps, 'id'>) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  isModalOpen: (id: string) => boolean;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
  children: ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [modals, setModals] = useState<ModalProps[]>([]);

  const openModal = useCallback((modal: Omit<ModalProps, 'id'>): string => {
    const id = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newModal: ModalProps = {
      ...modal,
      id,
      closeOnOutsideClick: modal.closeOnOutsideClick ?? true,
      closeOnEscape: modal.closeOnEscape ?? true,
    };

    setModals(prev => [...prev, newModal]);
    modal.onOpen?.();
    return id;
  }, []);

  const closeModal = useCallback((id: string) => {
    setModals(prev => {
      const modal = prev.find(m => m.id === id);
      if (modal) {
        modal.onClose?.();
      }
      return prev.filter(m => m.id !== id);
    });
  }, []);

  const closeAllModals = useCallback(() => {
    setModals(prev => {
      prev.forEach(modal => modal.onClose?.());
      return [];
    });
  }, []);

  const isModalOpen = useCallback(
    (id: string): boolean => {
      return modals.some(modal => modal.id === id);
    },
    [modals]
  );

  const value: ModalContextType = {
    modals,
    openModal,
    closeModal,
    closeAllModals,
    isModalOpen,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
      <ModalContainer />
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}

// ─── Modal Container ────────────────────────────────────────────────────────

function ModalContainer() {
  const { modals, closeModal } = useModal();

  if (modals.length === 0) return null;

  const getSizeClass = (size: ModalProps['size'] = 'md'): string => {
    const sizes = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-full mx-4',
    };
    return sizes[size];
  };

  return (
    <>
      {modals.map(modal => (
        <div
          key={modal.id}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (modal.closeOnOutsideClick && e.target === e.currentTarget) {
              closeModal(modal.id);
            }
          }}
          onKeyDown={(e) => {
            if (modal.closeOnEscape && e.key === 'Escape') {
              closeModal(modal.id);
            }
          }}
        >
          <div className={`bg-surface rounded-xl shadow-2xl w-full ${getSizeClass(modal.size)} max-h-[90vh] overflow-y-auto`}>
            {(modal.title || modal.description) && (
              <div className="flex items-start justify-between p-6 pb-0">
                <div>
                  {modal.title && (
                    <h2 className="text-heading font-heading text-text-primary">{modal.title}</h2>
                  )}
                  {modal.description && (
                    <p className="text-body text-text-secondary mt-1">{modal.description}</p>
                  )}
                </div>
                <button
                  onClick={() => closeModal(modal.id)}
                  className="text-text-tertiary hover:text-text-primary transition-colors text-2xl leading-none"
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>
            )}
            <div className="p-6">{modal.content}</div>
          </div>
        </div>
      ))}
    </>
  );
}
