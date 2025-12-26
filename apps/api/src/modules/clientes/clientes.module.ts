/**
 * @module ClientesModule
 * @description Módulo de gestión de clientes (principalmente SIERRACOL ENERGY)
 * 
 * Características:
 * - CRUD de clientes con validación de NIT
 * - Gestión de múltiples contactos por cliente
 * - Gestión de ubicaciones/sitios (Caño Limón, etc.)
 * - Historial de órdenes por cliente
 */

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';

@Module({
    imports: [PrismaModule],
    controllers: [ClientesController],
    providers: [ClientesService],
    exports: [ClientesService],
})
export class ClientesModule { }
