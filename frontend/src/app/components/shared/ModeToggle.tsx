'use client';

import { useSimpleMode } from '@/hooks/useSimpleMode';

export default function ModeToggle() {
  const { isSimple, toggle } = useSimpleMode();

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 rounded-full border border-[#1e2a3a] bg-[#0f1520] px-3 py-1 text-xs transition-colors hover:border-[#C9A84C]/40"
      aria-label={isSimple ? 'Switch to Pro mode' : 'Switch to Simple mode'}
    >
      <span className={isSimple ? 'text-gray-500' : 'text-white font-medium'}>Pro</span>
      <div className="relative h-4 w-8 rounded-full bg-[#1e2a3a]">
        <div
          className={`absolute top-0.5 h-3 w-3 rounded-full transition-all duration-200 ${
            isSimple
              ? 'left-[18px] bg-emerald-400'
              : 'left-0.5 bg-[#C9A84C]'
          }`}
        />
      </div>
      <span className={isSimple ? 'text-white font-medium' : 'text-gray-500'}>Simple</span>
    </button>
  );
}
