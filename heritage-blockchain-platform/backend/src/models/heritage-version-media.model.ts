import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from "typeorm";
import { MediaType } from "../types/enums/media.enum.js";
import { HeritageVersion } from "./heritage-version.model.js";

@Entity('heritage_version_media')
export class HeritageVersionMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  versionId: string;

  @Column({
    type: 'enum',
    enum: MediaType,
  })
  type: MediaType;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'varchar', nullable: true })
  cid?: string;

  @Column({ type: 'text', nullable: true })
  caption?: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  // 🟢 Các trường bổ sung thông tin file
  @Column({ type: 'varchar', length: 255, nullable: true })
  fileName?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  mimeType?: string; // VD: 'image/png', 'video/mp4', 'application/pdf'

  @Column({ type: 'bigint', nullable: true })
  fileSize?: number; // Dung lượng file tính bằng bytes

  @Column({ type: 'text', nullable: true })
  thumbnailUrl?: string; // Khung hình thumbnail cho Video hoặc file PDF/Doc

  // 🟢 Cột thời gian tạo & cập nhật
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => HeritageVersion, version => version.media, { onDelete: 'CASCADE' },)
  @JoinColumn({ name: 'versionId' })
  version: Relation<HeritageVersion>;
}
