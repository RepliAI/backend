import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateUserPreferencesDto {
    @IsString()
    @IsOptional()
    tone?: string;

    @IsString()
    @IsOptional()
    signature?: string;

    @IsBoolean()
    @IsOptional()
    autoImport?: boolean;

    @IsBoolean()
    @IsOptional()
    autoAiSend?: boolean;
}