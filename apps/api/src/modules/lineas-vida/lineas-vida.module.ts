import { Module } from '@nestjs/common';
import { LineasVidaController } from './lineas-vida.controller';
import { LineasVidaService } from './lineas-vida.service';
@Module({ controllers: [LineasVidaController], providers: [LineasVidaService] })
export class LineasVidaModule { }
