'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-chamber-950 disabled:opacity-50 disabled:cursor-not-allowed',
          variant === 'primary' && 'bg-gold-400 text-chamber-950 hover:bg-gold-300 focus:ring-gold-400',
          variant === 'secondary' && 'border border-gray-300 dark:border-chamber-600 text-gray-700 dark:text-chamber-200 hover:bg-gray-100 dark:hover:bg-chamber-800 focus:ring-chamber-500',
          variant === 'ghost' && 'text-gray-500 dark:text-chamber-300 hover:bg-gray-100 dark:hover:bg-chamber-800 hover:text-gray-900 dark:hover:text-white focus:ring-chamber-500',
          variant === 'danger' && 'bg-red-600 text-white hover:bg-red-500 focus:ring-red-500',
          size === 'sm' && 'px-3 py-1.5 text-xs',
          size === 'md' && 'px-4 py-2.5 text-sm',
          size === 'lg' && 'px-6 py-3 text-base',
          className,
        )}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
