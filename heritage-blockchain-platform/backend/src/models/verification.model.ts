import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Relation } from 'typeorm';
import { Heritage } from './heritage.model.js';
import { Expert } from './expert.model.js';
import { VerificationStatus } from '../types/enums/verification.enum.js';

@Entity({ name: 'verifications' })
export class Verification {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'uuid' })
  heritageId: string;

  @Column({ type: 'uuid', nullable: true })
  expertId?: string;

  @Column({ type: 'enum', enum: VerificationStatus, default: VerificationStatus.PENDING })
  status: VerificationStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => Heritage, heritage => heritage.verifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'heritageId' })
  heritage: Relation<Heritage>;

  @ManyToOne(() => Expert)
  @JoinColumn({ name: 'expertId' })
  expert: Relation<Expert>;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
