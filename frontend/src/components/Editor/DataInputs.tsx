import { useStore } from "../../store";

export function DataInputs() {
  const {
    selectedTemplate,
    previewData,
    setPreviewData,
    generatePreview,
    generateThumbnail,
    isGenerating,
  } = useStore();

  if (!selectedTemplate) return null;

  const handlePreview = () => {
    generatePreview();
  };

  const handleGenerate = () => {
    const episodeId = `${new Date().toISOString().split("T")[0]}-preview`;
    generateThumbnail(episodeId, previewData);
  };

  const zoneNames = Object.keys(selectedTemplate.zones);

  return (
    <div className="p-4">
      <h3 className="text-sm font-mono font-semibold text-white/80 uppercase tracking-wider mb-4">
        Test Data
      </h3>

      <div className="space-y-4">
        {zoneNames.length === 0 ? (
          <div className="text-center py-4 text-white/30 text-sm border border-dashed border-border rounded-lg">
            Add text zones in the Zones tab to enter content
          </div>
        ) : (
          zoneNames.map((zoneName) => (
            <div key={zoneName}>
              <label className="text-[10px] font-mono text-white/40 uppercase">
                {zoneName.replace(/_/g, " ")}
              </label>
              <input
                type="text"
                value={previewData[zoneName] || ""}
                onChange={(e) =>
                  setPreviewData({ ...previewData, [zoneName]: e.target.value })
                }
                placeholder={`Enter ${zoneName.replace(/_/g, " ")}...`}
                className="w-full bg-surface-deep border border-border px-3 py-2 rounded-lg text-sm text-white placeholder-white/20 mt-1 outline-none focus:border-accent/50 transition-colors"
              />
            </div>
          ))
        )}

        <div className="flex gap-2 pt-2">
          <button
            onClick={handlePreview}
            className="flex-1 bg-surface-elevated hover:bg-surface-overlay border border-border px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Preview
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex-1 bg-accent hover:bg-accent-hover text-surface-deep px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed glow-accent"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </span>
            ) : (
              "Generate"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
