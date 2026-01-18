import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SeedService } from './seed.service';

/**
 * Módulo para la ejecución de seeds de base de datos
 *
 * @example
 * ```bash
 * pnpm seed:run
 * ```
 */
@Module({
  imports: [PrismaModule],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
