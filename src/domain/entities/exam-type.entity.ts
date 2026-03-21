import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
} from 'typeorm';
import { Profession } from './profession.entity';
import { Sector } from './sector.entity';
import { User } from '../../users/entities/user.entity';

@Entity('exam_types')
export class ExamType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'icon_url' })
  iconUrl: string | null;

  @Column({ type: 'integer', default: 0, name: 'display_order' })
  displayOrder: number;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'uuid', name: 'sector_id' })
  sectorId: string;

  @ManyToOne(() => Sector, (sector) => sector.examTypes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sector_id' })
  sector: Sector;

  @Column({ type: 'uuid', name: 'profession_id', nullable: true })
  professionId: string | null;

  @ManyToOne(() => Profession, (profession) => profession.examTypes, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'profession_id' })
  profession: Profession;

  @ManyToMany(() => User, (user) => user.examTypes)
  users: User[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
