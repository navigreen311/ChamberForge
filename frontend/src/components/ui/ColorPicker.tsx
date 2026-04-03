"use client";

import { useState } from "react";

const PRESET_COLORS = [
  "#fbbf24", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6",
  "#6366f1", "#3b82f6", "#0ea5e9", "#14b8a6", "#22c55e",
  "#102a43", "#1e3a5f", "#334155", "#1f2937", "#000000",
  "#ffffff",
];

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(value);

  const handleInputChange = (val: string) => {
    setInputValue(val);
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      onChange(val);
    }
  };

  const handlePresetClick = (color: string) => {
    setInputValue(color);
    onChange(color);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      <div className="flex items-center gap-3">
        {/* Preview swatch */}
        <div
          className="h-10 w-10 rounded-lg border border-chamber-700 shrink-0"
          style={{ backgroundColor: value }}
        />
        {/* Hex input */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="#000000"
          maxLength={7}
          className="flex-1 rounded-lg border border-chamber-700 bg-chamber-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>
      {/* Preset palette */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => handlePresetClick(color)}
            className={`h-6 w-6 rounded border transition-all ${
              value === color
                ? "border-amber-400 ring-2 ring-amber-400/50 scale-110"
                : "border-chamber-600 hover:border-gray-400"
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
}
