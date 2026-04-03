'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);

    // Report to Sentry if configured
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        extra: { componentStack: errorInfo.componentStack },
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-lg bg-chamber-900 p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <svg
              className="h-6 w-6 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-white">
              Something went wrong
            </h3>
            <p className="mt-1 text-sm text-chamber-400">
              An unexpected error occurred. Please try again.
            </p>
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre className="mt-2 max-w-full overflow-auto rounded-md bg-chamber-800 p-3 text-xs text-red-300">
              {this.state.error.message}
              {'\n'}
              {this.state.error.stack}
            </pre>
          )}

          <button
            onClick={this.handleReset}
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-gold-400 px-4 py-2 text-sm font-medium text-chamber-950 transition-colors hover:bg-gold-500"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
