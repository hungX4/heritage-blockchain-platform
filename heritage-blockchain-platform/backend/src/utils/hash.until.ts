import crypto from 'node:crypto';

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObject);
  }

  if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>;

    return Object.keys(obj)
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        result[key] = sortObject(obj[key]);
        return result;
      }, {});
  }

  return value;
}

export function canonicalStringify(data: object): string {
  return JSON.stringify(sortObject(data));
}

export function sha256(data: object): string {
  const canonicalJson = canonicalStringify(data);

  return crypto
    .createHash('sha256')
    .update(canonicalJson, 'utf8')
    .digest('hex');
}
