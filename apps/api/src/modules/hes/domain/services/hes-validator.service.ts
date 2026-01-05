/**
 * Domain Service: HESValidatorService
 *
 * Servicio de dominio para validar completitud de HES
 */

import { HES } from "../entities/hes.entity";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class HESValidatorService {
  validate(hes: HES): ValidationResult {
    const errors: string[] = [];

    // Validar información del cliente
    if (!hes.getClienteInfo()) {
      errors.push("Información del cliente es requerida");
    }

    // Validar condiciones de entrada
    if (!hes.getCondicionesEntrada()) {
      errors.push("Condiciones de entrada son requeridas");
    } else {
      const tipoServicio = hes.getTipoServicio();
      if (tipoServicio.requiereFotosEntrada()) {
        const condiciones = hes.getCondicionesEntrada();
        if (condiciones && !condiciones.tieneFotos()) {
          errors.push("Este tipo de servicio requiere fotos de entrada");
        }
      }
    }

    // Validar diagnóstico
    if (!hes.getDiagnosticoPreliminar()) {
      errors.push("Diagnóstico preliminar es requerido");
    }

    // Validar seguridad
    if (!hes.getRequerimientosSeguridad()) {
      errors.push("Requerimientos de seguridad son requeridos");
    } else {
      const seguridad = hes.getRequerimientosSeguridad();
      if (seguridad && !seguridad.checklistCompletado()) {
        errors.push(
          `Checklist de seguridad incompleto (${seguridad.getPorcentajeCompletitud()}%)`,
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
