import { useStore } from '../../store';

export function QueueBadge() {
  const { toggleQueuePanel, queuePanelOpen } = useStore();

  // TODO: Replace with actual queue count from store
  const queueCount = 0;

  return (
    <button
      onClick={toggleQueuePanel}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        queuePanelOpen
          ? 'bg-accent text-surface-deep'
          : 'bg-surface-elevated hover:bg-surface-overlay border border-border text-white/70 hover:text-white'
      }`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      Queue
      {queueCount > 0 && (
        <span className="bg-accent text-surface-deep text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
          {queueCount}
        </span>
      )}
    </button>
  );
}
