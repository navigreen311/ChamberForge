"use client";

import { useState, useEffect } from "react";

const personas = [
  { id: "p1", name: "The Jet-Set Principal", desc: "UHNW individual, $100M+ net worth, privacy-focused, time-conscious", avatar: "JP" },
  { id: "p2", name: "The Family Office CIO", desc: "Investment-oriented, data-driven, risk-averse, values transparency", avatar: "FC" },
  { id: "p3", name: "The Estate Manager", desc: "Operational buyer, budget-conscious, detail-oriented, vendor-fatigued", avatar: "EM" },
  { id: "p4", name: "The Spouse Influencer", desc: "Quality-focused, relationship-driven, lifestyle priorities, social proof matters", avatar: "SI" },
];

const sampleChat = [
  { role: "user" as const, text: "Hi, I'd like to tell you about our private aviation concierge service." },
  { role: "assistant" as const, text: "I appreciate you reaching out. My time is extremely limited, so I'll give you two minutes. What specifically differentiates your service from NetJets or Wheels Up? I've been disappointed by promises of 'white-glove' service before." },
  { role: "user" as const, text: "Unlike card programs, we provide a dedicated coordinator who knows your preferences and can confirm flights in under 2 hours, not days." },
  { role: "assistant" as const, text: "Under 2 hours is interesting — my current broker takes 2-3 days for anything outside the US. But I need to know: what happens at 2 AM when I need to evacuate my family from a property? Do you have true 24/7 coverage, or is that marketing speak?" },
];

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function PersonaSimPage() {
  const [loading, setLoading] = useState(true);
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [messages, setMessages] = useState(sampleChat);
  const [input, setInput] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: input }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", text: "That's a fair point. I'd want to see your response time data — not testimonials, real metrics. If you can show me sub-2-hour confirmations on 90%+ of bookings, I'd consider a trial month. But I'm not signing an annual contract upfront." }]);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="grid grid-cols-3 gap-6"><Skeleton className="h-96" /><div className="col-span-2"><Skeleton className="h-96" /></div></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/sell" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Sell</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Persona Simulator</h1>
      <p className="text-chamber-400 mb-8">Practice your pitch against AI-simulated buyer personas</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Persona Selection */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-chamber-400 uppercase tracking-wider">Select Persona</h3>
          {personas.map((p) => (
            <button key={p.id} onClick={() => setSelectedPersona(p.id)} className={`w-full text-left p-4 rounded-xl border transition ${selectedPersona === p.id ? "border-gold-400 bg-gold-400/5" : "border-chamber-800 bg-chamber-900 hover:border-chamber-600"}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gold-400/20 text-gold-400 flex items-center justify-center font-bold text-sm">{p.avatar}</div>
                <span className="text-white font-semibold">{p.name}</span>
              </div>
              <p className="text-xs text-chamber-400">{p.desc}</p>
            </button>
          ))}

          {/* Score Display */}
          <div className="bg-chamber-900 rounded-xl p-5 border border-chamber-800">
            <h3 className="text-sm font-semibold text-chamber-400 uppercase tracking-wider mb-3">Pitch Score</h3>
            <div className="text-center">
              <span className="text-4xl font-bold text-gold-400">74</span>
              <span className="text-chamber-500 text-sm">/100</span>
            </div>
            <div className="mt-3 space-y-2">
              {[
                ["Relevance", 82],
                ["Objection Handling", 68],
                ["Value Clarity", 78],
                ["Trust Building", 65],
              ].map(([label, score]) => (
                <div key={String(label)}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-chamber-400">{String(label)}</span>
                    <span className="text-chamber-300">{score}</span>
                  </div>
                  <div className="w-full h-1.5 bg-chamber-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gold-400 rounded-full" style={{ width: `${score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2 bg-chamber-900 rounded-xl border border-chamber-800 flex flex-col h-[600px]">
          <div className="p-4 border-b border-chamber-800">
            <h3 className="text-white font-semibold">Conversation with {personas.find(p => p.id === selectedPersona)?.name || "The Jet-Set Principal"}</h3>
            <p className="text-xs text-chamber-500">Practice your pitch — the persona will respond as a real prospect would</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                  m.role === "user" ? "bg-gold-400/20 text-white" : "bg-chamber-800 text-chamber-300"
                }`}>{m.text}</div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-chamber-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your pitch..."
                className="flex-1 bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white placeholder-chamber-500 focus:outline-none focus:border-gold-400"
              />
              <button onClick={handleSend} className="px-5 py-2.5 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
