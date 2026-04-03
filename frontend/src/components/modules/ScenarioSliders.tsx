"use client";

import { useState } from "react";

interface SliderParams {
  basePrice: number;
  baseClients: number;
  margin: number;
  staffingCost: number;
  scaleFactor: number;
  wlDiscount: number;
}

interface ScenarioSlidersProps {
  onRun: (params: SliderParams) => void;
  loading: boolean;
}

/**
 * Input sliders for scenario planner parameters.
 * Calls onRun with current values when the user clicks "Run Scenario".
 */
export default function ScenarioSliders({ onRun, loading }: ScenarioSlidersProps) {
  const [basePrice, setBasePrice] = useState(5000);
  const [baseClients, setBaseClients] = useState(20);
  const [margin, setMargin] = useState(70);
  const [staffingCost, setStaffingCost] = useState(80000);
  const [scaleFactor, setScaleFactor] = useState(1.5);
  const [wlDiscount, setWlDiscount] = useState(15);

  const sliders = [
    { label: "Base Price ($/mo)", value: basePrice, set: setBasePrice, min: 1000, max: 50000, step: 500, fmt: (v: number) => `$${v.toLocaleString()}` },
    { label: "Base Clients", value: baseClients, set: setBaseClients, min: 1, max: 200, step: 1, fmt: (v: number) => `${v}` },
    { label: "Target Margin (%)", value: margin, set: setMargin, min: 20, max: 90, step: 5, fmt: (v: number) => `${v}%` },
    { label: "Staffing Cost ($/yr)", value: staffingCost, set: setStaffingCost, min: 40000, max: 200000, step: 5000, fmt: (v: number) => `$${v.toLocaleString()}` },
    { label: "Scale Factor", value: scaleFactor, set: setScaleFactor, min: 1.0, max: 5.0, step: 0.1, fmt: (v: number) => `${v.toFixed(1)}x` },
    { label: "White-Label Discount (%)", value: wlDiscount, set: setWlDiscount, min: 0, max: 40, step: 5, fmt: (v: number) => `${v}%` },
  ];

  return (
    <div className="bg-chamber-900 border border-chamber-700 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Parameters</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sliders.map((s) => (
          <div key={s.label}>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm text-chamber-400">{s.label}</label>
              <span className="text-sm text-gold-400 font-semibold">{s.fmt(s.value)}</span>
            </div>
            <input
              type="range"
              min={s.min}
              max={s.max}
              step={s.step}
              value={s.value}
              onChange={(e) => s.set(Number(e.target.value))}
              className="w-full accent-gold-500 h-2 bg-chamber-700 rounded-full appearance-none cursor-pointer"
            />
          </div>
        ))}
      </div>
      <button
        onClick={() =>
          onRun({ basePrice, baseClients, margin, staffingCost, scaleFactor, wlDiscount })
        }
        disabled={loading}
        className="mt-6 px-6 py-2.5 bg-gold-500 text-chamber-950 font-semibold rounded-lg hover:bg-gold-400 transition-colors disabled:opacity-50"
      >
        {loading ? "Running..." : "Run Scenario"}
      </button>
    </div>
  );
}
