import { User } from '../entities/user.entity';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  updateRefreshTokenHash(userId: string, hash: string | null): Promise<void>;
  updatePassword(id: string, hashedPassword: string): Promise<void>;
  updateEmail(userId: string, newEmail: string): Promise<void>;
  delete(userId: string): Promise<void>;
  getUserCreatedAt(userId: string): Promise<Date | null>;
}