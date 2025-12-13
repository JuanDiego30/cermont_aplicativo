/**
 * @module UsuariosModule
 *
 * Módulo para administración de usuarios (CRUD y activación/desactivación).
 *
 * Uso: Importado por AppModule para exponer rutas /usuarios.
 */
import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';

@Module({ controllers: [UsuariosController], providers: [UsuariosService], exports: [UsuariosService] })
export class UsuariosModule { }
