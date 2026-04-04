interface Props {
  hasFilters: boolean
  onClearFilters: () => void
  onRunScan: () => void
}

export default function EmptyState({
  hasFilters,
  onClearFilters,
  onRunScan,
}: Props) {
  return (
    <div className="flex flex-col items-center py-16">
      <div className="w-16 h-16 rounded-full bg-[#1e2a3a] flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      {hasFilters ? (
        <>
          <p className="text-gray-400 text-sm">
            No problems match your current filters
          </p>
          <button
            onClick={onClearFilters}
            className="mt-3 text-sm text-[#C9A84C] hover:underline"
          >
            Clear all filters
          </button>
        </>
      ) : (
        <>
          <p className="text-gray-400 text-sm">No problems discovered yet</p>
          <button
            onClick={onRunScan}
            className="mt-3 bg-[#C9A84C] text-[#0D1117] font-medium px-4 py-2 rounded-lg text-sm hover:bg-[#C9A84C]/90"
          >
            Run AI Scan
          </button>
        </>
      )}
    </div>
  )
}
