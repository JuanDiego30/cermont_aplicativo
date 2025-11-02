/**
 * Test Argon2 hash and verify
 */

import argon2 from 'argon2';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import '../src/config/database.js';

const testPassword = 'Admin123';

console.log('\n🔐 Test de Argon2\n');
console.log('='.repeat(50));

try {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cermont_db');
  console.log('✅ MongoDB Connected\n');

  // 1. Encontrar usuario (con password explícito porque tiene select: false)
  const user = await User.findOne({ email: 'juan.arevalo2@unipamplona.edu.co' }).select('+password');
  if (!user) {
    console.log('❌ Usuario no encontrado');
    process.exit(1);
  }

  console.log(`📧 Usuario: ${user.email}`);
  console.log(`🔑 Hash almacenado:\n${user.password}\n`);

  // 2. Test directo con argon2.verify
  console.log(`🧪 Test 1: argon2.verify directo`);
  console.log(`   Contraseña: "${testPassword}"`);
  const result1 = await argon2.verify(user.password, testPassword);
  console.log(`   Resultado: ${result1 ? '✅ VÁLIDA' : '❌ INVÁLIDA'}\n`);

  // 3. Test con el método del modelo
  console.log(`🧪 Test 2: user.comparePassword`);
  console.log(`   Contraseña: "${testPassword}"`);
  const result2 = await user.comparePassword(testPassword);
  console.log(`   Resultado: ${result2 ? '✅ VÁLIDA' : '❌ INVÁLIDA'}\n`);

  // 4. Crear nuevo hash y verificar
  console.log(`🧪 Test 3: Crear nuevo hash y verificar`);
  const newHash = await argon2.hash(testPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
  });
  console.log(`   Nuevo hash:\n${newHash}`);
  const result3 = await argon2.verify(newHash, testPassword);
  console.log(`   Resultado: ${result3 ? '✅ VÁLIDA' : '❌ INVÁLIDA'}\n`);

  console.log('='.repeat(50));

} catch (error) {
  console.error('❌ Error:', error);
} finally {
  await mongoose.connection.close();
  process.exit(0);
}
