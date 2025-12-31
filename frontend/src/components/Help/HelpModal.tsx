import { useState } from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [activeSection, setActiveSection] = useState<'quickstart' | 'concepts' | 'faq'>('quickstart');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-surface-deep border border-border rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Help & Getting Started</h2>
              <p className="text-xs text-white/50">Learn how to create thumbnails</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-elevated rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border">
          {[
            { id: 'quickstart', label: 'Quick Start', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
            { id: 'concepts', label: 'Concepts', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
            { id: 'faq', label: 'FAQ', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as typeof activeSection)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeSection === tab.id
                  ? 'text-accent border-b-2 border-accent -mb-px'
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeSection === 'quickstart' && <QuickStartContent />}
          {activeSection === 'concepts' && <ConceptsContent />}
          {activeSection === 'faq' && <FAQContent />}
        </div>
      </div>
    </div>
  );
}

function QuickStartContent() {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl">
        <p className="text-accent font-medium text-sm">Your First Thumbnail in 5 Steps</p>
      </div>

      {[
        {
          step: 1,
          title: 'Create a Template',
          description: 'Click the "+ New" button in the left sidebar. Give it a name like "keeper-v1".',
          icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
        },
        {
          step: 2,
          title: 'Upload a Background',
          description: 'Go to Assets tab. Drag an image into the Backgrounds section.',
          icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
        },
        {
          step: 3,
          title: 'Select Your Background',
          description: 'Back in Editor tab, go to Background panel. Click on your uploaded image to select it.',
          icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        },
        {
          step: 4,
          title: 'Add a Text Zone',
          description: 'Go to Zones tab. Click "+ Add Zone". This is where your headline will appear.',
          icon: 'M4 6h16M4 12h16m-7 6h7',
        },
        {
          step: 5,
          title: 'Generate!',
          description: 'Enter test data at the bottom, click Preview to see it, then Generate to save.',
          icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z',
        },
      ].map((item) => (
        <div key={item.step} className="flex gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
            {item.step}
          </div>
          <div className="flex-1">
            <h3 className="text-white font-medium mb-1">{item.title}</h3>
            <p className="text-white/60 text-sm">{item.description}</p>
          </div>
        </div>
      ))}

      <div className="mt-8 p-4 bg-surface-elevated rounded-xl border border-border">
        <p className="text-white/80 text-sm">
          <span className="text-accent font-medium">Pro tip:</span> Once your template looks good, your AI pipeline can generate thumbnails automatically using the API. No UI needed!
        </p>
      </div>
    </div>
  );
}

function ConceptsContent() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent"></span>
          Templates
        </h3>
        <p className="text-white/60 text-sm pl-4">
          A template is like a "recipe" for your thumbnails. It defines where text goes, what colors to use, and what background to show. You create it once, then reuse it for every episode.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent"></span>
          Background Modes
        </h3>
        <div className="pl-4 space-y-3">
          <div className="p-3 bg-surface-elevated rounded-lg">
            <p className="text-white font-medium text-sm">Fixed Images</p>
            <p className="text-white/50 text-xs mt-1">Use specific images you've uploaded. Great for consistent branding like host photos.</p>
          </div>
          <div className="p-3 bg-surface-elevated rounded-lg">
            <p className="text-white font-medium text-sm">AI Generated</p>
            <p className="text-white/50 text-xs mt-1">Creates unique backgrounds using AI. Perfect for story-based content where each episode needs a different mood.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent"></span>
          Zones
        </h3>
        <p className="text-white/60 text-sm pl-4">
          Zones are "slots" where content appears. A text zone shows your headline. The text automatically shrinks to fit if it's too long.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent"></span>
          Data
        </h3>
        <p className="text-white/60 text-sm pl-4">
          When generating, you provide data like headline text, severity level, mood, etc. This data fills in the zones and can affect colors (e.g., CRITICAL = red text).
        </p>
      </div>

      <div className="mt-6 p-4 bg-surface-elevated rounded-xl border border-border">
        <p className="text-white/70 text-sm font-mono">
          Template + Data = Thumbnail
        </p>
        <p className="text-white/40 text-xs mt-2">
          Same template, different data = different thumbnails with consistent style
        </p>
      </div>
    </div>
  );
}

function FAQContent() {
  const faqs = [
    {
      q: "Why is my preview blank?",
      a: "You probably don't have a background selected. Go to the Background tab in the right panel and click on an image to select it."
    },
    {
      q: "The text is too small or too big",
      a: "Adjust the 'Max Size' value in the zone settings. Text auto-shrinks to fit, but won't go bigger than the max size."
    },
    {
      q: "Where are my files saved?",
      a: "Everything is in the 'data' folder: templates in data/templates/, backgrounds in data/assets/backgrounds/, generated thumbnails in data/outputs/"
    },
    {
      q: "Do I need to keep the terminal windows open?",
      a: "Yes! The backend server must be running. If you close the terminals, run start.bat again to restart."
    },
    {
      q: "How does my AI pipeline use this?",
      a: "Your pipeline makes a POST request to http://localhost:8000/api/generate with the template ID and episode data. Check the integration guide in docs/ for details."
    },
    {
      q: "Can I use AI-generated backgrounds?",
      a: "Yes! Set background mode to 'AI Generated' and configure the prompt template. You'll need a valid Gemini API key in the .env file."
    },
  ];

  return (
    <div className="space-y-4">
      {faqs.map((faq, i) => (
        <div key={i} className="p-4 bg-surface-elevated rounded-xl border border-border">
          <h3 className="text-white font-medium text-sm mb-2">{faq.q}</h3>
          <p className="text-white/60 text-sm">{faq.a}</p>
        </div>
      ))}
    </div>
  );
}

// Floating Help Button Component
export function HelpButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-accent hover:bg-accent-hover text-surface-deep rounded-full shadow-lg shadow-accent/30 flex items-center justify-center transition-all hover:scale-105 z-40"
        title="Help & Getting Started"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      <HelpModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
