import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('users')
@Index(['email'], { unique: true })
@Index(['createdAt'])
@Index(['role'])
@Index(['status'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  emailVerifiedAt?: Date;

  @Column({ nullable: true })
  @Exclude()
  refreshToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  @Exclude()
  refreshTokenExpiresAt?: Date;

  @Column({ nullable: true })
  @Exclude()
  resetPasswordToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  @Exclude()
  resetPasswordExpiresAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  async comparePassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.password);
  }

  isActive(): boolean {
    return this.status === UserStatus.ACTIVE && !this.deletedAt;
  }

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  updateLastLogin(): void {
    this.lastLoginAt = new Date();
  }

  verifyEmail(): void {
    this.emailVerifiedAt = new Date();
  }

  isEmailVerified(): boolean {
    return !!this.emailVerifiedAt;
  }

  setRefreshToken(token: string, expiresIn: number): void {
    this.refreshToken = token;
    this.refreshTokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
  }

  clearRefreshToken(): void {
    this.refreshToken = null;
    this.refreshTokenExpiresAt = null;
  }

  setResetPasswordToken(token: string, expiresIn: number): void {
    this.resetPasswordToken = token;
    this.resetPasswordExpiresAt = new Date(Date.now() + expiresIn * 1000);
  }

  clearResetPasswordToken(): void {
    this.resetPasswordToken = null;
    this.resetPasswordExpiresAt = null;
  }

  isResetPasswordTokenValid(): boolean {
    return (
      !!this.resetPasswordToken &&
      !!this.resetPasswordExpiresAt &&
      this.resetPasswordExpiresAt > new Date()
    );
  }

  suspend(): void {
    this.status = UserStatus.SUSPENDED;
  }

  activate(): void {
    this.status = UserStatus.ACTIVE;
  }

  deactivate(): void {
    this.status = UserStatus.INACTIVE;
  }
}