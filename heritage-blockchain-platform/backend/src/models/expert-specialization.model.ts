import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from "typeorm";
import { Expert } from "./expert.model.js";
import { Specialization } from "./specialization.model.js";

@Entity({ name: 'expert_specializations' })
export class ExpertSpecialization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  expertId: string;

  @Column({ type: 'uuid' })
  specializationId: string;

  @ManyToOne(() => Expert, expert => expert.specializationMappings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'expertId' })
  expert: Relation<Expert>;

  @ManyToOne(
    () => Specialization,
    specialization => specialization.expertMappings,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'specializationId' })
  specialization: Relation<Specialization>;
}
