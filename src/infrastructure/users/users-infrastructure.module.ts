import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { USER_REPOSITORY } from 'src/domain/users/repositories/user.repository';
import { PrismaUserRepository } from './repositories/prisma-user.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [
    USER_REPOSITORY,
  ],
})
export class UsersInfrastructureModule {}