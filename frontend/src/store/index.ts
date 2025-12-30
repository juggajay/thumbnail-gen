import { create } from "zustand";
import type { Template, Asset, Output } from "../api/types";
import api from "../api/client";

interface AppState {
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
}

export const useStore = create<AppState>((set, get) => ({
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
}));
