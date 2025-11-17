import { Injectable } from '@nestjs/common';
import { IUserRepository } from 'src/domain/users/repositories/user.repository';
import { User } from 'src/domain/users/entities/user.entity';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(user: any): User {
    return new User(
      user.id,
      user.email,
      user.passwordHash,
      user.refreshTokenHash ?? null,
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return this.toDomain(user);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return this.toDomain(user);
  }

  async create(user: User): Promise<void> {
    await this.prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        refreshTokenHash: user.refreshTokenHash ?? null,
      },
    });
  }
  async updateRefreshTokenHash(userId: string, hash: string | null): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: hash },
    });
  }
}
