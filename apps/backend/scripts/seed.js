/**
 * Database Seed Script
 * @description Script para poblar la base de datos con datos de prueba
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/database.js';
import User from '../src/models/User.js';
import Order from '../src/models/Order.js';
import WorkPlan from '../src/models/WorkPlan.js';
import { logger } from '../src/utils/logger.js';

// Cargar variables de entorno
dotenv.config();

/**
 * Datos de usuarios de prueba
 */
const usersData = [
  {
    nombre: 'Juan Pérez',
    email: 'admin@cermont.com',
    password: 'Admin123',
    rol: 'admin',
    telefono: '+57 300 123 4567',
    cedula: '1234567890',
    cargo: 'Administrador General',
    isActive: true,
  },
  {
    nombre: 'María García',
    email: 'ingeniero@cermont.com',
    password: 'Ing123456',
    rol: 'engineer',
    telefono: '+57 301 234 5678',
    cedula: '2345678901',
    cargo: 'Ingeniero Residente',
    especialidad: 'Eléctrica',
    isActive: true,
  },
  {
    nombre: 'Carlos Rodríguez',
    email: 'supervisor@cermont.com',
    password: 'Super123',
    rol: 'supervisor',
    telefono: '+57 302 345 6789',
    cedula: '3456789012',
    cargo: 'Supervisor de Campo',
    especialidad: 'Telecomunicaciones',
    isActive: true,
  },
  {
    nombre: 'Ana Martínez',
    email: 'tecnico@cermont.com',
    password: 'Tech123456',
    rol: 'technician',
    telefono: '+57 303 456 7890',
    cedula: '4567890123',
    cargo: 'Técnico Electricista',
    especialidad: 'Eléctrica',
    isActive: true,
  },
  {
    nombre: 'Luis Hernández',
    email: 'hes@cermont.com',
    password: 'Hes123456',
    rol: 'coordinator_hes',
    telefono: '+57 304 567 8901',
    cedula: '5678901234',
    cargo: 'Coordinador HES',
    especialidad: 'Seguridad Industrial',
    isActive: true,
  },
];

/**
 * Función para generar número de orden
 */
const generateOrderNumber = (index) => {
  const year = new Date().getFullYear();
  const number = String(index + 1).padStart(4, '0');
  return `OT-${year}-${number}`;
};

/**
 * Poblar usuarios
 */
const seedUsers = async () => {
  try {
    console.log('👥 Creando usuarios de prueba...');

    // Eliminar usuarios existentes (excepto root)
    await User.deleteMany({ rol: { $ne: 'root' } });

    // Crear usuarios
    const users = await User.create(usersData);

    console.log(`✅ ${users.length} usuarios creados`);
    return users;
  } catch (error) {
    console.error('❌ Error al crear usuarios:', error);
    throw error;
  }
};

/**
 * Poblar órdenes de trabajo
 */
const seedOrders = async (users) => {
  try {
    console.log('📋 Creando órdenes de trabajo de prueba...');

    // Eliminar órdenes existentes
    await Order.deleteMany({});

    const engineer = users.find(u => u.rol === 'engineer');
    const supervisor = users.find(u => u.rol === 'supervisor');
    const technician = users.find(u => u.rol === 'technician');
    const admin = users.find(u => u.rol === 'admin');

    const ordersData = [
      {
        numeroOrden: generateOrderNumber(0),
        code: 'ORDER-001',
        clienteNombre: 'ECOPETROL S.A.',
        clienteContacto: {
          nombre: 'Pedro Sánchez',
          email: 'pedro.sanchez@ecopetrol.com',
          telefono: '+57 310 111 2222',
        },
        poNumber: 'PO-2025-001',
        descripcion: 'Instalación de sistema CCTV en refinería Barrancabermeja',
        alcance: 'Instalación de 50 cámaras IP, cableado estructurado y NVR de 128 canales',
        lugar: 'Refinería Barrancabermeja, Santander',
        fechaInicio: new Date(),
        fechaFinEstimada: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        prioridad: 'alta',
        estado: 'planificacion',
        costoEstimado: 150000000,
        moneda: 'COP',
        asignadoA: [engineer._id, technician._id],
        supervisorId: supervisor._id,
        creadoPor: admin._id,
      },
      {
        numeroOrden: generateOrderNumber(1),
        code: 'ORDER-002',
        clienteNombre: 'Carbones del Cerrejón',
        clienteContacto: {
          nombre: 'Laura Gómez',
          email: 'laura.gomez@cerrejon.com',
          telefono: '+57 320 222 3333',
        },
        poNumber: 'PO-2025-002',
        descripcion: 'Mantenimiento preventivo de sistema de control industrial',
        alcance: 'Revisión y mantenimiento de PLCs, sensores y actuadores en planta de procesamiento',
        lugar: 'Planta Cerrejón, La Guajira',
        fechaInicio: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        fechaFinEstimada: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        prioridad: 'media',
        estado: 'en_progreso',
        costoEstimado: 75000000,
        moneda: 'COP',
        asignadoA: [engineer._id],
        supervisorId: supervisor._id,
        creadoPor: admin._id,
      },
      {
        numeroOrden: generateOrderNumber(2),
        code: 'ORDER-003',
        clienteNombre: 'Pacific Rubiales',
        clienteContacto: {
          nombre: 'Roberto Díaz',
          email: 'roberto.diaz@pacific.com',
          telefono: '+57 315 333 4444',
        },
        descripcion: 'Instalación de fibra óptica en campo petrolero',
        alcance: 'Tendido de 10km de fibra óptica monomodo',
        lugar: 'Campo Rubiales, Meta',
        fechaInicio: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        fechaFinEstimada: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        prioridad: 'baja',
        estado: 'pendiente',
        costoEstimado: 200000000,
        moneda: 'COP',
        supervisorId: supervisor._id,
        creadoPor: admin._id,
      },
    ];

    const orders = await Order.create(ordersData);

    console.log(`✅ ${orders.length} órdenes de trabajo creadas`);
    return orders;
  } catch (error) {
    console.error('❌ Error al crear órdenes:', error);
    throw error;
  }
};

/**
 * Script principal
 */
const seedDatabase = async () => {
  try {
    console.log('\n🌱 ============================================');
    console.log('🌱 SEED DATABASE - CERMONT ATG');
    console.log('🌱 ============================================\n');

    // Conectar a la base de datos
    console.log('📦 Conectando a MongoDB...');
    await connectDB();
    console.log('✅ Conectado a MongoDB\n');

    // Poblar datos
    const users = await seedUsers();
    const orders = await seedOrders(users);

    console.log('\n✅ ============================================');
    console.log('✅ BASE DE DATOS POBLADA EXITOSAMENTE');
    console.log('✅ ============================================\n');
    console.log('📊 Resumen:');
    console.log(`   👥 Usuarios: ${users.length}`);
    console.log(`   📋 Órdenes: ${orders.length}`);
    console.log('\n💡 Credenciales de acceso:\n');
    console.log('   Admin:      admin@cermont.com      / Admin123');
    console.log('   Ingeniero:  ingeniero@cermont.com  / Ing123456');
    console.log('   Supervisor: supervisor@cermont.com / Super123');
    console.log('   Técnico:    tecnico@cermont.com    / Tech123456');
    console.log('   HES:        hes@cermont.com        / Hes123456\n');

    // Cerrar conexión
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error al poblar base de datos:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Ejecutar script
seedDatabase();
