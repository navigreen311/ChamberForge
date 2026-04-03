"use client";

import { useState } from "react";

interface HouseholdGraphViewerProps {
  members: Record<string, unknown>[];
  properties: Record<string, unknown>[];
  staff: Record<string, unknown>[];
  vendors: Record<string, unknown>[];
  onAddItem?: (category: string, data: Record<string, unknown>) => void;
}

interface AddFormState {
  category: string | null;
  fields: Record<string, string>;
}

const CATEGORY_CONFIG: Record<
  string,
  { label: string; icon: string; color: string; fields: string[] }
> = {
  members: {
    label: "Family Members",
    icon: "👤",
    color: "border-blue-600 bg-blue-900/20",
    fields: ["name", "relationship", "age", "notes"],
  },
  properties: {
    label: "Properties",
    icon: "🏠",
    color: "border-green-600 bg-green-900/20",
    fields: ["address", "type", "estimated_value", "notes"],
  },
  staff: {
    label: "Staff",
    icon: "💼",
    color: "border-purple-600 bg-purple-900/20",
    fields: ["name", "role", "contact", "notes"],
  },
  vendors: {
    label: "Vendors",
    icon: "🤝",
    color: "border-orange-600 bg-orange-900/20",
    fields: ["name", "service", "contact", "notes"],
  },
};

export default function HouseholdGraphViewer({
  members,
  properties,
  staff,
  vendors,
  onAddItem,
}: HouseholdGraphViewerProps) {
  const [addForm, setAddForm] = useState<AddFormState>({
    category: null,
    fields: {},
  });

  const dataMap: Record<string, Record<string, unknown>[]> = {
    members,
    properties,
    staff,
    vendors,
  };

  function startAdd(category: string) {
    const fields: Record<string, string> = {};
    CATEGORY_CONFIG[category].fields.forEach((f) => (fields[f] = ""));
    setAddForm({ category, fields });
  }

  function cancelAdd() {
    setAddForm({ category: null, fields: {} });
  }

  function submitAdd() {
    if (!addForm.category || !onAddItem) return;
    const nonEmpty: Record<string, string> = {};
    Object.entries(addForm.fields).forEach(([k, v]) => {
      if (v.trim()) nonEmpty[k] = v.trim();
    });
    if (Object.keys(nonEmpty).length === 0) return;
    onAddItem(addForm.category, nonEmpty);
    cancelAdd();
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
        <div key={key} className="bg-chamber-900 border border-chamber-700 rounded-lg p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">
              {config.icon} {config.label}
            </h2>
            <span className="text-chamber-400 text-sm">
              {dataMap[key].length} item{dataMap[key].length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Cards */}
          <div className="space-y-2 mb-4">
            {dataMap[key].length === 0 && (
              <p className="text-chamber-500 text-sm italic">No items yet</p>
            )}
            {dataMap[key].map((item, i) => (
              <div key={i} className={`border rounded p-3 ${config.color}`}>
                {Object.entries(item).map(([field, value]) => (
                  <div key={field} className="text-sm">
                    <span className="text-chamber-400 capitalize">
                      {field.replace(/_/g, " ")}:
                    </span>{" "}
                    <span className="text-white">{String(value)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Add Form */}
          {addForm.category === key ? (
            <div className="space-y-2 border border-chamber-600 rounded p-3 bg-chamber-800">
              {config.fields.map((field) => (
                <input
                  key={field}
                  type="text"
                  placeholder={field.replace(/_/g, " ")}
                  value={addForm.fields[field] || ""}
                  onChange={(e) =>
                    setAddForm((prev) => ({
                      ...prev,
                      fields: { ...prev.fields, [field]: e.target.value },
                    }))
                  }
                  className="w-full bg-chamber-900 border border-chamber-600 rounded px-2 py-1 text-white text-sm capitalize placeholder:normal-case"
                />
              ))}
              <div className="flex gap-2">
                <button
                  onClick={submitAdd}
                  className="bg-gold-500 hover:bg-gold-600 text-chamber-950 text-sm font-semibold px-3 py-1 rounded"
                >
                  Add
                </button>
                <button
                  onClick={cancelAdd}
                  className="bg-chamber-700 hover:bg-chamber-600 text-white text-sm px-3 py-1 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            onAddItem && (
              <button
                onClick={() => startAdd(key)}
                className="text-gold-400 hover:text-gold-300 text-sm font-medium"
              >
                + Add {config.label.replace(/s$/, "")}
              </button>
            )
          )}
        </div>
      ))}
    </div>
  );
}
