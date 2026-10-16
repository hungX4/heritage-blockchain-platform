// types/interface/heritage-snapshot.ts

export interface HeritageSnapshot {
  schemaVersion: number;

  heritage: {
    heritageCode: string;
    name: string;
    description: string;
    location: unknown;
    source: string;
    sourceOrganization: string;
    sourceDocumentNumber: string | null;
    sourceUrl: string | null;
    sourceDocumentCid: string | null;
    recognizedAt: string | null;
  };

  field: {
    code: string;
    name: string;
  };

  media: {
    type: string;
    cid: string;             // CID đại diện cho nội dung file gốc trên IPFS
    caption: string | null;  // Chú thích ảnh/video (có tính nghiệp vụ)
    order: number;
  }[];
}
