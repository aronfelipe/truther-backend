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
