export const AUTH_TOKEN_SERVICE = 'AUTH_TOKEN_SERVICE';

export interface IAuthTokenService {
  signAccessToken(userId: string): Promise<string>;
  signRefreshToken(userId: string): Promise<string>;
}
