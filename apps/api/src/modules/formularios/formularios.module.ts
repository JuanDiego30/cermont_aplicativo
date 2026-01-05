/**
 * @module FormulariosModule
 *
 * Módulo de formularios dinámicos con DDD completo.
 * Permite crear, gestionar, renderizar y procesar formularios configurables.
 */
import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { EventEmitterModule } from "@nestjs/event-emitter";

// Controllers
import { FormulariosController } from "./infrastructure/controllers/formularios.controller";

// Use Cases
import {
  CreateTemplateUseCase,
  UpdateTemplateUseCase,
  PublishTemplateUseCase,
  ArchiveTemplateUseCase,
  GetTemplateUseCase,
  ListTemplatesUseCase,
  SubmitFormUseCase,
  GetSubmissionUseCase,
  ListSubmissionsUseCase,
} from "./application/use-cases";

// Repositories
import {
  FormTemplateRepository,
  FormSubmissionRepository,
} from "./infrastructure/persistence";
import {
  IFormTemplateRepository,
  IFormSubmissionRepository,
  FORM_TEMPLATE_REPOSITORY,
  FORM_SUBMISSION_REPOSITORY,
} from "./domain/repositories";

// Services
import { FormParserService } from "./infrastructure/services/form-parser.service";
import { JSONSchemaValidatorService } from "./infrastructure/services/json-schema-validator.service";

// Domain Services
import {
  FormValidatorService,
  ConditionalLogicEvaluatorService,
  CalculationEngineService,
  FormSchemaGeneratorService,
} from "./domain/services";

// Legacy (deprecar)
import { FormulariosService } from "./formularios.service";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [
    PrismaModule,
    EventEmitterModule,
    MulterModule.register({
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  ],
  controllers: [FormulariosController],
  providers: [
    // Repositories
    {
      provide: FORM_TEMPLATE_REPOSITORY,
      useClass: FormTemplateRepository,
    },
    {
      provide: FORM_SUBMISSION_REPOSITORY,
      useClass: FormSubmissionRepository,
    },

    // Use Cases
    CreateTemplateUseCase,
    UpdateTemplateUseCase,
    PublishTemplateUseCase,
    ArchiveTemplateUseCase,
    GetTemplateUseCase,
    ListTemplatesUseCase,
    SubmitFormUseCase,
    GetSubmissionUseCase,
    ListSubmissionsUseCase,

    // Infrastructure Services
    FormParserService,
    JSONSchemaValidatorService,

    // Domain Services
    FormValidatorService,
    ConditionalLogicEvaluatorService,
    CalculationEngineService,
    FormSchemaGeneratorService,

    // Legacy (deprecar)
    FormulariosService,
  ],
  exports: [
    // Repositories
    FORM_TEMPLATE_REPOSITORY,
    FORM_SUBMISSION_REPOSITORY,

    // Use Cases
    CreateTemplateUseCase,
    UpdateTemplateUseCase,
    PublishTemplateUseCase,
    GetTemplateUseCase,
    ListTemplatesUseCase,
    SubmitFormUseCase,
    GetSubmissionUseCase,

    // Services
    FormParserService,
    JSONSchemaValidatorService,
    FormValidatorService,
    ConditionalLogicEvaluatorService,
    CalculationEngineService,
    FormSchemaGeneratorService,

    // Legacy
    FormulariosService,
  ],
})
export class FormulariosModule {}
