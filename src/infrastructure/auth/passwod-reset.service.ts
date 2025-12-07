import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { IPasswordResetService } from "src/domain/auth/services/password-reset.service";

@Injectable()
export class PasswordResetService implements IPasswordResetService {
    constructor(private readonly jwt: JwtService) { }

    async generateResetToken(userId: string): Promise<string> {
        return this.jwt.sign(
            { 
                sub: userId 
            },
            {
                expiresIn: "30m",
                secret: process.env.JWT_ACCESS_SECRET as string,
            }
        );
    }

    async verifyResetToken(token: string): Promise<{ userId: string }> {
        const decoded = await this.jwt.verifyAsync(token, {secret: process.env.JWT_ACCESS_SECRET});
        return { userId: decoded.sub };
    }
}