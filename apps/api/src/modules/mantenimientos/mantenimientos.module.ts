/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MANTENIMIENTOS MODULE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Módulo de gestión de mantenimientos con Clean Architecture.
 *
 * Principios aplicados:
 * - DIP: Inyección de dependencias con interfaces
 * - SRP: Separación en capas (domain, infrastructure)
 * - OCP: Extensible mediante nuevos use cases
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";

// Domain
import { MANTENIMIENTO_REPOSITORY } from "./domain/repositories/mantenimiento.repository.interface";

// Infrastructure
import { PrismaMantenimientoRepository } from "./infrastructure/persistence";
import { MantenimientosController } from "./infrastructure/controllers";

@Module({
  imports: [PrismaModule],
  controllers: [MantenimientosController],
  providers: [
    // Repository Implementation
    {
      provide: MANTENIMIENTO_REPOSITORY,
      useClass: PrismaMantenimientoRepository,
    },
    PrismaMantenimientoRepository,
  ],
  exports: [MANTENIMIENTO_REPOSITORY],
})
export class MantenimientosModule {}
