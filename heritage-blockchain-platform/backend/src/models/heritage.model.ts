import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Relation } from 'typeorm';
import { User } from './user.model.js';
import { HeritageVersion } from './heritage-version.model.js';
import { Verification } from './verification.model.js';
import { BlockchainRecord } from './blockchain-record.model.js';
import { HeritageStatus } from '../types/enums/heritage.enum.js';
import { HeritageField } from './heritage-fields.model.js';
import { LocationItem } from '../types/interface/heritage.js';
import { HeritageMedia } from './heritage-media.model.js';

@Entity({ name: 'heritages' })
export class Heritage {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'varchar', unique: true })
  heritageCode: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'uuid' })
  fieldId: string;

  @ManyToOne(() => HeritageField, field => field.heritages)
  @JoinColumn({ name: 'fieldId' })
  field: Relation<HeritageField>

  @Column({ type: 'json' })
  location: LocationItem[];

  @Column({ type: 'varchar' })
  source: string;

  @Column({ type: 'varchar' })
  sourceOrganization: string;

  // Số hiệu quyết định / Căn cứ pháp lý (VD: "2684/QĐ-BVHTTDL")
  @Column({ type: 'varchar', nullable: true })
  sourceDocumentNumber?: string;

  // Link tham khảo trên Internet (Tùy chọn)
  @Column({ type: 'varchar', nullable: true })
  sourceUrl?: string;

  // Mã CID của tệp PDF scan quyết định gốc lưu trên IPFS (Bắt buộc cho Phase 5)
  @Column({ type: 'varchar', nullable: true })
  sourceDocumentCid?: string;

  // Ngày/năm chính thức được công nhận/ghi danh
  @Column({ type: 'date', nullable: true })
  recognizedAt?: Date;

  @Column({ type: 'enum', enum: HeritageStatus, default: HeritageStatus.DRAFT })
  status: HeritageStatus;

  @Column({ type: 'uuid', nullable: true })
  createdBy?: string;

  @ManyToOne(() => User, user => user.createdHeritages, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdBy' })
  creator: Relation<User>;

  @OneToMany(() => HeritageMedia, media => media.heritage,)
  media: Relation<HeritageMedia[]>;

  @OneToMany(() => HeritageVersion, version => version.heritage)
  versions: Relation<HeritageVersion>[];

  @OneToMany(() => Verification, verification => verification.heritage)
  verifications: Relation<Verification>[];

  @OneToMany(() => BlockchainRecord, record => record.heritage)
  blockchainRecords: Relation<BlockchainRecord>[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
