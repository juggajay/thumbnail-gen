import { useEffect } from 'react';
import { useStore } from '../../store';

export function QueuePanel() {
  const {
    queuePanelOpen,
    setQueuePanelOpen,
    queue,
    loadQueue,
    approveJob,
    deleteJob,
    autoApprove,
    setAutoApprove
  } = useStore();

  useEffect(() => {
    if (queuePanelOpen) {
      loadQueue();
    }
  }, [queuePanelOpen, loadQueue]);

  return (
    <>
      {/* Backdrop */}
      {queuePanelOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={() => setQueuePanelOpen(false)}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-surface-deep border-l border-border z-50 flex flex-col transition-transform duration-300 ease-out ${
          queuePanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-lg font-semibold text-white font-display">Queue</h2>
          <button
            onClick={() => setQueuePanelOpen(false)}
            className="p-2 text-white/60 hover:text-white hover:bg-surface-elevated rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Queue Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {queue.length === 0 ? (
            <div className="text-center py-12 text-white/30 text-sm">
              <svg className="w-12 h-12 mx-auto mb-3 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p>No items in queue</p>
              <p className="text-xs mt-1">Generated thumbnails will appear here</p>
            </div>
          ) : (
            queue.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-surface border border-border rounded-lg"
              >
                <div className="flex gap-3">
                  <div className="w-16 h-9 bg-surface-elevated rounded overflow-hidden flex-shrink-0">
                    {item.output_path ? (
                      <img src={`/static/outputs/${item.output_path}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">
                      {item.data?.hook || item.data?.title || item.episode_id}
                    </p>
                    <p className="text-xs text-white/40">{item.episode_id}</p>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1">
                    {item.status === 'approved' && (
                      <span className="text-green-400">✓</span>
                    )}
                    {item.status === 'pending' && (
                      <>
                        <button
                          onClick={() => approveJob(item.id)}
                          className="p-1 text-green-400 hover:bg-green-400/10 rounded"
                          title="Approve"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => deleteJob(item.id)}
                          className="p-1 text-red-400 hover:bg-red-400/10 rounded"
                          title="Delete"
                        >
                          ✗
                        </button>
                      </>
                    )}
                    {item.status === 'processing' && (
                      <svg className="w-4 h-4 text-accent animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    )}
                    {item.status === 'failed' && (
                      <span className="text-red-400" title={item.error}>✗</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Settings */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Auto-approve</span>
            <button
              onClick={() => setAutoApprove(!autoApprove)}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                autoApprove ? 'bg-accent' : 'bg-surface-elevated'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                  autoApprove ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-white/40 mt-1">
            When on, API-generated thumbnails skip review
          </p>
        </div>
      </div>
    </>
  );
}
