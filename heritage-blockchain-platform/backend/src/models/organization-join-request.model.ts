import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Relation } from 'typeorm';
import { User } from './user.model.js';
import { Organization } from './organization.model.js';
import { RequestStatus } from '../types/enums/organization.enum.js';

@Entity({ name: 'organization_join_requests' })
export class OrganizationJoinRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Relation<Organization>;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
