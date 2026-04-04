export default function DiscoverSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-5 animate-pulse"
        >
          <div className="flex justify-between">
            <div className="h-5 bg-[#1e2a3a] rounded w-2/3" />
            <div className="h-8 bg-[#1e2a3a] rounded w-12" />
          </div>
          <div className="flex gap-2 mt-3">
            <div className="h-5 bg-[#1e2a3a] rounded w-16" />
            <div className="h-5 bg-[#1e2a3a] rounded w-20" />
            <div className="h-5 bg-[#1e2a3a] rounded w-24" />
          </div>
          <div className="space-y-2 mt-4">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex items-center gap-2">
                <div className="h-3 bg-[#1e2a3a] rounded w-20" />
                <div className="flex-1 h-2 bg-[#1e2a3a] rounded" />
                <div className="h-3 bg-[#1e2a3a] rounded w-8" />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <div className="h-8 bg-[#1e2a3a] rounded w-24" />
            <div className="h-8 bg-[#1e2a3a] rounded w-28" />
            <div className="h-8 bg-[#1e2a3a] rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}
