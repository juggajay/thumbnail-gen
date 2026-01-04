import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store';

export function TemplateSelector() {
  const { templates, selectedTemplate, selectTemplate } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-surface-elevated hover:bg-surface-overlay border border-border rounded-lg text-sm font-medium text-white transition-colors"
      >
        <span className="max-w-[200px] truncate">
          {selectedTemplate?.name || 'Select Template'}
        </span>
        <svg
          className={`w-4 h-4 text-white/50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-surface-elevated border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-3 border-b border-border">
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              Your Templates
            </h3>
          </div>

          <div className="max-h-64 overflow-y-auto p-2">
            {templates.length === 0 ? (
              <div className="text-center py-6 text-white/30 text-sm">
                No templates yet
              </div>
            ) : (
              <div className="space-y-1">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      selectTemplate(template.id);
                      setIsOpen(false);
                    }}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'bg-accent/10 border border-accent/30'
                        : 'hover:bg-surface-overlay border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-medium text-sm ${
                        selectedTemplate?.id === template.id ? 'text-accent' : 'text-white'
                      }`}>
                        {template.name}
                      </span>
                      <span className="text-[10px] font-mono text-white/40">
                        v{template.version}
                      </span>
                    </div>
                    <span className="text-xs text-white/40 mt-0.5 block">
                      {template.pipeline}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
