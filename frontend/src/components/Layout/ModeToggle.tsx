import { useStore } from '../../store';

export function ModeToggle() {
  const { mode, setMode } = useStore();

  return (
    <div className="flex items-center bg-surface-deep rounded-lg p-1">
      <button
        onClick={() => setMode('generate')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          mode === 'generate'
            ? 'bg-accent text-surface-deep shadow-lg shadow-accent/20'
            : 'text-white/60 hover:text-white hover:bg-surface-elevated'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Generate
      </button>
      <button
        onClick={() => setMode('design')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          mode === 'design'
            ? 'bg-accent text-surface-deep shadow-lg shadow-accent/20'
            : 'text-white/60 hover:text-white hover:bg-surface-elevated'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>
        Design
      </button>
    </div>
  );
}
