import { Ejecucion } from '../../domain/entities';
import { EjecucionResponse } from '../dto';

export function toEjecucionResponse(e: Ejecucion): EjecucionResponse {
  return {
    id: e.getId().getValue(),
    ordenId: e.getOrdenId(),
    tecnicoId: e.getStartedBy() || '',
    estado: e.getStatus().getValue(),
    avance: e.getProgress().getValue(),
    horasReales: e.getTotalWorkedTime().getTotalHours(),
    fechaInicio: e.getStartedAt()?.toISOString() || new Date().toISOString(),
    fechaFin: e.getCompletedAt()?.toISOString(),
    observaciones: e.getObservaciones(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
