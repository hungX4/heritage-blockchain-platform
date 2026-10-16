// utils/heritage-snapshot.util.ts

import { HeritageSnapshot } from "../types/interface/heritage-snapshot.type.js";

export function buildHeritageSnapshot(
  heritage: any,
  media: any[]
): HeritageSnapshot {
  return {
    schemaVersion: 1,

    heritage: {
      heritageCode: heritage.heritageCode,
      name: heritage.name,
      description: heritage.description,
      location: heritage.location,

      source: heritage.source,
      sourceOrganization: heritage.sourceOrganization,

      sourceDocumentNumber:
        heritage.sourceDocumentNumber ?? null,

      sourceUrl:
        heritage.sourceUrl ?? null,

      sourceDocumentCid:
        heritage.sourceDocumentCid ?? null,

      recognizedAt: heritage.recognizedAt
        ? heritage.recognizedAt.toISOString()
        : null,
    },

    field: {
      code: heritage.field.code,
      name: heritage.field.name,
    },

    media: media.map((item) => ({
      type: item.type,
      cid: item.cid,
      caption: item.caption ?? null,
      order: item.order,
    })),
  };
}
