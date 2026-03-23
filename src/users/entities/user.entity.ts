import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import {
  SubscriptionTier,
  SubscriptionStatus,
} from '../../common/enums/subscription.enum';
import { Role } from '../../common/decorators/roles.decorator';
import { ProfessionCode } from '../../common/enums/profession.enum';
import { ExamTypeCode } from '../../common/enums/exam-type.enum';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['subscriptionTier'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 100, name: 'first_name' })
  firstName: string;

  @Column({ type: 'varchar', length: 100, name: 'last_name' })
  lastName: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'avatar_url' })
  avatarUrl: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'date', nullable: true, name: 'date_of_birth' })
  dateOfBirth: Date | null;

  @Column({
    type: 'enum',
    enum: ProfessionCode,
    nullable: true,
    name: 'profession',
  })
  profession: ProfessionCode | null;

  @Column({
    type: 'enum',
    enum: ExamTypeCode,
    array: true,
    name: 'exam_types',
  })
  examTypes: ExamTypeCode[];

  @Column({
    type: 'enum',
    enum: SubscriptionTier,
    default: SubscriptionTier.FREE,
    name: 'subscription_tier',
  })
  subscriptionTier: SubscriptionTier;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
    name: 'subscription_status',
  })
  subscriptionStatus: SubscriptionStatus;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'subscription_expires_at',
  })
  subscriptionExpiresAt: Date | null;

  @Column({ type: 'boolean', default: false, name: 'is_admin' })
  isAdmin: boolean;

  @Column({ type: 'boolean', default: false, name: 'email_verified' })
  emailVerified: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  get role(): Role {
    return this.isAdmin ? Role.ADMIN : Role.USER;
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
