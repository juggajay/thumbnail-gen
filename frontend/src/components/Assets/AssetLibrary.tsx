import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useStore } from "../../store";
import { assets as assetsApi } from "../../api/client";

export function AssetLibrary() {
  const { assets, uploadAsset, deleteAsset, selectedTemplate, updateTemplate } =
    useStore();

  const onDrop = useCallback(
    async (acceptedFiles: File[], type: string) => {
      for (const file of acceptedFiles) {
        await uploadAsset(type, file);
      }
    },
    [uploadAsset]
  );

  const bgDropzone = useDropzone({
    onDrop: (files) => onDrop(files, "backgrounds"),
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
  });

  const fontDropzone = useDropzone({
    onDrop: (files) => onDrop(files, "fonts"),
    accept: { "font/*": [".ttf", ".otf", ".woff", ".woff2"] },
  });

  const selectBackground = (filename: string) => {
    if (!selectedTemplate) return;
    updateTemplate(selectedTemplate.id, {
      background: {
        ...selectedTemplate.background,
        fixed_images: [filename],
      },
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold font-mono mb-8">
        <span className="text-accent">Asset</span> Library
      </h2>

      {/* Backgrounds */}
      <section className="mb-10">
        <h3 className="text-sm font-mono font-semibold text-white/80 uppercase tracking-wider mb-4">
          Backgrounds
        </h3>
        <div
          {...bgDropzone.getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer mb-6 transition-all duration-200 ${
            bgDropzone.isDragActive
              ? "border-accent bg-accent/10"
              : "border-border hover:border-white/30 hover:bg-surface-elevated"
          }`}
        >
          <input {...bgDropzone.getInputProps()} />
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-surface-overlay border border-border flex items-center justify-center">
            <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-white/60 text-sm">
            Drop images here or <span className="text-accent">browse</span>
          </p>
          <p className="text-white/30 text-xs mt-1">PNG, JPG, WebP</p>
        </div>

        {assets.backgrounds.length === 0 ? (
          <div className="text-center py-8 text-white/30 text-sm">
            No backgrounds uploaded
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {assets.backgrounds.map((asset) => (
              <div
                key={asset.id}
                className="group relative rounded-xl overflow-hidden bg-surface-elevated border border-border hover:border-accent/50 transition-all"
              >
                <img
                  src={assetsApi.getUrl("backgrounds", asset.filename)}
                  alt={asset.filename}
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4 gap-2">
                  <button
                    onClick={() => selectBackground(asset.filename)}
                    className="bg-accent hover:bg-accent-hover text-surface-deep px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  >
                    Use
                  </button>
                  <button
                    onClick={() => deleteAsset("backgrounds", asset.filename)}
                    className="bg-red-500/80 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
                <div className="p-2">
                  <p className="text-xs text-white/60 truncate font-mono">{asset.filename}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Fonts */}
      <section className="mb-10">
        <h3 className="text-sm font-mono font-semibold text-white/80 uppercase tracking-wider mb-4">
          Fonts
        </h3>
        <div
          {...fontDropzone.getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer mb-6 transition-all duration-200 ${
            fontDropzone.isDragActive
              ? "border-accent bg-accent/10"
              : "border-border hover:border-white/30"
          }`}
        >
          <input {...fontDropzone.getInputProps()} />
          <p className="text-white/60 text-sm">
            Drop font files here or <span className="text-accent">browse</span>
          </p>
          <p className="text-white/30 text-xs mt-1">TTF, OTF, WOFF</p>
        </div>

        {assets.fonts.length === 0 ? (
          <div className="text-center py-6 text-white/30 text-sm">
            No custom fonts uploaded
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {assets.fonts.map((asset) => (
              <div
                key={asset.id}
                className="p-4 bg-surface-elevated border border-border rounded-xl flex items-center justify-between hover:border-accent/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-overlay flex items-center justify-center">
                    <span className="text-lg font-bold text-white/60">Aa</span>
                  </div>
                  <span className="text-sm text-white/80 font-mono truncate max-w-[120px]">
                    {asset.filename}
                  </span>
                </div>
                <button
                  onClick={() => deleteAsset("fonts", asset.filename)}
                  className="text-white/40 hover:text-red-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
