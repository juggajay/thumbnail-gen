import { useStore } from "../../store";
import { outputs as outputsApi } from "../../api/client";

export function OutputHistory() {
  const { outputs, deleteOutput } = useStore();

  const handleDownload = (filename: string) => {
    const url = outputsApi.getUrl(filename);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold font-mono">
          <span className="text-accent">Generated</span> Thumbnails
        </h2>
        <span className="text-sm font-mono text-white/40 bg-surface-elevated px-3 py-1.5 rounded-lg">
          {outputs.length} outputs
        </span>
      </div>

      {outputs.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center">
            <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-white/40 text-sm">No thumbnails generated yet</p>
          <p className="text-white/20 text-xs mt-1">Create a template and hit Generate</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {outputs.map((output) => (
            <div
              key={output.id}
              className="bg-surface-elevated border border-border rounded-xl overflow-hidden hover:border-accent/30 transition-all group"
            >
              <div className="relative">
                <img
                  src={outputsApi.getUrl(output.filename)}
                  alt={output.filename}
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-surface/80 backdrop-blur text-xs font-mono text-white/60 px-2 py-1 rounded">
                    1280x720
                  </span>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm font-mono text-white/80 truncate mb-1">
                  {output.filename}
                </p>
                <p className="text-xs text-white/40 mb-4">
                  {new Date(output.created_at).toLocaleString()}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(output.filename)}
                    className="flex-1 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this output?")) {
                        deleteOutput(output.filename);
                      }
                    }}
                    className="bg-surface-overlay hover:bg-red-500/20 border border-border hover:border-red-500/50 text-white/60 hover:text-red-400 px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
