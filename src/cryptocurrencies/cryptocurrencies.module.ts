import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { CryptocurrencyController } from './cryptocurrency.controller';
import { CryptocurrencyService } from './cryptocurrency.service';
import { Cryptocurrency } from './entities/cryptocurrency.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cryptocurrency]),
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
      retries: 3,
      retryDelay: (retryCount) => retryCount * 1000, // Exponential backoff
    }),
    CacheModule.register({
      ttl: 60, // Default TTL of 60 seconds
      max: 100, // Maximum number of items in cache
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [CryptocurrencyController],
  providers: [CryptocurrencyService],
  exports: [CryptocurrencyService, TypeOrmModule],
})
export class CryptocurrencyModule {}