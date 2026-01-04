import { useEffect } from 'react';
import { useStore } from './store';
import { Header } from './components/Layout/Header';
import { GenerateMode } from './components/Generate';
import { DesignMode } from './components/Design';
import { QueuePanel } from './components/Queue';
import { HelpButton } from './components/Help/HelpModal';
import { AnalysisPanel } from './components/Analysis';

function App() {
  const { mode, loadTemplates, loadAssets, loadOutputs } = useStore();

  useEffect(() => {
    loadTemplates();
    loadAssets();
    loadOutputs();
  }, [loadTemplates, loadAssets, loadOutputs]);

  return (
    <div className="min-h-screen bg-surface-deep flex flex-col font-body">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-auto">
          {mode === 'generate' && <GenerateMode />}
          {mode === 'design' && <DesignMode />}
        </main>
      </div>

      <QueuePanel />
      <HelpButton />
      <AnalysisPanel />
    </div>
  );
}

export default App;
