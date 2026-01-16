import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { AdministrativeClosureService } from "./administrative-closure.service";
import { CIERRE_REPOSITORY } from "./application/dto";
import {
    AprobarCierreUseCase,
    CreateCierreUseCase,
    GetCierreByOrdenUseCase,
} from "./application/use-cases";
import { AdministrativeClosureController } from "./infrastructure/controllers/administrative-closure.controller";
import { CierreRepository } from "./infrastructure/persistence";

@Module({
  imports: [PrismaModule],
  controllers: [AdministrativeClosureController],
  providers: [
    // Repository binding
    {
      provide: CIERRE_REPOSITORY,
      useClass: CierreRepository,
    },
    // Use Cases
    CreateCierreUseCase,
    GetCierreByOrdenUseCase,
    AprobarCierreUseCase,
    // Service (Legacy support)
    AdministrativeClosureService,
  ],
  exports: [
    AdministrativeClosureService,
    CIERRE_REPOSITORY,
    CreateCierreUseCase,
    GetCierreByOrdenUseCase,
    AprobarCierreUseCase,
  ],
})
export class AdministrativeClosureModule {}
