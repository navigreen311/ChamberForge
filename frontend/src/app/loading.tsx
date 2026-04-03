export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-chamber-950">
      {/* Logo mark */}
      <div className="relative">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold-400 border-t-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gold-400">CF</span>
        </div>
      </div>

      <p className="text-sm font-medium text-chamber-400">Loading...</p>
    </div>
  );
}
