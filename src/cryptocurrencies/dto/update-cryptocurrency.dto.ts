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