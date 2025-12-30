export interface ZonePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextSize {
  min: number;
  max: number;
  auto: boolean;
}

export interface TextEffects {
  stroke_color: string;
  stroke_width: number;
  shadow_color: string;
  shadow_blur: number;
  shadow_offset: [number, number];
}

export interface TextZone {
  type: "text";
  position: ZonePosition;
  font: string;
  size: TextSize;
  color_rules: Record<string, string>;
  effects: TextEffects;
}

export interface BadgeZone {
  type: "badge";
  position: ZonePosition;
  variants: Record<string, string>;
  visible_when?: string;
}

export interface ImageZone {
  type: "image";
  position: ZonePosition;
  mapping: Record<string, string>;
}

export type Zone = TextZone | BadgeZone | ImageZone;

export interface AIConfig {
  prompt_template: string;
  negative_prompt: string;
  fallback_prompt: string;
}

export interface BackgroundConfig {
  mode: "fixed" | "ai";
  fixed_images: string[];
  selection: "first" | "rotate" | "random";
  ai_config: AIConfig;
}

export interface CanvasConfig {
  width: number;
  height: number;
}

export interface Template {
  id: string;
  name: string;
  pipeline: string;
  version: number;
  canvas: CanvasConfig;
  background: BackgroundConfig;
  zones: Record<string, Zone>;
  overlays: string[];
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  filename: string;
  path: string;
  type: string;
  size?: number;
}

export interface Output {
  id: string;
  filename: string;
  path: string;
  size: number;
  created_at: string;
}

export interface GenerateRequest {
  template_id: string;
  episode_id: string;
  data: Record<string, string>;
  variants?: number;
  webhook_url?: string;
}

export interface GenerateResponse {
  job_id: string;
  status: string;
  outputs: Array<{
    path: string;
    filename: string;
    size: string;
    dimensions: [number, number];
  }>;
}
