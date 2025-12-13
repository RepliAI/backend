import { Injectable } from '@nestjs/common';
import { IUserRepository } from 'src/domain/users/repositories/user.repository';
import { User as UserEntity } from 'src/domain/users/entities/user.entity';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '../../shared/types/user.type';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaService) { }

    private toDomain(user: User): UserEntity {
        return new UserEntity(
            user.id,
            user.email,
            user.passwordHash,
            user.refreshTokenHash ?? null,
        );
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        return this.toDomain(user);
    }

    async findById(id: string): Promise<UserEntity | null> {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) return null;
        return this.toDomain(user);
    }

    async create(user: UserEntity): Promise<void> {
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
    async updatePassword(id: string, hashedPassword: string): Promise<void> {
        await this.prisma.user.update({
            where: { id },
            data: { passwordHash: hashedPassword },
        });
    }
}