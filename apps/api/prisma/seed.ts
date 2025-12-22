import { PrismaClient } from '.prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:admin@localhost:5432/cermont_fsm';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // --- 1. USUARIOS ---
  const adminEmail = 'root@cermont.com';
  const adminPassword = 'admin123456';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // Upsert Admin
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      name: 'Administrador',
      role: 'admin',
      active: true,
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Administrador',
      role: 'admin',
      phone: faker.phone.number(),
      active: true,
    },
  });
  console.log('✓ Usuario admin sincronizado (Password set to admin123456)');

  // Crear Técnicos
  const tecnicos = [];
  for (let i = 1; i <= 5; i++) {
    const email = `tecnico${i}@cermont.com`;
    const techPassword = await bcrypt.hash('tecnico123456', 10);
    const user = await prisma.user.upsert({
      where: { email },
      update: { password: techPassword },
      create: {
        email,
        password: techPassword,
        name: faker.person.fullName(),
        role: 'tecnico',
        phone: faker.phone.number(),
        active: true,
      },
    });
    console.log(`✓ Técnico ${i} sincronizado`);
    tecnicos.push(user);
  }

  // --- 2. CLIENTES (Simulados para uso en Órdenes) ---
  const clientes = [];
  for (let i = 0; i < 5; i++) {
    clientes.push({
      nombre: faker.company.name(),
      contacto: faker.person.fullName(),
      email: faker.internet.email(),
      telefono: faker.phone.number(),
      direccion: faker.location.streetAddress(),
      ciudad: faker.location.city(),
    });
  }
  console.log(`✓ ${clientes.length} Clientes simulados`);

  // --- 3. ÓRDENES DE TRABAJO ---
  console.log('Generando órdenes de trabajo...');
  const ordenesCreadas = [];

  for (let i = 0; i < 20; i++) {
    const cliente = faker.helpers.arrayElement(clientes);
    const tecnico = faker.helpers.arrayElement(tecnicos);

    // Enum OrderStatus: planeacion, ejecucion, pausada, completada, cancelada
    const estado = faker.helpers.arrayElement(['planeacion', 'ejecucion', 'pausada', 'completada', 'cancelada']);
    // Enum OrderPriority: baja, media, alta, urgente
    const prioridad = faker.helpers.arrayElement(['baja', 'media', 'alta', 'urgente']);

    // Enum OrderSubState
    const subEstado = 'solicitud_recibida'; // Default

    const createdAt = faker.date.past({ years: 0.5 });
    const fechaProgramada = faker.date.future({ years: 0.1, refDate: createdAt });

    const orden = await prisma.order.create({
      data: {
        numero: `ORD-${Date.now()}-${i}`,
        descripcion: faker.lorem.sentence(),

        // Datos Cliente (Strings)
        cliente: cliente.nombre,
        contactoCliente: cliente.contacto,
        telefonoCliente: cliente.telefono,
        direccion: cliente.direccion,
        // ciudad no existe

        // Relaciones
        asignadoId: tecnico.id,

        // Enums
        estado: estado as any,
        subEstado: subEstado as any,
        prioridad: prioridad as any,

        // Fechas
        fechaInicio: estado === 'ejecucion' || estado === 'completada' ? fechaProgramada : null,
        fechaFin: estado === 'completada' ? faker.date.soon({ days: 2, refDate: fechaProgramada }) : null,
        createdAt: createdAt,
        updatedAt: faker.date.recent(),
      }
    });
    ordenesCreadas.push(orden);
  }
  console.log('✓ 20 Órdenes creadas');

  // --- 4. MANTENIMIENTOS ---
  console.log('Generando mantenimientos...');
  // Crear Equipo
  const equipo = await prisma.equipo.create({
    data: {
      codigo: `EQ-${faker.string.alphanumeric(5).toUpperCase()}`,
      nombre: faker.commerce.productName(),
      marca: faker.company.name(),
      modelo: faker.string.alphanumeric(4),
      categoria: 'General',
      activo: true
    }
  });

  for (let i = 0; i < 5; i++) {
    await prisma.mantenimiento.create({
      data: {
        titulo: `Mantenimiento ${faker.commerce.productName()}`,
        descripcion: faker.lorem.paragraph(),
        frecuenciaDias: 30, // integer

        estado: 'programado', // Enum EstadoMantenimiento
        prioridad: 'media',   // Enum PrioridadMantenimiento

        equipoId: equipo.id,
        fechaProgramada: faker.date.future(),

        tecnicoAsignadoId: tecnicos[0].id,
        tipo: 'preventivo' // Enum TipoMantenimiento
      }
    });
  }
  console.log('✓ Mantenimientos creados');

  // --- 5. ALERTAS AUTOMATICAS ---
  console.log('Generando alertas...');
  if (ordenesCreadas.length > 0) {
    for (let i = 0; i < 10; i++) {
      const orden = faker.helpers.arrayElement(ordenesCreadas);
      await prisma.alertaAutomatica.create({
        data: {
          ordenId: orden.id,
          titulo: faker.lorem.sentence(3),
          mensaje: faker.lorem.sentence(),
          // Enum TipoAlerta: acta_sin_firmar, ses_pendiente, factura_vencida...
          tipo: faker.helpers.arrayElement(['acta_sin_firmar', 'ses_pendiente', 'factura_vencida']),
          leida: faker.datatype.boolean(),
          usuarioId: admin.id,
          prioridad: 'info' // Enum PrioridadAlerta
        }
      });
    }
    console.log('✓ Alertas creadas');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
