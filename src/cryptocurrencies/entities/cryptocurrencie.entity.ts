// src/cryptocurrencies/entities/cryptocurrency.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PriceHistory } from './price-history.entity';
import { UserFavorite } from './user-favorite.entity';
import { PriceAlert } from './price-alert.entity';

@Entity('cryptocurrencies')
@Index(['symbol'])
@Index(['name'])
@Index(['market_cap_rank'])
@Index(['created_at'])
export class Cryptocurrency {
  @ApiProperty({
    description: 'Unique identifier for the cryptocurrency',
    example: '1',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'CoinGecko ID',
    example: 'bitcoin',
  })
  @Column({ unique: true })
  @Index()
  coingecko_id: string;

  @ApiProperty({
    description: 'Cryptocurrency name',
    example: 'Bitcoin',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Cryptocurrency symbol',
    example: 'BTC',
  })
  @Column()
  symbol: string;

  @ApiProperty({
    description: 'Current price in USD',
    example: 45000.50,
  })
  @Column('decimal', { precision: 20, scale: 8 })
  current_price: number;

  @ApiProperty({
    description: 'Market capitalization in USD',
    example: 850000000000,
  })
  @Column('bigint', { nullable: true })
  market_cap: number;

  @ApiProperty({
    description: 'Market capitalization rank',
    example: 1,
  })
  @Column({ nullable: true })
  market_cap_rank: number;

  @ApiProperty({
    description: 'Total volume traded in 24h',
    example: 25000000000,
  })
  @Column('bigint', { nullable: true })
  total_volume: number;

  @ApiProperty({
    description: 'Price change in 24h',
    example: 1250.75,
  })
  @Column('decimal', { precision: 20, scale: 8, nullable: true })
  price_change_24h: number;

  @ApiProperty({
    description: 'Price change percentage in 24h',
    example: 2.85,
  })
  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  price_change_percentage_24h: number;

  @ApiProperty({
    description: 'Price change percentage in 7 days',
    example: 5.42,
  })
  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  price_change_percentage_7d: number;

  @ApiProperty({
    description: 'Price change percentage in 30 days',
    example: 12.75,
  })
  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  price_change_percentage_30d: number;

  @ApiProperty({
    description: 'Circulating supply',
    example: 19500000,
  })
  @Column('decimal', { precision: 30, scale: 8, nullable: true })
  circulating_supply: number;

  @ApiProperty({
    description: 'Total supply',
    example: 21000000,
  })
  @Column('decimal', { precision: 30, scale: 8, nullable: true })
  total_supply: number;

  @ApiProperty({
    description: 'Maximum supply',
    example: 21000000,
  })
  @Column('decimal', { precision: 30, scale: 8, nullable: true })
  max_supply: number;

  @ApiProperty({
    description: 'All time high price',
    example: 69000,
  })
  @Column('decimal', { precision: 20, scale: 8, nullable: true })
  ath: number;

  @ApiProperty({
    description: 'All time high date',
    example: '2021-11-10T14:24:11.849Z',
  })
  @Column({ type: 'timestamp', nullable: true })
  ath_date: Date;

  @ApiProperty({
    description: 'All time low price',
    example: 0.0432,
  })
  @Column('decimal', { precision: 20, scale: 8, nullable: true })
  atl: number;

  @ApiProperty({
    description: 'All time low date',
    example: '2013-07-05T00:00:00.000Z',
  })
  @Column({ type: 'timestamp', nullable: true })
  atl_date: Date;

  @ApiProperty({
    description: 'Logo image URL',
    example: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  })
  @Column({ nullable: true })
  image: string;

  @ApiProperty({
    description: 'Cryptocurrency description',
    example: 'Bitcoin is a decentralized cryptocurrency...',
  })
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty({
    description: 'Official website URL',
    example: 'https://bitcoin.org',
  })
  @Column({ nullable: true })
  homepage: string;

  @ApiProperty({
    description: 'Blockchain explorer URL',
    example: 'https://blockchair.com/bitcoin',
  })
  @Column({ nullable: true })
  blockchain_site: string;

  @ApiProperty({
    description: 'Categories/tags',
    example: ['Layer 1', 'Store of Value'],
  })
  @Column('simple-array', { nullable: true })
  categories: string[];

  @ApiProperty({
    description: 'Whether the crypto is actively tracked',
    example: true,
  })
  @Column({ default: true })
  is_active: boolean;

  @ApiProperty({
    description: 'Last successful sync with external API',
    example: '2024-01-15T10:30:00.000Z',
  })
  @Column({ type: 'timestamp', nullable: true })
  last_synced_at: Date;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => PriceHistory, (priceHistory) => priceHistory.cryptocurrency)
  price_history: PriceHistory[];

  @OneToMany(() => UserFavorite, (favorite) => favorite.cryptocurrency)
  user_favorites: UserFavorite[];

  @OneToMany(() => PriceAlert, (alert) => alert.cryptocurrency)
  price_alerts: PriceAlert[];

  // Virtual properties for API responses
  @ApiProperty({
    description: 'Number of users who favorited this crypto',
    example: 1250,
  })
  favorites_count?: number;

  @ApiProperty({
    description: 'Whether current user has favorited this crypto',
    example: true,
  })
  is_favorited?: boolean;

  @ApiProperty({
    description: 'Current user active alerts for this crypto',
    example: 2,
  })
  active_alerts_count?: number;

  // Computed properties
  get fully_diluted_valuation(): number {
    if (!this.current_price || !this.total_supply) return null;
    return this.current_price * this.total_supply;
  }

  get ath_change_percentage(): number {
    if (!this.current_price || !this.ath) return null;
    return ((this.current_price - this.ath) / this.ath) * 100;
  }

  get atl_change_percentage(): number {
    if (!this.current_price || !this.atl) return null;
    return ((this.current_price - this.atl) / this.atl) * 100;
  }
}