import { Test, TestingModule } from '@nestjs/testing';
import { CryptocurrenciesController } from './cryptocurrencies.controller';
import { CryptocurrenciesService } from './cryptocurrencies.service';

describe('CryptocurrenciesController', () => {
  let controller: CryptocurrenciesController;
  let service: CryptocurrenciesService;

  const mockCrypto = {
    id: 1,
    name: 'Bitcoin',
    symbol: 'btc',
    marketCap: 1000000,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CryptocurrenciesController],
      providers: [
        {
          provide: CryptocurrenciesService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([mockCrypto]),
            findBySymbolOrName: jest.fn().mockResolvedValue([mockCrypto]),
          },
        },
      ],
    }).compile();

    controller = module.get<CryptocurrenciesController>(CryptocurrenciesController);
    service = module.get<CryptocurrenciesService>(CryptocurrenciesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all cryptos', async () => {
    expect(await controller.findAll()).toEqual([mockCrypto]);
  });

  it('should search cryptos', async () => {
    expect(await controller.search('btc')).toEqual([mockCrypto]);
  });
});
