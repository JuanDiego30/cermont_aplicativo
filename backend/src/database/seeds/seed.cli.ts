import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { SeedService } from './seed.service';

/**
 * Script CLI para ejecutar seeders
 *
 * @example
 * ```bash
 * pnpm seed:run
 * # O directamente:
 * npx ts-node -r tsconfig-paths/register src/database/seeds/seed.cli.ts
 * ```
 */
async function runSeed() {
  console.log('🌱 Iniciando proceso de seed...');

  const app = await NestFactory.createApplicationContext(SeedModule);
  const seeder = app.get(SeedService);

  try {
    await seeder.run();
    console.log('✅ Seed ejecutado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando seed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

runSeed();
