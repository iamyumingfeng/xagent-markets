import { describe, it, expect } from 'vitest';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildMarket } from '../src/build.js';
import { defaultConfig } from '../src/config.js';

const imageManifest = {
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

describe('buildMarket', () => {
  it('生成分类索引与详情文件', async () => {
    const root = await mkdtemp(join(tmpdir(), 'mkt-build-'));
    await mkdir(join(root, 'templates', 'image'), { recursive: true });
    await writeFile(join(root, 'templates', 'image', 'demo-image.json'), JSON.stringify(imageManifest));

    const result = await buildMarket({
      repoRoot: root,
      config: defaultConfig,
      now: new Date('2026-09-20T00:00:00Z'),
      seq: 0,
    });

    expect(result.writtenIndex).toContain(join('index', 'image.json'));
    const index = JSON.parse(await readFile(join(root, 'dist', 'index', 'image.json'), 'utf8'));
    expect(index.indexVersion).toBe(2026092000);
    expect(index.templates).toHaveLength(1);
    expect(index.templates[0].detailUrl).toContain('/detail/image/demo-image.json');

    const detail = JSON.parse(await readFile(join(root, 'dist', 'detail', 'image', 'demo-image.json'), 'utf8'));
    expect(detail.payload.prompt).toBe('a cat');
    expect(detail.cover).toContain('cdn.jsdelivr.net');

    await rm(root, { recursive: true, force: true });
  });

  it('遇到非法 manifest 抛出含 id 的错误', async () => {
    const root = await mkdtemp(join(tmpdir(), 'mkt-build2-'));
    await mkdir(join(root, 'templates', 'image'), { recursive: true });
    await writeFile(
      join(root, 'templates', 'image', 'bad.json'),
      JSON.stringify({ ...imageManifest, id: 'bad-tpl', version: 'nope' }),
    );
    await expect(
      buildMarket({ repoRoot: root, config: defaultConfig, now: new Date(), seq: 0 }),
    ).rejects.toThrow(/bad-tpl/);
    await rm(root, { recursive: true, force: true });
  });

  it('同分类重复 id 快速失败（防止静默覆盖产物）', async () => {
    const root = await mkdtemp(join(tmpdir(), 'mkt-build4-'));
    await mkdir(join(root, 'templates', 'image'), { recursive: true });
    await writeFile(join(root, 'templates', 'image', 'a.json'), JSON.stringify(imageManifest));
    await writeFile(join(root, 'templates', 'image', 'b.json'), JSON.stringify(imageManifest));
    await expect(
      buildMarket({ repoRoot: root, config: defaultConfig, now: new Date(), seq: 0 }),
    ).rejects.toThrow(/重复 id: image\/demo-image/);
    await rm(root, { recursive: true, force: true });
  });

  it('空分类也生成空索引（plugin 预留）', async () => {
    const root = await mkdtemp(join(tmpdir(), 'mkt-build3-'));
    await mkdir(join(root, 'templates', 'plugin'), { recursive: true });
    const result = await buildMarket({
      repoRoot: root,
      config: defaultConfig,
      now: new Date('2026-09-20T00:00:00Z'),
      seq: 0,
    });
    expect(result.writtenIndex).toContain(join('index', 'plugin.json'));
    const index = JSON.parse(await readFile(join(root, 'dist', 'index', 'plugin.json'), 'utf8'));
    expect(index.templates).toHaveLength(0);
    await rm(root, { recursive: true, force: true });
  });
});
