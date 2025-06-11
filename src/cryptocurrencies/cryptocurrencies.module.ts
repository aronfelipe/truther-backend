import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';

import { CryptocurrenciesController } from './cryptocurrencies.controller';
import { CryptocurrenciesService } from './cryptocurrencies.service'
import { Cryptocurrencie } from './entities/cryptocurrencie.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cryptocurrencie]),
    HttpModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [CryptocurrenciesController],
  providers: [CryptocurrenciesService],
})
export class CryptocurrenciesModule {}
