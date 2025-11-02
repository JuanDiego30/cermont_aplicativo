import dotenv from 'dotenv';
import mongoose from 'mongoose';
import argon2 from 'argon2';
import User from '../src/models/User.js';

dotenv.config();

async function resetPassword() {
  try {
    // Conectar a MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/cermont_db';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected:', mongoose.connection.host);
    console.log('📊 Database:', mongoose.connection.name);

    console.log('\n🔐 ============================================');
    console.log('🔐 RESETEAR CONTRASEÑA - CERMONT ATG');
    console.log('🔐 ============================================\n');

    // Buscar usuario
    const email = 'juan.arevalo2@unipamplona.edu.co';
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`❌ No se encontró usuario con email: ${email}`);
      process.exit(1);
    }

    console.log(`✅ Usuario encontrado:`);
    console.log(`   Nombre: ${user.nombre}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Rol: ${user.rol}`);
    console.log(`   Activo: ${user.isActive || user.activo}\n`);

    // Nueva contraseña (cumple requisitos: mayúscula, minúscula, número)
    const newPassword = 'Admin123';
    
    console.log(`🔑 Estableciendo nueva contraseña: ${newPassword}`);
    console.log(`   ⚠️  Requisitos: Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número`);
    console.log(`   🔒 Usando Argon2 (algoritmo del backend)\n`);

    // Hashear nueva contraseña con Argon2 (igual que el backend)
    const hashedPassword = await argon2.hash(newPassword, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 1
    });
    
    // Actualizar directamente en la BD (bypass pre-save hooks)
    // Esto evita que el hook vuelva a hashear un hash ya hasheado
    await User.updateOne(
      { _id: user._id },
      { 
        $set: { 
          password: hashedPassword,
          lastPasswordChange: new Date(),
          loginAttempts: 0,
          lockUntil: null
        }
      }
    );

    console.log('✅ Contraseña actualizada exitosamente!\n');
    console.log('📝 Credenciales de acceso:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${newPassword}`);
    console.log(`   Rol: ${user.rol}\n`);
    console.log('🎯 Ahora puedes iniciar sesión con estas credenciales\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al resetear contraseña:', error.message);
    process.exit(1);
  }
}

resetPassword();
