import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

/**
 * Modelo para tokens JWT revocados (blacklist)
 * Permite invalidar tokens antes de su expiración natural
 */
const blacklistedTokenSchema = new mongoose.Schema({
  // Token completo (o hash si prefieres más seguridad)
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Usuario al que pertenecía el token
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Razón de la revocación
  reason: {
    type: String,
    enum: [
      'LOGOUT',              // Usuario cerró sesión
      'PASSWORD_CHANGE',     // Contraseña cambiada
      'SECURITY_BREACH',     // Cuenta comprometida
      'ADMIN_REVOKE',        // Admin revocó acceso
      'SUSPICIOUS_ACTIVITY', // Actividad sospechosa detectada
      'ACCOUNT_DISABLED'     // Cuenta deshabilitada
    ],
    required: true
  },

  // Fecha de expiración del token (para auto-eliminar)
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },

  // Metadata adicional
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Admin que revocó (si aplica)
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Auto-eliminar tokens después de que expiren (MongoDB TTL Index)
blacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Índice compuesto para búsquedas rápidas
blacklistedTokenSchema.index({ userId: 1, token: 1 });

/**
 * Método estático para verificar si un token está en blacklist
 */
blacklistedTokenSchema.statics.isBlacklisted = async function(token) {
  const entry = await this.findOne({ token });
  return !!entry;
};

/**
 * Método estático para revocar token
 */
blacklistedTokenSchema.statics.revokeToken = async function(token, userId, reason, metadata = {}) {
  try {
    // Decodificar token para obtener expiración
    const decoded = jwt.decode(token);

    if (!decoded || !decoded.exp) {
      throw new Error('Token inválido o sin expiración');
    }

    // Crear entrada en blacklist
    await this.create({
      token,
      userId,
      reason,
      expiresAt: new Date(decoded.exp * 1000), // exp viene en segundos
      ...metadata
    });

    return true;
  } catch (error) {
    console.error('[BlacklistedToken] Error revocando token:', error.message);
    return false;
  }
};

/**
 * Método estático para revocar todos los tokens de un usuario
 */
blacklistedTokenSchema.statics.revokeAllUserTokens = async function(userId, reason, metadata = {}) {
  // Esta función requiere que guardes tokens activos en el modelo User
  // O implementes un sistema de "token version" en JWT
  const User = mongoose.model('User');
  const user = await User.findById(userId);

  if (user && user.activeTokens && user.activeTokens.length > 0) {
    const promises = user.activeTokens.map(token =>
      this.revokeToken(token, userId, reason, metadata)
    );

    await Promise.all(promises);

    // Limpiar tokens activos del usuario
    user.activeTokens = [];
    await user.save();

    return true;
  }

  return false;
};

export default mongoose.model('BlacklistedToken', blacklistedTokenSchema);