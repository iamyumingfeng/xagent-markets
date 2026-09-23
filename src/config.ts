/** 市场分类 slug。 */
export const CATEGORIES = ['image', 'video', 'workflow', 'agent', 'plugin'] as const;
export type Category = (typeof CATEGORIES)[number];

/** 构建期配置：URL 基址与 schema 版本。 */
export interface BuildConfig {
  /** GitHub Pages 基址，以 `/` 结尾。 */
  readonly siteBase: string;
  /** 素材 CDN 基址（jsDelivr），以 `/` 结尾。 */
  readonly assetBase: string;
  /** manifest / index 的 schemaVersion。 */
  readonly schemaVersion: number;
}

export const defaultConfig: BuildConfig = {
  siteBase: 'https://iamyumingfeng.github.io/xagent-markets/',
  assetBase: 'https://cdn.jsdelivr.net/gh/iamyumingfeng/xagent-market-assets@main/',
  schemaVersion: 1,
};

/** 每个分类下用于筛选 chips 的子分类元数据（categoryKey → 双语名）。 */
export const CATEGORY_LABELS: Record<Category, { key: string; name: { zh: string; en: string } }[]> = {
  image: [
    { key: 'portrait', name: { zh: '人像', en: 'Portrait' } },
    { key: 'illustration', name: { zh: '插画', en: 'Illustration' } },
    { key: 'product', name: { zh: '产品', en: 'Product' } },
  ],
  video: [
    { key: 'short-video', name: { zh: '短视频', en: 'Short Video' } },
    { key: 'animation', name: { zh: '动画', en: 'Animation' } },
  ],
  workflow: [
    { key: 'productivity', name: { zh: '效率', en: 'Productivity' } },
    { key: 'rag', name: { zh: '知识库', en: 'RAG' } },
  ],
  agent: [
    { key: 'assistant', name: { zh: '助手', en: 'Assistant' } },
    { key: 'roleplay', name: { zh: '角色扮演', en: 'Roleplay' } },
  ],
  plugin: [],
};
