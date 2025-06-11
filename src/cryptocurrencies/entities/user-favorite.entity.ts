// src/cryptocurrencies/entities/user-favorite.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Cryptocurrency } from './cryptocurrency.entity';

@Entity('user_favorites')
@Unique(['user_id', 'cryptocurrency_id'])
@Index(['user_id'])
@Index(['cryptocurrency_id'])
export class UserFavorite {
  @ApiProperty({
    description: 'Unique identifier for the favorite record',
    example: '1',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'User ID who favorited',
    example: 123,
  })
  @Column()
  user_id: number;

  @ApiProperty({
    description: 'Cryptocurrency ID that was favorited',
    example: 1,
  })
  @Column()
  cryptocurrency_id: number;

  @ApiProperty({
    description: 'Custom notes from user',
    example: 'Long term hold, buy more under $40k',
  })
  @Column('text', { nullable: true })
  notes: string;

  @ApiProperty({
    description: 'Custom tags from user',
    example: ['long-term', 'hodl', 'portfolio'],
  })
  @Column('simple-array', { nullable: true })
  tags: string[];

  @ApiProperty({
    description: 'Price when favorited',
    example: 43250.50,
  })
  @Column('decimal', { precision: 20, scale: 8, nullable: true })
  price_when_added: number;

  @ApiProperty({
    description: 'When this crypto was favorited',
    example: '2024-01-15T10:30:00.000Z',
  })
  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Cryptocurrency, (crypto) => crypto.user_favorites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cryptocurrency_id' })
  cryptocurrency: Cryptocurrency;
}

// src/cryptocurrencies/entities/price-alert.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

export enum AlertType {
  PRICE_ABOVE = 'price_above',
  PRICE_BELOW = 'price_below',
  PRICE_CHANGE_PERCENTAGE = 'price_change_percentage',
  VOLUME_SPIKE = 'volume_spike',
  MARKET_CAP_CHANGE = 'market_cap_change',
}

export enum AlertStatus {
  ACTIVE = 'active',
  TRIGGERED = 'triggered',
  PAUSED = 'paused',
  EXPIRED = 'expired',
}

export enum NotificationMethod {
  EMAIL = 'email',
  PUSH = 'push',
  WEBHOOK = 'webhook',
}

@Entity('price_alerts')
@Index(['user_id', 'status'])
@Index(['cryptocurrency_id', 'status'])
@Index(['alert_type', 'status'])
export class PriceAlert {
  @ApiProperty({
    description: 'Unique identifier for the alert',
    example: '1',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'User ID who created the alert',
    example: 123,
  })
  @Column()
  user_id: number;

  @ApiProperty({
    description: 'Cryptocurrency ID for the alert',
    example: 1,
  })
  @Column()
  cryptocurrency_id: number;

  @ApiProperty({
    description: 'Type of alert',
    enum: AlertType,
    example: AlertType.PRICE_ABOVE,
  })
  @Column({
    type: 'enum',
    enum: AlertType,
  })
  alert_type: AlertType;

  @ApiProperty({
    description: 'Target value for the alert',
    example: 50000,
  })
  @Column('decimal', { precision: 20, scale: 8 })
  target_value: number;

  @ApiProperty({
    description: 'Current status of the alert',
    enum: AlertStatus,
    example: AlertStatus.ACTIVE,
  })
  @Column({
    type: 'enum',
    enum: AlertStatus,
    default: AlertStatus.ACTIVE,
  })
  status: AlertStatus;

  @ApiProperty({
    description: 'Notification methods',
    enum: NotificationMethod,
    isArray: true,
    example: [NotificationMethod.EMAIL, NotificationMethod.PUSH],
  })
  @Column('simple-array')
  notification_methods: NotificationMethod[];

  @ApiProperty({
    description: 'Custom message for the alert',
    example: 'Bitcoin reached your target price!',
  })
  @Column('text', { nullable: true })
  custom_message: string;

  @ApiProperty({
    description: 'Alert expiration date',
    example: '2024-12-31T23:59:59.000Z',
  })
  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @ApiProperty({
    description: 'When the alert was triggered',
    example: '2024-01-20T15:45:00.000Z',
  })
  @Column({ type: 'timestamp', nullable: true })
  triggered_at: Date;

  @ApiProperty({
    description: 'Price when the alert was triggered',
    example: 50125.75,
  })
  @Column('decimal', { precision: 20, scale: 8, nullable: true })
  triggered_price: number;

  @ApiProperty({
    description: 'Number of times this alert has been triggered',
    example: 1,
  })
  @Column({ default: 0 })
  trigger_count: number;

  @ApiProperty({
    description: 'Whether to repeat the alert after trigger',
    example: false,
  })
  @Column({ default: false })
  is_repeatable: boolean;

  @ApiProperty({
    description: 'Additional configuration in JSON format',
    example: { webhook_url: 'https://api.example.com/webhook', cooldown_minutes: 60 },
  })
  @Column('jsonb', { nullable: true })
  config: Record<string, any>;

  @ApiProperty({
    description: 'Alert creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    description: 'Alert last update timestamp',
    example: '2024-01-20T15:45:00.000Z',
  })
  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Cryptocurrency, (crypto) => crypto.price_alerts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cryptocurrency_id' })
  cryptocurrency: Cryptocurrency;

  // Helper methods
  isExpired(): boolean {
    return this.expires_at && new Date() > this.expires_at;
  }

  canTrigger(): boolean {
    return this.status === AlertStatus.ACTIVE && !this.isExpired();
  }

  shouldTrigger(currentPrice: number): boolean {
    if (!this.canTrigger()) return false;

    switch (this.alert_type) {
      case AlertType.PRICE_ABOVE:
        return currentPrice >= this.target_value;
      case AlertType.PRICE_BELOW:
        return currentPrice <= this.target_value;
      default: