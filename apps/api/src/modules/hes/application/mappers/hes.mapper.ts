/**
 * Mapper: HESMapper
 *
 * Mapea entre Domain Entities y DTOs
 */

import { HES } from "../../domain/entities/hes.entity";
import { HESResponseDto } from "../dto/hes-response.dto";
import { CreateHESDto } from "../dto/create-hes.dto";
import { TipoServicio } from "../../domain/value-objects/tipo-servicio.vo";
import { Prioridad } from "../../domain/value-objects/prioridad.vo";
import { ClienteInfo } from "../../domain/entities/cliente-info.entity";
import { CondicionesEntrada } from "../../domain/entities/condiciones-entrada.entity";
import { DiagnosticoPreliminar } from "../../domain/entities/diagnostico-preliminar.entity";
import { RequerimientosSeguridad } from "../../domain/entities/requerimientos-seguridad.entity";

export class HESMapper {
  static toResponseDto(hes: HES): HESResponseDto {
    const clienteInfo = hes.getClienteInfo();
    const condicionesEntrada = hes.getCondicionesEntrada();
    const diagnostico = hes.getDiagnosticoPreliminar();
    const seguridad = hes.getRequerimientosSeguridad();
    const firmaCliente = hes.getFirmaCliente();
    const firmaTecnico = hes.getFirmaTecnico();

    return {
      id: hes.getId().getValue(),
      numero: hes.getNumero(),
      ordenId: hes.getOrdenId(),
      estado: hes.getEstado().getValue(),
      tipoServicio: hes.getTipoServicio().getValue(),
      prioridad: hes.getPrioridad().getValue(),
      nivelRiesgo: hes.getNivelRiesgo().getValue(),
      clienteInfo: {
        nombre: clienteInfo.getNombre(),
        identificacion: clienteInfo.getIdentificacion(),
        telefono: clienteInfo.getTelefono(),
        email: clienteInfo.getEmail(),
        direccion: clienteInfo.getDireccionCompleta(),
      },
      condicionesEntrada: condicionesEntrada
        ? {
            estadoGeneral: condicionesEntrada.getEstadoGeneral(),
            equipoFuncional: condicionesEntrada.isEquipoFuncional(),
            daniosVisibles: condicionesEntrada.getDaniosVisibles(),
            fotosEntrada: condicionesEntrada.getFotosEntrada(),
          }
        : undefined,
      diagnosticoPreliminar: diagnostico
        ? {
            descripcion: diagnostico.getDescripcion(),
            causaProbable: diagnostico.getCausaProbable(),
            accionesRecomendadas: diagnostico.getAccionesRecomendadas(),
          }
        : undefined,
      requerimientosSeguridad: seguridad
        ? {
            eppRequerido: seguridad
              .getEPPRequerido()
              .map((epp) => epp.toString()),
            checklistItems: Object.fromEntries(seguridad.getChecklistItems()),
            porcentajeCompletitud: seguridad.getPorcentajeCompletitud(),
          }
        : undefined,
      firmaCliente: firmaCliente
        ? {
            firmadoPor: firmaCliente.getFirmadoPor(),
            fechaHora: firmaCliente.getFechaHora().toISOString(),
          }
        : undefined,
      firmaTecnico: firmaTecnico
        ? {
            firmadoPor: firmaTecnico.getFirmadoPor(),
            fechaHora: firmaTecnico.getFechaHora().toISOString(),
          }
        : undefined,
      creadoPor: (hes as any)._creadoPor,
      creadoEn: (hes as any)._creadoEn.toISOString(),
      completadoEn: (hes as any)._completadoEn?.toISOString(),
      version: (hes as any)._version,
    };
  }

  static toDomain(
    dto: CreateHESDto,
    creadoPor: string,
    numero?: string,
    year?: number,
  ): HES {
    const tipoServicio = TipoServicio.fromString(dto.tipoServicio);
    const prioridad = Prioridad.fromString(dto.prioridad);
    const clienteInfo = ClienteInfo.create(dto.clienteInfo);

    const condicionesEntrada = dto.condicionesEntrada
      ? CondicionesEntrada.create(dto.condicionesEntrada)
      : undefined;

    const diagnostico = dto.diagnosticoPreliminar
      ? DiagnosticoPreliminar.create(dto.diagnosticoPreliminar)
      : undefined;

    const requerimientosSeguridad = dto.requerimientosSeguridad
      ? RequerimientosSeguridad.create(dto.requerimientosSeguridad)
      : undefined;

    return HES.create({
      numero: numero ? undefined : undefined, // Se generará automáticamente
      ordenId: dto.ordenId,
      tipoServicio,
      prioridad,
      clienteInfo,
      condicionesEntrada,
      diagnosticoPreliminar: diagnostico,
      requerimientosSeguridad,
      creadoPor,
      year: year || new Date().getFullYear(),
    });
  }
}
