"use client";

import { useState, useRef, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type AudioBrief = {
  audio_url: string;
  duration_seconds: number;
};

export default function AudioBriefPlayer() {
  const [briefText, setBriefText] = useState("");
  const [voiceStyle, setVoiceStyle] = useState("professional");
  const [brief, setBrief] = useState<AudioBrief | null>(null);
  const [loading, setLoading] = useState(false);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  async function convertToAudio() {
    if (!briefText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/voiceforge/intel-brief/audio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief_text: briefText, voice_style: voiceStyle }),
      });
      const data: AudioBrief = await res.json();
      setBrief(data);
      setCurrentTime(0);
      setIsPlaying(false);
    } finally {
      setLoading(false);
    }
  }

  function togglePlay() {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }

  function handleTimeUpdate() {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 2];
  const duration = brief?.duration_seconds ?? 0;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Audio Brief Player</h2>

      {/* Input area */}
      <div className="space-y-3">
        <label className="block">
          <span className="text-sm font-medium text-gray-300">Brief Text</span>
          <textarea
            value={briefText}
            onChange={(e) => setBriefText(e.target.value)}
            placeholder="Paste your intelligence brief text here..."
            rows={6}
            className="mt-1 block w-full rounded bg-chamber-800 border border-chamber-700 px-3 py-2 text-white placeholder-gray-500 text-sm"
          />
        </label>

        <div className="flex gap-3 items-end">
          <label className="block flex-1">
            <span className="text-sm font-medium text-gray-300">Voice Style</span>
            <select
              value={voiceStyle}
              onChange={(e) => setVoiceStyle(e.target.value)}
              className="mt-1 block w-full rounded bg-chamber-800 border border-chamber-700 px-3 py-2 text-white"
            >
              <option value="professional">Professional</option>
              <option value="conversational">Conversational</option>
              <option value="executive">Executive</option>
            </select>
          </label>
          <button
            onClick={convertToAudio}
            disabled={loading || !briefText.trim()}
            className="rounded bg-indigo-600 px-6 py-2 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? "Converting..." : "Generate Audio"}
          </button>
        </div>
      </div>

      {/* Audio player */}
      {brief && (
        <div className="bg-chamber-800 rounded-lg p-5 space-y-4">
          <audio
            ref={audioRef}
            src={brief.audio_url}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
          />

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center hover:bg-indigo-500 transition"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <rect x="5" y="4" width="3" height="12" rx="1" />
                  <rect x="12" y="4" width="3" height="12" rx="1" />
                </svg>
              ) : (
                <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <polygon points="6,4 16,10 6,16" />
                </svg>
              )}
            </button>

            {/* Progress bar */}
            <div className="flex-1 space-y-1">
              <input
                type="range"
                min={0}
                max={duration}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {/* Speed control */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Speed:</span>
            {SPEED_OPTIONS.map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackRate(speed)}
                className={`text-xs px-2 py-1 rounded ${
                  playbackRate === speed
                    ? "bg-indigo-600 text-white"
                    : "bg-chamber-700 text-gray-300 hover:bg-chamber-600"
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Brief text display */}
      {brief && briefText && (
        <div className="bg-chamber-800/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Brief Transcript</h3>
          <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
            {briefText}
          </p>
        </div>
      )}
    </div>
  );
}
