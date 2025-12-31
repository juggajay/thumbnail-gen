import { useState, useRef, useCallback } from "react";
import { useStore } from "../../store";
import { assets as assetsApi } from "../../api/client";
import type { TextZone, SubjectConfig } from "../../api/types";

type EditMode = "none" | "draw-zone" | "move-background" | "move-subject";

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export function Canvas() {
  const { selectedTemplate, previewData, updateTemplate } = useStore();
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<EditMode>("none");
  const [drag, setDrag] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Background offset being dragged (temporary, before saving)
  const [tempBgOffset, setTempBgOffset] = useState<{ x: number; y: number } | null>(null);
  // Subject offset being dragged (temporary, before saving)
  const [tempSubjectOffset, setTempSubjectOffset] = useState<{ x: number; y: number } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (editMode === "none" || !canvasRef.current) return;
    if (editMode === "draw-zone" && !selectedZone) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDrag({
      isDragging: true,
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
    });

    // For background move, initialize temp offset
    if (editMode === "move-background" && selectedTemplate) {
      setTempBgOffset({
        x: selectedTemplate.background.offset_x || 0,
        y: selectedTemplate.background.offset_y || 0,
      });
    }

    // For subject move, initialize temp offset
    if (editMode === "move-subject" && selectedTemplate?.subject) {
      setTempSubjectOffset({
        x: selectedTemplate.subject.offset_x || 0,
        y: selectedTemplate.subject.offset_y || 0,
      });
    }
  }, [editMode, selectedZone, selectedTemplate]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!drag.isDragging || !canvasRef.current || !selectedTemplate) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDrag(prev => ({
      ...prev,
      currentX: x,
      currentY: y,
    }));

    // For background move, update temp offset in real-time
    if (editMode === "move-background") {
      const scale = previewWidth / selectedTemplate.canvas.width;
      const deltaX = (x - drag.startX) / scale;
      const deltaY = (y - drag.startY) / scale;
      const baseOffsetX = selectedTemplate.background.offset_x || 0;
      const baseOffsetY = selectedTemplate.background.offset_y || 0;
      setTempBgOffset({
        x: Math.round(baseOffsetX + deltaX),
        y: Math.round(baseOffsetY + deltaY),
      });
    }

    // For subject move, update temp offset in real-time
    if (editMode === "move-subject" && selectedTemplate.subject) {
      const scale = previewWidth / selectedTemplate.canvas.width;
      const deltaX = (x - drag.startX) / scale;
      const deltaY = (y - drag.startY) / scale;
      const baseOffsetX = selectedTemplate.subject.offset_x || 0;
      const baseOffsetY = selectedTemplate.subject.offset_y || 0;
      setTempSubjectOffset({
        x: Math.round(baseOffsetX + deltaX),
        y: Math.round(baseOffsetY + deltaY),
      });
    }
  }, [drag.isDragging, drag.startX, drag.startY, editMode, selectedTemplate]);

  const handleMouseUp = useCallback(() => {
    if (!drag.isDragging || !selectedTemplate) return;

    const scale = previewWidth / selectedTemplate.canvas.width;

    if (editMode === "draw-zone" && selectedZone) {
      // Calculate the rectangle bounds (handle drawing in any direction)
      const left = Math.min(drag.startX, drag.currentX);
      const top = Math.min(drag.startY, drag.currentY);
      const width = Math.abs(drag.currentX - drag.startX);
      const height = Math.abs(drag.currentY - drag.startY);

      // Only update if the drawn area is meaningful (at least 20px)
      if (width > 20 && height > 20) {
        const canvasX = Math.round(left / scale);
        const canvasY = Math.round(top / scale);
        const canvasWidth = Math.round(width / scale);
        const canvasHeight = Math.round(height / scale);

        const currentZone = selectedTemplate.zones[selectedZone];
        if (currentZone && currentZone.type === "text") {
          const updatedZones = { ...selectedTemplate.zones };
          updatedZones[selectedZone] = {
            ...currentZone,
            position: {
              x: canvasX,
              y: canvasY,
              width: canvasWidth,
              height: canvasHeight,
            },
          };
          updateTemplate(selectedTemplate.id, { zones: updatedZones });
        }
      }
      setEditMode("none");
    } else if (editMode === "move-background" && tempBgOffset) {
      // Save the background offset
      updateTemplate(selectedTemplate.id, {
        background: {
          ...selectedTemplate.background,
          offset_x: tempBgOffset.x,
          offset_y: tempBgOffset.y,
        },
      });
      setTempBgOffset(null);
      // Don't exit move mode - allow multiple adjustments
    } else if (editMode === "move-subject" && tempSubjectOffset && selectedTemplate.subject) {
      // Save the subject offset
      updateTemplate(selectedTemplate.id, {
        subject: {
          ...selectedTemplate.subject,
          offset_x: tempSubjectOffset.x,
          offset_y: tempSubjectOffset.y,
        },
      });
      setTempSubjectOffset(null);
      // Don't exit move mode - allow multiple adjustments
    }

    setDrag({
      isDragging: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
    });
  }, [drag, selectedTemplate, selectedZone, editMode, tempBgOffset, updateTemplate]);

  const handleScaleChange = (newScale: number) => {
    if (!selectedTemplate) return;
    updateTemplate(selectedTemplate.id, {
      background: {
        ...selectedTemplate.background,
        scale: newScale,
      },
    });
  };

  const resetBackgroundPosition = () => {
    if (!selectedTemplate) return;
    updateTemplate(selectedTemplate.id, {
      background: {
        ...selectedTemplate.background,
        offset_x: 0,
        offset_y: 0,
        scale: 1.0,
      },
    });
  };

  const handleSubjectScaleChange = (newScale: number) => {
    if (!selectedTemplate?.subject) return;
    updateTemplate(selectedTemplate.id, {
      subject: {
        ...selectedTemplate.subject,
        scale: newScale,
      },
    });
  };

  const resetSubjectPosition = () => {
    if (!selectedTemplate?.subject) return;
    updateTemplate(selectedTemplate.id, {
      subject: {
        ...selectedTemplate.subject,
        offset_x: 0,
        offset_y: 0,
        scale: 1.0,
      },
    });
  };

  if (!selectedTemplate) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface-deep">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center">
            <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-white/40 text-sm">Select a template to start editing</p>
        </div>
      </div>
    );
  }

  const { canvas, background, zones, subject } = selectedTemplate;
  const aspectRatio = canvas.width / canvas.height;

  let backgroundUrl = "";
  if (background.mode === "fixed" && background.fixed_images.length > 0) {
    backgroundUrl = assetsApi.getUrl("backgrounds", background.fixed_images[0]);
  }

  // Scale factor for preview (canvas is 1280x720, preview might be smaller)
  const previewWidth = 800;
  const scale = previewWidth / canvas.width;

  // Background positioning
  const bgOffsetX = tempBgOffset?.x ?? (background.offset_x || 0);
  const bgOffsetY = tempBgOffset?.y ?? (background.offset_y || 0);
  const bgScale = background.scale || 1.0;

  // Calculate selection rectangle for zone drawing
  const selectionRect = drag.isDragging && editMode === "draw-zone" ? {
    left: Math.min(drag.startX, drag.currentX),
    top: Math.min(drag.startY, drag.currentY),
    width: Math.abs(drag.currentX - drag.startX),
    height: Math.abs(drag.currentY - drag.startY),
  } : null;

  const zoneNames = Object.keys(zones);

  // Cursor based on mode
  const getCursor = () => {
    if (editMode === "draw-zone") return "crosshair";
    if (editMode === "move-background") return drag.isDragging ? "grabbing" : "grab";
    if (editMode === "move-subject") return drag.isDragging ? "grabbing" : "grab";
    return "default";
  };

  // Subject positioning
  const subjectOffsetX = tempSubjectOffset?.x ?? (subject?.offset_x || 0);
  const subjectOffsetY = tempSubjectOffset?.y ?? (subject?.offset_y || 0);
  const subjectScale = subject?.scale || 1.0;

  return (
    <div className="flex-1 bg-surface-deep overflow-auto flex flex-col items-center justify-center p-4">
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3 bg-surface-elevated/80 backdrop-blur rounded-lg px-4 py-2 border border-border">
        {/* Background Controls */}
        {backgroundUrl && (
          <>
            <button
              onClick={() => setEditMode(editMode === "move-background" ? "none" : "move-background")}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-2 ${
                editMode === "move-background"
                  ? "bg-blue-500 text-white"
                  : "bg-surface-deep border border-border text-white/70 hover:text-white hover:border-blue-500/50"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              {editMode === "move-background" ? "Moving BG..." : "Move BG"}
            </button>

            {/* Scale slider */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">Zoom:</span>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={bgScale}
                onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                className="w-20 accent-blue-500"
              />
              <span className="text-xs text-white/60 w-8">{Math.round(bgScale * 100)}%</span>
            </div>

            {(bgOffsetX !== 0 || bgOffsetY !== 0 || bgScale !== 1.0) && (
              <button
                onClick={resetBackgroundPosition}
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                Reset
              </button>
            )}

            <div className="w-px h-6 bg-border" />
          </>
        )}

        {/* Subject Controls */}
        {subject?.enabled && subject?.image && (
          <>
            <button
              onClick={() => setEditMode(editMode === "move-subject" ? "none" : "move-subject")}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-2 ${
                editMode === "move-subject"
                  ? "bg-green-500 text-white"
                  : "bg-surface-deep border border-border text-white/70 hover:text-white hover:border-green-500/50"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              {editMode === "move-subject" ? "Moving..." : "Move Subject"}
            </button>

            {/* Subject Scale slider */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">Scale:</span>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.05"
                value={subjectScale}
                onChange={(e) => handleSubjectScaleChange(parseFloat(e.target.value))}
                className="w-20 accent-green-500"
              />
              <span className="text-xs text-white/60 w-10">{Math.round(subjectScale * 100)}%</span>
            </div>

            {(subjectOffsetX !== 0 || subjectOffsetY !== 0 || subjectScale !== 1.0) && (
              <button
                onClick={resetSubjectPosition}
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                Reset
              </button>
            )}

            <div className="w-px h-6 bg-border" />
          </>
        )}

        {/* Zone Controls */}
        {zoneNames.length > 0 && (
          <>
            <span className="text-xs text-white/50">Zone:</span>
            <select
              value={selectedZone || ""}
              onChange={(e) => {
                setSelectedZone(e.target.value || null);
                setEditMode("none");
              }}
              className="bg-surface-deep border border-border px-3 py-1.5 rounded text-sm text-white outline-none focus:border-accent/50"
            >
              <option value="">Select...</option>
              {zoneNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            {selectedZone && (
              <button
                onClick={() => setEditMode(editMode === "draw-zone" ? "none" : "draw-zone")}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                  editMode === "draw-zone"
                    ? "bg-accent text-surface-deep"
                    : "bg-surface-deep border border-border text-white/70 hover:text-white hover:border-accent/50"
                }`}
              >
                {editMode === "draw-zone" ? "Drawing..." : "Draw"}
              </button>
            )}
          </>
        )}
      </div>

      <div className="relative">
        {/* Canvas Container */}
        <div
          ref={canvasRef}
          data-canvas-preview
          className={`relative bg-surface rounded-lg overflow-hidden shadow-2xl border-2 transition-colors ${
            editMode === "draw-zone" ? "border-accent" :
            editMode === "move-background" ? "border-blue-500" :
            editMode === "move-subject" ? "border-green-500" : "border-border"
          }`}
          style={{
            width: `${previewWidth}px`,
            height: `${previewWidth / aspectRatio}px`,
            cursor: getCursor(),
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Background Layer */}
          {backgroundUrl ? (
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{
                // Container clips the background
              }}
            >
              <img
                src={backgroundUrl}
                alt="Background"
                style={{
                  position: "absolute",
                  // Scale from center, then apply offset
                  width: `${100 * bgScale}%`,
                  height: `${100 * bgScale}%`,
                  left: `${50 + (bgOffsetX / canvas.width) * 100}%`,
                  top: `${50 + (bgOffsetY / canvas.height) * 100}%`,
                  transform: "translate(-50%, -50%)",
                  objectFit: "cover",
                }}
              />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-surface-elevated to-surface flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-white/40 text-sm">No background</p>
                <p className="text-white/20 text-xs mt-1">Upload in Assets tab</p>
              </div>
            </div>
          )}

          {/* Subject Layer */}
          {subject?.enabled && subject?.image && (
            <SubjectPreview
              subject={subject}
              canvasWidth={canvas.width}
              canvasHeight={canvas.height}
              scale={scale}
              tempOffset={tempSubjectOffset}
            />
          )}

          {/* Zone Outlines Layer */}
          {Object.entries(zones).map(([zoneName, zone]) => {
            if (zone.type !== "text") return null;
            const textZone = zone as TextZone;
            const isSelected = zoneName === selectedZone;

            return (
              <div
                key={`outline-${zoneName}`}
                className={`absolute border-2 border-dashed pointer-events-none transition-all ${
                  isSelected
                    ? "border-accent bg-accent/10"
                    : "border-white/20"
                }`}
                style={{
                  left: textZone.position.x * scale,
                  top: textZone.position.y * scale,
                  width: textZone.position.width * scale,
                  height: textZone.position.height * scale,
                }}
              >
                <span className={`absolute -top-5 left-0 text-[10px] font-mono px-1 rounded ${
                  isSelected ? "bg-accent text-surface-deep" : "bg-surface-elevated text-white/60"
                }`}>
                  {zoneName}
                </span>
              </div>
            );
          })}

          {/* Text Zones Layer - Live CSS Preview */}
          {Object.entries(zones).map(([zoneName, zone]) => {
            if (zone.type !== "text") return null;
            const textZone = zone as TextZone;
            const text = previewData[zoneName] || "";
            if (!text) return null;

            return (
              <TextZonePreview
                key={zoneName}
                zone={textZone}
                text={text}
                scale={scale}
              />
            );
          })}

          {/* Drawing Selection Rectangle */}
          {selectionRect && selectionRect.width > 0 && selectionRect.height > 0 && (
            <div
              className="absolute border-2 border-accent bg-accent/20 pointer-events-none"
              style={{
                left: selectionRect.left,
                top: selectionRect.top,
                width: selectionRect.width,
                height: selectionRect.height,
              }}
            >
              <span className="absolute -top-5 left-0 text-[10px] font-mono bg-accent text-surface-deep px-1 rounded">
                {Math.round(selectionRect.width / scale)} x {Math.round(selectionRect.height / scale)}
              </span>
            </div>
          )}

          {/* Mode Overlay Hints */}
          {editMode === "draw-zone" && !drag.isDragging && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-surface-deep/90 backdrop-blur px-4 py-2 rounded-lg border border-accent/50">
                <p className="text-accent text-sm font-medium">Click and drag to draw zone area</p>
              </div>
            </div>
          )}
          {editMode === "move-background" && !drag.isDragging && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-surface-deep/90 backdrop-blur px-4 py-2 rounded-lg border border-blue-500/50">
                <p className="text-blue-400 text-sm font-medium">Click and drag to reposition background</p>
              </div>
            </div>
          )}
          {editMode === "move-subject" && !drag.isDragging && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-surface-deep/90 backdrop-blur px-4 py-2 rounded-lg border border-green-500/50">
                <p className="text-green-400 text-sm font-medium">Click and drag to reposition subject</p>
              </div>
            </div>
          )}
        </div>

        {/* Canvas Info */}
        <div className="mt-3 text-center">
          <span className="text-xs font-mono text-white/30">
            {canvas.width} x {canvas.height} • Live Preview
            {(bgOffsetX !== 0 || bgOffsetY !== 0) && (
              <span className="text-blue-400/60"> • BG: {bgOffsetX}, {bgOffsetY}</span>
            )}
            {subject?.enabled && (subjectOffsetX !== 0 || subjectOffsetY !== 0) && (
              <span className="text-green-400/60"> • Subject: {subjectOffsetX}, {subjectOffsetY}</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

// Render a single text zone using CSS
function TextZonePreview({ zone, text, scale }: { zone: TextZone; text: string; scale: number }) {
  const {
    position,
    font,
    size,
    color_rules,
    effects,
    layout_mode = "horizontal",
    rotation = 0,
    align = "center",
    valign = "middle",
    letter_spacing = 0,
    stack_gap = 0,
    transform = "none",
    text_background,
  } = zone;

  // Transform text
  let displayText = text;
  if (transform === "uppercase") displayText = text.toUpperCase();
  if (transform === "lowercase") displayText = text.toLowerCase();

  // Calculate scaled values
  const scaledX = position.x * scale;
  const scaledY = position.y * scale;
  const scaledWidth = position.width * scale;
  const scaledHeight = position.height * scale;
  const scaledFontSize = size.max * scale;
  const scaledLetterSpacing = letter_spacing * scale;
  const scaledStrokeWidth = effects.stroke_width * scale;
  const scaledStackGap = stack_gap * scale;

  // Text shadow for stroke effect (CSS approximation)
  const strokeColor = effects.stroke_color;
  const sw = scaledStrokeWidth;
  const textShadow = sw > 0 ? `
    ${-sw}px ${-sw}px 0 ${strokeColor},
    ${sw}px ${-sw}px 0 ${strokeColor},
    ${-sw}px ${sw}px 0 ${strokeColor},
    ${sw}px ${sw}px 0 ${strokeColor},
    0 ${-sw}px 0 ${strokeColor},
    0 ${sw}px 0 ${strokeColor},
    ${-sw}px 0 0 ${strokeColor},
    ${sw}px 0 0 ${strokeColor}
  ` : "none";

  // Common text styles
  const textStyles: React.CSSProperties = {
    fontFamily: `"${font}", Impact, sans-serif`,
    fontSize: `${scaledFontSize}px`,
    color: color_rules.default || "#FFFFFF",
    letterSpacing: `${scaledLetterSpacing}px`,
    textShadow,
    lineHeight: 1.1,
    position: "relative",
    zIndex: 1,
  };

  // Determine flex direction and alignment based on layout mode
  const isStacked = layout_mode === "stacked-words" || layout_mode === "stacked-chars";
  const isRotated = layout_mode === "rotated";

  // Split text for stacked modes
  const textParts = layout_mode === "stacked-words"
    ? displayText.split(/\s+/)
    : layout_mode === "stacked-chars"
      ? displayText.split('')
      : [displayText];

  // Alignment for container
  const alignItems = isStacked
    ? (align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center")
    : (valign === "top" ? "flex-start" : valign === "bottom" ? "flex-end" : "center");

  const justifyContent = isStacked
    ? (valign === "top" ? "flex-start" : valign === "bottom" ? "flex-end" : "center")
    : (align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center");

  return (
    <div
      className="absolute flex overflow-hidden pointer-events-none"
      style={{
        left: scaledX,
        top: scaledY,
        width: scaledWidth,
        height: scaledHeight,
        flexDirection: isStacked ? "column" : "row",
        alignItems,
        justifyContent,
        transform: isRotated && rotation !== 0 ? `rotate(${rotation}deg)` : undefined,
        transformOrigin: "center center",
        gap: isStacked ? `${scaledStackGap}px` : undefined,
      }}
    >
      {/* Text background bar */}
      {text_background?.enabled && (
        <div
          className="absolute rounded"
          style={{
            inset: -text_background.padding * scale,
            backgroundColor: text_background.color,
            opacity: text_background.opacity,
            borderRadius: (text_background.border_radius || 0) * scale,
          }}
        />
      )}

      {/* Text - stacked or single */}
      {isStacked ? (
        textParts.map((part, i) => (
          <span key={i} style={{ ...textStyles, whiteSpace: "nowrap", textAlign: align }}>
            {part}
          </span>
        ))
      ) : (
        <span style={{ ...textStyles, whiteSpace: "nowrap", textAlign: align }}>
          {displayText}
        </span>
      )}
    </div>
  );
}

// Render subject layer
function SubjectPreview({
  subject,
  canvasWidth,
  canvasHeight,
  scale,
  tempOffset,
}: {
  subject: SubjectConfig;
  canvasWidth: number;
  canvasHeight: number;
  scale: number;
  tempOffset?: { x: number; y: number } | null;
}) {
  const subjectUrl = assetsApi.getUrl("subjects", subject.image);
  // Use temp offset during drag, otherwise use stored offset
  const offsetX = tempOffset?.x ?? (subject.offset_x || 0);
  const offsetY = tempOffset?.y ?? (subject.offset_y || 0);
  const subjectScale = subject.scale || 1.0;
  const flipH = subject.flip_horizontal || false;
  const opacity = subject.opacity ?? 1.0;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
      style={{
        opacity,
      }}
    >
      <img
        src={subjectUrl}
        alt="Subject"
        style={{
          // Scale by both preview scale AND subject's own scale setting
          transform: `translate(${offsetX * scale}px, ${offsetY * scale}px) scale(${subjectScale * scale}) ${flipH ? 'scaleX(-1)' : ''}`,
          maxWidth: "none",
          maxHeight: "none",
        }}
      />
    </div>
  );
}
