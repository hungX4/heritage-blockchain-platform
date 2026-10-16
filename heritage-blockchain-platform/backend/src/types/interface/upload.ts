export interface HybridUploadResult {
  fileName: string;
  mimeType: string;
  fileSize: number;
  url: string;
  thumbnailUrl?: string;
  cid: string;
}
