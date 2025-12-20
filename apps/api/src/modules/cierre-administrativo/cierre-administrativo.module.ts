import { Module } from '@nestjs/common';
import { CierreAdministrativoController } from './infrastructure/controllers/cierre-administrativo.controller';
import { CierreAdministrativoService } from './cierre-administrativo.service';

@Module({
  controllers: [CierreAdministrativoController],
  providers: [CierreAdministrativoService],
  exports: [CierreAdministrativoService],
})
export class CierreAdministrativoModule { }
