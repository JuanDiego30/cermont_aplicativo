/**
 * Create Root User Script
 * @description Script para crear el primer usuario ROOT del sistema
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import readline from 'readline';
import User from '../src/models/User.js';
import { connectDB } from '../src/config/database.js';

// Cargar variables de entorno
dotenv.config();

// Interfaz para leer input del usuario
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Función para hacer preguntas al usuario
 */
const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

/**
 * Script principal
 */
const createRootUser = async () => {
  try {
    console.log('\n🚀 ============================================');
    console.log('🚀 CREAR USUARIO ROOT - CERMONT ATG');
    console.log('🚀 ============================================\n');

    // Conectar a la base de datos
    console.log('📦 Conectando a MongoDB...');
    await connectDB();
    console.log('✅ Conectado a MongoDB\n');

    // Verificar si ya existe un usuario root
    const existingRoot = await User.findOne({ rol: 'root' });
    
    if (existingRoot) {
      console.log('⚠️  Ya existe un usuario ROOT en el sistema:');
      console.log(`   Email: ${existingRoot.email}`);
      console.log(`   Nombre: ${existingRoot.nombre}\n`);
      
      const overwrite = await question('¿Deseas crear otro usuario ROOT? (s/n): ');
      
      if (overwrite.toLowerCase() !== 's') {
        console.log('\n❌ Operación cancelada.');
        await mongoose.connection.close();
        rl.close();
        process.exit(0);
      }
    }

    // Solicitar datos del usuario
    console.log('\n📝 Ingresa los datos del usuario ROOT:\n');

    const nombre = await question('Nombre completo: ');
    const email = await question('Email: ');
    const password = await question('Contraseña (mínimo 8 caracteres): ');
    const confirmPassword = await question('Confirmar contraseña: ');

    // Validaciones
    if (!nombre || nombre.trim().length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres');
    }

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new Error('Email inválido');
    }

    if (!password || password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    if (password !== confirmPassword) {
      throw new Error('Las contraseñas no coinciden');
    }

    if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)) {
      throw new Error('La contraseña debe contener al menos una mayúscula, una minúscula y un número');
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      throw new Error('Ya existe un usuario con este email');
    }

    // Crear usuario ROOT
    console.log('\n⏳ Creando usuario ROOT...');

    const rootUser = await User.create({
      nombre: nombre.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      rol: 'root',
      isActive: true,
    });

    console.log('\n✅ ============================================');
    console.log('✅ USUARIO ROOT CREADO EXITOSAMENTE');
    console.log('✅ ============================================\n');
    console.log('📋 Detalles del usuario:');
    console.log(`   ID: ${rootUser._id}`);
    console.log(`   Nombre: ${rootUser.nombre}`);
    console.log(`   Email: ${rootUser.email}`);
    console.log(`   Rol: ${rootUser.rol}`);
    console.log(`   Activo: ${rootUser.isActive}`);
    console.log('\n💡 Puedes iniciar sesión con este usuario ahora.\n');

    // Cerrar conexión
    await mongoose.connection.close();
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error al crear usuario ROOT:', error.message);
    await mongoose.connection.close();
    rl.close();
    process.exit(1);
  }
};

// Ejecutar script
createRootUser();
