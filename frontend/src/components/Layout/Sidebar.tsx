import { useStore } from "../../store";
import { useState } from "react";

export function Sidebar() {
  const {
    templates,
    selectedTemplate,
    selectTemplate,
    createTemplate,
    deleteTemplate,
    duplicateTemplate,
  } = useStore();

  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPipeline, setNewPipeline] = useState("cybersecurity");

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const template = await createTemplate(newName, newPipeline);
    await selectTemplate(template.id);
    setShowNew(false);
    setNewName("");
  };

  const handleDuplicate = async (id: string, name: string) => {
    const newTemplate = await duplicateTemplate(id, `${name} (Copy)`);
    await selectTemplate(newTemplate.id);
  };

  return (
    <aside className="w-72 bg-surface border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-mono font-semibold text-white/80 uppercase tracking-wider mb-3">
          Templates
        </h2>
        <button
          onClick={() => setShowNew(true)}
          className="w-full bg-accent/10 hover:bg-accent/20 border border-accent/30 hover:border-accent/50 text-accent px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Template
        </button>
      </div>

      {/* New Template Form */}
      {showNew && (
        <div className="p-4 border-b border-border bg-surface-elevated animate-in slide-in-from-top-2">
          <input
            type="text"
            placeholder="Template name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
            className="w-full bg-surface-deep border border-border focus:border-accent/50 px-3 py-2 rounded-lg text-sm text-white placeholder-white/30 outline-none transition-colors"
          />
          <select
            value={newPipeline}
            onChange={(e) => setNewPipeline(e.target.value)}
            className="w-full bg-surface-deep border border-border px-3 py-2 rounded-lg text-sm text-white mt-2 outline-none"
          >
            <option value="cybersecurity">Cybersecurity</option>
            <option value="keeper">The Keeper</option>
            <option value="other">Other</option>
          </select>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleCreate}
              className="flex-1 bg-accent hover:bg-accent-hover text-surface-deep font-medium px-3 py-2 rounded-lg text-sm transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowNew(false);
                setNewName("");
              }}
              className="flex-1 bg-surface-deep hover:bg-surface-overlay border border-border px-3 py-2 rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Template List */}
      <div className="flex-1 overflow-y-auto p-2">
        {templates.length === 0 ? (
          <div className="text-center py-8 text-white/30 text-sm">
            No templates yet
          </div>
        ) : (
          <div className="space-y-1">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => selectTemplate(template.id)}
                className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedTemplate?.id === template.id
                    ? "bg-accent/10 border border-accent/30"
                    : "hover:bg-surface-elevated border border-transparent"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className={`font-medium text-sm ${
                      selectedTemplate?.id === template.id ? "text-accent" : "text-white"
                    }`}>
                      {template.name}
                    </div>
                    <div className="text-xs text-white/40 mt-0.5 font-mono">
                      {template.pipeline}
                    </div>
                  </div>
                  <div className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    selectedTemplate?.id === template.id
                      ? "bg-accent/20 text-accent"
                      : "bg-surface-deep text-white/40"
                  }`}>
                    v{template.version}
                  </div>
                </div>

                {selectedTemplate?.id === template.id && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-accent/20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicate(template.id, template.name);
                      }}
                      className="text-xs text-white/60 hover:text-accent transition-colors"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Delete this template?")) {
                          deleteTemplate(template.id);
                        }
                      }}
                      className="text-xs text-white/60 hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
