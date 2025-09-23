"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type ToastType = 'success' | 'error' | 'info';

type Toast = { id: number; message: string; type: ToastType };

type ToastContextValue = {
  show: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setItems(prev => [...prev, { id, message, type }]);
    setTimeout(() => setItems(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={{ position: 'fixed', top: 100, right: 20, zIndex: 3000, display: 'grid', gap: 12 }}>
        {items.map(t => (
          <div key={t.id} style={{
            background: `var(--${t.type === 'success' ? 'success' : t.type === 'error' ? 'danger' : 'accent'})`,
            color: 'white', padding: '1rem 1.5rem', borderRadius: 12, fontWeight: 600,
            boxShadow: 'var(--shadow-lg-val)'
          }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}


