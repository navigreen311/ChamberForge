"use client";

import { useState, useRef, useEffect, FormEvent } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Persona = {
  name: string;
  role: string;
  background: string;
  personality_traits: string[];
};

type Message = {
  role: "user" | "persona";
  content: string;
  coaching_tip?: string;
};

type SessionResult = {
  performance_score: number;
  strengths: string[];
  improvements: string[];
};

const PERSONA_OPTIONS = [
  { value: "founder", label: "Tech Founder" },
  { value: "cfo", label: "CFO" },
  { value: "inheritor", label: "Wealth Inheritor" },
  { value: "family_office_principal", label: "Family Office Principal" },
];

export default function VoiceRoleplay() {
  const [personaType, setPersonaType] = useState("founder");
  const [scenario, setScenario] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SessionResult | null>(null);
  const [coachingTips, setCoachingTips] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function startSession() {
    if (!scenario.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/voiceforge/persona-sim/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona_type: personaType, scenario }),
      });
      const data = await res.json();
      setSessionId(data.session_id);
      setPersona(data.persona);
      setMessages([{ role: "persona", content: data.opening_message }]);
      setResult(null);
      setCoachingTips([]);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || !sessionId) return;
    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch(
        `${API}/api/v1/voiceforge/persona-sim/${sessionId}/message`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_message: userMsg }),
        }
      );
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "persona", content: data.response, coaching_tip: data.coaching_tip },
      ]);
      if (data.coaching_tip) {
        setCoachingTips((prev) => [...prev, data.coaching_tip]);
      }
    } finally {
      setLoading(false);
    }
  }

  async function endSession() {
    if (!sessionId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API}/api/v1/voiceforge/persona-sim/${sessionId}/end`,
        { method: "POST" }
      );
      const data = await res.json();
      setResult(data);
      setSessionId(null);
    } finally {
      setLoading(false);
    }
  }

  // ---- Pre-session setup ----
  if (!sessionId && !result) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <h2 className="text-2xl font-bold">Voice Roleplay Simulator</h2>
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-300">Persona Type</span>
            <select
              value={personaType}
              onChange={(e) => setPersonaType(e.target.value)}
              className="mt-1 block w-full rounded bg-chamber-800 border border-chamber-700 px-3 py-2 text-white"
            >
              {PERSONA_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-300">Scenario</span>
            <textarea
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="Describe the roleplay scenario..."
              rows={3}
              className="mt-1 block w-full rounded bg-chamber-800 border border-chamber-700 px-3 py-2 text-white placeholder-gray-500"
            />
          </label>
          <button
            onClick={startSession}
            disabled={loading || !scenario.trim()}
            className="w-full rounded bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? "Starting..." : "Start Session"}
          </button>
        </div>
      </div>
    );
  }

  // ---- Score display ----
  if (result) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <h2 className="text-2xl font-bold">Session Results</h2>
        <div className="text-center">
          <div className="text-6xl font-bold text-indigo-400">{result.performance_score}</div>
          <div className="text-gray-400 mt-1">Performance Score</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-chamber-800 rounded-lg p-4">
            <h3 className="font-semibold text-green-400 mb-2">Strengths</h3>
            <ul className="list-disc list-inside text-sm space-y-1 text-gray-300">
              {result.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="bg-chamber-800 rounded-lg p-4">
            <h3 className="font-semibold text-amber-400 mb-2">Areas to Improve</h3>
            <ul className="list-disc list-inside text-sm space-y-1 text-gray-300">
              {result.improvements.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
        <button
          onClick={() => {
            setResult(null);
            setMessages([]);
            setCoachingTips([]);
          }}
          className="w-full rounded bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500"
        >
          Start New Session
        </button>
      </div>
    );
  }

  // ---- Active chat ----
  return (
    <div className="flex max-w-5xl mx-auto h-[80vh]">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col p-4">
        {/* Persona header */}
        {persona && (
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-chamber-700">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-lg">
              {persona.name[0]}
            </div>
            <div>
              <div className="font-semibold">{persona.name}</div>
              <div className="text-xs text-gray-400">{persona.role}</div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-lg px-4 py-2 text-sm ${
                  m.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-chamber-800 text-gray-200"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="mt-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your response..."
            className="flex-1 rounded bg-chamber-800 border border-chamber-700 px-3 py-2 text-white placeholder-gray-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            Send
          </button>
          <button
            type="button"
            onClick={endSession}
            className="rounded bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500"
          >
            End Session
          </button>
        </form>
      </div>

      {/* Coaching tips sidebar */}
      <div className="w-72 border-l border-chamber-700 p-4 overflow-y-auto">
        <h3 className="font-semibold text-amber-400 mb-3">Coaching Tips</h3>
        {coachingTips.length === 0 ? (
          <p className="text-sm text-gray-500">Tips will appear here as you converse.</p>
        ) : (
          <ul className="space-y-3">
            {coachingTips.map((tip, i) => (
              <li
                key={i}
                className="text-sm bg-chamber-800 rounded p-3 text-gray-300 border-l-2 border-amber-500"
              >
                {tip}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
