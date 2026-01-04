import { useStore } from '../../store';
import { Sidebar } from '../Layout/Sidebar';
import { Canvas } from '../Editor/Canvas';
import { ZoneEditor } from '../Editor/ZoneEditor';
import { PreviewPanel } from '../Editor/PreviewPanel';
import { DataInputs } from '../Editor/DataInputs';

export function DesignMode() {
  const { selectedTemplate, templates } = useStore();

  if (!selectedTemplate) {
    return (
      <div className="h-full flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-lg">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
            </div>
            {templates.length === 0 ? (
              <>
                <h2 className="text-2xl font-bold text-white mb-3 font-display">Create Your First Template</h2>
                <p className="text-white/60 text-sm">
                  Click "+ New Template" in the sidebar to get started.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-white mb-2 font-display">Select a Template</h2>
                <p className="text-white/50 text-sm">
                  Choose a template from the sidebar to start editing.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-auto">
          <Canvas />
        </div>
        <div className="border-t border-border">
          <DataInputs />
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-80 border-l border-border flex flex-col bg-surface">
        <div className="flex-1 overflow-auto">
          <ZoneEditor />
        </div>
        <div className="border-t border-border">
          <PreviewPanel />
        </div>
      </div>
    </div>
  );
}
