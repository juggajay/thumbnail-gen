import { useStore } from '../../store';
import { DataInputs } from '../Editor/DataInputs';
import { Canvas } from '../Editor/Canvas';
import { PreviewPanel } from '../Editor/PreviewPanel';

export function GenerateMode() {
  const { selectedTemplate } = useStore();

  if (!selectedTemplate) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2 font-display">Select a Template</h2>
          <p className="text-white/50 text-sm">
            Choose a template from the dropdown above to start generating thumbnails.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Left: Data Input Form */}
      <div className="w-96 border-r border-border flex flex-col bg-surface">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-white font-display">Generate Thumbnail</h2>
          <p className="text-sm text-white/50 mt-1">Fill in the data and click generate</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <DataInputs />
        </div>
      </div>

      {/* Right: Live Preview */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-surface-deep">
          <div className="max-w-3xl w-full">
            <Canvas />
          </div>
        </div>
        <div className="border-t border-border bg-surface">
          <PreviewPanel />
        </div>
      </div>
    </div>
  );
}
