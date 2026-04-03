"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ValidationScorecard from "@/components/modules/ValidationScorecard";

interface ValidationResult {
  is_real: boolean;
  real_score: number;
  real_reasoning: string;
  is_payable: boolean;
  payable_score: number;
  payable_reasoning: string;
  is_deliverable: boolean;
  deliverable_score: number;
  deliverable_reasoning: string;
  is_ethical: boolean;
  ethical_score: number;
  ethical_reasoning: string;
  overall_score: number;
}

export default function ValidateProblemPage() {
  const params = useParams();
  const problemId = params.problemId as string;

  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runValidation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1/qualify/validate/${problemId}`,
        { method: "POST" },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResult(data.validation);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Validation failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (problemId && problemId !== "new") {
      runValidation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemId]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-12">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Problem Validation
        </h1>
        <p className="mt-1 text-white/50">
          4-point scorecard for problem {problemId}
        </p>
      </div>

      {problemId === "new" && !result && (
        <button
          onClick={runValidation}
          disabled={loading}
          className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
        >
          {loading ? "Validating..." : "Run Validation"}
        </button>
      )}

      {loading && (
        <div className="text-white/40">Running validation...</div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      {result && (
        <>
          <div className="flex items-center gap-4">
            <span className="text-lg text-white/60">Overall Score:</span>
            <span className="text-3xl font-bold text-white">
              {result.overall_score.toFixed(1)}
            </span>
          </div>

          <ValidationScorecard
            real={{
              is_valid: result.is_real,
              score: result.real_score,
              reasoning: result.real_reasoning,
            }}
            payable={{
              is_valid: result.is_payable,
              score: result.payable_score,
              reasoning: result.payable_reasoning,
            }}
            deliverable={{
              is_valid: result.is_deliverable,
              score: result.deliverable_score,
              reasoning: result.deliverable_reasoning,
            }}
            ethical={{
              is_valid: result.is_ethical,
              score: result.ethical_score,
              reasoning: result.ethical_reasoning,
            }}
          />
        </>
      )}
    </div>
  );
}
