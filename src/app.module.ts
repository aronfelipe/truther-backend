import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { typeOrmConfigAsync } from './config/database.config';
import { UsersModule } from './users/users.module';
import { CryptocurrenciesModule } from './cryptocurrencies/cryptocurrencies.module';
import { AuthenticationModule } from './authentication/authentication.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    ScheduleModule.forRoot(),
    AuthenticationModule,
    UsersModule,
    CryptocurrenciesModule,
  ],
})
export class AppModule {}
