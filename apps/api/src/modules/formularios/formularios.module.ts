import { Module } from '@nestjs/common';
import { FormulariosController } from './infrastructure/controllers/formularios.controller';
import { FormulariosService } from './formularios.service';
import { FORMULARIO_REPOSITORY } from './application/dto';
import { FormularioRepository } from './infrastructure/persistence';
import { ListFormulariosUseCase, CreateFormularioUseCase, SubmitFormularioUseCase } from './application/use-cases';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FormulariosController],
  providers: [
    FormulariosService,
    {
      provide: FORMULARIO_REPOSITORY,
      useClass: FormularioRepository,
    },
    ListFormulariosUseCase,
    CreateFormularioUseCase,
    SubmitFormularioUseCase,
  ],
  exports: [FormulariosService],
})
export class FormulariosModule { }
