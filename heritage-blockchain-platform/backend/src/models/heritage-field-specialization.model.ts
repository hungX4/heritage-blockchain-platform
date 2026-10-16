import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from "typeorm";
import { HeritageField } from "./heritage-fields.model.js";
import { Specialization } from "./specialization.model.js";

@Entity('heritage_field_specializations')
export class HeritageFieldSpecialization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  fieldId: string;

  @Column({ type: 'uuid' })
  specializationId: string;

  @ManyToOne(
    () => HeritageField,
    field => field.specializationMappings,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'fieldId' })
  field: Relation<HeritageField>;

  @ManyToOne(
    () => Specialization,
    specialization => specialization.fieldMappings,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'specializationId' })
  specialization: Relation<Specialization>;
}
