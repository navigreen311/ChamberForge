"use client";

interface ValueLayer {
  name: string;
  description: string;
  delivery_method: string;
  estimated_hours: number;
}

interface Props {
  layers: ValueLayer[];
  onChange: (layers: ValueLayer[]) => void;
}

const DELIVERY_METHODS = ["retainer", "project", "concierge", "hybrid", "membership"];

export default function ValueStackBuilder({ layers, onChange }: Props) {
  const addLayer = () => {
    onChange([
      ...layers,
      { name: "", description: "", delivery_method: "retainer", estimated_hours: 0 },
    ]);
  };

  const removeLayer = (index: number) => {
    onChange(layers.filter((_, i) => i !== index));
  };

  const updateLayer = (index: number, field: keyof ValueLayer, value: string | number) => {
    const updated = layers.map((layer, i) =>
      i === index ? { ...layer, [field]: value } : layer
    );
    onChange(updated);
  };

  const moveLayer = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= layers.length) return;
    const updated = [...layers];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {layers.length === 0 && (
        <p className="text-chamber-400 text-sm">No value layers yet. Add one or use AI generation.</p>
      )}
      {layers.map((layer, i) => (
        <div
          key={i}
          className="bg-chamber-900 border border-chamber-800 rounded-lg p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-chamber-500 font-medium">Layer {i + 1}</span>
            <div className="flex gap-1">
              <button
                onClick={() => moveLayer(i, -1)}
                disabled={i === 0}
                className="px-2 py-0.5 text-xs bg-chamber-800 text-chamber-400 rounded disabled:opacity-30"
              >
                Up
              </button>
              <button
                onClick={() => moveLayer(i, 1)}
                disabled={i === layers.length - 1}
                className="px-2 py-0.5 text-xs bg-chamber-800 text-chamber-400 rounded disabled:opacity-30"
              >
                Down
              </button>
              <button
                onClick={() => removeLayer(i)}
                className="px-2 py-0.5 text-xs bg-red-900/50 text-red-400 rounded hover:bg-red-900"
              >
                Remove
              </button>
            </div>
          </div>
          <input
            className="w-full bg-chamber-800 border border-chamber-700 rounded p-2 text-white text-sm focus:outline-none focus:border-gold-500"
            placeholder="Layer name"
            value={layer.name}
            onChange={(e) => updateLayer(i, "name", e.target.value)}
          />
          <textarea
            className="w-full bg-chamber-800 border border-chamber-700 rounded p-2 text-white text-sm resize-none h-16 focus:outline-none focus:border-gold-500"
            placeholder="Description"
            value={layer.description}
            onChange={(e) => updateLayer(i, "description", e.target.value)}
          />
          <div className="flex gap-3">
            <select
              className="flex-1 bg-chamber-800 border border-chamber-700 rounded p-2 text-white text-sm focus:outline-none focus:border-gold-500"
              value={layer.delivery_method}
              onChange={(e) => updateLayer(i, "delivery_method", e.target.value)}
            >
              {DELIVERY_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </option>
              ))}
            </select>
            <input
              type="number"
              className="w-24 bg-chamber-800 border border-chamber-700 rounded p-2 text-white text-sm focus:outline-none focus:border-gold-500"
              placeholder="Hours"
              value={layer.estimated_hours || ""}
              onChange={(e) => updateLayer(i, "estimated_hours", Number(e.target.value))}
            />
          </div>
        </div>
      ))}
      <button
        onClick={addLayer}
        className="w-full py-2 border border-dashed border-chamber-700 rounded-lg text-chamber-400 text-sm hover:border-gold-500 hover:text-gold-400 transition"
      >
        + Add Value Layer
      </button>
    </div>
  );
}
