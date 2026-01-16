/**
 * @module FormulariosModule
 *
 * Módulo de formularios dinámicos con DDD completo.
 * Permite crear, gestionar, renderizar y procesar formularios configurables.
 */
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MulterModule } from '@nestjs/platform-express';

// Controllers
import { FormsController } from './infrastructure/controllers/forms.controller';

// Use Cases
import {
  ArchiveTemplateUseCase,
  CreateTemplateUseCase,
  GetSubmissionUseCase,
  GetTemplateUseCase,
  ListSubmissionsUseCase,
  ListTemplatesUseCase,
  PublishTemplateUseCase,
  SubmitFormUseCase,
  UpdateTemplateUseCase,
} from './application/use-cases';

// Repositories
import { FORM_SUBMISSION_REPOSITORY, FORM_TEMPLATE_REPOSITORY } from './domain/repositories';
import { FormSubmissionRepository, FormTemplateRepository } from './infrastructure/persistence';

// Services
import { FormParserService } from './infrastructure/services/form-parser.service';
import { JSONSchemaValidatorService } from './infrastructure/services/json-schema-validator.service';

// Domain Services
import {
  CalculationEngineService,
  ConditionalLogicEvaluatorService,
  FormSchemaGeneratorService,
  FormValidatorService,
} from './domain/services';

// Legacy (deprecar)
import { PrismaModule } from '../../prisma/prisma.module';
import { FormsService } from './forms.service';

@Module({
  imports: [
    PrismaModule,
    EventEmitterModule,
    MulterModule.register({
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  ],
  controllers: [FormsController],
  providers: [
    {
      provide: FORM_TEMPLATE_REPOSITORY,
      useClass: FormTemplateRepository,
    },
    {
      provide: FORM_SUBMISSION_REPOSITORY,
      useClass: FormSubmissionRepository,
    },
    CreateTemplateUseCase,
    UpdateTemplateUseCase,
    PublishTemplateUseCase,
    ArchiveTemplateUseCase,
    GetTemplateUseCase,
    ListTemplatesUseCase,
    SubmitFormUseCase,
    GetSubmissionUseCase,
    ListSubmissionsUseCase,
    FormParserService,
    JSONSchemaValidatorService,
    FormValidatorService,
    ConditionalLogicEvaluatorService,
    CalculationEngineService,
    FormSchemaGeneratorService,
    FormsService,
  ],
  exports: [
    FORM_TEMPLATE_REPOSITORY,
    FORM_SUBMISSION_REPOSITORY,
    CreateTemplateUseCase,
    UpdateTemplateUseCase,
    PublishTemplateUseCase,
    GetTemplateUseCase,
    ListTemplatesUseCase,
    SubmitFormUseCase,
    GetSubmissionUseCase,
    FormParserService,
    JSONSchemaValidatorService,
    FormValidatorService,
    ConditionalLogicEvaluatorService,
    CalculationEngineService,
    FormSchemaGeneratorService,
    FormsService,
  ],
})
export class FormsModule {}
