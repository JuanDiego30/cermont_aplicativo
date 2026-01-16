import { Alerta } from '../entities/alerta.entity';

export const ALERTA_REPOSITORY = Symbol('ALERTA_REPOSITORY');

export interface IAlertaRepository {
  findById(id: string): Promise<Alerta | null>;
  marcarComoEnviada(id: string, canal: string): Promise<void>;
  save(alerta: Alerta): Promise<void>;
}
