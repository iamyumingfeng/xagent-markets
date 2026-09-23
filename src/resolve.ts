import type { BuildConfig, Category } from './config.js';
import type {
  Manifest, IndexItem, TemplateDetail, Payload,
  ImagePayload, VideoPayload, WorkflowPayload, PluginPayload,
} from './types.js';

/** 相对路径解析为绝对 CDN URL；已是 http(s) 的原样返回。 */
export function toAssetUrl(path: string, config: BuildConfig): string {
  if (/^https?:\/\//.test(path)) return path;
  return config.assetBase + path.replace(/^\/+/, '');
}

/** 详情页绝对 URL。 */
export function detailUrlFor(category: Category, id: string, config: BuildConfig): string {
  return `${config.siteBase}detail/${category}/${id}.json`;
}

function resolvePayload(payload: Payload, config: BuildConfig): Payload {
  if ('referenceImages' in payload || 'firstFrameImage' in payload || 'lastFrameImage' in payload) {
    const p = payload as ImagePayload & VideoPayload;
    const out: Record<string, unknown> = { ...p };
    if (Array.isArray(p.referenceImages)) {
      out.referenceImages = p.referenceImages.map((u) => toAssetUrl(u, config));
    }
    if (typeof p.firstFrameImage === 'string') {
      out.firstFrameImage = toAssetUrl(p.firstFrameImage, config);
    }
    if (typeof p.lastFrameImage === 'string') {
      out.lastFrameImage = toAssetUrl(p.lastFrameImage, config);
    }
    return out as unknown as Payload;
  }
  if ('definitionUrl' in payload) {
    const p = payload as WorkflowPayload;
    return { ...p, definitionUrl: toAssetUrl(p.definitionUrl, config) };
  }
  if ('packageUrl' in payload) {
    const p = payload as PluginPayload;
    return { ...p, packageUrl: toAssetUrl(p.packageUrl, config) };
  }
  // agent payload：contextFiles 是纯文本，无素材路径
  return payload;
}

/** Manifest → 索引轻量条目（cover 解析、附 detailUrl、剔除 payload）。 */
export function toIndexItem(m: Manifest, config: BuildConfig): IndexItem {
  return {
    id: m.id,
    version: m.version,
    name: m.name,
    cover: toAssetUrl(m.cover, config),
    tags: m.tags,
    categoryKey: m.categoryKey,
    stats: m.stats,
    minAppVersion: m.minAppVersion,
    detailUrl: detailUrlFor(m.category, m.id, config),
  };
}

/** Manifest → 详情（cover 与 payload 内路径解析为绝对 URL）。 */
export function toDetail(m: Manifest, config: BuildConfig): TemplateDetail {
  return {
    ...m,
    cover: toAssetUrl(m.cover, config),
    payload: resolvePayload(m.payload, config),
  };
}
