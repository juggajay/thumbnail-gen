import { useEffect, useState } from 'react';
import { useStore } from './store';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { Canvas } from './components/Editor/Canvas';
import { ZoneEditor } from './components/Editor/ZoneEditor';
import { PreviewPanel } from './components/Editor/PreviewPanel';
import { DataInputs } from './components/Editor/DataInputs';
import { AssetLibrary } from './components/Assets/AssetLibrary';
import { OutputHistory } from './components/Outputs/OutputHistory';
import { HelpButton } from './components/Help/HelpModal';
import { AnalysisPanel } from './components/Analysis';

type TabId = 'editor' | 'assets' | 'outputs' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('editor');
  const { loadTemplates, loadAssets, loadOutputs } = useStore();

  useEffect(() => {
    // Load initial data
    loadTemplates();
    loadAssets();
    loadOutputs();
  }, [loadTemplates, loadAssets, loadOutputs]);

  return (
    <div className="min-h-screen bg-surface-deep flex flex-col">
      {/* Header */}
      <Header activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as TabId)} />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - only show for editor */}
        {activeTab === 'editor' && <Sidebar />}

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          {activeTab === 'editor' && <EditorView />}
          {activeTab === 'assets' && <AssetLibrary />}
          {activeTab === 'outputs' && <OutputHistory />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Floating Help Button */}
      <HelpButton />

      {/* Analysis Panel */}
      <AnalysisPanel />
    </div>
  );
}

function EditorView() {
  const { selectedTemplate, templates } = useStore();

  if (!selectedTemplate) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-lg">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          {templates.length === 0 ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-3">Welcome to ThumbGen!</h2>
              <p className="text-white/60 text-sm mb-6">
                Create professional YouTube thumbnails with templates. Set up once, generate forever.
              </p>
              <div className="space-y-3 text-left bg-surface-elevated p-4 rounded-xl border border-border">
                <p className="text-accent font-medium text-sm">Get started in 3 steps:</p>
                <div className="flex items-start gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                  <span className="text-white/70">Click <span className="text-white font-medium">"+ New"</span> in the sidebar to create a template</span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                  <span className="text-white/70">Go to <span className="text-white font-medium">Assets</span> tab and upload a background image</span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                  <span className="text-white/70">Configure your template and click <span className="text-white font-medium">Generate</span>!</span>
                </div>
              </div>
              <p className="text-white/40 text-xs mt-4">
                Click the <span className="text-accent">?</span> button for detailed help
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white mb-2">Select a Template</h2>
              <p className="text-white/50 text-sm">
                Choose a template from the sidebar to start editing, or click "+ New" to create one.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Left: Canvas & Data Inputs */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Canvas - Live CSS Preview */}
        <div className="flex-1 overflow-auto">
          <Canvas />
        </div>

        {/* Data Inputs */}
        <div className="border-t border-border">
          <DataInputs />
        </div>
      </div>

      {/* Right Panel: Zone Editor & Preview */}
      <div className="w-80 border-l border-border flex flex-col bg-surface">
        {/* Zone Editor */}
        <div className="flex-1 overflow-auto">
          <ZoneEditor />
        </div>

        {/* Preview Panel */}
        <div className="border-t border-border">
          <PreviewPanel />
        </div>
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>

      <div className="space-y-6">
        <div className="p-4 bg-surface border border-border rounded-lg">
          <h3 className="text-sm font-medium text-white mb-2">API Configuration</h3>
          <p className="text-white/50 text-sm mb-4">
            Configure your Gemini API key for AI-generated backgrounds.
          </p>
          <div className="flex gap-3">
            <input
              type="password"
              placeholder="GEMINI_API_KEY"
              className="flex-1 px-3 py-2 bg-surface-elevated border border-border rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-accent"
              disabled
            />
            <button
              className="px-4 py-2 bg-surface-elevated border border-border rounded-lg text-white/50 text-sm cursor-not-allowed"
              disabled
            >
              Set via .env
            </button>
          </div>
          <p className="text-white/30 text-xs mt-2">
            API keys are configured via the .env file for security. Edit .env and restart the
            server.
          </p>
        </div>

        <div className="p-4 bg-surface border border-border rounded-lg">
          <h3 className="text-sm font-medium text-white mb-2">Data Directory</h3>
          <p className="text-white/50 text-sm mb-4">
            All templates, assets, and outputs are stored locally.
          </p>
          <code className="block px-3 py-2 bg-surface-deep rounded text-accent text-sm font-mono">
            ./data/
          </code>
        </div>

        <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
          <div className="flex gap-3">
            <svg
              className="w-5 h-5 text-accent flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-accent">Documentation</h3>
              <p className="text-white/50 text-sm mt-1">
                API documentation is available at{' '}
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  localhost:8000/docs
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
