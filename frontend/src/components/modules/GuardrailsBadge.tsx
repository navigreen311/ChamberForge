"use client";

interface GuardrailsBadgeProps {
  status: "PASS" | "WARN" | "BLOCK";
  label?: string;
}

const styles: Record<string, string> = {
  PASS: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  WARN: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  BLOCK: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function GuardrailsBadge({ status, label }: GuardrailsBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${styles[status] ?? styles.WARN}`}
    >
      {status === "PASS" && "\u2713"}
      {status === "WARN" && "\u26A0"}
      {status === "BLOCK" && "\u2717"}
      {label ?? status}
    </span>
  );
}
