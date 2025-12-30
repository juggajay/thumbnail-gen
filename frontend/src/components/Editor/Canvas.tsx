import { useStore } from "../../store";
import { assets as assetsApi } from "../../api/client";

export function Canvas() {
  const { selectedTemplate, previewImage } = useStore();

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

  const { canvas, background } = selectedTemplate;
  const aspectRatio = canvas.width / canvas.height;

  let backgroundUrl = "";
  if (background.mode === "fixed" && background.fixed_images.length > 0) {
    backgroundUrl = assetsApi.getUrl("backgrounds", background.fixed_images[0]);
  }

  return (
    <div className="flex-1 p-6 bg-surface-deep overflow-auto flex items-center justify-center">
      <div className="relative">
        {/* Canvas Container */}
        <div
          className="relative bg-surface rounded-lg overflow-hidden shadow-2xl border border-border"
          style={{
            width: "min(100%, 800px)",
            aspectRatio: `${aspectRatio}`,
          }}
        >
          {/* Render State */}
          {previewImage ? (
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : backgroundUrl ? (
            <div className="relative w-full h-full">
              <img
                src={backgroundUrl}
                alt="Background"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="px-4 py-2 bg-surface/80 backdrop-blur rounded-lg text-sm text-white/60 font-mono">
                  Click "Preview" to render
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-elevated to-surface">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-surface-overlay border border-border flex items-center justify-center">
                  <svg className="w-6 h-6 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-white/40 text-sm">No background set</p>
                <p className="text-white/20 text-xs mt-1">Upload in Assets tab</p>
              </div>
            </div>
          )}
        </div>

        {/* Canvas Info */}
        <div className="mt-3 text-center">
          <span className="text-xs font-mono text-white/30">
            {canvas.width} x {canvas.height}
          </span>
        </div>
      </div>
    </div>
  );
}
