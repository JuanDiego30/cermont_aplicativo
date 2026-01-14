import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { PlaneacionController } from "./infrastructure/controllers/planeacion.controller";
import { PlaneacionService } from "./planeacion.service";
import {
  GetPlaneacionUseCase,
  CreateOrUpdatePlaneacionUseCase,
  AprobarPlaneacionUseCase,
  RechazarPlaneacionUseCase,
} from "./application/use-cases";
import { PLANEACION_REPOSITORY } from "./domain/repositories";
import { PlaneacionRepository } from "./infrastructure/persistence/planeacion.repository";

@Module({
  imports: [PrismaModule],
  controllers: [PlaneacionController],
  providers: [
    // Repository binding (Dependency Inversion)
    {
      provide: PLANEACION_REPOSITORY,
      useClass: PlaneacionRepository,
    },
    // Services
    PlaneacionService,
    // Use Cases
    GetPlaneacionUseCase,
    CreateOrUpdatePlaneacionUseCase,
    AprobarPlaneacionUseCase,
    RechazarPlaneacionUseCase,
  ],
  exports: [
    PlaneacionService,
    PLANEACION_REPOSITORY,
    GetPlaneacionUseCase,
    CreateOrUpdatePlaneacionUseCase,
  ],
})
export class PlaneacionModule {}
