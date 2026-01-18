import { faker } from '@faker-js/faker';
import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Servicio para poblar la base de datos con datos de prueba
 *
 * @example
 * ```bash
 * pnpm seed:run      # Ejecutar seed
 * pnpm seed:refresh  # Limpiar y ejecutar seed
 * ```
 */
@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ejecuta todos los seeders
   */
  async run(): Promise<void> {
    this.logger.log('🌱 Iniciando seed de base de datos...');

    await this.seedUsers();

    this.logger.log('✅ Seed completado exitosamente');
  }

  /**
   * Crea usuarios de prueba
   */
  private async seedUsers(): Promise<void> {
    this.logger.log('👤 Creando usuarios...');

    const password = await bcrypt.hash('Admin123!', 10);

    // Verificar si ya existen usuarios de prueba
    const existingAdmin = await this.prisma.user.findUnique({
      where: { email: 'admin@cermont.com' },
    });

    if (existingAdmin) {
      this.logger.log('⏭️ Usuarios de prueba ya existen, saltando...');
      return;
    }

    const usersData = [
      {
        email: 'admin@cermont.com',
        name: 'Admin CERMONT',
        password,
        role: 'admin' as const,
        active: true,
        emailVerified: true,
      },
      {
        email: 'supervisor@cermont.com',
        name: 'Supervisor Técnico',
        password,
        role: 'supervisor' as const,
        active: true,
        emailVerified: true,
      },
      {
        email: 'tecnico@cermont.com',
        name: 'Técnico de Campo',
        password,
        role: 'tecnico' as const,
        active: true,
        emailVerified: true,
      },
    ];

    // Crear usuarios adicionales aleatorios
    for (let i = 0; i < 5; i++) {
      usersData.push({
        email: faker.internet.email().toLowerCase(),
        name: faker.person.fullName(),
        password,
        role: faker.helpers.arrayElement(['supervisor', 'tecnico']) as 'supervisor' | 'tecnico',
        active: true,
        emailVerified: true,
      });
    }

    for (const userData of usersData) {
      await this.prisma.user.create({ data: userData });
    }

    this.logger.log(`✅ ${usersData.length} usuarios creados`);
  }
}
