/**
 * @module PlaneacionModule (Refactored)
 * @description Módulo con Clean Architecture
 */
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PLANEACION_REPOSITORY } from './domain/repositories';
import { PlaneacionRepository } from './infrastructure/persistence';
import { PlaneacionController } from './infrastructure/controllers';
import {
  GetPlaneacionUseCase,
  CreateOrUpdatePlaneacionUseCase,
  AprobarPlaneacionUseCase,
  RechazarPlaneacionUseCase,
} from './application/use-cases';

@Module({
  imports: [PrismaModule],
  controllers: [PlaneacionController],
  providers: [
    // Repository
    {
      provide: PLANEACION_REPOSITORY,
      useClass: PlaneacionRepository,
    },
    // Use Cases
    GetPlaneacionUseCase,
    CreateOrUpdatePlaneacionUseCase,
    AprobarPlaneacionUseCase,
    RechazarPlaneacionUseCase,
  ],
  exports: [PLANEACION_REPOSITORY],
})
export class PlaneacionModuleRefactored {}
