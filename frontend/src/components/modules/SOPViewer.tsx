"use client";

import { useState } from "react";

interface SOP {
  title: string;
  steps: string[];
  owner: string;
  frequency: string;
}

interface SOPViewerProps {
  sops: SOP[];
}

export default function SOPViewer({ sops }: SOPViewerProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});

  function toggleAccordion(index: number) {
    setOpenIndex(openIndex === index ? null : index);
  }

  function toggleStep(sopIndex: number, stepIndex: number) {
    const key = `${sopIndex}-${stepIndex}`;
    setCheckedSteps((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function getProgress(sopIndex: number, totalSteps: number): number {
    let checked = 0;
    for (let i = 0; i < totalSteps; i++) {
      if (checkedSteps[`${sopIndex}-${i}`]) checked++;
    }
    return totalSteps > 0 ? Math.round((checked / totalSteps) * 100) : 0;
  }

  return (
    <div className="space-y-3">
      {sops.map((sop, sopIdx) => {
        const isOpen = openIndex === sopIdx;
        const progress = getProgress(sopIdx, sop.steps.length);

        return (
          <div
            key={sopIdx}
            className="bg-chamber-900 border border-chamber-700 rounded-lg overflow-hidden"
          >
            {/* Header */}
            <button
              onClick={() => toggleAccordion(sopIdx)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-chamber-800 transition-colors"
            >
              <div className="flex-1">
                <h3 className="text-white font-semibold">{sop.title}</h3>
                <div className="text-chamber-400 text-sm mt-1">
                  Owner: {sop.owner} &middot; Frequency: {sop.frequency} &middot;{" "}
                  {sop.steps.length} steps
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Progress bar */}
                <div className="w-20 bg-chamber-700 rounded-full h-2">
                  <div
                    className="bg-gold-500 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-chamber-400 text-sm w-10 text-right">
                  {progress}%
                </span>
                <span className="text-chamber-400 text-lg">
                  {isOpen ? "−" : "+"}
                </span>
              </div>
            </button>

            {/* Steps */}
            {isOpen && (
              <div className="border-t border-chamber-700 p-4">
                <ul className="space-y-2">
                  {sop.steps.map((step, stepIdx) => {
                    const key = `${sopIdx}-${stepIdx}`;
                    const isChecked = !!checkedSteps[key];

                    return (
                      <li key={stepIdx} className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleStep(sopIdx, stepIdx)}
                          className="mt-1 h-4 w-4 rounded border-chamber-500 bg-chamber-800 accent-gold-500"
                        />
                        <span
                          className={`text-sm ${
                            isChecked
                              ? "text-chamber-500 line-through"
                              : "text-chamber-300"
                          }`}
                        >
                          {step}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
