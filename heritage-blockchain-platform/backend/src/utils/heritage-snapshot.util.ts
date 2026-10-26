// utils/heritage-snapshot.util.ts

import { HeritageSnapshot } from "../types/interface/heritage-snapshot.type.js";

const formatToIso = (dateVal?: string | Date | null) => {
  if (!dateVal) return null;
  if (dateVal instanceof Date) return dateVal.toISOString();
  // Nếu đã là string thì tạo Date object từ string đó
  return new Date(dateVal).toISOString();
};

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
        ? formatToIso(heritage.recognizedAt)
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
