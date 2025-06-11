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
