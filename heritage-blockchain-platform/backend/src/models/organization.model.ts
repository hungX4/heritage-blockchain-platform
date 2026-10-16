import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Relation } from 'typeorm';
import { User } from './user.model.js';
import { RequestStatus } from '../types/enums/organization.enum.js';
@Entity({ name: 'organizations' })
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @OneToMany(() => User, user => user.organization)
  users: Relation<User>[];

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus;

  @Column({ type: 'varchar', unique: true })
  contactEmail: string;

  @Column({ type: 'simple-array' }) // Lưu URL file ảnh/PDF minh chứng
  legalDocumentUrls: string[];

  @Column({ type: 'uuid', nullable: false })
  requesterId: string

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

