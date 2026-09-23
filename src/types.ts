import type { Category } from './config.js';

/** 双语文本。 */
export interface LocalizedString {
  zh: string;
  en: string;
}

/** 模型引用（生图/生视频/Agent 推荐）。 */
export interface ModelRef {
  platform: string;
  modelId: string;
  modelName: string;
}

export interface ImagePayload {
  /** 模式字符串等于客户端 ImageGenMode.value（snake_case），客户端用 ImageGenMode.fromString 直接解析。 */
  mode: 'text_to_image' | 'image_to_image' | 'image_edit' | 'multi_reference';
  model?: ModelRef;
  prompt: string;
  aspectRatio?: string;
  quality?: string;
  resolution?: string;
  watermark?: boolean;
  n?: number;
  referenceImages?: string[];
}

export interface VideoPayload {
  /** 模式字符串等于客户端 VideoGenMode.value（snake_case），客户端用 VideoGenMode.fromString 直接解析。 */
  mode: 'text_to_video' | 'first_last_frame' | 'multi_reference';
  model?: ModelRef;
  prompt: string;
  durationSeconds?: number;
  aspectRatio?: string;
  resolution?: '480p' | '720p' | '1080p' | '4K';
  watermark?: boolean;
  n?: number;
  firstFrameImage?: string;
  lastFrameImage?: string;
  referenceImages?: string[];
}

export interface WorkflowPayload {
  definitionUrl: string;
  nodeCount?: number;
}

export interface AgentContextFiles {
  agents: string;
  rules?: string;
  style?: string;
  tools?: string;
}

export interface AgentPayload {
  recommended?: ModelRef;
  contextFiles: AgentContextFiles;
  recommendedSkills?: { slug: string; name: string }[];
  requiredMcpServers?: { name: string; hint: string }[];
}

export interface PluginPayload {
  packageUrl: string;
  sha256: string;
  entrypoint?: string;
}

export type Payload = ImagePayload | VideoPayload | WorkflowPayload | AgentPayload | PluginPayload;

/** 源 manifest（templates/ 下的 JSON）。 */
export interface Manifest {
  schemaVersion: number;
  id: string;
  category: Category;
  version: string;
  name: LocalizedString;
  description: LocalizedString;
  categoryKey: string;
  tags: string[];
  /** 相对素材仓的路径，构建时解析为绝对 CDN URL。 */
  cover: string;
  author: { id: string; name: string };
  stats: { downloads: number; likes: number };
  minAppVersion: string;
  publishedAt: string;
  payload: Payload;
}

/** 索引中的轻量条目。 */
export interface IndexItem {
  id: string;
  version: string;
  name: LocalizedString;
  cover: string;
  tags: string[];
  categoryKey: string;
  stats: { downloads: number; likes: number };
  minAppVersion: string;
  detailUrl: string;
}

/** 分类索引文件。 */
export interface CategoryIndex {
  indexVersion: number;
  schemaVersion: number;
  category: Category;
  generatedAt: string;
  categories: { key: string; name: LocalizedString }[];
  templates: IndexItem[];
}

/** 详情文件：完整 manifest，但 cover / payload 内路径已解析为绝对 URL。 */
export interface TemplateDetail extends Omit<Manifest, 'payload'> {
  payload: Payload;
}
