import { useState } from "react";
import { useStore } from "../../store";
import type { TextZone, Zone, TextBackground } from "../../api/types";
import { BackgroundConfig } from "./BackgroundConfig";
import { SubjectConfig } from "./SubjectConfig";

type EditorTab = "background" | "subject" | "zones";

export function ZoneEditor() {
  const [activeTab, setActiveTab] = useState<EditorTab>("background");
  const [expandedZone, setExpandedZone] = useState<string | null>(null);
  const { selectedTemplate, updateTemplate, assets } = useStore();

  if (!selectedTemplate) return null;

  const updateZone = (zoneName: string, updates: Partial<TextZone>) => {
    const currentZone = selectedTemplate.zones[zoneName];
    if (!currentZone) return;

    const updatedZones = { ...selectedTemplate.zones };
    updatedZones[zoneName] = { ...currentZone, ...updates } as Zone;
    updateTemplate(selectedTemplate.id, { zones: updatedZones });
  };

  const addZone = () => {
    const zoneCount = Object.keys(selectedTemplate.zones).length;
    const zoneName = zoneCount === 0 ? "title" : `zone_${zoneCount + 1}`;
    const newZone: TextZone = {
      type: "text",
      position: { x: 50, y: 500, width: 1180, height: 150 },
      font: "Impact",
      size: { min: 48, max: 96, auto: true },
      color_rules: { default: "#FFFFFF" },
      effects: {
        stroke_color: "#000000",
        stroke_width: 4,
        shadow_color: "#000000",
        shadow_blur: 8,
        shadow_offset: [2, 2],
      },
      layout_mode: "horizontal",
      rotation: 0,
      align: "center",
      valign: "middle",
      letter_spacing: 0,
      stack_gap: 0,
      transform: "none",
    };
    const updatedZones = { ...selectedTemplate.zones };
    updatedZones[zoneName] = newZone;
    updateTemplate(selectedTemplate.id, { zones: updatedZones });
    setExpandedZone(zoneName);
  };

  const removeZone = (zoneName: string) => {
    const { [zoneName]: _, ...remaining } = selectedTemplate.zones;
    updateTemplate(selectedTemplate.id, { zones: remaining });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab Header */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("background")}
          className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${
            activeTab === "background"
              ? "text-accent border-b-2 border-accent -mb-px"
              : "text-white/50 hover:text-white/70"
          }`}
        >
          BG
        </button>
        <button
          onClick={() => setActiveTab("subject")}
          className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${
            activeTab === "subject"
              ? "text-accent border-b-2 border-accent -mb-px"
              : "text-white/50 hover:text-white/70"
          }`}
        >
          Subject
        </button>
        <button
          onClick={() => setActiveTab("zones")}
          className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${
            activeTab === "zones"
              ? "text-accent border-b-2 border-accent -mb-px"
              : "text-white/50 hover:text-white/70"
          }`}
        >
          Zones
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "background" && <BackgroundConfig />}

        {activeTab === "subject" && <SubjectConfig />}

        {activeTab === "zones" && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-mono font-semibold text-white/80 uppercase tracking-wider">
                Text Zones
              </h3>
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
                {Object.entries(selectedTemplate.zones).map(([name, zone]) => {
                  const textZone = zone as TextZone;
                  const isExpanded = expandedZone === name;

                  return (
                    <div key={name} className="bg-surface-elevated border border-border rounded-lg overflow-hidden">
                      {/* Zone Header */}
                      <div
                        className="flex items-center justify-between p-3 cursor-pointer hover:bg-surface-overlay/50"
                        onClick={() => setExpandedZone(isExpanded ? null : name)}
                      >
                        <div className="flex items-center gap-2">
                          <svg
                            className={`w-4 h-4 text-white/40 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span className="font-mono text-sm text-accent">{name}</span>
                          {textZone.rotation !== 0 && (
                            <span className="text-[10px] bg-surface-overlay px-1.5 py-0.5 rounded text-white/40">
                              {textZone.rotation}°
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeZone(name);
                          }}
                          className="text-xs text-white/40 hover:text-red-400 transition-colors"
                        >
                          Remove
                        </button>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && zone.type === "text" && (
                        <div
                          className="p-3 pt-0 space-y-4 border-t border-border"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Position */}
                          <div>
                            <label className="text-[10px] font-mono text-white/50 uppercase mb-2 block">
                              Position & Size
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                              <div>
                                <label className="text-[9px] text-white/30">X</label>
                                <input
                                  type="number"
                                  value={textZone.position.x}
                                  onChange={(e) => updateZone(name, { position: { ...textZone.position, x: +e.target.value } })}
                                  className="w-full bg-surface-deep border border-border px-2 py-1 rounded text-xs text-white outline-none focus:border-accent/50"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] text-white/30">Y</label>
                                <input
                                  type="number"
                                  value={textZone.position.y}
                                  onChange={(e) => updateZone(name, { position: { ...textZone.position, y: +e.target.value } })}
                                  className="w-full bg-surface-deep border border-border px-2 py-1 rounded text-xs text-white outline-none focus:border-accent/50"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] text-white/30">Width</label>
                                <input
                                  type="number"
                                  value={textZone.position.width}
                                  onChange={(e) => updateZone(name, { position: { ...textZone.position, width: +e.target.value } })}
                                  className="w-full bg-surface-deep border border-border px-2 py-1 rounded text-xs text-white outline-none focus:border-accent/50"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] text-white/30">Height</label>
                                <input
                                  type="number"
                                  value={textZone.position.height}
                                  onChange={(e) => updateZone(name, { position: { ...textZone.position, height: +e.target.value } })}
                                  className="w-full bg-surface-deep border border-border px-2 py-1 rounded text-xs text-white outline-none focus:border-accent/50"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Typography */}
                          <div>
                            <label className="text-[10px] font-mono text-white/50 uppercase mb-2 block">
                              Typography
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="col-span-2">
                                <label className="text-[9px] text-white/30">Font</label>
                                <select
                                  value={textZone.font}
                                  onChange={(e) => updateZone(name, { font: e.target.value })}
                                  className="w-full bg-surface-deep border border-border px-2 py-1 rounded text-xs text-white outline-none focus:border-accent/50"
                                >
                                  <optgroup label="System Fonts">
                                    <option value="Impact">Impact</option>
                                    <option value="Arial Black">Arial Black</option>
                                    <option value="Georgia">Georgia</option>
                                    <option value="Times New Roman">Times New Roman</option>
                                    <option value="Trebuchet MS">Trebuchet MS</option>
                                    <option value="Verdana">Verdana</option>
                                    <option value="Courier New">Courier New</option>
                                    <option value="Comic Sans MS">Comic Sans MS</option>
                                  </optgroup>
                                  {assets.fonts.length > 0 && (
                                    <optgroup label="Custom Fonts">
                                      {assets.fonts.map((f) => (
                                        <option key={f.id} value={f.filename.replace(/\.(ttf|otf|woff|woff2)$/i, '')}>
                                          {f.filename.replace(/\.(ttf|otf|woff|woff2)$/i, '')}
                                        </option>
                                      ))}
                                    </optgroup>
                                  )}
                                </select>
                              </div>
                              <div>
                                <label className="text-[9px] text-white/30">Max Size</label>
                                <input
                                  type="number"
                                  value={textZone.size.max}
                                  onChange={(e) => updateZone(name, { size: { ...textZone.size, max: +e.target.value } })}
                                  className="w-full bg-surface-deep border border-border px-2 py-1 rounded text-xs text-white outline-none focus:border-accent/50"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] text-white/30">Transform</label>
                                <select
                                  value={textZone.transform || "none"}
                                  onChange={(e) => updateZone(name, { transform: e.target.value as "none" | "uppercase" | "lowercase" })}
                                  className="w-full bg-surface-deep border border-border px-2 py-1 rounded text-xs text-white outline-none focus:border-accent/50"
                                >
                                  <option value="none">None</option>
                                  <option value="uppercase">UPPERCASE</option>
                                  <option value="lowercase">lowercase</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[9px] text-white/30">Letter Spacing</label>
                                <input
                                  type="number"
                                  value={textZone.letter_spacing || 0}
                                  onChange={(e) => updateZone(name, { letter_spacing: +e.target.value })}
                                  className="w-full bg-surface-deep border border-border px-2 py-1 rounded text-xs text-white outline-none focus:border-accent/50"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] text-white/30">Stack Gap</label>
                                <input
                                  type="number"
                                  value={textZone.stack_gap || 0}
                                  onChange={(e) => updateZone(name, { stack_gap: +e.target.value })}
                                  className="w-full bg-surface-deep border border-border px-2 py-1 rounded text-xs text-white outline-none focus:border-accent/50"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Layout */}
                          <div>
                            <label className="text-[10px] font-mono text-white/50 uppercase mb-2 block">
                              Layout
                            </label>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <div className="col-span-2">
                                <label className="text-[9px] text-white/30">Layout Mode</label>
                                <select
                                  value={textZone.layout_mode || "horizontal"}
                                  onChange={(e) => updateZone(name, { layout_mode: e.target.value as "horizontal" | "stacked-words" | "stacked-chars" | "rotated" })}
                                  className="w-full bg-surface-deep border border-border px-2 py-1 rounded text-xs text-white outline-none focus:border-accent/50"
                                >
                                  <option value="horizontal">Horizontal (normal)</option>
                                  <option value="stacked-words">Stacked Words (each word on new line)</option>
                                  <option value="stacked-chars">Stacked Characters (each letter)</option>
                                  <option value="rotated">Rotated (angled text)</option>
                                </select>
                              </div>
                            </div>
                            {textZone.layout_mode === "rotated" && (
                              <div className="mb-2">
                                <label className="text-[9px] text-white/30">Rotation Angle</label>
                                <select
                                  value={textZone.rotation || 0}
                                  onChange={(e) => updateZone(name, { rotation: +e.target.value })}
                                  className="w-full bg-surface-deep border border-border px-2 py-1 rounded text-xs text-white outline-none focus:border-accent/50"
                                >
                                  <option value={0}>0°</option>
                                  <option value={-90}>-90° (Vertical Up)</option>
                                  <option value={90}>90° (Vertical Down)</option>
                                  <option value={180}>180° (Upside Down)</option>
                                  <option value={-45}>-45° (Diagonal Up)</option>
                                  <option value={45}>45° (Diagonal Down)</option>
                                  <option value={-15}>-15° (Slight Tilt)</option>
                                  <option value={15}>15° (Slight Tilt)</option>
                                </select>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[9px] text-white/30">H Align</label>
                                <select
                                  value={textZone.align || "center"}
                                  onChange={(e) => updateZone(name, { align: e.target.value as "left" | "center" | "right" })}
                                  className="w-full bg-surface-deep border border-border px-2 py-1 rounded text-xs text-white outline-none focus:border-accent/50"
                                >
                                  <option value="left">Left</option>
                                  <option value="center">Center</option>
                                  <option value="right">Right</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[9px] text-white/30">V Align</label>
                                <select
                                  value={textZone.valign || "middle"}
                                  onChange={(e) => updateZone(name, { valign: e.target.value as "top" | "middle" | "bottom" })}
                                  className="w-full bg-surface-deep border border-border px-2 py-1 rounded text-xs text-white outline-none focus:border-accent/50"
                                >
                                  <option value="top">Top</option>
                                  <option value="middle">Middle</option>
                                  <option value="bottom">Bottom</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          {/* Colors & Effects */}
                          <div>
                            <label className="text-[10px] font-mono text-white/50 uppercase mb-2 block">
                              Colors & Effects
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="text-[9px] text-white/30">Text Color</label>
                                <input
                                  type="color"
                                  value={textZone.color_rules.default || "#FFFFFF"}
                                  onChange={(e) => updateZone(name, { color_rules: { ...textZone.color_rules, default: e.target.value } })}
                                  className="w-full h-8 bg-surface-deep border border-border rounded cursor-pointer"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] text-white/30">Stroke Color</label>
                                <input
                                  type="color"
                                  value={textZone.effects.stroke_color}
                                  onChange={(e) => updateZone(name, { effects: { ...textZone.effects, stroke_color: e.target.value } })}
                                  className="w-full h-8 bg-surface-deep border border-border rounded cursor-pointer"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] text-white/30">Stroke Width</label>
                                <input
                                  type="number"
                                  value={textZone.effects.stroke_width}
                                  onChange={(e) => updateZone(name, { effects: { ...textZone.effects, stroke_width: +e.target.value } })}
                                  className="w-full bg-surface-deep border border-border px-2 py-1 rounded text-xs text-white outline-none focus:border-accent/50"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Text Background */}
                          <div>
                            <label className="text-[10px] font-mono text-white/50 uppercase mb-2 flex items-center gap-2">
                              Text Background
                              <input
                                type="checkbox"
                                checked={textZone.text_background?.enabled || false}
                                onChange={(e) => updateZone(name, {
                                  text_background: {
                                    enabled: e.target.checked,
                                    color: textZone.text_background?.color || "#000000",
                                    opacity: textZone.text_background?.opacity || 0.7,
                                    padding: textZone.text_background?.padding || 20,
                                    border_radius: textZone.text_background?.border_radius || 0,
                                  }
                                })}
                                className="ml-auto"
                              />
                            </label>
                            {textZone.text_background?.enabled && (
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <label className="text-[9px] text-white/30">BG Color</label>
                                  <input
                                    type="color"
                                    value={textZone.text_background.color}
                                    onChange={(e) => updateZone(name, {
                                      text_background: { ...textZone.text_background as TextBackground, color: e.target.value }
                                    })}
                                    className="w-full h-8 bg-surface-deep border border-border rounded cursor-pointer"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] text-white/30">Opacity</label>
                                  <input
                                    type="number"
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    value={textZone.text_background.opacity}
                                    onChange={(e) => updateZone(name, {
                                      text_background: { ...textZone.text_background as TextBackground, opacity: +e.target.value }
                                    })}
                                    className="w-full bg-surface-deep border border-border px-2 py-1 rounded text-xs text-white outline-none focus:border-accent/50"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] text-white/30">Padding</label>
                                  <input
                                    type="number"
                                    value={textZone.text_background.padding}
                                    onChange={(e) => updateZone(name, {
                                      text_background: { ...textZone.text_background as TextBackground, padding: +e.target.value }
                                    })}
                                    className="w-full bg-surface-deep border border-border px-2 py-1 rounded text-xs text-white outline-none focus:border-accent/50"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
