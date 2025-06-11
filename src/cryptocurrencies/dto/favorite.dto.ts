// src/cryptocurrencies/dto/crypto-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  IsIn,
  IsArray,
  ArrayMaxSize,
} from 'class-validator';

export class CryptoQueryDto {
  @ApiPropertyOptional({
    description: 'Search term for name or symbol',
    example: 'bitcoin',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by categories',
    example: ['layer-1', 'store-of-value'],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({
    description: 'Minimum market cap rank',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  min_rank?: number;

  @ApiPropertyOptional({
    description: 'Maximum market cap rank',
    example: 100,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  max_rank?: number;

  @ApiPropertyOptional({
    description: 'Minimum price in USD',
    example: 0.01,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_price?: number;

  @ApiPropertyOptional({
    description: 'Maximum price in USD',
    example: 100000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max_price?: number;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'market_cap_rank',
    enum: [
      'market_cap_rank',
      'current_price',
      'market_cap',
      'total_volume',
      'price_change_percentage_24h',
      'price_change_percentage_7d',
      'name',
      'symbol',
      'created_at',
    ],
  })
  @IsOptional()
  @IsString()
  @IsIn([
    'market_cap_rank',
    'current_price',
    'market_cap',
    'total_volume',
    'price_change_percentage_24h',
    'price_change_percentage_7d',
    'name',
    'symbol',
    'created_at',
  ])
  sort_by?: string = 'market_cap_rank';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'asc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'asc';

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Include only active cryptocurrencies',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  active_only?: boolean = true;

  @ApiPropertyOptional({
    description: 'Include user-specific data (favorites, alerts)',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  include_user_data?: boolean = false;
}