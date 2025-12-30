import axios from "axios";
import type {
  Template,
  Asset,
  Output,
  GenerateRequest,
  GenerateResponse,
} from "./types";

const API_BASE = "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE,
});

// Templates
export const templates = {
  list: () => api.get<Template[]>("/api/templates").then((r) => r.data),

  get: (id: string) => api.get<Template>(`/api/templates/${id}`).then((r) => r.data),

  create: (data: { name: string; pipeline: string }) =>
    api.post<Template>("/api/templates", data).then((r) => r.data),

  update: (id: string, data: Partial<Template>) =>
    api.put<Template>(`/api/templates/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/api/templates/${id}`),

  duplicate: (id: string, newName: string) =>
    api
      .post<Template>(`/api/templates/${id}/duplicate?new_name=${encodeURIComponent(newName)}`)
      .then((r) => r.data),
};

// Assets
export const assets = {
  list: () =>
    api
      .get<{ backgrounds: Asset[]; fonts: Asset[]; overlays: Asset[] }>("/api/assets")
      .then((r) => r.data),

  upload: (type: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<Asset>(`/api/assets/${type}`, formData).then((r) => r.data);
  },

  delete: (type: string, filename: string) =>
    api.delete(`/api/assets/${type}/${filename}`),

  getUrl: (type: string, filename: string) =>
    `${API_BASE}/static/assets/${type}/${filename}`,
};

// Outputs
export const outputs = {
  list: () => api.get<Output[]>("/api/outputs").then((r) => r.data),

  delete: (filename: string) => api.delete(`/api/outputs/${filename}`),

  getUrl: (filename: string) => `${API_BASE}/static/outputs/${filename}`,
};

// Generate
export const generate = {
  thumbnail: (data: GenerateRequest) =>
    api.post<GenerateResponse>("/api/generate", data).then((r) => r.data),

  status: (jobId: string) =>
    api.get<GenerateResponse>(`/api/generate/${jobId}/status`).then((r) => r.data),

  preview: (templateId: string, data: Record<string, string>) =>
    api
      .post<{ image: string; format: string }>("/api/generate/preview", null, {
        params: { template_id: templateId, episode_data: JSON.stringify(data) },
      })
      .then((r) => r.data),
};

export default {
  templates,
  assets,
  outputs,
  generate,
};
