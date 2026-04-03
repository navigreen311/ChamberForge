"use client";

interface DimensionScore {
  is_valid: boolean;
  score: number;
  reasoning: string;
}

interface ValidationScorecardProps {
  real: DimensionScore;
  payable: DimensionScore;
  deliverable: DimensionScore;
  ethical: DimensionScore;
}

function ScoreBox({
  label,
  dimension,
}: {
  label: string;
  dimension: DimensionScore;
}) {
  const pct = (dimension.score / 10) * 100;
  const barColor = dimension.is_valid
    ? "bg-emerald-500"
    : "bg-red-500";
  const icon = dimension.is_valid ? "\u2713" : "\u2717";
  const iconColor = dimension.is_valid
    ? "text-emerald-400"
    : "text-red-400";

  return (
    <div className="flex flex-col rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white/70">
          {label}
        </h3>
        <span className={`text-2xl font-bold ${iconColor}`}>{icon}</span>
      </div>
      <p className="mb-4 text-3xl font-bold text-white">
        {dimension.score}
        <span className="text-base text-white/40">/10</span>
      </p>
      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${barColor} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-sm leading-relaxed text-white/60">
        {dimension.reasoning}
      </p>
    </div>
  );
}

export default function ValidationScorecard({
  real,
  payable,
  deliverable,
  ethical,
}: ValidationScorecardProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <ScoreBox label="Real" dimension={real} />
      <ScoreBox label="Payable" dimension={payable} />
      <ScoreBox label="Deliverable" dimension={deliverable} />
      <ScoreBox label="Ethical" dimension={ethical} />
    </div>
  );
}
