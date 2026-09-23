/**
 * 计算单调递增的索引版本号。
 * 规则：UTC 日期 `YYYYMMDD` × 100 + 当日序号（0..99）。
 * 同日多次构建递增 seq；跨日自然大于前一日任意 seq。
 */
export function computeIndexVersion(at: Date, seq: number): number {
  const y = at.getUTCFullYear();
  const m = String(at.getUTCMonth() + 1).padStart(2, '0');
  const d = String(at.getUTCDate()).padStart(2, '0');
  const datePart = Number(`${y}${m}${d}`);
  return datePart * 100 + Math.max(0, Math.min(99, Math.floor(seq)));
}
