/**
 * Domain Service: RiesgoEvaluatorService
 *
 * Evalúa el nivel de riesgo de una HES basado en múltiples factores
 */

import { TipoServicio } from '../value-objects/tipo-servicio.vo';
import { NivelRiesgo } from '../value-objects/nivel-riesgo.vo';
import { RequerimientosSeguridad } from '../entities/requerimientos-seguridad.entity';
import { CondicionesEntrada } from '../entities/condiciones-entrada.entity';

export interface EvaluarRiesgoParams {
  tipoServicio: TipoServicio;
  requerimientosSeguridad?: RequerimientosSeguridad;
  condicionesEntrada?: CondicionesEntrada;
}

export class RiesgoEvaluatorService {
  evaluar(params: EvaluarRiesgoParams): NivelRiesgo {
    let puntos = 0;

    // Evaluar tipo de servicio
    const tipoServicio = params.tipoServicio.getValue();
    if (tipoServicio === 'REPARACION') {
      puntos += 2;
    } else if (tipoServicio === 'INSTALACION') {
      puntos += 1;
    }

    // Evaluar requerimientos de seguridad
    if (params.requerimientosSeguridad) {
      if (params.requerimientosSeguridad.tieneRiesgosAltos()) {
        puntos += 2;
      }

      if (!params.requerimientosSeguridad.checklistCompletado()) {
        puntos += 1;
      }
    }

    // Evaluar condiciones de entrada
    if (params.condicionesEntrada) {
      if (params.condicionesEntrada.tieneDanios()) {
        puntos += 1;
      }
    }

    // Asignar nivel según puntos
    if (puntos >= 5) {
      return NivelRiesgo.critico();
    } else if (puntos >= 3) {
      return NivelRiesgo.alto();
    } else if (puntos >= 1) {
      return NivelRiesgo.medio();
    } else {
      return NivelRiesgo.bajo();
    }
  }
}
