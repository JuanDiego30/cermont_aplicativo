/**
 * @module HESModule
 * @description Simple HES module - MVP Architecture
 * HES = Hoja de Entrada de Servicio
 */

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { HESController } from './hes.controller';
import { HESService } from './hes.service';

@Module({
  imports: [PrismaModule],
  controllers: [HESController],
  providers: [HESService],
  exports: [HESService],
})
export class HESModule {}
