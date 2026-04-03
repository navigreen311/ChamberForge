"use client";

import { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface MarginResult {
  monthly_revenue: number;
  monthly_costs: number;
  gross_margin_pct: number;
  net_margin_pct: number;
  annual_revenue: number;
  annual_profit: number;
  breakeven_months: number;
}

export default function PricingCalculator() {
  const [monthlyPrice, setMonthlyPrice] = useState(20000);
  const [setupFee, setSetupFee] = useState(5000);
  const [staffCost, setStaffCost] = useState(10000);
  const [toolsCost, setToolsCost] = useState(3000);
  const [overheadCost, setOverheadCost] = useState(2000);
  const [result, setResult] = useState<MarginResult | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetch(`${API}/api/v1/offers/simulate-margins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthly_price: monthlyPrice,
          setup_fee: setupFee,
          costs: { staff: staffCost, tools: toolsCost, overhead: overheadCost },
        }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then(setResult)
        .catch(() => setResult(null));
    }, 300);
    return () => clearTimeout(timeout);
  }, [monthlyPrice, setupFee, staffCost, toolsCost, overheadCost]);

  const SliderInput = ({
    label,
    value,
    onChange,
    min,
    max,
    step,
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    min: number;
    max: number;
    step: number;
  }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-chamber-400">{label}</span>
        <span className="text-white font-medium">${value.toLocaleString()}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-gold-500"
      />
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-8">
      {/* Inputs */}
      <div className="space-y-5">
        <SliderInput
          label="Monthly Price"
          value={monthlyPrice}
          onChange={setMonthlyPrice}
          min={5000}
          max={100000}
          step={1000}
        />
        <SliderInput
          label="Setup Fee"
          value={setupFee}
          onChange={setSetupFee}
          min={0}
          max={50000}
          step={500}
        />
        <SliderInput
          label="Staff Cost"
          value={staffCost}
          onChange={setStaffCost}
          min={0}
          max={50000}
          step={500}
        />
        <SliderInput
          label="Tools & Software"
          value={toolsCost}
          onChange={setToolsCost}
          min={0}
          max={20000}
          step={250}
        />
        <SliderInput
          label="Overhead"
          value={overheadCost}
          onChange={setOverheadCost}
          min={0}
          max={20000}
          step={250}
        />
      </div>

      {/* Results */}
      <div className="space-y-4">
        {result ? (
          <>
            <div className="bg-chamber-800 rounded-lg p-4">
              <p className="text-sm text-chamber-400">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gold-400">
                ${result.monthly_revenue.toLocaleString()}
              </p>
            </div>
            <div className="bg-chamber-800 rounded-lg p-4">
              <p className="text-sm text-chamber-400">Monthly Costs</p>
              <p className="text-2xl font-bold text-white">
                ${result.monthly_costs.toLocaleString()}
              </p>
            </div>
            <div className="bg-chamber-800 rounded-lg p-4">
              <p className="text-sm text-chamber-400">Gross Margin</p>
              <p
                className={`text-2xl font-bold ${
                  result.gross_margin_pct >= 50 ? "text-green-400" : result.gross_margin_pct >= 30 ? "text-yellow-400" : "text-red-400"
                }`}
              >
                {result.gross_margin_pct.toFixed(1)}%
              </p>
            </div>
            <div className="bg-chamber-800 rounded-lg p-4">
              <p className="text-sm text-chamber-400">Annual Profit</p>
              <p className="text-2xl font-bold text-gold-400">
                ${result.annual_profit.toLocaleString()}
              </p>
            </div>
            <div className="bg-chamber-800 rounded-lg p-4">
              <p className="text-sm text-chamber-400">Breakeven</p>
              <p className="text-2xl font-bold text-white">
                {result.breakeven_months.toFixed(1)} months
              </p>
            </div>
          </>
        ) : (
          <p className="text-chamber-400">Calculating...</p>
        )}
      </div>
    </div>
  );
}
