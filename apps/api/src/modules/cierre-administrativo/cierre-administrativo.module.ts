import { Module } from '@nestjs/common';
import { CierreAdministrativoController } from './cierre-administrativo.controller';
import { CierreAdministrativoService } from './cierre-administrativo.service';
@Module({ controllers: [CierreAdministrativoController], providers: [CierreAdministrativoService] })
export class CierreAdministrativoModule { }
