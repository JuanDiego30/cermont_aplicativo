/**
 * @useCase ArchivarAutomaticoUseCase
 */
import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ARCHIVADO_REPOSITORY, IArchivadoRepository } from '../dto';

@Injectable()
export class ArchivarAutomaticoUseCase {
  private readonly logger = new Logger(ArchivarAutomaticoUseCase.name);
  private readonly DIAS_ANTIGUEDAD = 90;

  constructor(
    @Inject(ARCHIVADO_REPOSITORY)
    private readonly repo: IArchivadoRepository,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async execute(): Promise<{ archivadas: number }> {
    this.logger.log('Iniciando archivado automático...');
    
    const archivadas = await this.repo.archivarAutomatico(this.DIAS_ANTIGUEDAD);
    
    this.logger.log(`Archivadas ${archivadas} órdenes automáticamente`);
    
    return { archivadas };
  }
}
