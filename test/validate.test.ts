import { describe, it, expect } from 'vitest';
import { createManifestValidator } from '../src/validate.js';

const validImage = {
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

describe('createManifestValidator', () => {
  it('接受合法 image manifest', () => {
    const validate = createManifestValidator();
    expect(validate(validImage).valid).toBe(true);
  });

  it('拒绝非法 version（非 semver）', () => {
    const validate = createManifestValidator();
    const res = validate({ ...validImage, version: '1.0' });
    expect(res.valid).toBe(false);
    expect(res.errors.join(' ')).toContain('version');
  });

  it('拒绝 image payload 中未知字段', () => {
    const validate = createManifestValidator();
    const res = validate({ ...validImage, payload: { mode: 'text_to_image', prompt: 'a cat', bogus: 1 } });
    expect(res.valid).toBe(false);
  });

  it('拒绝 agent payload 携带私有 memory 文件', () => {
    const validate = createManifestValidator();
    const res = validate({
      ...validImage,
      category: 'agent',
      id: 'demo-agent',
      categoryKey: 'assistant',
      payload: { contextFiles: { agents: 'hi', memory: 'secret' } },
    });
    expect(res.valid).toBe(false);
  });
});
