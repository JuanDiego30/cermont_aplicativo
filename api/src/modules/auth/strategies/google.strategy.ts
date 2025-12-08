/**
 * Configuración de estrategia OAuth 2.0 con Google para Cermont. Integra Passport.js
 * para autenticación social, verifica credenciales de Google, busca o crea usuarios
 * automáticamente basado en email, vincula cuentas existentes sin googleId, y proporciona
 * control de acceso basado en roles. Simplifica onboarding eliminando necesidad de
 * registro manual mientras mantiene sincronización con base de datos.
 */

import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import { prisma } from '../../../config/database.js';
import { env } from '../../../config/env.js';

export const configureGoogleStrategy = () => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('⚠️ Google Auth credentials missing. Skipping strategy configuration.');
    return;
  }

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${env.API_URL || 'http://localhost:3001'}/api/auth/google/callback`,
    scope: ['profile', 'email']
  }, async (_accessToken, _refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) return done(new Error('No email found in Google profile'), undefined);

      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name: profile.displayName,
            googleId: profile.id,
            password: '',
            role: 'tecnico',
            active: true
          }
        });
      } else if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: profile.id }
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error as Error, undefined);
    }
  }));
};

