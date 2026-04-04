'use client';

export default function PageHeader() {
  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <h1 className="text-xl font-semibold text-white">Problem Discovery</h1>
        <p className="text-xs text-gray-500">
          AI-powered scanning across wealth management pain points
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors">
          Configure scan
        </button>
        <button className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors">
          Scan history
        </button>
        <button className="px-3 py-1.5 text-sm border border-gray-600 rounded-md text-gray-300 hover:text-white hover:border-gray-400 transition-colors">
          Save view
        </button>
        <button className="px-3 py-1.5 text-sm bg-[#C9A84C] text-[#0D1117] font-semibold rounded-md hover:bg-[#d4b65c] transition-colors">
          Run AI Scan
        </button>
      </div>
    </div>
  );
}
