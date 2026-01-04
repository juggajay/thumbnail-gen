import { create } from "zustand";
import type { Template, Asset, Output, AnalysisResult } from "../api/types";
import api from "../api/client";

interface QueueJob {
  id: string;
  template_id: string;
  episode_id: string;
  data: Record<string, string>;
  status: 'processing' | 'pending' | 'approved' | 'failed';
  source: 'ui' | 'api';
  created_at: string;
  completed_at?: string;
  output_path?: string;
  error?: string;
}

interface AppState {
  // Mode state
  mode: 'generate' | 'design';
  setMode: (mode: 'generate' | 'design') => void;

  // Queue panel state
  queuePanelOpen: boolean;
  setQueuePanelOpen: (open: boolean) => void;
  toggleQueuePanel: () => void;

  // Queue data
  queue: QueueJob[];
  autoApprove: boolean;
  loadQueue: () => Promise<void>;
  approveJob: (jobId: string) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
  setAutoApprove: (enabled: boolean) => Promise<void>;

  // Templates
  templates: Template[];
  selectedTemplate: Template | null;
  loadTemplates: () => Promise<void>;
  selectTemplate: (id: string | null) => Promise<void>;
  createTemplate: (name: string, pipeline: string) => Promise<Template>;
  updateTemplate: (id: string, data: Partial<Template>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  duplicateTemplate: (id: string, newName: string) => Promise<Template>;

  // Assets
  assets: {
    backgrounds: Asset[];
    fonts: Asset[];
    overlays: Asset[];
    subjects: Asset[];
    keeper: Asset[];
  };
  loadAssets: () => Promise<void>;
  uploadAsset: (type: string, file: File) => Promise<Asset>;
  deleteAsset: (type: string, filename: string) => Promise<void>;

  // Outputs
  outputs: Output[];
  loadOutputs: () => Promise<void>;
  deleteOutput: (filename: string) => Promise<void>;

  // Editor state
  previewData: Record<string, string>;
  setPreviewData: (data: Record<string, string>) => void;
  previewImage: string | null;
  generatePreview: () => Promise<void>;

  // Generation
  isGenerating: boolean;
  generateThumbnail: (episodeId: string, data: Record<string, string>) => Promise<void>;

  // Analysis panel
  analysisPanel: {
    isOpen: boolean;
    isAnalyzing: boolean;
    result: AnalysisResult | null;
    error: string | null;
  };
  videoContext: {
    title: string;
    emotion: string;
  };
  toggleAnalysisPanel: () => void;
  setAnalysisPanelOpen: (open: boolean) => void;
  setVideoContext: (title: string, emotion: string) => void;
  setAnalyzing: (analyzing: boolean) => void;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setAnalysisError: (error: string | null) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Mode state
  mode: 'generate',
  setMode: (mode) => set({ mode }),

  // Queue panel state
  queuePanelOpen: false,
  setQueuePanelOpen: (open) => set({ queuePanelOpen: open }),
  toggleQueuePanel: () => set((state) => ({ queuePanelOpen: !state.queuePanelOpen })),

  // Queue data
  queue: [],
  autoApprove: true,

  loadQueue: async () => {
    try {
      const response = await fetch('/api/queue');
      const data = await response.json();
      set({ queue: data.jobs || [] });
    } catch (error) {
      console.error('Failed to load queue:', error);
    }
  },

  approveJob: async (jobId: string) => {
    try {
      await fetch(`/api/queue/${jobId}/approve`, { method: 'POST' });
      get().loadQueue();
    } catch (error) {
      console.error('Failed to approve job:', error);
    }
  },

  deleteJob: async (jobId: string) => {
    try {
      await fetch(`/api/queue/${jobId}`, { method: 'DELETE' });
      get().loadQueue();
    } catch (error) {
      console.error('Failed to delete job:', error);
    }
  },

  setAutoApprove: async (enabled: boolean) => {
    try {
      await fetch('/api/queue/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auto_approve: enabled })
      });
      set({ autoApprove: enabled });
    } catch (error) {
      console.error('Failed to update auto-approve:', error);
    }
  },

  // Templates
  templates: [],
  selectedTemplate: null,

  loadTemplates: async () => {
    const templates = await api.templates.list();
    set({ templates });
  },

  selectTemplate: async (id) => {
    if (!id) {
      set({ selectedTemplate: null, previewImage: null });
      return;
    }
    const template = await api.templates.get(id);
    set({ selectedTemplate: template, previewImage: null });
  },

  createTemplate: async (name, pipeline) => {
    const template = await api.templates.create({ name, pipeline });
    await get().loadTemplates();
    return template;
  },

  updateTemplate: async (id, data) => {
    await api.templates.update(id, data);
    await get().loadTemplates();
    if (get().selectedTemplate?.id === id) {
      await get().selectTemplate(id);
    }
  },

  deleteTemplate: async (id) => {
    await api.templates.delete(id);
    if (get().selectedTemplate?.id === id) {
      set({ selectedTemplate: null });
    }
    await get().loadTemplates();
  },

  duplicateTemplate: async (id, newName) => {
    const template = await api.templates.duplicate(id, newName);
    await get().loadTemplates();
    return template;
  },

  // Assets
  assets: {
    backgrounds: [],
    fonts: [],
    overlays: [],
    subjects: [],
    keeper: [],
  },

  loadAssets: async () => {
    const assets = await api.assets.list();
    set({ assets });
  },

  uploadAsset: async (type, file) => {
    const asset = await api.assets.upload(type, file);
    await get().loadAssets();
    return asset;
  },

  deleteAsset: async (type, filename) => {
    await api.assets.delete(type, filename);
    await get().loadAssets();
  },

  // Outputs
  outputs: [],

  loadOutputs: async () => {
    const outputs = await api.outputs.list();
    set({ outputs });
  },

  deleteOutput: async (filename) => {
    await api.outputs.delete(filename);
    await get().loadOutputs();
  },

  // Editor
  previewData: {
    headline: "SAMPLE HEADLINE",
    severity: "CRITICAL",
  },
  previewImage: null,

  setPreviewData: (data) => set({ previewData: data }),

  generatePreview: async () => {
    const { selectedTemplate, previewData } = get();
    if (!selectedTemplate) return;

    try {
      const result = await api.generate.preview(selectedTemplate.id, previewData);
      set({ previewImage: `data:image/png;base64,${result.image}` });
    } catch (error) {
      console.error("Preview error:", error);
    }
  },

  // Generation
  isGenerating: false,

  generateThumbnail: async (episodeId, data) => {
    const { selectedTemplate } = get();
    if (!selectedTemplate) return;

    set({ isGenerating: true });
    try {
      const response = await api.generate.thumbnail({
        template_id: selectedTemplate.id,
        episode_id: episodeId,
        data,
        variants: 1,
      });

      let status = response;
      while (status.status === "processing") {
        await new Promise((r) => setTimeout(r, 1000));
        status = await api.generate.status(response.job_id);
      }

      await get().loadOutputs();
    } finally {
      set({ isGenerating: false });
    }
  },

  // Analysis panel
  analysisPanel: {
    isOpen: false,
    isAnalyzing: false,
    result: null,
    error: null,
  },
  videoContext: {
    title: '',
    emotion: 'curiosity',
  },

  toggleAnalysisPanel: () =>
    set((state) => ({
      analysisPanel: {
        ...state.analysisPanel,
        isOpen: !state.analysisPanel.isOpen,
      },
    })),

  setAnalysisPanelOpen: (open) =>
    set((state) => ({
      analysisPanel: { ...state.analysisPanel, isOpen: open },
    })),

  setVideoContext: (title, emotion) =>
    set({ videoContext: { title, emotion } }),

  setAnalyzing: (analyzing) =>
    set((state) => ({
      analysisPanel: { ...state.analysisPanel, isAnalyzing: analyzing },
    })),

  setAnalysisResult: (result) =>
    set((state) => ({
      analysisPanel: { ...state.analysisPanel, result, error: null },
    })),

  setAnalysisError: (error) =>
    set((state) => ({
      analysisPanel: { ...state.analysisPanel, error, isAnalyzing: false },
    })),
}));
