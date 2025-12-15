/**
 * ARCHIVO: prisma.module.ts
 * FUNCION: Módulo global que provee PrismaService a toda la aplicación
 * IMPLEMENTACION: Decorador @Global hace el servicio disponible sin re-importar
 * DEPENDENCIAS: @nestjs/common, PrismaService
 * EXPORTS: PrismaService (disponible globalmente)
 */
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
    providers: [PrismaService],
    exports: [PrismaService],
})
export class PrismaModule { }
