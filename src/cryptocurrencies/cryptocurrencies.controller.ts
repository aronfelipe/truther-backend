import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth.guard';
import { CryptocurrenciesService } from './cryptocurrencies.service';

@Controller('cryptos')
@UseGuards(JwtAuthGuard)
export class CryptocurrenciesController {
  constructor(private readonly service: CryptocurrenciesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('search')
  search(@Query('q') query: string) {
    return this.service.findBySymbolOrName(query);
  }
}
