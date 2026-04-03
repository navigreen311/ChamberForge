"use client";

interface ContradictionAlertProps {
  claimA: string;
  claimB: string;
  sourceAId?: string;
  sourceBId?: string;
  explanation: string;
}

export default function ContradictionAlert({
  claimA,
  claimB,
  sourceAId,
  sourceBId,
  explanation,
}: ContradictionAlertProps) {
  return (
    <div className="border border-red-300 bg-red-50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-red-600 font-bold text-sm">!</span>
        <h3 className="text-sm font-semibold text-red-800">
          Contradiction Detected
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
        <div className="bg-white border border-red-200 rounded p-3">
          <span className="text-xs font-medium text-gray-500 block mb-1">
            Claim A{sourceAId ? ` (${sourceAId.slice(0, 8)}...)` : ""}
          </span>
          <p className="text-sm text-gray-800">{claimA}</p>
        </div>
        <div className="bg-white border border-red-200 rounded p-3">
          <span className="text-xs font-medium text-gray-500 block mb-1">
            Claim B{sourceBId ? ` (${sourceBId.slice(0, 8)}...)` : ""}
          </span>
          <p className="text-sm text-gray-800">{claimB}</p>
        </div>
      </div>

      <div className="bg-white border border-red-100 rounded p-3">
        <span className="text-xs font-medium text-gray-500 block mb-1">
          Explanation
        </span>
        <p className="text-sm text-red-700">{explanation}</p>
      </div>
    </div>
  );
}
