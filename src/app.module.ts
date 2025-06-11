import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WinstonModule } from 'nest-winston';
import * as redisStore from 'cache-manager-redis-store';

import { databaseConfig } from './config/database.config';
import { appConfig } from './config/app.config';
import { jwtConfig } from './config/jwt.config';
import { redisConfig } from './config/redis.config';
import { winstonConfig } from './config/winston.config';
import { validationSchema } from './config/validation.schema';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CryptocurrenciesModule } from './cryptocurrencies/cryptocurrencies.module';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, redisConfig],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),

    // Logging
    WinstonModule.forRootAsync({
      useFactory: winstonConfig,
    }),

    // Database
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
    }),

    // Cache
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: (config) => ({
        store: redisStore,
        host: config.get('REDIS_HOST'),
        port: config.get('REDIS_PORT'),
        ttl: config.get('CACHE_TTL', 300),
        max: config.get('CACHE_MAX_ITEMS', 100),
      }),
      inject: [ConfigModule],
    }),

    // Queue
    BullModule.forRootAsync({
      useFactory: (config) => ({
        redis: {
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
        },
      }),
      inject: [ConfigModule],
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      useFactory: (config) => ({
        ttl: config.get('THROTTLE_TTL', 60),
        limit: config.get('THROTTLE_LIMIT', 100),
      }),
      inject: [ConfigModule],
    }),

    // Scheduling
    ScheduleModule.forRoot(),

    // Event emitter
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    CryptocurrenciesModule,
    HealthModule,
    MetricsModule,
  ],
})
export class AppModule {}