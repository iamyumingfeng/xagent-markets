import { describe, it, expect } from 'vitest';
import { toAssetUrl, toIndexItem, toDetail, detailUrlFor } from '../src/resolve.js';
import { defaultConfig } from '../src/config.js';
import type { Manifest } from '../src/types.js';

const manifest: Manifest = {
  schemaVersion: 1,
  id: 'demo-image',
  category: 'image',
  version: '1.0.0',
  name: { zh: '示例', en: 'Demo' },
  description: { zh: '示例描述', en: 'Demo description' },
  categoryKey: 'portrait',
  tags: ['demo'],
  cover: 'covers/demo.jpg',
  author: { id: 'official', name: 'XAgent Official' },
  stats: { downloads: 3, likes: 1 },
  minAppVersion: '1.2.0',
  publishedAt: '2026-09-20T00:00:00Z',
  payload: { mode: 'text_to_image', prompt: 'a cat', referenceImages: ['refs/a.jpg'] },
};

describe('resolve', () => {
  it('toAssetUrl 拼接 CDN 基址', () => {
    expect(toAssetUrl('covers/demo.jpg', defaultConfig)).toBe(
      'https://cdn.jsdelivr.net/gh/iamyumingfeng/xagent-market-assets@main/covers/demo.jpg',
    );
  });

  it('toAssetUrl 保留已是绝对 URL 的值', () => {
    expect(toAssetUrl('https://x/y.jpg', defaultConfig)).toBe('https://x/y.jpg');
  });

  it('detailUrlFor 指向 Pages 详情路径', () => {
    expect(detailUrlFor('image', 'demo-image', defaultConfig)).toBe(
      'https://iamyumingfeng.github.io/xagent-markets/detail/image/demo-image.json',
    );
  });

  it('toIndexItem 输出轻量条目且 cover 已解析、剔除 payload', () => {
    const item = toIndexItem(manifest, defaultConfig);
    expect(item.id).toBe('demo-image');
    expect(item.cover).toContain('cdn.jsdelivr.net');
    expect(item.detailUrl).toContain('/detail/image/demo-image.json');
    expect((item as unknown as Record<string, unknown>).payload).toBeUndefined();
  });

  it('toDetail 解析 payload 内 referenceImages 为绝对 URL', () => {
    const detail = toDetail(manifest, defaultConfig);
    const payload = detail.payload as { referenceImages?: string[] };
    expect(payload.referenceImages?.[0]).toContain('cdn.jsdelivr.net');
  });
});
