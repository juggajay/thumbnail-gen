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

export interface TextBackground {
  enabled: boolean;
  color: string;
  opacity: number;
  padding: number;
  border_radius: number;
}

export interface TextZone {
  type: "text";
  position: ZonePosition;
  font: string;
  size: TextSize;
  color_rules: Record<string, string>;
  effects: TextEffects;
  // Layout mode
  layout_mode?: "horizontal" | "stacked-words" | "stacked-chars" | "rotated";
  rotation?: number; // degrees, only used when layout_mode is "rotated"
  align?: "left" | "center" | "right";
  valign?: "top" | "middle" | "bottom";
  // Typography
  letter_spacing?: number; // extra pixels between characters
  line_height?: number; // multiplier for multi-line text
  stack_gap?: number; // extra pixels between stacked words/chars
  transform?: "none" | "uppercase" | "lowercase";
  // Visual
  opacity?: number; // 0.0 to 1.0
  text_background?: TextBackground;
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
  // Background positioning
  offset_x?: number;  // horizontal offset in pixels
  offset_y?: number;  // vertical offset in pixels
  scale?: number;     // scale multiplier (1.0 = fit to canvas)
}

export interface CanvasConfig {
  width: number;
  height: number;
}

export interface SubjectConfig {
  enabled: boolean;
  image: string;  // filename of the subject PNG
  offset_x?: number;
  offset_y?: number;
  scale?: number;
  flip_horizontal?: boolean;
  opacity?: number;
}

export interface Template {
  id: string;
  name: string;
  pipeline: string;
  version: number;
  canvas: CanvasConfig;
  background: BackgroundConfig;
  subject?: SubjectConfig;  // Foreground layer (PNG cutout)
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

// Analysis types
export interface AnalysisContext {
  niche: string;
  target_audience: string;
  channel_style: string;
  competitors: string;
  video_title: string;
  target_emotion: string;
}

export interface AnalysisPriority {
  issue: string;
  fix: string;
  impact: "high" | "medium" | "low";
}

export interface AnalysisCategory {
  name: string;
  score: number;
  status: "excellent" | "good" | "needs_work" | "poor";
  summary: string;
  why_it_matters: string;
  whats_working: string[];
  whats_not: string[];
  fixes: string[];
}

export interface AnalysisResult {
  overall_score: number;
  verdict: string;
  top_priorities: AnalysisPriority[];
  categories: AnalysisCategory[];
  error?: string;
}
