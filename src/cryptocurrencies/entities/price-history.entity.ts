// src/cryptocurrencies/entities/price-history.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Cryptocurrency } from './cryptocurrency.entity';

export enum PriceInterval {
  MINUTE_5 = '5m',
  MINUTE_15 = '15m',
  MINUTE_30 = '30m',
  HOUR_1 = '1h',
  HOUR_4 = '4h',
  HOUR_12 = '12h',
  DAY_1 = '1d',
  WEEK_1 = '1w',
  MONTH_1 = '1M',
}

@Entity('price_history')
@Index(['cryptocurrency_id', 'timestamp'])
@Index(['cryptocurrency_id', 'interval', 'timestamp'])
@Index(['timestamp'])
export class PriceHistory {
  @ApiProperty({
    description: 'Unique identifier for the price record',
    example: '1',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Reference to cryptocurrency',
    example: 1,
  })
  @Column()
  cryptocurrency_id: number;

  @ApiProperty({
    description: 'Price at this timestamp',
    example: 45250.75,
  })
  @Column('decimal', { precision: 20, scale: 8 })
  price: number;

  @ApiProperty({
    description: 'Market capitalization at this timestamp',
    example: 850000000000,
  })
  @Column('bigint', { nullable: true })
  market_cap: number;

  @ApiProperty({
    description: 'Trading volume at this timestamp',
    example: 25000000000,
  })
  @Column('bigint', { nullable: true })
  volume: number;

  @ApiProperty({
    description: 'Time interval for this data point',
    enum: PriceInterval,
    example: PriceInterval.HOUR_1,
  })
  @Column({
    type: 'enum',
    enum: PriceInterval,
    default: PriceInterval.HOUR_1,
  })
  interval: PriceInterval;

  @ApiProperty({
    description: 'Timestamp of this price point',
    example: '2024-01-15T10:30:00.000Z',
  })
  @Column({ type: 'timestamp' })
  timestamp: Date;

  @ApiProperty({
    description: 'OHLC - Opening price for the interval',
    example: 45100.25,
  })
  @Column('decimal', { precision: 20, scale: 8, nullable: true })
  open: number;

  @ApiProperty({
    description: 'OHLC - Highest price for the interval',
    example: 45350.80,
  })
  @Column('decimal', { precision: 20, scale: 8, nullable: true })
  high: number;

  @ApiProperty({
    description: 'OHLC - Lowest price for the interval',
    example: 45050.10,
  })
  @Column('decimal', { precision: 20, scale: 8, nullable: true })
  low: number;

  @ApiProperty({
    description: 'OHLC - Closing price for the interval',
    example: 45250.75,
  })
  @Column('decimal', { precision: 20, scale: 8, nullable: true })
  close: number;

  @ApiProperty({
    description: 'Additional metadata in JSON format',
    example: { source: 'coingecko', confidence: 0.95 },
  })
  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @ApiProperty({
    description: 'Record creation timestamp',
    example: '2024-01-15T10:31:00.000Z',
  })
  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Cryptocurrency, (crypto) => crypto.price_history, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cryptocurrency_id' })
  cryptocurrency: Cryptocurrency;

  // Computed properties
  get price_change(): number {
    if (!this.open || !this.close) return null;
    return this.close - this.open;
  }

  get price_change_percentage(): number {
    if (!this.open || !this.close) return null;
    return ((this.close - this.open) / this.open) * 100;
  }

  get volatility(): number {
    if (!this.high || !this.low || !this.close) return null;
    return ((this.high - this.low) / this.close) * 100;
  }
}