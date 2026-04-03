"use client";

interface EvidenceCardProps {
  id: string;
  sourceUrl: string;
  sourceType: string;
  credibilityScore: number;
  recencyDecayScore: number;
  publicationDate: string;
  claimsCount: number;
  onClick?: () => void;
}

export default function EvidenceCard({
  id,
  sourceUrl,
  sourceType,
  credibilityScore,
  recencyDecayScore,
  publicationDate,
  claimsCount,
  onClick,
}: EvidenceCardProps) {
  function credibilityBarColor(score: number) {
    if (score < 4) return "bg-red-500";
    if (score <= 7) return "bg-yellow-500";
    return "bg-green-500";
  }

  function credibilityBadge(score: number) {
    if (score < 4) return { label: "Low", cls: "bg-red-100 text-red-700" };
    if (score <= 7)
      return { label: "Medium", cls: "bg-yellow-100 text-yellow-700" };
    return { label: "High", cls: "bg-green-100 text-green-700" };
  }

  function recencyIndicator() {
    const pub = new Date(publicationDate);
    const now = new Date();
    const months =
      (now.getFullYear() - pub.getFullYear()) * 12 +
      (now.getMonth() - pub.getMonth());

    if (months < 6)
      return { label: "Fresh", cls: "bg-green-100 text-green-700" };
    if (months <= 18)
      return { label: "Aging", cls: "bg-yellow-100 text-yellow-700" };
    return { label: "Stale", cls: "bg-red-100 text-red-700" };
  }

  const badge = credibilityBadge(credibilityScore);
  const recency = recencyIndicator();

  // Extract a short title from the URL
  const title = sourceUrl.startsWith("http")
    ? new URL(sourceUrl).pathname.split("/").pop() || sourceUrl
    : sourceUrl;

  return (
    <div
      className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-800 truncate flex-1">
          {title}
        </h3>
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600 ml-2 whitespace-nowrap">
          {sourceType.replace(/_/g, " ")}
        </span>
      </div>

      {/* Credibility bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Credibility</span>
          <span className={`px-1.5 py-0.5 rounded ${badge.cls}`}>
            {badge.label}
          </span>
        </div>
        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full ${credibilityBarColor(credibilityScore)}`}
            style={{ width: `${(credibilityScore / 10) * 100}%` }}
          />
        </div>
        <div className="text-right text-xs text-gray-500 mt-0.5">
          {credibilityScore.toFixed(1)}/10
        </div>
      </div>

      {/* Footer indicators */}
      <div className="flex items-center justify-between text-xs">
        <span className={`px-2 py-0.5 rounded ${recency.cls}`}>
          {recency.label}
        </span>
        <span className="text-gray-500">
          {claimsCount} claim{claimsCount !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
