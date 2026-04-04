'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, X } from 'lucide-react';

interface AIFeedbackProps {
  outputId: string;
  outputType: string;
}

const REJECTION_REASONS = ['Inaccurate', 'Not relevant', 'Compliance risk', 'Other'] as const;

export default function AIFeedback({ outputId, outputType }: AIFeedbackProps) {
  const [status, setStatus] = useState<'idle' | 'positive' | 'negative'>('idle');
  const [showPopover, setShowPopover] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleThumbsUp = () => {
    setStatus('positive');
    setShowPopover(false);
    setTimeout(() => setStatus('idle'), 2000);
  };

  const handleThumbsDown = () => {
    setStatus('negative');
    setShowPopover(true);
  };

  const handleSubmit = () => {
    setShowPopover(false);
    setSubmitted(true);
    setSelectedReason(null);
    setComment('');
  };

  if (submitted) {
    return <span className="text-xs text-chamber-400">Feedback recorded</span>;
  }

  return (
    <div className="relative inline-flex items-center gap-2">
      <button
        onClick={handleThumbsUp}
        className="p-1 rounded hover:bg-chamber-800 text-chamber-400 hover:text-green-400 transition"
        aria-label="Thumbs up"
      >
        <ThumbsUp className="h-4 w-4" />
      </button>

      {status === 'positive' && (
        <span className="text-xs text-green-400 font-medium">Thanks!</span>
      )}

      <button
        onClick={handleThumbsDown}
        className="p-1 rounded hover:bg-chamber-800 text-chamber-400 hover:text-red-400 transition"
        aria-label="Thumbs down"
      >
        <ThumbsDown className="h-4 w-4" />
      </button>

      {showPopover && (
        <div className="absolute top-8 right-0 z-50 w-72 rounded-lg border border-chamber-800 bg-chamber-900 p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white">What went wrong?</span>
            <button onClick={() => setShowPopover(false)} className="text-chamber-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {REJECTION_REASONS.map((reason) => (
              <button
                key={reason}
                onClick={() => setSelectedReason(reason)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${
                  selectedReason === reason
                    ? 'border-gold-400 bg-gold-400/20 text-gold-400'
                    : 'border-chamber-700 text-chamber-300 hover:border-chamber-500'
                }`}
              >
                {reason}
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Additional comments (optional)"
            rows={2}
            className="w-full rounded-md border border-chamber-700 bg-chamber-950 px-3 py-2 text-sm text-white placeholder:text-chamber-500 focus:border-gold-400 focus:outline-none resize-none mb-3"
          />

          <button
            onClick={handleSubmit}
            disabled={!selectedReason}
            className="w-full rounded-md bg-gold-400 px-3 py-1.5 text-sm font-medium text-chamber-950 hover:bg-gold-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
}
