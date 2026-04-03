import { ReactNode } from 'react';
import clsx from 'clsx';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gold';

interface BadgeProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<Variant, string> = {
  default: 'bg-chamber-700 text-chamber-200',
  success: 'bg-green-900/60 text-green-300',
  warning: 'bg-yellow-900/60 text-yellow-300',
  danger: 'bg-red-900/60 text-red-300',
  info: 'bg-blue-900/60 text-blue-300',
  gold: 'bg-gold-400/20 text-gold-400',
};

export default function Badge({
  variant = 'default',
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
