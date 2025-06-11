# Truther Backend API

API RESTful construída com NestJS para gerenciamento de usuários e sincronização de dados de criptomoedas via CoinGecko.

## ✨ Tecnologias Utilizadas

* [NestJS](https://nestjs.com/)
* [TypeORM](https://typeorm.io/)
* [PostgreSQL](https://www.postgresql.org/)
* [Swagger](https://swagger.io/)
* [JWT](https://jwt.io/)
* [Jest](https://jestjs.io/)
* [Docker](https://www.docker.com/)
* [CoinGecko API](https://www.coingecko.com/en/api)

---

## 🔧 Instalação Local

```bash
git clone https://github.com/seu-usuario/truther-backend.git
cd truther-backend
npm install
```

Crie um arquivo `.env` com base no `.env.example`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=truther
JWT_SECRET=supersecret
JWT_EXPIRES_IN=3600s
```

Rode o projeto:

```bash
npm run start:dev
```

---

## 🌐 Variáveis de Ambiente - `.env.example`

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=truther
JWT_SECRET=supersecret
JWT_EXPIRES_IN=3600s
```

---

## 🚀 Endpoints

* `POST /auth/register`: Criar novo usuário
* `POST /auth/login`: Fazer login e receber JWT
* `GET /users`: Listar todos os usuários (Admin)
* `GET /cryptocurrencies`: Listar criptomoedas sincronizadas
* `GET /cryptocurrencies/search?q=btc`: Buscar por nome ou símbolo

### Swagger: [http://localhost:3000/docs](http://localhost:3000/docs)

---

## ⏳ Tarefas Cron

A cada hora, a aplicação sincroniza com a CoinGecko e salva as 10 criptomoedas com maior market cap na base.

---

## 💪 Autenticação

JWT é utilizado para autenticar os endpoints protegidos. Inclua:

```http
Authorization: Bearer <token>
```

---

## 🧪 Testes

Execute os testes unitários:

```bash
npm run test
```

---

## 🐳 Docker

### Build & Run

```bash
docker-compose up --build
```

O backend estará disponível em `http://localhost:3000`

---

## ☁️ Deploy com Railway

1. Suba este repositório no GitHub
2. Acesse [Railway](https://railway.app)
3. Clique em "Deploy from GitHub"
4. Adicione as variáveis de ambiente conforme `.env`
5. Railway detecta o Dockerfile automaticamente

---

## 🌟 Diferenciais Implementados

* [x] JWT + Middleware de proteção
* [x] Swagger com autenticação via token
* [x] Cron para sync com CoinGecko
* [x] Tests com Jest
* [x] Docker + Compose com PostgreSQL
* [x] Busca por nome ou símbolo de cripto
* [x] Roles (admin/cliente)
* [x] Deploy via Railway

---

## 🧪 Seed de Admin

Para criar um usuário admin via seed:

```bash
npm run seed
```

Crie um script `seed.ts` com o seguinte conteúdo:

```ts
import { DataSource } from 'typeorm';
import { User } from './src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();

  const user = new User();
  user.name = 'Admin';
  user.email = 'admin@truther.com';
  user.password = await bcrypt.hash('admin123', 10);
  user.role = 'admin';

  await dataSource.manager.save(user);
  console.log('Usuário admin criado.');
  process.exit();
}

seed();
```

Adicione no `package.json`:

```json
"scripts": {
  "seed": "ts-node seed.ts"
}
```

---

## 📝 Licença

Este projeto está licenciado sob os termos da licença MIT.

```
MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

[...truncated for brevity...]
```
