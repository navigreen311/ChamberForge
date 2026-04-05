export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0D1117]">
      <div className="relative">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#C9A84C] border-t-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-[#C9A84C]">CF</span>
        </div>
      </div>
      <p className="text-sm font-medium text-gray-400">Loading...</p>
    </div>
  )
}
