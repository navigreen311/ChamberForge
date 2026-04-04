'use client'

interface Props {
  message: string
  onRetry: () => void
}

export default function ErrorBanner({ message, onRetry }: Props) {
  return (
    <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <span className="text-sm text-amber-300">{message}</span>
      </div>
      <button
        onClick={onRetry}
        className="text-sm text-[#C9A84C] hover:underline font-medium"
      >
        Retry
      </button>
    </div>
  )
}
