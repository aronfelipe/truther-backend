// src/cryptocurrencies/cryptocurrencies.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { Cron } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { Cryptocurrencie } from './entities/cryptocurrencie.entity';

@Injectable()
export class CryptocurrenciesService {
  private readonly logger = new Logger(CryptocurrenciesService.name);

  constructor(
    @InjectRepository(Cryptocurrencie) private repo: Repository<Cryptocurrencie>,
    private readonly http: HttpService,
  ) {}

  @Cron('0 * * * *')
  async syncCryptos() {
    this.logger.log('Sincronizando criptomoedas com CoinGecko...');
    const url = 'https://api.coingecko.com/api/v3/coins/markets';
    const params = {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: 10,
      page: 1,
      sparkline: false,
      price_change_percentage: '24h,7d',
    };

    const { data } = await firstValueFrom(this.http.get(url, { params }));

    for (const item of data) {
      const existing = await this.repo.findOne({
        where: { symbol: item.symbol },
      });

      const cryptoData = this.repo.create({
        name: item.name,
        symbol: item.symbol,
        marketCap: item.market_cap,
        change24h: item.price_change_percentage_24h_in_currency,
        change7d: item.price_change_percentage_7d_in_currency,
        allTimeHigh: item.ath,
        allTimeLow: item.atl,
        currentPrice: item.current_price,
      });

      if (existing) {
        await this.repo.update({ id: existing.id }, cryptoData);
      } else {
        await this.repo.save(cryptoData);
      }
    }

    this.logger.log('Sincronização completa.');
  }

  async findAll(): Promise<Cryptocurrencie[]> {
    return this.repo.find();
  }

  async findBySymbolOrName(search: string): Promise<Cryptocurrencie[]> {
    return this.repo.find({
      where: [
        { symbol: ILike(`%${search}%`) },
        { name: ILike(`%${search}%`) },
      ],
    });
  }
}
