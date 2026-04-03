"use client";

import { useState, useRef, useEffect } from "react";

interface ChatMessage {
  role: "user" | "persona";
  content: string;
}

interface ScoreResult {
  overall_score: number;
  dimensions: Record<string, number>;
  feedback: string;
  coaching_tips: string[];
}

export default function PersonaSimPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [personaName, setPersonaName] = useState("Victoria Chen");
  const [personaRole, setPersonaRole] = useState("CFO at Fortune 500 tech company");
  const [traits, setTraits] = useState("skeptical, data-driven, time-conscious");
  const [scenario, setScenario] = useState(
    "Discovery call to pitch a $200K annual advisory engagement"
  );
  const [difficulty, setDifficulty] = useState("medium");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<ScoreResult | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startSession = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/sell/persona/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona_name: personaName,
          persona_role: personaRole,
          persona_traits: traits.split(",").map((t) => t.trim()),
          scenario,
          difficulty,
        }),
      });
      const data = await res.json();
      setSessionId(data.session_id);
      setMessages([]);
      setScore(null);
    } catch (err) {
      console.error("Failed to start session:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!sessionId || !input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/v1/sell/persona/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: userMsg }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "persona", content: data.persona_response },
      ]);
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleScore = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/sell/persona/score/${sessionId}`, {
        method: "POST",
      });
      const data = await res.json();
      setScore(data);
    } catch (err) {
      console.error("Failed to score:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-white">Persona Simulator</h1>
        <p className="mt-2 text-zinc-400">
          Practice sales conversations with AI buyer personas
        </p>

        {!sessionId ? (
          /* Setup */
          <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="text-lg font-semibold text-white">
              Configure Persona
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-300">
                  Persona Name
                </label>
                <input
                  type="text"
                  value={personaName}
                  onChange={(e) => setPersonaName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300">
                  Role
                </label>
                <input
                  type="text"
                  value={personaRole}
                  onChange={(e) => setPersonaRole(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300">
                  Traits (comma-separated)
                </label>
                <input
                  type="text"
                  value={traits}
                  onChange={(e) => setTraits(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-zinc-300">
                Scenario
              </label>
              <textarea
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <button
              onClick={startSession}
              disabled={loading}
              className="mt-6 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {loading ? "Starting..." : "Start Roleplay"}
            </button>
          </div>
        ) : (
          /* Chat Interface */
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <span className="text-sm text-zinc-400">Talking to: </span>
                <span className="font-medium text-white">{personaName}</span>
                <span className="ml-2 text-sm text-zinc-500">
                  ({personaRole})
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleScore}
                  disabled={loading || messages.length === 0}
                  className="rounded-lg border border-violet-500/50 px-4 py-1.5 text-sm text-violet-400 hover:bg-violet-500/10 disabled:opacity-50"
                >
                  Score Performance
                </button>
                <button
                  onClick={() => {
                    setSessionId(null);
                    setMessages([]);
                    setScore(null);
                  }}
                  className="rounded-lg border border-zinc-700 px-4 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800"
                >
                  End Session
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="h-[400px] overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
              {messages.length === 0 && (
                <p className="text-center text-zinc-500">
                  Start the conversation. You are the salesperson.
                </p>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`mb-4 flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] rounded-xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-emerald-600/20 text-emerald-100"
                        : "bg-zinc-800 text-zinc-200"
                    }`}
                  >
                    <p className="mb-1 text-xs font-medium text-zinc-400">
                      {msg.role === "user" ? "You" : personaName}
                    </p>
                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="mt-4 flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                placeholder="Type your message..."
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="rounded-lg bg-emerald-600 px-6 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {loading ? "..." : "Send"}
              </button>
            </div>

            {/* Score Display */}
            {score && (
              <div className="mt-6 rounded-xl border border-violet-500/30 bg-violet-500/5 p-6">
                <h3 className="text-lg font-semibold text-violet-400">
                  Performance Score: {score.overall_score}/10
                </h3>
                <div className="mt-4 grid grid-cols-5 gap-3">
                  {Object.entries(score.dimensions).map(([key, val]) => (
                    <div key={key} className="text-center">
                      <div className="text-2xl font-bold text-white">{val}</div>
                      <div className="text-xs capitalize text-zinc-400">
                        {key.replace(/_/g, " ")}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-zinc-300">{score.feedback}</p>
                {score.coaching_tips.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-zinc-400">
                      Coaching Tips:
                    </p>
                    <ul className="mt-1 list-inside list-disc text-sm text-zinc-300">
                      {score.coaching_tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
