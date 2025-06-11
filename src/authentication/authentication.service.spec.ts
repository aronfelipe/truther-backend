import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: '$2b$10$hashedpassword', // bcrypt hashed
    role: 'client',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn().mockResolvedValue(mockUser),
            create: jest.fn().mockResolvedValue(mockUser),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('signed-jwt-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register user', async () => {
    jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
    jest.spyOn(usersService, 'create').mockResolvedValue(mockUser);
    const result = await service.register({ name: 'Test', email: 'test@example.com', password: '123', role: 'client' });
    expect(result).toEqual(mockUser);
  });

  it('should throw error on register if user exists', async () => {
    jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
    await expect(service.register({ name: 'Test', email: 'test@example.com', password: '123', role: 'client' })).rejects.toThrow();
  });

  it('should login user and return token', async () => {
    jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    const token = await service.login('test@example.com', 'password');
    expect(token).toEqual('signed-jwt-token');
  });

  it('should throw error if login fails', async () => {
    jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
    await expect(service.login('test@example.com', 'password')).rejects.toThrow();
  });
});
