"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface OntologyField {
  description: string;
  allowed_values: string[];
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  auto_corrections: Record<string, string>;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function OntologyPage() {
  const [schema, setSchema] = useState<Record<string, OntologyField>>({});
  const [stats, setStats] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(true);
  const [validateText, setValidateText] = useState("");
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [schemaRes, statsRes] = await Promise.all([
          api.get("/api/v1/ontology/schema"),
          api.get("/api/v1/ontology/stats"),
        ]);
        setSchema(schemaRes.data);
        setStats(statsRes.data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSuggest = async () => {
    if (!validateText.trim()) return;
    try {
      const res = await api.post("/api/v1/ontology/suggest", { text: validateText });
      // Show suggestions as a validation-like result
      setValidationResult({
        valid: true,
        errors: [],
        warnings: Object.entries(res.data.suggestions ?? {})
          .filter(([, v]) => v !== null)
          .map(([k, v]) => `Suggested ${k}: ${v}`),
        auto_corrections: {},
      });
    } catch {
      // silent
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  const fields = Object.keys(schema);

  return (
    <div className="min-h-screen bg-chamber-950 p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-1">Problem Ontology</h1>
        <p className="text-chamber-400">Explore the canonical classification schema and validate problems</p>
      </div>

      {/* AI Suggest Tool */}
      <div className="bg-chamber-900 rounded-xl border border-chamber-800 p-5 mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">AI Classification Suggest</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Describe a problem in plain text..."
            value={validateText}
            onChange={(e) => setValidateText(e.target.value)}
            className="flex-1 bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white placeholder-chamber-500 focus:outline-none focus:border-gold-400 transition"
          />
          <button
            onClick={handleSuggest}
            className="px-5 py-2.5 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition"
          >
            Suggest
          </button>
        </div>
        {validationResult && (
          <div className="mt-4 space-y-2">
            {validationResult.warnings.map((w, i) => (
              <div key={i} className="text-sm text-gold-400">{w}</div>
            ))}
            {validationResult.errors.map((e, i) => (
              <div key={i} className="text-sm text-red-400">{e}</div>
            ))}
          </div>
        )}
      </div>

      {/* Ontology Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fields.map((field) => {
          const meta = schema[field];
          const fieldStats = stats[field] ?? {};
          const total = Object.values(fieldStats).reduce((a, b) => a + b, 0);

          return (
            <div
              key={field}
              onClick={() => setSelectedField(selectedField === field ? null : field)}
              className={`bg-chamber-900 rounded-xl border cursor-pointer transition p-5 ${selectedField === field ? "border-gold-400" : "border-chamber-800 hover:border-chamber-600"}`}
            >
              <h3 className="text-white font-semibold mb-1 capitalize">{field.replace(/_/g, " ")}</h3>
              <p className="text-xs text-chamber-400 mb-3">{meta.description}</p>
              <div className="flex items-center justify-between text-xs text-chamber-500">
                <span>{meta.allowed_values.length} values</span>
                <span>{total} entries</span>
              </div>
              {selectedField === field && (
                <div className="mt-3 pt-3 border-t border-chamber-800 space-y-1 max-h-48 overflow-y-auto">
                  {meta.allowed_values.map((v) => (
                    <div key={v} className="flex items-center justify-between text-xs">
                      <span className="text-chamber-300">{v}</span>
                      <span className="text-gold-400">{fieldStats[v] ?? 0}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
