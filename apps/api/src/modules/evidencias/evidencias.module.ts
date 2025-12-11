import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { EvidenciasController } from './evidencias.controller';
import { EvidenciasService } from './evidencias.service';

@Module({ imports: [MulterModule.register({ dest: './uploads', limits: { fileSize: 10 * 1024 * 1024 } })], controllers: [EvidenciasController], providers: [EvidenciasService], exports: [EvidenciasService] })
export class EvidenciasModule { }
