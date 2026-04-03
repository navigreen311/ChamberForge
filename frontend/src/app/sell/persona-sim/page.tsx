"use client";

import { useState, useRef, useEffect } from "react";
import api from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  text: string;
}

interface SessionScore {
  overall: number;
  relevance?: number;
  objection_handling?: number;
  value_clarity?: number;
  trust_building?: number;
}

const personas = [
  { id: "jet_set_principal", name: "The Jet-Set Principal", desc: "UHNW individual, $100M+ net worth, privacy-focused, time-conscious", avatar: "JP" },
  { id: "family_office_cio", name: "The Family Office CIO", desc: "Investment-oriented, data-driven, risk-averse, values transparency", avatar: "FC" },
  { id: "estate_manager", name: "The Estate Manager", desc: "Operational buyer, budget-conscious, detail-oriented, vendor-fatigued", avatar: "EM" },
  { id: "spouse_influencer", name: "The Spouse Influencer", desc: "Quality-focused, relationship-driven, lifestyle priorities, social proof matters", avatar: "SI" },
];

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function PersonaSimPage() {
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState<SessionScore | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function startSession(personaId: string) {
    setSelectedPersona(personaId);
    setStarting(true);
    setError(null);
    setMessages([]);
    setScore(null);
    try {
      const res = await api.post("/api/v1/voiceforge/persona-sim/start", {
        persona_type: personaId,
      });
      const data = res.data;
      setSessionId(data.session_id ?? data.id);
      if (data.initial_message) {
        setMessages([{ role: "assistant", text: data.initial_message }]);
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to start session");
    } finally {
      setStarting(false);
    }
  }

  async function handleSend() {
    if (!input.trim() || !sessionId) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setSending(true);
    setError(null);
    try {
      const res = await api.post(`/api/v1/voiceforge/persona-sim/${sessionId}/message`, {
        message: userMsg,
      });
      const data = res.data;
      const reply = data.response ?? data.message ?? data.text ?? "";
      if (reply) {
        setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
      }
      if (data.score) setScore(data.score);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  async function handleEndSession() {
    if (!sessionId) return;
    setEnding(true);
    setError(null);
    try {
      const res = await api.post(`/api/v1/voiceforge/persona-sim/${sessionId}/end`);
      const data = res.data;
      if (data.score) setScore(data.score);
      if (data.feedback) {
        setMessages((prev) => [...prev, { role: "assistant", text: `[Session Ended] ${data.feedback}` }]);
      }
      setSessionId(null);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to end session");
    } finally {
      setEnding(false);
    }
  }

  const activePersona = personas.find((p) => p.id === selectedPersona);

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/sell" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Sell</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Persona Simulator</h1>
      <p className="text-chamber-400 mb-8">Practice your pitch against AI-simulated buyer personas</p>

      {error && (
        <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-4 mb-6 text-red-400 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Persona Selection */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-chamber-400 uppercase tracking-wider">Select Persona</h3>
          {personas.map((p) => (
            <button
              key={p.id}
              onClick={() => startSession(p.id)}
              disabled={starting}
              className={`w-full text-left p-4 rounded-xl border transition ${selectedPersona === p.id ? "border-gold-400 bg-gold-400/5" : "border-chamber-800 bg-chamber-900 hover:border-chamber-600"} disabled:opacity-50`}
            >
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
              <span className="text-4xl font-bold text-gold-400">{score?.overall ?? "--"}</span>
              <span className="text-chamber-500 text-sm">/100</span>
            </div>
            {score && (
              <div className="mt-3 space-y-2">
                {[
                  ["Relevance", score.relevance],
                  ["Objection Handling", score.objection_handling],
                  ["Value Clarity", score.value_clarity],
                  ["Trust Building", score.trust_building],
                ].filter(([, v]) => v != null).map(([label, val]) => (
                  <div key={String(label)}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-chamber-400">{String(label)}</span>
                      <span className="text-chamber-300">{val}</span>
                    </div>
                    <div className="w-full h-1.5 bg-chamber-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gold-400 rounded-full" style={{ width: `${val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {sessionId && (
            <button
              onClick={handleEndSession}
              disabled={ending}
              className="w-full px-4 py-2.5 border border-red-400/50 text-red-400 rounded-lg hover:bg-red-400/10 transition text-sm disabled:opacity-50"
            >
              {ending ? "Ending..." : "End Session & Get Score"}
            </button>
          )}
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2 bg-chamber-900 rounded-xl border border-chamber-800 flex flex-col h-[600px]">
          <div className="p-4 border-b border-chamber-800">
            <h3 className="text-white font-semibold">
              {sessionId
                ? `Conversation with ${activePersona?.name ?? "Persona"}`
                : "Select a persona to begin"}
            </h3>
            <p className="text-xs text-chamber-500">Practice your pitch — the persona will respond as a real prospect would</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !sessionId && (
              <div className="flex items-center justify-center h-full text-chamber-500">
                <p>Select a persona to start a practice session</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                  m.role === "user" ? "bg-gold-400/20 text-white" : "bg-chamber-800 text-chamber-300"
                }`}>{m.text}</div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-chamber-800 p-3 rounded-xl">
                  <span className="w-4 h-4 border-2 border-chamber-400 border-t-transparent rounded-full animate-spin inline-block" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="p-4 border-t border-chamber-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !sending && handleSend()}
                placeholder={sessionId ? "Type your pitch..." : "Start a session first..."}
                disabled={!sessionId || sending}
                className="flex-1 bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white placeholder-chamber-500 focus:outline-none focus:border-gold-400 disabled:opacity-50"
              />
              <button onClick={handleSend} disabled={!sessionId || sending || !input.trim()} className="px-5 py-2.5 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition disabled:opacity-50">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
