import { useStore } from "../../store";
import type { TextZone } from "../../api/types";

export function ZoneEditor() {
  const { selectedTemplate, updateTemplate } = useStore();

  if (!selectedTemplate) return null;

  const updateZone = (zoneName: string, updates: Partial<TextZone>) => {
    const currentZone = selectedTemplate.zones[zoneName];
    if (!currentZone) return;

    updateTemplate(selectedTemplate.id, {
      zones: {
        ...selectedTemplate.zones,
        [zoneName]: { ...currentZone, ...updates },
      },
    });
  };

  const addZone = () => {
    const zoneName = `headline`;
    updateTemplate(selectedTemplate.id, {
      zones: {
        ...selectedTemplate.zones,
        [zoneName]: {
          type: "text",
          position: { x: 50, y: 500, width: 1180, height: 150 },
          font: "Impact",
          size: { min: 48, max: 96, auto: true },
          color_rules: { default: "#FFFFFF", CRITICAL: "#FF0000", HIGH: "#FF6600" },
          effects: {
            stroke_color: "#000000",
            stroke_width: 4,
            shadow_color: "#000000",
            shadow_blur: 8,
            shadow_offset: [2, 2] as [number, number],
          },
        },
      },
    });
  };

  const removeZone = (zoneName: string) => {
    const { [zoneName]: _, ...remaining } = selectedTemplate.zones;
    updateTemplate(selectedTemplate.id, { zones: remaining });
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-mono font-semibold text-white/80 uppercase tracking-wider">Zones</h3>
        <button
          onClick={addZone}
          className="text-xs bg-accent/10 hover:bg-accent/20 text-accent px-3 py-1.5 rounded-md transition-colors"
        >
          + Add Zone
        </button>
      </div>

      {Object.keys(selectedTemplate.zones).length === 0 ? (
        <div className="text-center py-6 text-white/30 text-sm border border-dashed border-border rounded-lg">
          No zones defined
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(selectedTemplate.zones).map(([name, zone]) => (
            <div key={name} className="p-3 bg-surface-elevated border border-border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-sm text-accent">{name}</span>
                <button
                  onClick={() => removeZone(name)}
                  className="text-xs text-white/40 hover:text-red-400 transition-colors"
                >
                  Remove
                </button>
              </div>

              {zone.type === "text" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-white/40 uppercase">Font</label>
                    <input
                      type="text"
                      value={(zone as TextZone).font}
                      onChange={(e) => updateZone(name, { font: e.target.value })}
                      className="w-full bg-surface-deep border border-border px-2 py-1.5 rounded text-sm text-white mt-1 outline-none focus:border-accent/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-white/40 uppercase">Max Size</label>
                    <input
                      type="number"
                      value={(zone as TextZone).size.max}
                      onChange={(e) =>
                        updateZone(name, {
                          size: { ...(zone as TextZone).size, max: +e.target.value },
                        })
                      }
                      className="w-full bg-surface-deep border border-border px-2 py-1.5 rounded text-sm text-white mt-1 outline-none focus:border-accent/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-white/40 uppercase">Color</label>
                    <input
                      type="color"
                      value={(zone as TextZone).color_rules.default || "#FFFFFF"}
                      onChange={(e) =>
                        updateZone(name, {
                          color_rules: {
                            ...(zone as TextZone).color_rules,
                            default: e.target.value,
                          },
                        })
                      }
                      className="w-full h-9 bg-surface-deep border border-border rounded cursor-pointer mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-white/40 uppercase">Stroke</label>
                    <input
                      type="number"
                      value={(zone as TextZone).effects.stroke_width}
                      onChange={(e) =>
                        updateZone(name, {
                          effects: {
                            ...(zone as TextZone).effects,
                            stroke_width: +e.target.value,
                          },
                        })
                      }
                      className="w-full bg-surface-deep border border-border px-2 py-1.5 rounded text-sm text-white mt-1 outline-none focus:border-accent/50"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
