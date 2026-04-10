'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, ShieldQuestion } from 'lucide-react';

type ConfirmVariant = 'danger' | 'primary';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
}

interface ConfirmState {
  open: boolean;
  options: ConfirmOptions;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

const defaultOptions: ConfirmOptions = {
  title: 'Konfirmasi',
  message: '',
  confirmText: 'Lanjutkan',
  cancelText: 'Batal',
  variant: 'primary',
};

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    const merged = { ...defaultOptions, ...options } as ConfirmOptions;
    setState({ open: true, options: merged });
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const close = useCallback((result: boolean) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setState(null);
  }, []);

  useEffect(() => {
    if (!state?.open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [state?.open, close]);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {state?.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            aria-label="Tutup dialog"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => close(false)}
          />
          <div className="relative w-full max-w-md">
            <div className={`absolute -inset-1 rounded-[28px] blur-xl opacity-70 ${
              state.options.variant === 'danger'
                ? 'bg-gradient-to-br from-red-200/60 via-rose-100/50 to-orange-100/40'
                : 'bg-gradient-to-br from-blue-200/60 via-cyan-100/40 to-emerald-100/40'
            }`} />
            <div className="relative rounded-[26px] border border-white/60 bg-white/90 shadow-2xl overflow-hidden">
              <div className="flex items-start gap-3 px-5 pt-5">
                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${
                  state.options.variant === 'danger'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {state.options.variant === 'danger' ? <AlertTriangle className="w-5 h-5" /> : <ShieldQuestion className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">{state.options.title}</p>
                  <h2 className="text-base font-semibold text-gray-900 mt-0.5">
                    {state.options.message}
                  </h2>
                </div>
              </div>
              <div className="px-5 pb-5 pt-4 flex gap-2">
                <button className="btn-secondary flex-1" onClick={() => close(false)}>
                  {state.options.cancelText}
                </button>
                <button
                  className={`flex-1 ${state.options.variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
                  onClick={() => close(true)}
                >
                  {state.options.confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): (options: ConfirmOptions) => Promise<boolean> {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }
  return ctx.confirm;
}
