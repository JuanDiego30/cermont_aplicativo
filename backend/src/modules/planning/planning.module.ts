import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import {
    AprobarPlaneacionUseCase,
    CreateOrUpdatePlaneacionUseCase,
    GetPlaneacionUseCase,
    RechazarPlaneacionUseCase,
} from "./application/use-cases";
import { PLANEACION_REPOSITORY } from "./domain/repositories";
import { PlanningController } from "./infrastructure/controllers/planning.controller";
import { PlaneacionRepository } from "./infrastructure/persistence/planeacion.repository";
import { PlanningService } from "./planning.service";

@Module({
  imports: [PrismaModule],
  controllers: [PlanningController],
  providers: [
    {
      provide: PLANEACION_REPOSITORY,
      useClass: PlaneacionRepository,
    },
    PlanningService,
    GetPlaneacionUseCase,
    CreateOrUpdatePlaneacionUseCase,
    AprobarPlaneacionUseCase,
    RechazarPlaneacionUseCase,
  ],
  exports: [
    PlanningService,
    PLANEACION_REPOSITORY,
    GetPlaneacionUseCase,
    CreateOrUpdatePlaneacionUseCase,
  ],
})
export class PlanningModule {}
