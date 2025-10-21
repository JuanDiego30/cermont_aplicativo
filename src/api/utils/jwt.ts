import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  sub: string;
  correo: string;
  rol: string;
  exp?: number;
  iat?: number;
}

const EXPIRATION = '24h';

export function signToken(payload: Omit<JwtPayload, 'exp' | 'iat'>): string {
  return jwt.sign(payload, env.jwtSecret, { algorithm: 'HS256', expiresIn: EXPIRATION });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] }) as JwtPayload;
}
