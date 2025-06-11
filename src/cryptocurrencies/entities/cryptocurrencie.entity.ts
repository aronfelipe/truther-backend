// src/cryptocurrencies/entities/crypto.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cryptocurrencies')
export class Cryptocurrencie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  symbol: string;

  @Column('decimal', { precision: 20, scale: 2 })
  marketCap: number;

  @Column('decimal', { precision: 10, scale: 2 })
  change24h: number;

  @Column('decimal', { precision: 10, scale: 2 })
  change7d: number;

  @Column('decimal', { precision: 20, scale: 2 })
  allTimeHigh: number;

  @Column('decimal', { precision: 20, scale: 2 })
  allTimeLow: number;

  @Column('decimal', { precision: 20, scale: 2 })
  currentPrice: number;
}
