import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from "typeorm";
import { MediaType } from "../types/enums/media.enum.js";
import { Heritage } from "./heritage.model.js";

@Entity('heritage_media')
export class HeritageMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  heritageId: string;

  @Column({
    type: 'enum',
    enum: MediaType,
  })
  type: MediaType;

  @Column({ type: 'text' })
  url?: string;

  @Column({ type: 'varchar', length: 255 })
  cid: string;

  @Column({ type: 'text', nullable: true })
  caption?: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  // 🟢 Thông tin file bổ sung
  @Column({ type: 'varchar', length: 255, nullable: true })
  fileName?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  mimeType?: string;

  @Column({ type: 'bigint', nullable: true })
  fileSize?: number;

  @Column({ type: 'text', nullable: true })
  thumbnailUrl?: string;

  // 🟢 Cột thời gian
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(
    () => Heritage,
    (heritage) => heritage.media,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'heritageId' })
  heritage: Relation<Heritage>;
}
