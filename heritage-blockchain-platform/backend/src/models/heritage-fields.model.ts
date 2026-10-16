import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from "typeorm";
import { Heritage } from "./heritage.model.js";
import { HeritageFieldSpecialization } from "./heritage-field-specialization.model.js";

@Entity('heritage_fields')
export class HeritageField {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ type: 'varchar' })
  name: string;

  @OneToMany(() => Heritage, heritage => heritage.field)
  heritages: Relation<Heritage[]>;

  @OneToMany(
    () => HeritageFieldSpecialization,
    relation => relation.field,
  )
  specializationMappings: Relation<HeritageFieldSpecialization[]>;
}
