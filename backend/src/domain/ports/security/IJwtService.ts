/**
 * Port: JWT Service
 * Define la interfaz para la gestión de tokens JWT.
 */
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  jti: string;
  iat?: number;
  exp?: number;
}

export interface IJwtService {
  /**
   * Genera un token de acceso.
   */
  generateAccessToken(payload: Omit<JwtPayload, 'jti' | 'iat' | 'exp'>): Promise<string>;

  /**
   * Genera un token de refresh.
   */
  generateRefreshToken(payload: Omit<JwtPayload, 'jti' | 'iat' | 'exp'>): Promise<string>;

  /**
   * Verifica y decodifica un token de acceso.
   */
  verifyAccessToken(token: string): Promise<JwtPayload>;

  /**
   * Verifica y decodifica un token de refresh.
   */
  verifyRefreshToken(token: string): Promise<JwtPayload>;

  /**
   * Decodifica un token sin verificar la firma (para inspección).
   */
  decodeToken(token: string): JwtPayload | null;
}
