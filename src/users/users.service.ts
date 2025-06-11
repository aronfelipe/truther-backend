import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.repo.create(dto);
    return this.repo.save(user);
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.repo.preload({ id, ...dto });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return this.repo.save(user);
  }

  async findAll(search?: string): Promise<User[]> {
    if (search) {
      return this.repo.find({
        where: [
          { name: ILike(`%${search}%`) },
          { email: ILike(`%${search}%`) },
        ],
      });
    }
    return this.repo.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.repo.findOneBy({ id });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async findByEmail(email: string): Promise<any> {
    return this.repo.findOne({ where: { email } });
  }
}

