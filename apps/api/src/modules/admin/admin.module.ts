/**
 * @module AdminModule
 *
 * Módulo de administración para gestión de usuarios, roles y permisos.
 * Usa el controller refactorizado de la capa de infraestructura.
 */
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AdminController } from './infrastructure/controllers';
import { AdminService } from './admin.service';

@Module({
    imports: [PrismaModule],
    controllers: [AdminController],
    providers: [AdminService],
    exports: [AdminService],
})
export class AdminModule {}
