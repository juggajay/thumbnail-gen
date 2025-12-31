import { useState } from 'react';
import { useStore } from '../../store';
import type { BackgroundConfig as BackgroundConfigType } from '../../api/types';
import { generate } from '../../api/client';

export function BackgroundConfig() {
  const { selectedTemplate, updateTemplate, assets, loadAssets } = useStore();

  if (!selectedTemplate) return null;

  const background = selectedTemplate.background;
  const backgroundAssets = assets.backgrounds;

  const updateBackground = (updates: Partial<BackgroundConfigType>) => {
    updateTemplate(selectedTemplate.id, {
      background: { ...background, ...updates },
    });
  };

  const handleGenerated = async (filename: string) => {
    // Reload assets to show the new background
    await loadAssets();
    // Auto-select the generated background
    updateTemplate(selectedTemplate.id, {
      background: {
        ...selectedTemplate.background,
        mode: 'fixed',
        fixed_images: [filename],
      },
    });
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-sm font-medium text-white mb-3">Background Mode</h3>
        <div className="flex gap-2">
          <button
            onClick={() => updateBackground({ mode: 'fixed' })}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              background.mode === 'fixed'
                ? 'bg-accent text-surface-deep'
                : 'bg-surface-elevated text-white/70 hover:text-white border border-border hover:border-border-focus'
            }`}
          >
            Fixed Images
          </button>
          <button
            onClick={() => updateBackground({ mode: 'ai' })}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              background.mode === 'ai'
                ? 'bg-purple-600 text-white'
                : 'bg-surface-elevated text-white/70 hover:text-white border border-border hover:border-border-focus'
            }`}
          >
            AI Generate
          </button>
        </div>
      </div>

      {background.mode === 'fixed' && (
        <FixedModeConfig
          background={background}
          backgroundAssets={backgroundAssets}
          onUpdate={updateBackground}
        />
      )}

      {background.mode === 'ai' && (
        <AIModeConfig
          background={background}
          onUpdate={updateBackground}
          onGenerated={handleGenerated}
        />
      )}
    </div>
  );
}

interface FixedModeConfigProps {
  background: BackgroundConfigType;
  backgroundAssets: Array<{ id: string; filename: string; path: string }>;
  onUpdate: (updates: Partial<BackgroundConfigType>) => void;
}

function FixedModeConfig({ background, backgroundAssets, onUpdate }: FixedModeConfigProps) {
  const toggleImage = (filename: string) => {
    const currentImages = background.fixed_images || [];
    const newImages = currentImages.includes(filename)
      ? currentImages.filter((f) => f !== filename)
      : [...currentImages, filename];
    onUpdate({ fixed_images: newImages });
  };

  return (
    <>
      {/* Selection Strategy */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">Selection Strategy</label>
        <select
          value={background.selection}
          onChange={(e) =>
            onUpdate({ selection: e.target.value as 'first' | 'rotate' | 'random' })
          }
          className="w-full px-3 py-2 bg-surface-elevated border border-border rounded-lg text-white text-sm focus:outline-none focus:border-accent"
        >
          <option value="first">Always First</option>
          <option value="rotate">Rotate (Sequential)</option>
          <option value="random">Random</option>
        </select>
        <p className="mt-1 text-xs text-white/40">
          {background.selection === 'first' && 'Always use the first selected image'}
          {background.selection === 'rotate' && 'Cycle through images in order'}
          {background.selection === 'random' && 'Pick a random image each time'}
        </p>
      </div>

      {/* Image Selection */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Background Images ({background.fixed_images?.length || 0} selected)
        </label>

        {backgroundAssets.length === 0 ? (
          <div className="p-4 bg-surface-elevated rounded-lg border border-border text-center">
            <p className="text-white/50 text-sm">No background images uploaded</p>
            <p className="text-white/30 text-xs mt-1">Upload images in the Assets tab</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {backgroundAssets.map((asset) => {
              const isSelected = background.fixed_images?.includes(asset.filename);
              return (
                <button
                  key={asset.id}
                  onClick={() => toggleImage(asset.filename)}
                  className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                    isSelected
                      ? 'border-accent shadow-glow-sm'
                      : 'border-transparent hover:border-border-focus'
                  }`}
                >
                  <img
                    src={`http://localhost:8000${asset.path}`}
                    alt={asset.filename}
                    className="w-full h-full object-cover"
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
    </>
  );
}

interface AIModeConfigProps {
  background: BackgroundConfigType;
  onUpdate: (updates: Partial<BackgroundConfigType>) => void;
  onGenerated: (filename: string) => void;
}

function AIModeConfig({ background, onUpdate, onGenerated }: AIModeConfigProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aiConfig = background.ai_config || {
    prompt_template: '',
    negative_prompt: '',
    fallback_prompt: '',
  };

  const updateAIConfig = (field: keyof typeof aiConfig, value: string) => {
    onUpdate({
      ai_config: { ...aiConfig, [field]: value },
    });
  };

  const handleGenerate = async () => {
    if (!aiConfig.prompt_template.trim()) {
      setError('Please enter a prompt first');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generate.background(
        aiConfig.prompt_template,
        aiConfig.negative_prompt || 'text, words, watermark, blurry, people'
      );

      if (result.success) {
        onGenerated(result.filename);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message :
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Failed to generate background';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {/* Prompt Template */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Prompt
        </label>
        <textarea
          value={aiConfig.prompt_template}
          onChange={(e) => updateAIConfig('prompt_template', e.target.value)}
          placeholder="A haunted Southern plantation mansion silhouette in heavy fog, dusk twilight sky, sepia amber color grading, atmospheric haze, Southern Gothic aesthetic, cinematic, no people, no text"
          rows={4}
          className="w-full px-3 py-2 bg-surface-elevated border border-border rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-accent resize-none"
        />
      </div>

      {/* Negative Prompt */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">Negative Prompt</label>
        <textarea
          value={aiConfig.negative_prompt}
          onChange={(e) => updateAIConfig('negative_prompt', e.target.value)}
          placeholder="text, words, watermark, blurry, low quality, people, faces"
          rows={2}
          className="w-full px-3 py-2 bg-surface-elevated border border-border rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-accent resize-none"
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !aiConfig.prompt_template.trim()}
        className={`w-full py-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
          isGenerating
            ? 'bg-purple-600/50 text-white/70 cursor-wait'
            : !aiConfig.prompt_template.trim()
            ? 'bg-surface-elevated text-white/30 cursor-not-allowed'
            : 'bg-purple-600 hover:bg-purple-500 text-white'
        }`}
      >
        {isGenerating ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Generating...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate Background
          </>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Info Box */}
      <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
        <div className="flex gap-2">
          <svg
            className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <div className="text-sm">
            <p className="text-purple-400 font-medium">AI Generation</p>
            <p className="text-white/50 text-xs mt-1">
              Powered by Google Imagen. Generated images are automatically saved to your backgrounds.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
