'use client';

import clsx from 'clsx';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export default function ErrorAlert({
  message,
  onRetry,
  onDismiss,
  className,
}: ErrorAlertProps) {
  return (
    <div
      className={clsx(
        'flex items-center gap-3 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3',
        className,
      )}
      role="alert"
    >
      <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />

      <p className="flex-1 text-sm text-red-300">{message}</p>

      <div className="flex items-center gap-1">
        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded-md p-1.5 text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
            title="Retry"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="rounded-md p-1.5 text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
