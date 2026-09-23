import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Manifest } from './types.js';
import { CATEGORIES, type Category } from './config.js';

/** 递归读取 templatesDir 下所有 `.json` 文件并解析为 Manifest[]。 */
export async function loadManifests(templatesDir: string): Promise<Manifest[]> {
  const out: Manifest[] = [];
  for (const category of CATEGORIES as readonly Category[]) {
    const dir = join(templatesDir, category);
    let entries: string[];
    try {
      entries = await readdir(dir);
    } catch {
      continue; // 分类目录不存在则跳过
    }
    for (const entry of entries) {
      if (!entry.endsWith('.json')) continue;
      const file = join(dir, entry);
      const raw = await readFile(file, 'utf8');
      try {
        out.push(JSON.parse(raw) as Manifest);
      } catch (err) {
        throw new Error(`JSON 解析失败 [${file}]: ${(err as Error).message}`);
      }
    }
  }
  return out;
}
