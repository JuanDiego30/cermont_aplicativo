/**
 * @module FormsModule
 *
 * Módulo de formularios dinámicos.
 * Permite crear, parsear y gestionar formularios desde JSON schemas.
 */
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { FormsController } from './forms.controller';
import { FormsService } from './forms.service';
import { FormParserService } from './infrastructure/services/form-parser.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [
        PrismaModule,
        MulterModule.register({
            limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
        }),
    ],
    controllers: [FormsController],
    providers: [FormsService, FormParserService],
    exports: [FormsService, FormParserService],
})
export class FormsModule { }
