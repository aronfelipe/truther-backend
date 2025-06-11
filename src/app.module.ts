import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './authentication/authentication.module';
import { UsersModule } from './users/users.module';
import { CryptocurrenciesModule } from './cryptocurrencies/cryptocurrencies.module';

@Module({
  imports: [AuthenticationModule, UsersModule, CryptocurrenciesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
