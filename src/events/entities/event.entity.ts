import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { EventRegistration } from './event-registration.entity';

export enum EventType {
  ZOOM = 'zoom',
  PHYSICAL = 'physical',
}

@Entity('events')
@Index(['eventType'])
@Index(['eventDate'])
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: EventType,
    name: 'event_type',
  })
  eventType: EventType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp', name: 'event_date' })
  eventDate: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'zoom_link' })
  zoomLink: string;

  @Column({ type: 'integer', default: 0, name: 'max_attendees' })
  maxAttendees: number;

  @Column({ type: 'integer', default: 0, name: 'registered_count' })
  registeredCount: number;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => EventRegistration, (registration) => registration.event)
  registrations: EventRegistration[];
}
