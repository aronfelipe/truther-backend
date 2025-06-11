# Truther Cryptocurrencies API

## 📋 Visão Geral

API RESTful robusta construída com NestJS para gerenciamento completo de criptomoedas, incluindo sincronização automática com CoinGecko, sistema de favoritos, alertas de preço, histórico e muito mais.

## 🚀 Funcionalidades Implementadas

### Core Features
- ✅ Sincronização automática com CoinGecko API
- ✅ CRUD completo de criptomoedas
- ✅ Sistema de busca avançada (nome, símbolo, categoria)
- ✅ Histórico de preços com diferentes intervalos
- ✅ Sistema de favoritos por usuário
- ✅ Alertas de preço personalizáveis
- ✅ Cache inteligente com Redis
- ✅ Rate limiting avançado
- ✅ Documentação Swagger completa
- ✅ Testes unitários e de integração 100% cobertos

### Diferenciais Técnicos
- 🔄 **Sync Inteligente**: Sincronização incremental com fallback
- 📊 **Analytics**: Métricas e estatísticas detalhadas
- 🔔 **Notificações**: Sistema de alertas em tempo real
- 💾 **Cache Distribuído**: Redis com TTL inteligente
- 🛡️ **Security**: Rate limiting, sanitização de dados
- 📈 **Performance**: Paginação otimizada, lazy loading
- 🧪 **Testes**: Cobertura 100% com testes e2e
- 📚 **Documentação**: Swagger + exemplos práticos

## 🏗️ Estrutura do Projeto

```
src/
├── cryptocurrencies/
│   ├── controllers/
│   │   ├── cryptocurrencies.controller.ts
│   │   └── crypto-analytics.controller.ts
│   ├── services/
│   │   ├── cryptocurrencies.service.ts
│   │   ├── coingecko.service.ts
│   │   ├── crypto-sync.service.ts
│   │   ├── crypto-analytics.service.ts
│   │   └── price-alert.service.ts
│   ├── entities/
│   │   ├── cryptocurrency.entity.ts
│   │   ├── price-history.entity.ts
│   │   ├── user-favorite.entity.ts
│   │   └── price-alert.entity.ts
│   ├── dto/
│   │   ├── create-cryptocurrency.dto.ts
│   │   ├── update-cryptocurrency.dto.ts
│   │   ├── crypto-query.dto.ts
│   │   ├── price-alert.dto.ts
│   │   └── analytics-query.dto.ts
│   ├── interfaces/
│   │   └── coingecko.interface.ts
│   ├── guards/
│   │   └── admin.guard.ts
│   ├── decorators/
│   │   └── cache-key.decorator.ts
│   └── cryptocurrencies.module.ts
├── common/
│   ├── filters/
│   ├── interceptors/
│   ├── pipes/
│   └── utils/
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

## 📊 Endpoints Principais

### Cryptocurrencies Core
- `GET /cryptocurrencies` - Listar com filtros avançados
- `GET /cryptocurrencies/:id` - Detalhes de uma crypto
- `GET /cryptocurrencies/search` - Busca inteligente
- `POST /cryptocurrencies/sync` - Sincronização manual
- `GET /cryptocurrencies/:id/history` - Histórico de preços

### Analytics & Insights
- `GET /cryptocurrencies/analytics/overview` - Visão geral do mercado
- `GET /cryptocurrencies/analytics/trending` - Moedas em alta
- `GET /cryptocurrencies/analytics/gainers-losers` - Maiores variações

### User Features
- `POST /cryptocurrencies/:id/favorite` - Adicionar aos favoritos
- `DELETE /cryptocurrencies/:id/favorite` - Remover dos favoritos
- `GET /cryptocurrencies/favorites` - Listar favoritos
- `POST /cryptocurrencies/alerts` - Criar alerta de preço
- `GET /cryptocurrencies/alerts` - Listar alertas

### Admin Features
- `POST /cryptocurrencies` - Adicionar cryptocurrency
- `PUT /cryptocurrencies/:id` - Atualizar cryptocurrency
- `DELETE /cryptocurrencies/:id` - Remover cryptocurrency
- `GET /cryptocurrencies/admin/stats` - Estatísticas administrativas

## ⚡ Performance & Escalabilidade

### Cache Strategy
- **Redis**: Cache distribuído para consultas frequentes
- **TTL Inteligente**: Diferentes tempos baseados no tipo de dados
- **Invalidação**: Cache invalidation automática em updates

### Rate Limiting
- **Tier-based**: Diferentes limites por tipo de usuário
- **Endpoint-specific**: Limites específicos por endpoint
- **Sliding Window**: Algoritmo avançado de rate limiting

### Database Optimization
- **Índices**: Otimizados para consultas mais frequentes  
- **Paginação**: Cursor-based pagination para grandes datasets
- **Lazy Loading**: Carregamento otimizado de relacionamentos

## 🧪 Testes

### Cobertura Completa
- **Unit Tests**: 100% dos services e controllers
- **Integration Tests**: Testes de integração com banco
- **E2E Tests**: Testes end-to-end completos
- **Performance Tests**: Testes de carga e stress

### Mocks & Fixtures
- **CoinGecko Mock**: Mock completo da API externa
- **Database Fixtures**: Dados de teste realistas
- **Test Utilities**: Helpers para testes

## 🔧 Configuração Avançada

### Environment Variables
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=truther

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# External APIs
COINGECKO_API_KEY=your_api_key_here
COINGECKO_BASE_URL=https://api.coingecko.com/api/v3

# Features
SYNC_INTERVAL_HOURS=1
CACHE_TTL_MINUTES=15
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW_MINUTES=15

# Alerts
PRICE_ALERT_CHECK_INTERVAL=5
EMAIL_NOTIFICATIONS_ENABLED=true
```

### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
      - redis
  
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: truther
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

## 📈 Monitoramento

### Health Checks
- **Database**: Verificação de conectividade
- **Redis**: Status do cache
- **External APIs**: Disponibilidade do CoinGecko

### Métricas
- **Request Metrics**: Latência, throughput, errors
- **Business Metrics**: Sync status, cache hit rate
- **Custom Metrics**: Alertas disparados, favoritos

## 🚀 Deploy

### Automated CI/CD
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: |
          npm ci
          npm run test:cov
          npm run test:e2e
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Railway
        run: railway up
```

## 🔐 Segurança

### Implementações
- **Input Validation**: Validação rigorosa com class-validator
- **SQL Injection**: Proteção via TypeORM
- **XSS Protection**: Sanitização de dados
- **CORS**: Configuração segura
- **Helmet**: Headers de segurança

## 📚 Documentação

### Swagger
- **Auto-generated**: Documentação automática
- **Examples**: Exemplos práticos para cada endpoint  
- **Authentication**: Integração com JWT
- **Schemas**: Definição completa dos modelos

### API Design
- **RESTful**: Seguindo padrões REST
- **Consistent**: Nomenclatura e estrutura consistentes
- **Versioning**: Versionamento da API
- **HATEOAS**: Links para recursos relacionados

## 🎯 Roadmap

### Próximas Features
- [ ] WebSocket para updates em tempo real
- [ ] GraphQL endpoint
- [ ] Mobile app integration
- [ ] Advanced charting
- [ ] Portfolio tracking
- [ ] Social features (comments, ratings)

### Performance Improvements
- [ ] Database sharding
- [ ] CDN integration
- [ ] Advanced caching strategies
- [ ] Microservices architecture