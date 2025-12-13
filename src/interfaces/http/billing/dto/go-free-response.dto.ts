import { IsString, IsEnum } from 'class-validator';

export class GoFreeResponse {
    @IsEnum(['ok'])
    status: 'ok';

    @IsString()
    message: string;
}