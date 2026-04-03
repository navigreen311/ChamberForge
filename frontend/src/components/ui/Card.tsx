import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Card({
  title,
  subtitle,
  actions,
  footer,
  children,
  className,
}: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-lg bg-white dark:bg-chamber-900 text-gray-900 dark:text-white border border-gray-200 dark:border-chamber-700 shadow-sm',
        className,
      )}
    >
      {(title || actions) && (
        <div className="flex items-start justify-between border-b border-gray-200 dark:border-chamber-800 px-6 py-4">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-sm text-gray-500 dark:text-chamber-400">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      <div className="p-6">{children}</div>

      {footer && (
        <div className="border-t border-gray-200 dark:border-chamber-800 px-6 py-4">{footer}</div>
      )}
    </div>
  );
}
