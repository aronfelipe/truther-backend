import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';

describe('AuthenticationController', () => {
  let controller: AuthenticationController;
  let service: AuthenticationService;

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'client',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        {
          provide: AuthenticationService,
          useValue: {
            register: jest.fn().mockResolvedValue(mockUser),
            login: jest.fn().mockResolvedValue('token'),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
    service = module.get<AuthenticationService>(AuthenticationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register user', async () => {
    const dto = { name: 'Test', email: 'test@example.com', password: '123', role: 'client' };
    const result = await controller.register(dto);
    expect(result).toEqual(mockUser);
  });

  it('should login user', async () => {
    const dto = { email: 'test@example.com', password: '123' };
    const result = await controller.login(dto);
    expect(result).toEqual({ access_token: 'token' });
  });
});
