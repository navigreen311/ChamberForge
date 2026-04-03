"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Claim {
  claim_text: string;
  confidence: number;
  category: string;
}

interface Evidence {
  id: string;
  source_url: string;
  source_type: string;
  publication_date: string;
  credibility_score: number;
  recency_decay_score: number;
  extracted_claims: Claim[];
  contradiction_flags: Array<{
    claim_a: string;
    claim_b: string;
    explanation: string;
  }>;
  problem_id: string | null;
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function EvidenceDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [evidence, setEvidence] = useState<Evidence | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE}/api/v1/evidence/${id}`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Not found");
      })
      .then(setEvidence)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  function credibilityColor(score: number) {
    if (score < 4) return "bg-red-500";
    if (score <= 7) return "bg-yellow-500";
    return "bg-green-500";
  }

  function credibilityLabel(score: number) {
    if (score < 4) return "Low";
    if (score <= 7) return "Medium";
    return "High";
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-gray-500">Loading...</div>
    );
  }

  if (!evidence) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-red-500">
        Evidence not found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Evidence Detail</h1>
          <p className="text-sm text-gray-500 mt-1">{evidence.id}</p>
        </div>
        <a
          href="/discover/evidence"
          className="text-sm text-blue-600 hover:underline"
        >
          Back to list
        </a>
      </div>

      {/* Source Info */}
      <div className="bg-white border rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Source Information
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">URL:</span>
            <a
              href={evidence.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-600 hover:underline break-all"
            >
              {evidence.source_url}
            </a>
          </div>
          <div>
            <span className="text-gray-500">Type:</span>
            <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs font-medium">
              {evidence.source_type.replace(/_/g, " ")}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Published:</span>
            <span className="ml-2">{evidence.publication_date}</span>
          </div>
          <div>
            <span className="text-gray-500">Recency Decay Score:</span>
            <span className="ml-2 font-mono">
              {evidence.recency_decay_score.toFixed(3)}
            </span>
          </div>
        </div>
      </div>

      {/* Credibility Bar */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Credibility Score
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${credibilityColor(evidence.credibility_score)}`}
              style={{
                width: `${(evidence.credibility_score / 10) * 100}%`,
              }}
            />
          </div>
          <span className="text-lg font-bold text-gray-800 min-w-[60px]">
            {evidence.credibility_score.toFixed(1)} / 10
          </span>
          <span
            className={`text-xs font-medium px-2 py-1 rounded ${
              evidence.credibility_score < 4
                ? "bg-red-100 text-red-700"
                : evidence.credibility_score <= 7
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
            }`}
          >
            {credibilityLabel(evidence.credibility_score)}
          </span>
        </div>
      </div>

      {/* Claims List */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Extracted Claims ({evidence.extracted_claims?.length ?? 0})
        </h2>
        {evidence.extracted_claims?.length > 0 ? (
          <ul className="space-y-3">
            {evidence.extracted_claims.map((claim, i) => (
              <li key={i} className="border rounded p-3 bg-gray-50">
                <p className="text-sm text-gray-800">{claim.claim_text}</p>
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span>
                    Confidence:{" "}
                    <strong>{(claim.confidence * 100).toFixed(0)}%</strong>
                  </span>
                  <span>
                    Category:{" "}
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                      {claim.category}
                    </span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No claims extracted yet.</p>
        )}
      </div>

      {/* Contradiction Flags */}
      {evidence.contradiction_flags?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-3">
            Contradiction Flags ({evidence.contradiction_flags.length})
          </h2>
          <ul className="space-y-3">
            {evidence.contradiction_flags.map((flag, i) => (
              <li key={i} className="bg-white border border-red-200 rounded p-4">
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">
                      Claim A
                    </span>
                    <p className="text-sm">{flag.claim_a}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">
                      Claim B
                    </span>
                    <p className="text-sm">{flag.claim_b}</p>
                  </div>
                </div>
                <p className="text-xs text-red-600 mt-2">{flag.explanation}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Linked Problem */}
      {evidence.problem_id && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Linked Problem
          </h2>
          <p className="text-sm text-gray-600 font-mono">
            {evidence.problem_id}
          </p>
        </div>
      )}
    </div>
  );
}
