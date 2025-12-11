import { Module } from '@nestjs/common';
import { HesController } from './hes.controller';
import { HesService } from './hes.service';
@Module({ controllers: [HesController], providers: [HesService] })
export class HesModule { }
