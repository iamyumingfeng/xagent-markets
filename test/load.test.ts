import { describe, it, expect } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadManifests } from '../src/load.js';

const minimal = {
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
  stats: { downloads: 0, likes: 0 },
  minAppVersion: '1.2.0',
  publishedAt: '2026-09-20T00:00:00Z',
  payload: { mode: 'text_to_image', prompt: 'a cat' },
};

describe('loadManifests', () => {
  it('读取 templates 下所有 JSON 并解析为 Manifest[]', async () => {
    const root = await mkdtemp(join(tmpdir(), 'mkt-load-'));
    await mkdir(join(root, 'templates', 'image'), { recursive: true });
    await writeFile(join(root, 'templates', 'image', 'demo-image.json'), JSON.stringify(minimal));
    const list = await loadManifests(join(root, 'templates'));
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('demo-image');
    expect(list[0].category).toBe('image');
    await rm(root, { recursive: true, force: true });
  });

  it('忽略 .gitkeep 等非 JSON 文件', async () => {
    const root = await mkdtemp(join(tmpdir(), 'mkt-load2-'));
    await mkdir(join(root, 'templates', 'plugin'), { recursive: true });
    await writeFile(join(root, 'templates', 'plugin', '.gitkeep'), '');
    const list = await loadManifests(join(root, 'templates'));
    expect(list).toHaveLength(0);
    await rm(root, { recursive: true, force: true });
  });

  it('JSON 语法错误时报错包含文件路径', async () => {
    const root = await mkdtemp(join(tmpdir(), 'mkt-load3-'));
    await mkdir(join(root, 'templates', 'image'), { recursive: true });
    await writeFile(join(root, 'templates', 'image', 'broken.json'), '{ not json');
    await expect(loadManifests(join(root, 'templates'))).rejects.toThrow(/broken\.json/);
    await rm(root, { recursive: true, force: true });
  });
});
