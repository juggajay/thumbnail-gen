import { ModeToggle } from './ModeToggle';
import { TemplateSelector } from './TemplateSelector';
import { QueueBadge } from './QueueBadge';
import { useStore } from '../../store';

export function Header() {
  const { selectedTemplate } = useStore();

  return (
    <header className="h-14 bg-surface border-b border-border px-4 flex items-center justify-between">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-lg font-bold font-display tracking-tight">
          <span className="text-accent">Thumb</span>
          <span className="text-white/80">Gen</span>
        </h1>
      </div>

      {/* Center: Template Selector + Mode Toggle */}
      <div className="flex items-center gap-4">
        {selectedTemplate && <TemplateSelector />}
        <ModeToggle />
      </div>

      {/* Right: Queue + Status */}
      <div className="flex items-center gap-4">
        <QueueBadge />
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-white/40">API Connected</span>
        </div>
      </div>
    </header>
  );
}
