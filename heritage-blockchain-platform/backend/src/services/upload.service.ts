import cloudinary from '../config/cloudinary.config.js';
import streamifier from 'streamifier';
import { HybridUploadResult } from '../types/interface/upload.js';

export class UploadService {
  static async uploadDocument(fileBuffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'heritage_legal_docs',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error || !result) {
            return reject(new Error('Lỗi khi upload file lên Cloudinary'));
          }
          resolve(result.secure_url); // Trả về URL thành công
        }
      );

      // Chuyển buffer thành stream và đẩy lên
      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  }

  static async uploadMultipleDocuments(files: Express.Multer.File[]): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadDocument(file.buffer));
    return Promise.all(uploadPromises); // Đợi tất cả upload xong và trả về mảng các URL
  }

  static async uploadToCloudinary(
    file: Express.Multer.File
  ): Promise<{ url: string; thumbnailUrl?: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'heritage_media',
          resource_type: 'auto', // Tự nhận diện Image, Video, Audio, Document
        },
        (error, result) => {
          if (error || !result) {
            return reject(new Error('Lỗi khi upload file lên Cloudinary'));
          }

          let thumbnailUrl: string | undefined = undefined;

          // 🟢 Phân loại sinh Thumbnail chính xác theo MimeType
          if (file.mimetype.startsWith('image/')) {
            thumbnailUrl = cloudinary.url(result.public_id, {
              width: 300,
              height: 300,
              crop: 'fill',
              format: 'jpg',
            });
          } else if (file.mimetype.startsWith('video/')) {
            thumbnailUrl = cloudinary.url(result.public_id, {
              resource_type: 'video',
              format: 'jpg',
              transformation: [{ width: 300, height: 300, crop: 'pad' }],
            });
          } else if (file.mimetype.startsWith('audio/')) {
            // Audio không có frame hình -> để undefined để FE tự render Audio Player / Icon sóng âm
            thumbnailUrl = undefined;
          }

          resolve({ url: result.secure_url, thumbnailUrl });
        }
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  static async uploadToPinata(fileBuffer: Buffer, fileName: string): Promise<string> {
    const pinataJwt = process.env.IPFS_PINATA_JWT;
    if (!pinataJwt) {
      throw new Error('Chưa cấu hình IPFS_PINATA_JWT trong file .env');
    }

    const formData = new FormData();
    const blob = new Blob([fileBuffer as unknown as BlobPart]);
    formData.append('file', blob, fileName);

    const metadata = JSON.stringify({ name: fileName });
    formData.append('pinataMetadata', metadata);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lỗi upload IPFS Pinata: ${errorText}`);
    }

    const data = (await response.json()) as { IpfsHash: string };
    return data.IpfsHash;
  }

  static async uploadHybrid(file: Express.Multer.File): Promise<HybridUploadResult> {
    const [cloudinaryRes, cid] = await Promise.all([
      this.uploadToCloudinary(file),
      this.uploadToPinata(file.buffer, file.originalname),
    ]);

    return {
      fileName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      url: cloudinaryRes.url,
      thumbnailUrl: cloudinaryRes.thumbnailUrl,
      cid,
    };
  }

  static async uploadLegalDocumentToIPFS(
    file: Express.Multer.File
  ): Promise<{ cid: string; url: string; fileName: string }> {
    // 1. Chỉ đẩy duy nhất lên IPFS/Pinata
    const cid = await this.uploadToPinata(file.buffer, file.originalname);

    // 2. Tạo đường dẫn xem trực tiếp từ IPFS Gateway
    const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;

    return {
      cid,
      url: gatewayUrl,
      fileName: file.originalname,
    };
  }
}
