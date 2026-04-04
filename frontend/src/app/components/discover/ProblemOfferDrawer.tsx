'use client'
export default function ProblemOfferDrawer({ isOpen, onClose, problemId }: { isOpen: boolean; onClose: () => void; problemId: string }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 bg-[#0D1117] overflow-y-auto">
      <button onClick={onClose} className="fixed top-4 right-4 text-gray-400 hover:text-white text-2xl z-50">✕</button>
      <div className="p-8 text-center text-gray-400">Loading full opportunity for {problemId}...</div>
    </div>
  )
}
