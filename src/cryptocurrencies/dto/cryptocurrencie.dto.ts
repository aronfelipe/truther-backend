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

// src/cryptocurrencies/dto/create-cryptocurrency.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsUrl,
  IsArray,
  MinLength,
  MaxLength,
  IsBoolean,
  Min,
} from 'class-validator';

export class CreateCryptocurrencyDto {
  @ApiProperty({
    description: 'CoinGecko ID',
    example: 'bitcoin',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  coingecko_id: string;

  @ApiProperty({
    description: 'Cryptocurrency name',
    example: 'Bitcoin',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Cryptocurrency symbol',
    example: 'BTC',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  symbol: string;

  @ApiProperty({
    description: 'Current price in USD',
    example: 45000.50,
  })
  @IsNumber()
  @Min(0)
  current_price: number;

  @ApiPropertyOptional({
    description: 'Market capitalization in USD',
    example: 850000000000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  market_cap?: number;

  @ApiPropertyOptional({
    description: 'Market capitalization rank',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  market_cap_rank?: number;

  @ApiPropertyOptional({
    description: 'Total volume traded in 24h',
    example: 25000000000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  total_volume?: number;

  @ApiPropertyOptional({
    description: 'Logo image URL',
    example: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  })
  @IsOptional()
  @IsUrl()
  image?: string;

  @ApiPropertyOptional({
    description: 'Cryptocurrency description',
    example: 'Bitcoin is a decentralized cryptocurrency...',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Official website URL',
    example: 'https://bitcoin.org',
  })
  @IsOptional()
  @IsUrl()
  homepage?: string;

  @ApiPropertyOptional({
    description: 'Categories/tags',
    example: ['Layer 1', 'Store of Value'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({
    description: 'Whether the crypto is actively tracked',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;
}

// src/cryptocurrencies/dto/update-cryptocurrency.dto.ts
import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateCryptocurrencyDto } from './create-cryptocurrency.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateCryptocurrencyDto extends PartialType(CreateCryptocurrencyDto) {
  @ApiPropertyOptional({
    description: 'Force sync with external API after update',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  force_sync?: boolean = false;
}

// src/cryptocurrencies/dto/price-alert.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  IsBoolean,
  IsDateString,
  Min,
  MaxLength,
} from 'class-validator';
import {
  AlertType,
  NotificationMethod,
} from '../entities/price-alert.entity';

export class CreatePriceAlertDto {
  @ApiProperty({
    description: 'Cryptocurrency ID for the alert',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  cryptocurrency_id: number;

  @ApiProperty({
    description: 'Type of alert',
    enum: AlertType,
    example: AlertType.PRICE_ABOVE,
  })
  @IsEnum(AlertType)
  alert_type: AlertType;

  @ApiProperty({
    description: 'Target value for the alert',
    example: 50000,
  })
  @IsNumber()
  @Min(0)
  target_value: number;

  @ApiProperty({
    description: 'Notification methods',
    enum: NotificationMethod,
    isArray: true,
    example: [NotificationMethod.EMAIL],
  })
  @IsArray()
  @IsEnum(NotificationMethod, { each: true })
  notification_methods: NotificationMethod[];

  @ApiPropertyOptional({
    description: 'Custom message for the alert',
    example: 'Bitcoin reached your target price!',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  custom_message?: string;

  @ApiPropertyOptional({
    description: 'Alert expiration date (ISO string)',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  expires_at?: string;

  @ApiPropertyOptional({
    description: 'Whether to repeat the alert after trigger',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  is_repeatable?: boolean = false;

  @ApiPropertyOptional({
    description: 'Additional configuration',
    example: { cooldown_minutes: 60 },
  })
  @IsOptional()
  config?: Record<string, any>;
}

export class UpdatePriceAlertDto extends PartialType(CreatePriceAlertDto) {}

// src/cryptocurrencies/dto/analytics-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsIn,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class AnalyticsQueryDto {
  @ApiPropertyOptional({
    description: 'Time period for analytics',
    example: '24h',
    enum: ['1h', '24h', '7d', '30d', '90d', '1y'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['1h', '24h', '7d', '30d', '90d', '1y'])
  period?: string = '24h';

  @ApiPropertyOptional({
    description: 'Limit number of results',
    example: 10,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Include additional metrics',
    example: true,
  })
  @IsOptional()
  include_details?: boolean = false;
}

// src/cryptocurrencies/dto/favorite.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsArray,
  MaxLength,
} from 'class-validator';

export class AddFavoriteDto {
  @ApiPropertyOptional({
    description: 'Custom notes about this cryptocurrency',
    example: 'Long term hold, buy more under $40k',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Custom tags for organization',
    example: ['long-term', 'hodl', 'portfolio'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateFavoriteDto extends AddFavoriteDto {}