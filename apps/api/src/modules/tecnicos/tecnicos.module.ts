import { Module } from '@nestjs/common';
import { TecnicosController } from './tecnicos.controller';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
    imports: [UsuariosModule],
    controllers: [TecnicosController],
})
export class TecnicosModule { }
