'use client';

import { useEffect, useCallback } from 'react';
import clsx from 'clsx';
import { AlertTriangle, Info, Trash2 } from 'lucide-react';

type Variant = 'danger' | 'warning' | 'info';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: Variant;
}

const variantConfig: Record<
  Variant,
  { icon: typeof AlertTriangle; iconBg: string; iconColor: string; btnClass: string }
> = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-400',
    btnClass: 'bg-red-600 text-white hover:bg-red-700',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    btnClass: 'bg-amber-600 text-white hover:bg-amber-700',
  },
  info: {
    icon: Info,
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    btnClass: 'bg-blue-600 text-white hover:bg-blue-700',
  },
};

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger',
}: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    },
    [onCancel],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative mx-4 w-full max-w-md rounded-xl bg-chamber-900 p-6 shadow-2xl">
        <div className="flex gap-4">
          <div
            className={clsx(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
              config.iconBg,
            )}
          >
            <Icon className={clsx('h-5 w-5', config.iconColor)} />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="mt-1 text-sm text-chamber-400">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg bg-chamber-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-chamber-600"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={clsx(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              config.btnClass,
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
