import { useStore } from "../../store";

const PREVIEW_SIZES = [
  { name: "Full Size", width: 1280, height: 720, displayWidth: 200 },
  { name: "Search Result", width: 360, height: 202, displayWidth: 120 },
  { name: "Mobile", width: 168, height: 94, displayWidth: 84 },
];

export function PreviewPanel() {
  const { previewImage } = useStore();

  return (
    <div className="p-4">
      <h3 className="text-sm font-mono font-semibold text-white/80 uppercase tracking-wider mb-4">
        Size Preview
      </h3>

      {!previewImage ? (
        <div className="text-center py-8 text-white/30 text-sm border border-dashed border-border rounded-lg">
          Generate preview to see sizes
        </div>
      ) : (
        <div className="space-y-4">
          {PREVIEW_SIZES.map((size) => (
            <div key={size.name}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/60">{size.name}</span>
                <span className="text-[10px] font-mono text-white/30">
                  {size.width}x{size.height}
                </span>
              </div>
              <div
                className="bg-surface-elevated rounded-lg overflow-hidden border border-border"
                style={{ width: size.displayWidth }}
              >
                <img
                  src={previewImage}
                  alt={`${size.name} preview`}
                  className="w-full"
                />
              </div>
              {size.name === "Mobile" && (
                <p className="text-[10px] text-yellow-500/80 mt-1.5 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Check text readability
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
