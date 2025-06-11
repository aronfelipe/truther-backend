import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like, Between, In } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Cryptocurrency } from './entities/cryptocurrency.entity';
import {
  GetCryptocurrenciesQueryDto,
  CryptocurrencyResponseDto,
  PaginatedCryptocurrencyResponseDto,
  CryptocurrencyStatsDto,
  TopGainersLosersDto,
  SortBy,
  SortOrder,
  SyncStatusDto,
} from './dto/cryptocurrency.dto';

@Injectable()
export class CryptocurrencyService implements OnModuleInit {
  private readonly logger = new Logger(CryptocurrencyService.name);
  private isSyncing = false;
  private lastSyncDate: Date;
  private syncErrors = 0;
  private readonly COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
  private readonly DEFAULT_COINS_LIMIT = 250; // Increased for better coverage
  private readonly RATE_LIMIT_DELAY = 1100; // CoinGecko free tier: ~60 calls/min
  
  constructor(
    @InjectRepository(Cryptocurrency)
    private readonly cryptoRepository: Repository<Cryptocurrency>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.logger.log('Cryptocurrency Service initialized');
    // Initial sync on startup
    setTimeout(() => this.syncCryptocurrencies(), 5000);
  }

  /**
   * Get cryptocurrencies with advanced filtering and pagination
   */
  async findAll(
    query: GetCryptocurrenciesQueryDto,
  ): Promise<PaginatedCryptocurrencyResponseDto> {
    try {
      const {
        q,
        page = 1,
        limit = 10,
        sortBy = SortBy.MARKET_CAP_RANK,
        sortOrder = SortOrder.ASC,
        onlyActive = true,
        minRank,
        maxRank,
        minPriceChange24h,
        maxPriceChange24h,
      } = query;

      const whereConditions: any = {};
      
      if (onlyActive) {
        whereConditions.is_active = true;
      }

      if (q) {
        whereConditions = {
          ...whereConditions,
          $or: [
            { name: Like(`%${q}%`) },
            { symbol: Like(`%${q.toUpperCase()}%`) },
            { coingecko_id: Like(`%${q}%`) },
          ],
        };
      }

      if (minRank && maxRank) {
        whereConditions.market_cap_rank = Between(minRank, maxRank);
      } else if (minRank) {
        whereConditions.market_cap_rank = Between(minRank, 10000);
      } else if (maxRank) {
        whereConditions.market_cap_rank = Between(1, maxRank);
      }

      if (minPriceChange24h !== undefined && maxPriceChange24h !== undefined) {
        whereConditions.price_change_percentage_24h = Between(
          minPriceChange24h,
          maxPriceChange24h,
        );
      } else if (minPriceChange24h !== undefined) {
        whereConditions.price_change_percentage_24h = Between(
          minPriceChange24h,
          1000,
        );
      } else if (maxPriceChange24h !== undefined) {
        whereConditions.price_change_percentage_24h = Between(
          -1000,
          maxPriceChange24h,
        );
      }

      const findOptions: FindManyOptions<Cryptocurrency> = {
        where: whereConditions,
        skip: (page - 1) * limit,
        take: limit,
        order: { [sortBy]: sortOrder },
      };

      const [cryptocurrencies, total] = await this.cryptoRepository.findAndCount(
        findOptions,
      );

      const totalPages = Math.ceil(total / limit);

      return {
        data: cryptocurrencies.map(this.transformToResponseDto),
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      this.logger.error('Error finding cryptocurrencies:', error);
      throw new HttpException(
        'Failed to fetch cryptocurrencies',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get cryptocurrency by ID
   */
  async findOne(id: string): Promise<CryptocurrencyResponseDto> {
    try {
      const cryptocurrency = await this.cryptoRepository.findOne({
        where: { id },
      });

      if (!cryptocurrency) {
        throw new HttpException(
          'Cryptocurrency not found',
          HttpStatus.NOT_FOUND,
        );
      }

      return this.transformToResponseDto(cryptocurrency);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Error finding cryptocurrency:', error);
      throw new HttpException(
        'Failed to fetch cryptocurrency',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get cryptocurrency by CoinGecko ID
   */
  async findByCoingeckoId(coingeckoId: string): Promise<CryptocurrencyResponseDto> {
    try {
      const cryptocurrency = await this.cryptoRepository.findOne({
        where: { coingecko_id: coingeckoId },
      });

      if (!cryptocurrency) {
        throw new HttpException(
          'Cryptocurrency not found',
          HttpStatus.NOT_FOUND,
        );
      }

      return this.transformToResponseDto(cryptocurrency);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Error finding cryptocurrency by CoinGecko ID:', error);
      throw new HttpException(
        'Failed to fetch cryptocurrency',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get market statistics
   */
  async getMarketStats(): Promise<CryptocurrencyStatsDto> {
    try {
      const [totalCount, totalMarketCap, totalVolume, avgPriceChange] =
        await Promise.all([
          this.cryptoRepository.count({ where: { is_active: true } }),
          this.cryptoRepository
            .createQueryBuilder('crypto')
            .select('SUM(crypto.market_cap)', 'total')
            .where('crypto.is_active = :active', { active: true })
            .getRawOne()
            .then(result => Number(result.total) || 0),
          this.cryptoRepository
            .createQueryBuilder('crypto')
            .select('SUM(crypto.total_volume)', 'total')
            .where('crypto.is_active = :active', { active: true })
            .getRawOne()
            .then(result => Number(result.total) || 0),
          this.cryptoRepository
            .createQueryBuilder('crypto')
            .select('AVG(crypto.price_change_percentage_24h)', 'avg')
            .where('crypto.is_active = :active', { active: true })
            .getRawOne()
            .then(result => Number(result.avg) || 0),
        ]);

      const [bitcoin, ethereum] = await Promise.all([
        this.cryptoRepository.findOne({
          where: { symbol: 'btc', is_active: true },
        }),
        this.cryptoRepository.findOne({
          where: { symbol: 'eth', is_active: true },
        }),
      ]);

      const bitcoinDominance = bitcoin
        ? (Number(bitcoin.market_cap) / totalMarketCap) * 100
        : 0;
      const ethereumDominance = ethereum
        ? (Number(ethereum.market_cap) / totalMarketCap) * 100
        : 0;

      const [positiveCount, negativeCount] = await Promise.all([
        this.cryptoRepository.count({
          where: {
            is_active: true,
            price_change_percentage_24h: Between(0, 1000),
          },
        }),
        this.cryptoRepository.count({
          where: {
            is_active: true,
            price_change_percentage_24h: Between(-1000, 0),
          },
        }),
      ]);

      return {
        total_cryptocurrencies: totalCount,
        total_market_cap: totalMarketCap,
        total_volume_24h: totalVolume,
        bitcoin_dominance: Number(bitcoinDominance.toFixed(2)),
        ethereum_dominance: Number(ethereumDominance.toFixed(2)),
        average_price_change_24h: Number(avgPriceChange.toFixed(2)),
        positive_coins_count: positiveCount,
        negative_coins_count: negativeCount,
        last_updated: this.lastSyncDate || new Date(),
      };
    } catch (error) {
      this.logger.error('Error getting market stats:', error);
      throw new HttpException(
        'Failed to fetch market statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get top gainers, losers, and most volatile coins
   */
  async getTopGainersLosers(): Promise<TopGainersLosersDto> {
    try {
      const [topGainers, topLosers, mostVolatile] = await Promise.all([
        this.cryptoRepository.find({
          where: { is_active: true },
          order: { price_change_percentage_24h: 'DESC' },
          take: 10,
        }),
        this.cryptoRepository.find({
          where: { is_active: true },
          order: { price_change_percentage_24h: 'ASC' },
          take: 10,
        }),
        this.cryptoRepository
          .createQueryBuilder('crypto')
          .where('crypto.is_active = :active', { active: true })
          .andWhere('crypto.high_24h IS NOT NULL')
          .andWhere('crypto.low_24h IS NOT NULL')
          .andWhere('crypto.current_price > 0')
          .orderBy(
            '((crypto.high_24h - crypto.low_24h) / crypto.current_price) * 100',
            'DESC',
          )
          .limit(10)
          .getMany(),
      ]);

      return {
        top_gainers: topGainers.map(this.transformToResponseDto),
        top_losers: topLosers.map(this.transformToResponseDto),
        most_volatile: mostVolatile.map(this.transformToResponseDto),
      };
    } catch (error) {
      this.logger.error('Error getting top gainers/losers:', error);
      throw new HttpException(
        'Failed to fetch top gainers/losers',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Compare multiple cryptocurrencies
   */
  async compare(symbols: string[]): Promise<CryptocurrencyResponseDto[]> {
    try {
      const upperSymbols = symbols.map(s => s.toUpperCase());
      const cryptocurrencies = await this.cryptoRepository.find({
        where: {
          symbol: In(upperSymbols),
          is_active: true,
        },
        order: { market_cap_rank: 'ASC' },
      });

      if (cryptocurrencies.length === 0) {
        throw new HttpException(
          'No cryptocurrencies found for the provided symbols',
          HttpStatus.NOT_FOUND,
        );
      }

      return cryptocurrencies.map(this.transformToResponseDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Error comparing cryptocurrencies:', error);
      throw new HttpException(
        'Failed to compare cryptocurrencies',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get sync status information
   */
  async getSyncStatus(): Promise<SyncStatusDto> {
    const nextSync = new Date();
    nextSync.setHours(nextSync.getHours() + 1);

    return {
      is_syncing: this.isSyncing,
      last_sync: this.lastSyncDate || new Date(),
      next_sync: nextSync,
      total_coins_synced: await this.cryptoRepository.count(),
      sync_errors: this.syncErrors,
      data_source: 'CoinGecko API',
    };
  }

  /**
   * Manual sync trigger (admin only)
   */
  async triggerSync(): Promise<{ message: string; sync_started: boolean }> {
    if (this.isSyncing) {
      return {
        message: 'Sync is already in progress',
        sync_started: false,
      };
    }

    // Trigger sync in background
    this.syncCryptocurrencies();

    return {
      message: 'Cryptocurrency sync started',
      sync_started: true,
    };
  }

  /**
   * Scheduled sync job - runs every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async syncCryptocurrencies(): Promise<void> {
    if (this.isSyncing) {
      this.logger.warn('Sync already in progress, skipping...');
      return;
    }

    this.isSyncing = true;
    this.logger.log('Starting cryptocurrency sync...');

    try {
      await this.fetchAndUpdateCryptocurrencies();
      this.lastSyncDate = new Date();
      this.syncErrors = 0;
      this.logger.log('Cryptocurrency sync completed successfully');
    } catch (error) {
      this.syncErrors++;
      this.logger.error('Error during cryptocurrency sync:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Fetch data from CoinGecko and update database
   */
  private async fetchAndUpdateCryptocurrencies(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.