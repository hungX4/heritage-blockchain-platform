import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from "typeorm";
import { ExpertSpecialization } from "./expert-specialization.model.js";
import { HeritageFieldSpecialization } from "./heritage-field-specialization.model.js";

@Entity('specializations')
export class Specialization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ type: 'varchar' })
  name: string;

  @OneToMany(
    () => ExpertSpecialization,
    relation => relation.specialization,
  )
  expertMappings: Relation<ExpertSpecialization[]>;

  @OneToMany(
    () => HeritageFieldSpecialization,
    relation => relation.specialization,
  )
  fieldMappings: Relation<HeritageFieldSpecialization[]>;
}
