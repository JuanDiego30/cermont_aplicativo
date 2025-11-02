import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

dotenv.config();

async function checkUser() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/cermont_db';
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB\n');

    const email = 'juan.arevalo2@unipamplona.edu.co';
    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

    if (!user) {
      console.log(`❌ Usuario no encontrado: ${email}`);
      process.exit(1);
    }

    console.log('📊 INFORMACIÓN COMPLETA DEL USUARIO:\n');
    console.log(`Email: ${user.email}`);
    console.log(`Nombre: ${user.nombre}`);
    console.log(`Rol: ${user.rol}`);
    console.log(`Activo (isActive): ${user.isActive !== undefined ? user.isActive : user.activo}`);
    console.log(`Bloqueado (isLocked): ${user.isLocked}`);
    console.log(`Intentos de login: ${user.loginAttempts || 0}`);
    console.log(`Bloqueado hasta: ${user.lockUntil || 'No bloqueado'}`);
    console.log(`Token Version: ${user.tokenVersion || 0}`);
    console.log(`Password hash presente: ${user.password ? 'Sí' : 'No'}`);
    console.log(`Password hash (primeros 20): ${user.password ? user.password.substring(0, 20) + '...' : 'N/A'}\n`);

    // Verificar el campo exacto de activo
    console.log('🔍 CAMPOS RAW DEL DOCUMENTO:');
    console.log(`user.activo: ${user.activo}`);
    console.log(`user.isActive: ${user.isActive}`);
    console.log(`user.active: ${user.active}\n`);

    // Probar comparación de contraseña
    const testPassword = 'Admin123';
    console.log(`🔐 Probando contraseña: "${testPassword}"`);
    
    if (user.comparePassword) {
      const isValid = await user.comparePassword(testPassword);
      console.log(`Resultado comparePassword: ${isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA'}\n`);
    } else {
      console.log('⚠️  Método comparePassword no disponible\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

checkUser();
