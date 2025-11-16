import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/users/repositories/user.repository';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../../domain/users/entities/user.entity';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    // On reconstruit une entité métier User à partir du record Prisma
    return new User(user.id, user.email, user.passwordHash);
  }

  async create(user: User): Promise<void> {
    await this.prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
      },
    });
  }
}
