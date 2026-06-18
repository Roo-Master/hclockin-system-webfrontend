import { toast } from 'react-hot-toast';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export function useToast() {
  const showToast = (message: string, type: ToastType = 'info', options?: ToastOptions) => {
    const toastOptions = {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
    };

    switch (type) {
      case 'success':
        toast.success(message, toastOptions);
        break;
      case 'error':
        toast.error(message, toastOptions);
        break;
      case 'warning':
        toast(message, {
          ...toastOptions,
          icon: '⚠️',
          style: {
            background: '#FFEDD5',
            color: '#EA580C',
            border: '1px solid #EA580C',
          },
        });
        break;
      case 'info':
        toast(message, {
          ...toastOptions,
          icon: 'ℹ️',
          style: {
            background: '#DBEAFE',
            color: '#2563EB',
            border: '1px solid #2563EB',
          },
        });
        break;
    }
  };

  return { showToast };
}
