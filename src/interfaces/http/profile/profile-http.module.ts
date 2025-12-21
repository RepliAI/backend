import { Module } from '@nestjs/common';

import { UsersApplicationModule } from 'src/application/users/users-application.module';

import { ProfileController } from './controllers/profile.controller';

@Module({
    imports: [
        UsersApplicationModule,
    ],
    controllers: [ProfileController],
})
export class ProfileHttpModule { }
