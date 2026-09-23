import { join } from 'node:path';
import { buildMarket } from './build.js';
import { loadManifests } from './load.js';
import { createManifestValidator } from './validate.js';
import { defaultConfig } from './config.js';

const repoRoot = process.cwd();
const command = process.argv[2] ?? 'build';

/** 解析当日构建序号：环境变量 `MARKET_SEQ`（CI 传 run 次数）。 */
function resolveSeq(): number {
  const raw = process.env.MARKET_SEQ;
  const n = raw == null ? 0 : Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : 0;
}

async function runValidate(): Promise<number> {
  const manifests = await loadManifests(join(repoRoot, 'templates'));
  const validate = createManifestValidator();
  let failed = 0;
  for (const m of manifests) {
    const res = validate(m);
    if (!res.valid) {
      failed++;
      console.error(`✗ [${m.id ?? 'unknown'}] ${res.errors.join('; ')}`);
    }
  }
  if (failed > 0) {
    console.error(`校验失败：${failed} 个 manifest 不合法。`);
    return 1;
  }
  console.log(`校验通过：${manifests.length} 个 manifest。`);
  return 0;
}

async function runBuild(): Promise<number> {
  const result = await buildMarket({
    repoRoot,
    config: defaultConfig,
    now: new Date(),
    seq: resolveSeq(),
  });
  const summary = Object.entries(result.counts)
    .map(([k, v]) => `${k}=${v}`)
    .join(' ');
  console.log(
    `构建完成：${result.writtenIndex.length} 个索引，${result.writtenDetail.length} 个详情。${summary}`,
  );
  return 0;
}

let code: number;
if (command === 'validate') {
  code = await runValidate();
} else if (command === 'build') {
  code = await runBuild();
} else {
  console.error(`未知命令：${command}（可用：build | validate）`);
  code = 1;
}
process.exit(code);
