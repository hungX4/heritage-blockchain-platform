import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Relation } from 'typeorm';
import { UserRole } from '../types/enums/rbac.js';
import { Organization } from './organization.model.js';
import { Heritage } from './heritage.model.js';
@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  organizationId?: string | null;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  passwordHash: string;

  @Column({ type: 'varchar' })
  fullName: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @ManyToOne(() => Organization, org => org.users, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'organizationId' })
  organization: Relation<Organization>;

  @OneToMany(() => Heritage, heritage => heritage.creator)
  createdHeritages: Relation<Heritage>[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

