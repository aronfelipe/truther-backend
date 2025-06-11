import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashedpassword',
  role: 'client',
};

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find all users', async () => {
    jest.spyOn(repo, 'find').mockResolvedValue([mockUser as any]);
    const users = await service.findAll();
    expect(users).toEqual([mockUser]);
  });

  it('should find one user by id', async () => {
    jest.spyOn(repo, 'findOneBy').mockResolvedValue(mockUser as any);
    const user = await service.findOne(1);
    expect(user).toEqual(mockUser);
  });

  it('should create a user', async () => {
    jest.spyOn(repo, 'create').mockReturnValue(mockUser as any);
    jest.spyOn(repo, 'save').mockResolvedValue(mockUser as any);

    const user = await service.create({ name: 'Test User', email: 'test@example.com', password: '123', role: 'client' });
    expect(user).toEqual(mockUser);
  });

  it('should update a user', async () => {
    jest.spyOn(repo, 'update').mockResolvedValue(undefined);
    jest.spyOn(service, 'findOne').mockResolvedValue(mockUser as any);
    const user = await service.update(1, { name: 'Updated Name' });
    expect(user).toEqual(mockUser);
  });

  it('should remove a user', async () => {
    jest.spyOn(repo, 'delete').mockResolvedValue(undefined);
    await expect(service.remove(1)).resolves.not.toThrow();
  });
});
