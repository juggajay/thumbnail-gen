interface MobilePreviewProps {
  imageUrl: string | null;
}

export function MobilePreview({ imageUrl }: MobilePreviewProps) {
  return (
    <div className="p-4 bg-surface border border-border rounded-lg">
      <h4 className="text-sm font-semibold text-white/80 mb-2">
        Mobile Preview
      </h4>
      <p className="text-xs text-white/40 mb-3">
        This is what viewers see when browsing YouTube on mobile
      </p>

      <div className="flex justify-center">
        <div className="relative">
          {/* Mobile device frame */}
          <div className="bg-surface-deep rounded-lg p-2 border border-border">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Mobile preview"
                className="rounded"
                style={{
                  width: "160px",
                  height: "90px",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                className="bg-surface-elevated rounded flex items-center justify-center"
                style={{ width: "160px", height: "90px" }}
              >
                <span className="text-xs text-white/30">No preview</span>
              </div>
            )}

            {/* Mock video duration badge */}
            <div className="absolute bottom-3 right-3 bg-black/80 px-1 py-0.5 rounded text-[10px] text-white font-medium">
              12:34
            </div>
          </div>

          {/* Size label */}
          <div className="mt-2 text-center">
            <span className="text-[10px] text-white/30 font-mono">
              160 x 90px
            </span>
          </div>
        </div>
      </div>

      {/* Info callout */}
      <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-300/80">
        <strong>Tip:</strong> Text smaller than 24pt may be unreadable at this
        size. Ensure key elements are large and clear.
      </div>
    </div>
  );
}
