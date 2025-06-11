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