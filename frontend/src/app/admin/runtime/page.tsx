"use client";

import RuntimeDashboard from "@/components/modules/RuntimeDashboard";

export default function RuntimePage() {
  return (
    <main className="min-h-screen bg-chamber-950 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-gold-400 mb-2">
          AI Runtime
        </h1>
        <p className="text-chamber-400 mb-8">
          Cost tracking, usage metrics, and agent performance
        </p>
        <RuntimeDashboard />
      </div>
    </main>
  );
}
