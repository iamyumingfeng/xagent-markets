import { describe, it, expect } from 'vitest';
import { computeIndexVersion } from '../src/version.js';

describe('computeIndexVersion', () => {
  it('按 UTC 日期与序号生成单调整数', () => {
    const at = new Date('2026-09-20T08:30:00Z');
    expect(computeIndexVersion(at, 0)).toBe(2026092000);
    expect(computeIndexVersion(at, 3)).toBe(2026092003);
  });

  it('序号超过 99 时截断到 99', () => {
    const at = new Date('2026-09-20T08:30:00Z');
    expect(computeIndexVersion(at, 150)).toBe(2026092099);
  });

  it('次日序号归零后仍大于前一日最大序号', () => {
    const d1 = new Date('2026-09-20T23:59:00Z');
    const d2 = new Date('2026-09-21T00:01:00Z');
    expect(computeIndexVersion(d2, 0)).toBeGreaterThan(computeIndexVersion(d1, 99));
  });
});
