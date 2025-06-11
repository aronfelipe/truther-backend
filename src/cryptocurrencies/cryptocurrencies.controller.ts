import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  UseInterceptors,
  CacheInterceptor,
  CacheTTL,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CryptocurrencyService } from './cryptocurrency.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import {
  GetCryptocurrenciesQueryDto,
  CryptocurrencyResponseDto,
  PaginatedCryptocurrencyResponseDto,
  CryptocurrencyStatsDto,
  TopGainersLosersDto,
  CryptocurrencyCompareDto,
  SyncStatusDto,
} from './dto/cryptocurrency.dto';

@ApiTags('Cryptocurrencies')
@Controller('cryptocurrencies')
@UseInterceptors(CacheInterceptor)
export class CryptocurrencyController {
  constructor(private readonly cryptocurrencyService: CryptocurrencyService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all cryptocurrencies',
    description: 'Retrieve a paginated list of cryptocurrencies with advanced filtering options',
  })
  @ApiResponse({
    status: 200,
    description: 'List of cryptocurrencies retrieved successfully',
    type: PaginatedCryptocurrencyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @CacheTTL(60) // Cache for 1 minute
  async findAll(
    @Query() query: GetCryptocurrenciesQueryDto,
  ): Promise<PaginatedCryptocurrencyResponseDto> {
    return this.cryptocurrencyService.findAll(query);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search cryptocurrencies',
    description: 'Search cryptocurrencies by name, symbol, or CoinGecko ID',
  })
  @ApiQuery({
    name: 'q',
    description: 'Search query',
    required: true,
    example: 'bitcoin',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of results to return',
    required: false,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    type: PaginatedCryptocurrencyResponseDto,
  })
  @CacheTTL(30) // Cache for 30 seconds
  async search(
    @Query() query: GetCryptocurrenciesQueryDto,
  ): Promise<PaginatedCryptocurrencyResponseDto> {
    return this.cryptocurrencyService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get market statistics',
    description: 'Get comprehensive cryptocurrency market statistics and metrics',
  })
  @ApiResponse({
    status: 200,
    description: 'Market statistics retrieved successfully',
    type: CryptocurrencyStatsDto,
  })
  @CacheTTL(300) // Cache for 5 minutes
  async getStats(): Promise<CryptocurrencyStatsDto> {
    return this.cryptocurrencyService.getMarketStats();
  }

  @Get('trending')
  @ApiOperation({
    summary: 'Get trending cryptocurrencies',
    description: 'Get top gainers, losers, and most volatile cryptocurrencies',
  })
  @ApiResponse({
    status: 200,
    description: 'Trending cryptocurrencies retrieved successfully',
    type: TopGainersLosersDto,
  })
  @CacheTTL(120) // Cache for 2 minutes
  async getTrending(): Promise<TopGainersLosersDto> {
    return this.cryptocurrencyService.getTopGainersLosers();
  }

  @Get('compare')
  @ApiOperation({
    summary: 'Compare cryptocurrencies',
    description: 'Compare multiple cryptocurrencies by their symbols',
  })
  @ApiQuery({
    name: 'symbols',
    description: 'Comma-separated list of cryptocurrency symbols',
    required: true,
    example: 'btc,eth,ada',
  })
  @ApiResponse({
    status: 200,
    description: 'Cryptocurrencies comparison retrieved successfully',
    type: [CryptocurrencyResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'No cryptocurrencies found for the provided symbols',
  })
  @CacheTTL(60) // Cache for 1 minute
  async compare(
    @Query() query: CryptocurrencyCompareDto,
  ): Promise<CryptocurrencyResponseDto[]> {
    const symbols = query.symbols.split(',').map(s => s.trim());
    return this.cryptocurrencyService.compare(symbols);
  }

  @Get('sync-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get synchronization status',
    description: 'Get the current status of cryptocurrency data synchronization (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Sync status retrieved successfully',
    type: SyncStatusDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async getSyncStatus(): Promise<SyncStatusDto> {
    return this.cryptocurrencyService.getSyncStatus();
  }

  @Post('sync')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Trigger manual synchronization',
    description: 'Manually trigger cryptocurrency data synchronization (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Sync triggered successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Cryptocurrency sync started' },
        sync_started: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async triggerSync(): Promise<{ message: string; sync_started: boolean }> {
    return this.cryptocurrencyService.triggerSync();
  }

  @Get('health')
  @ApiOperation({
    summary: 'Health check',
    description: 'Check the health status of the cryptocurrency service',
  })
  @ApiResponse({
    status: 200,
    description: 'Health status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        last_sync: { type: 'string', format: 'date-time' },
        total_coins: { type: 'number', example: 150 },
      },
    },
  })
  async healthCheck(): Promise<{ status: string; last_sync: Date; total_coins: number }> {
    return this.cryptocurrencyService.healthCheck();
  }

  @Get('coingecko/:coingeckoId')
  @ApiOperation({
    summary: 'Get cryptocurrency by CoinGecko ID',
    description: 'Retrieve a specific cryptocurrency by its CoinGecko ID',
  })
  @ApiParam({
    name: 'coingeckoId',
    description: 'CoinGecko ID of the cryptocurrency',
    example: 'bitcoin',
  })
  @ApiResponse({
    status: 200,
    description: 'Cryptocurrency retrieved successfully',
    type: CryptocurrencyResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Cryptocurrency not found',
  })
  @CacheTTL(60) // Cache for 1 minute
  async findByCoingeckoId(
    @Param('coingeckoId') coingeckoId: string,
  ): Promise<CryptocurrencyResponseDto> {
    return this.cryptocurrencyService.findByCoingeckoId(coingeckoId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get cryptocurrency by ID',
    description: 'Retrieve a specific cryptocurrency by its UUID',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the cryptocurrency',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Cryptocurrency retrieved successfully',
    type: CryptocurrencyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format',
  })
  @ApiResponse({
    status: 404,
    description: 'Cryptocurrency not found',
  })
  @CacheTTL(60) // Cache for 1 minute
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CryptocurrencyResponseDto> {
    return this.cryptocurrencyService.findOne(id);
  }
}