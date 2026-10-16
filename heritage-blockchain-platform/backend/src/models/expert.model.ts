import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from "typeorm";
import { User } from "./user.model.js";
import { ExpertSpecialization } from "./expert-specialization.model.js";

@Entity('experts')
export class Expert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;

  @OneToMany(
    () => ExpertSpecialization,
    relation => relation.expert,
  )
  specializationMappings: Relation<ExpertSpecialization[]>;
}
