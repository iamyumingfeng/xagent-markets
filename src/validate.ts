import Ajv, { type ValidateFunction, type AnySchemaObject } from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const schemaDir = join(here, '..', 'schema');

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function loadSchema(name: string): AnySchemaObject {
  return JSON.parse(readFileSync(join(schemaDir, name), 'utf8')) as AnySchemaObject;
}

function formatErrors(validate: ValidateFunction): string[] {
  return (validate.errors ?? []).map(
    (e) => `${e.instancePath || '/'} ${e.message ?? ''}`.trim(),
  );
}

/** 创建 manifest 校验器（一次编译，多次复用）。 */
export function createManifestValidator(): (data: unknown) => ValidationResult {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(loadSchema('manifest.schema.json'));
  return (data) => {
    const valid = validate(data) as boolean;
    return { valid, errors: valid ? [] : formatErrors(validate) };
  };
}

/** 创建 index 校验器。 */
export function createIndexValidator(): (data: unknown) => ValidationResult {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(loadSchema('index.schema.json'));
  return (data) => {
    const valid = validate(data) as boolean;
    return { valid, errors: valid ? [] : formatErrors(validate) };
  };
}
