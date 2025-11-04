import { TokenPair, DeviceInfo } from '../types/index.js';
export interface JWTPayload {
    userId: string;
    role: string;
    tokenVersion?: number;
}
export declare const generateTokenPair: (payload: JWTPayload, deviceInfo: DeviceInfo) => Promise<TokenPair>;
export declare const verifyAccessToken: (token: string) => JWTPayload;
export declare const verifyRefreshToken: (token: string) => JWTPayload;
export type { TokenPair };
export declare const decodeToken: (token: string) => Record<string, unknown> | null;
export declare const generateTokenPair: (payload: TokenPayload, metadata?: TokenMetadata) => Promise<TokenPair>;
export declare const getTokenTimeRemaining: (token: string) => number | null;
export declare const isTokenExpiringSoon: (token: string, thresholdSeconds?: number) => boolean;
export declare const extractTokenMetadata: (token: string) => TokenMetadataExtracted | null;
export declare const TOKEN_CONSTANTS: {
    readonly ACCESS_TOKEN_EXPIRES_IN: any;
    readonly REFRESH_TOKEN_EXPIRES_IN: any;
    readonly ACCESS_TOKEN_SECONDS: number;
    readonly REFRESH_TOKEN_SECONDS: number;
};
//# sourceMappingURL=jwt.d.ts.map