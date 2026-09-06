import { createHash } from 'node:crypto';

export type CanonicalHeritageData = {
  heritageCode: string;
  name: string;
  description: string;
  category: string;
  source: string;
  sourceOrganization: string;
  sourceReference: string;
  version: number;
};

export class HashService {
  canonicalizeHeritageData(data: CanonicalHeritageData): CanonicalHeritageData {
    return {
      category: this.normalizeText(data.category),
      description: this.normalizeText(data.description),
      heritageCode: this.normalizeText(data.heritageCode),
      name: this.normalizeText(data.name),
      source: this.normalizeText(data.source),
      sourceOrganization: this.normalizeText(data.sourceOrganization),
      sourceReference: this.normalizeText(data.sourceReference),
      version: data.version
    };
  }

  createSha256Hash(data: CanonicalHeritageData) {
    const canonicalJson = JSON.stringify(this.canonicalizeHeritageData(data));

    return createHash('sha256').update(canonicalJson).digest('hex');
  }

  toBytes32Hex(sha256Hex: string) {
    return `0x${sha256Hex}`;
  }

  private normalizeText(value: string) {
    return value.trim().replace(/\s+/g, ' ');
  }
}
