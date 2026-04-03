"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface Module {
  title: string;
  description: string;
  duration_hours: number;
  assessment_type: string;
}

interface Curriculum {
  modules: Module[];
  certification_requirements: string;
  total_hours: number;
}

const ROLES = ["relationship_manager", "analyst", "operations"];

export default function TrainerPage() {
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .get(`/api/v1/lifecycle/trainer/curriculum/${selectedRole}`)
      .then((res) => {
        setCurriculum(res.data);
        setCompleted(new Set());
      })
      .catch((err) => {
        setCurriculum(null);
        setError(err?.response?.data?.detail || err?.message || "Failed to load curriculum");
      })
      .finally(() => setLoading(false));
  }, [selectedRole]);

  const toggleModule = (title: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const totalModules = curriculum?.modules.length ?? 1;
  const completionPct = (completed.size / totalModules) * 100;

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gold-400 mb-2">Team Training</h1>
      <p className="text-chamber-400 mb-6">Curriculum modules and certification progress</p>

      {/* Role selector */}
      <div className="flex gap-2 mb-8">
        {ROLES.map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
              selectedRole === role
                ? "bg-gold-500 text-chamber-950 font-semibold"
                : "bg-chamber-800 text-chamber-400 hover:text-white"
            }`}
          >
            {role.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-chamber-400 animate-pulse">Loading curriculum...</p>
      ) : error ? (
        <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-6 text-red-400">{error}</div>
      ) : curriculum ? (
        <>
          {/* Overall progress */}
          <div className="bg-chamber-900 border border-chamber-700 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-semibold">Overall Progress</span>
              <span className="text-gold-400 font-bold">{completionPct.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-chamber-800 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gold-500 rounded-full transition-all duration-300"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <p className="text-chamber-500 text-sm mt-2">
              {completed.size} of {totalModules} modules completed &middot; {curriculum.total_hours} total hours
            </p>
          </div>

          {/* Module list */}
          <div className="space-y-3">
            {curriculum.modules.map((mod) => {
              const done = completed.has(mod.title);
              return (
                <div
                  key={mod.title}
                  onClick={() => toggleModule(mod.title)}
                  className={`cursor-pointer rounded-xl border p-5 transition-colors ${
                    done
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-chamber-700 bg-chamber-900 hover:border-chamber-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs ${
                          done ? "border-green-400 bg-green-400 text-chamber-950" : "border-chamber-600"
                        }`}
                      >
                        {done && "\u2713"}
                      </div>
                      <h3 className={`font-semibold ${done ? "text-green-400" : "text-white"}`}>
                        {mod.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-chamber-400">
                      <span>{mod.duration_hours}h</span>
                      <span className="capitalize">{mod.assessment_type.replace("_", " ")}</span>
                    </div>
                  </div>
                  <p className="text-chamber-400 text-sm mt-2 ml-8">{mod.description}</p>
                </div>
              );
            })}
          </div>

          {/* Certification info */}
          <div className="mt-6 p-4 rounded-lg bg-chamber-800 border border-chamber-700">
            <p className="text-chamber-300 text-sm">
              <span className="text-gold-400 font-semibold">Certification: </span>
              {curriculum.certification_requirements}
            </p>
          </div>
        </>
      ) : (
        <p className="text-red-400">Failed to load curriculum.</p>
      )}
    </main>
  );
}
