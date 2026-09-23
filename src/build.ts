import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import type { BuildConfig, Category } from './config.js';
import { CATEGORIES, CATEGORY_LABELS } from './config.js';
import type { Manifest, CategoryIndex } from './types.js';
import { loadManifests } from './load.js';
import { createManifestValidator, createIndexValidator } from './validate.js';
import { toIndexItem, toDetail } from './resolve.js';
import { computeIndexVersion } from './version.js';

export interface BuildOptions {
  repoRoot: string;
  config: BuildConfig;
  /** 构建时间（用于 generatedAt 与 indexVersion）。测试可注入固定值。 */
  now: Date;
  /** 当日构建序号（0..99）。 */
  seq: number;
}

export interface BuildResult {
  writtenIndex: string[];
  writtenDetail: string[];
  counts: Record<Category, number>;
}

/** 校验并构建整个市场到 `repoRoot/dist`。 */
export async function buildMarket(opts: BuildOptions): Promise<BuildResult> {
  const { repoRoot, config, now, seq } = opts;
  const distDir = join(repoRoot, 'dist');
  await rm(distDir, { recursive: true, force: true });
  await mkdir(join(distDir, 'index'), { recursive: true });
  await mkdir(join(distDir, 'detail'), { recursive: true });

  const manifests = await loadManifests(join(repoRoot, 'templates'));
  const validateManifest = createManifestValidator();

  // 1. 全量校验（任一失败即中止，错误含 id）
  for (const m of manifests) {
    const res = validateManifest(m);
    if (!res.valid) {
      throw new Error(`manifest 校验失败 [${m.id ?? 'unknown'}]: ${res.errors.join('; ')}`);
    }
  }

  // 2. 同分类 id 唯一性检查（详情文件与 detailUrl 均以 id 为键，重复会静默覆盖）
  const seen = new Set<string>();
  for (const m of manifests) {
    const key = `${m.category}/${m.id}`;
    if (seen.has(key)) {
      throw new Error(`重复 id: ${key}`);
    }
    seen.add(key);
  }

  // 3. 按分类分组
  const byCategory = new Map<Category, Manifest[]>();
  for (const c of CATEGORIES) byCategory.set(c, []);
  for (const m of manifests) byCategory.get(m.category)!.push(m);

  const indexVersion = computeIndexVersion(now, seq);
  const generatedAt = now.toISOString();
  const validateIndex = createIndexValidator();

  const result: BuildResult = {
    writtenIndex: [],
    writtenDetail: [],
    counts: {} as Record<Category, number>,
  };

  for (const category of CATEGORIES) {
    const list = (byCategory.get(category) ?? [])
      .slice()
      .sort((a, b) => a.id.localeCompare(b.id));

    // 4. 写详情
    for (const m of list) {
      const detailDir = join(distDir, 'detail', category);
      await mkdir(detailDir, { recursive: true });
      await writeFile(
        join(detailDir, `${m.id}.json`),
        JSON.stringify(toDetail(m, config), null, 2),
        'utf8',
      );
      result.writtenDetail.push(join('detail', category, `${m.id}.json`));
    }

    // 5. 组装并校验索引
    const index: CategoryIndex = {
      indexVersion,
      schemaVersion: config.schemaVersion,
      category,
      generatedAt,
      categories: CATEGORY_LABELS[category],
      templates: list.map((m) => toIndexItem(m, config)),
    };
    const idxRes = validateIndex(index);
    if (!idxRes.valid) {
      throw new Error(`index 校验失败 [${category}]: ${idxRes.errors.join('; ')}`);
    }
    const relIndex = join('index', `${category}.json`);
    await writeFile(join(distDir, relIndex), JSON.stringify(index, null, 2), 'utf8');
    result.writtenIndex.push(relIndex);
    result.counts[category] = list.length;
  }

  return result;
}
