import { Test, TestingModule } from '@nestjs/testing';
import { CryptocurrenciesService } from './cryptocurrencies.service';
import { Repository } from 'typeorm';
import { Crypto } from './entities/crypto.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

describe('CryptocurrenciesService', () => {
  let service: CryptocurrenciesService;
  let repo: Repository<Crypto>;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptocurrenciesService,
        {
          provide: getRepositoryToken(Crypto),
          useClass: Repository,
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CryptocurrenciesService>(CryptocurrenciesService);
    repo = module.get<Repository<Crypto>>(getRepositoryToken(Crypto));
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all cryptos', async () => {
      const mockCryptos = [{ id: 1, name: 'Bitcoin' }] as Crypto[];
      jest.spyOn(repo, 'find').mockResolvedValue(mockCryptos);
      const result = await service.findAll();
      expect(result).toEqual(mockCryptos);
    });
  });

  describe('findBySymbolOrName', () => {
    it('should find cryptos by symbol or name', async () => {
      const mockCryptos = [{ id: 1, name: 'Bitcoin', symbol: 'btc' }] as Crypto[];
      jest.spyOn(repo, 'find').mockResolvedValue(mockCryptos);
      const result = await service.findBySymbolOrName('btc');
      expect(result).toEqual(mockCryptos);
    });
  });

  describe('syncCryptos', () => {
    it('should fetch and sync cryptos', async () => {
      const mockApiResponse = {
        data: [
          {
            name: 'Bitcoin',
            symbol: 'btc',
            market_cap: 1000000,
            price_change_percentage_24h_in_currency: 1.5,
            price_change_percentage_7d_in_currency: 10,
            ath: 60000,
            atl: 3000,
            current_price: 45000,
          },
        ],
      };

      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(mockApiResponse));
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);
      jest.spyOn(repo, 'create').mockImplementation(data => data as Crypto);
      jest.spyOn(repo, 'save').mockResolvedValue(mockApiResponse.data[0] as Crypto);

      await expect(service.syncCryptos()).resolves.not.toThrow();
    });
  });
});
