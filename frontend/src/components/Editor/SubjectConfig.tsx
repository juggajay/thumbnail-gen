import { useStore } from '../../store';
import type { SubjectConfig as SubjectConfigType } from '../../api/types';

export function SubjectConfig() {
  const { selectedTemplate, updateTemplate, assets } = useStore();

  if (!selectedTemplate) return null;

  const subject = selectedTemplate.subject || {
    enabled: false,
    image: '',
    offset_x: 0,
    offset_y: 0,
    scale: 1.0,
    flip_horizontal: false,
    opacity: 1.0,
  };
  const subjectAssets = assets.subjects || [];

  const updateSubject = (updates: Partial<SubjectConfigType>) => {
    updateTemplate(selectedTemplate.id, {
      subject: { ...subject, ...updates },
    });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Enable Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-white">Subject Layer</h3>
          <p className="text-xs text-white/40 mt-0.5">
            PNG cutout that sits between background and text
          </p>
        </div>
        <button
          onClick={() => updateSubject({ enabled: !subject.enabled })}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            subject.enabled ? 'bg-accent' : 'bg-surface-elevated border border-border'
          }`}
        >
          <span
            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
              subject.enabled ? 'left-7' : 'left-1'
            }`}
          />
        </button>
      </div>

      {subject.enabled && (
        <>
          {/* Image Selection */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Subject Image
            </label>

            {subjectAssets.length === 0 ? (
              <div className="p-4 bg-surface-elevated rounded-lg border border-border text-center">
                <p className="text-white/50 text-sm">No subject images uploaded</p>
                <p className="text-white/30 text-xs mt-1">
                  Upload PNG files with transparency in the Assets tab (subjects folder)
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {subjectAssets.map((asset) => {
                  const isSelected = subject.image === asset.filename;
                  return (
                    <button
                      key={asset.id}
                      onClick={() => updateSubject({ image: asset.filename })}
                      className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all bg-[#1a1a1a] ${
                        isSelected
                          ? 'border-accent shadow-glow-sm'
                          : 'border-transparent hover:border-border-focus'
                      }`}
                    >
                      <img
                        src={`http://localhost:8000${asset.path}`}
                        alt={asset.filename}
                        className="w-full h-full object-contain"
                      />
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-surface-deep"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                        <p className="text-xs text-white/70 truncate">{asset.filename}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Position Controls */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Position (offset from center)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/40 mb-1">X Offset</label>
                <input
                  type="number"
                  value={subject.offset_x || 0}
                  onChange={(e) => updateSubject({ offset_x: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-surface-elevated border border-border rounded-lg text-white text-sm focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Y Offset</label>
                <input
                  type="number"
                  value={subject.offset_y || 0}
                  onChange={(e) => updateSubject({ offset_y: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-surface-elevated border border-border rounded-lg text-white text-sm focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>

          {/* Scale Control */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Scale: {((subject.scale || 1) * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.05"
              value={subject.scale || 1}
              onChange={(e) => updateSubject({ scale: parseFloat(e.target.value) })}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-xs text-white/30 mt-1">
              <span>10%</span>
              <span>100%</span>
              <span>300%</span>
            </div>
          </div>

          {/* Flip & Opacity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/40 mb-1">Flip</label>
              <button
                onClick={() => updateSubject({ flip_horizontal: !subject.flip_horizontal })}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  subject.flip_horizontal
                    ? 'bg-accent text-surface-deep'
                    : 'bg-surface-elevated text-white/70 hover:text-white border border-border'
                }`}
              >
                {subject.flip_horizontal ? 'Flipped' : 'Normal'}
              </button>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">
                Opacity: {((subject.opacity || 1) * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={subject.opacity || 1}
                onChange={(e) => updateSubject({ opacity: parseFloat(e.target.value) })}
                className="w-full accent-accent"
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
            <div className="flex gap-2">
              <svg
                className="w-5 h-5 text-accent flex-shrink-0 mt-0.5"
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
              <div className="text-sm">
                <p className="text-accent font-medium">Layer Order</p>
                <p className="text-white/50 text-xs mt-1">
                  Background → Subject → Text. Upload PNG files with transparency for best results.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
