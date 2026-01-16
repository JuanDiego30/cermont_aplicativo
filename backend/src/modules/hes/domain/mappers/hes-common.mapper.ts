import { HES } from '../entities/hes.entity';
import { ClienteInfo } from '../entities/cliente-info.entity';
import { CondicionesEntrada } from '../entities/condiciones-entrada.entity';
import { DiagnosticoPreliminar } from '../entities/diagnostico-preliminar.entity';
import { RequerimientosSeguridad } from '../entities/requerimientos-seguridad.entity';
import { FirmaDigital } from '../entities/firma-digital.entity';

export function getHesParts(hes: HES): {
  clienteInfo: ClienteInfo;
  condicionesEntrada?: CondicionesEntrada;
  diagnosticoPreliminar?: DiagnosticoPreliminar;
  requerimientosSeguridad?: RequerimientosSeguridad;
  firmaCliente?: FirmaDigital;
  firmaTecnico?: FirmaDigital;
} {
  return {
    clienteInfo: hes.getClienteInfo(),
    condicionesEntrada: hes.getCondicionesEntrada(),
    diagnosticoPreliminar: hes.getDiagnosticoPreliminar(),
    requerimientosSeguridad: hes.getRequerimientosSeguridad(),
    firmaCliente: hes.getFirmaCliente(),
    firmaTecnico: hes.getFirmaTecnico(),
  };
}

export function mapHesCore(hes: HES): {
  id: string;
  numero: string;
  ordenId: string;
  estado: string;
  tipoServicio: string;
  prioridad: string;
  nivelRiesgo: string;
} {
  return {
    id: hes.getId().getValue(),
    numero: hes.getNumero(),
    ordenId: hes.getOrdenId(),
    estado: hes.getEstado().getValue(),
    tipoServicio: hes.getTipoServicio().getValue(),
    prioridad: hes.getPrioridad().getValue(),
    nivelRiesgo: hes.getNivelRiesgo().getValue(),
  };
}

export function mapClienteInfoCore(clienteInfo: ClienteInfo): {
  nombre: string;
  identificacion: string;
  telefono: string;
  email: string | undefined;
  direccion: string;
} {
  return {
    nombre: clienteInfo.getNombre(),
    identificacion: clienteInfo.getIdentificacion(),
    telefono: clienteInfo.getTelefono(),
    email: clienteInfo.getEmail(),
    direccion: clienteInfo.getDireccionCompleta(),
  };
}

export function mapCondicionesEntradaCore(condicionesEntrada: CondicionesEntrada): {
  estadoGeneral: string;
  equipoFuncional: boolean;
  daniosVisibles: string[];
  fotosEntrada: string[];
} {
  return {
    estadoGeneral: condicionesEntrada.getEstadoGeneral(),
    equipoFuncional: condicionesEntrada.isEquipoFuncional(),
    daniosVisibles: condicionesEntrada.getDaniosVisibles(),
    fotosEntrada: condicionesEntrada.getFotosEntrada(),
  };
}

export function mapDiagnosticoPreliminarCore(diagnostico: DiagnosticoPreliminar): {
  descripcion: string;
  causaProbable: string | undefined;
  accionesRecomendadas: string[];
} {
  return {
    descripcion: diagnostico.getDescripcion(),
    causaProbable: diagnostico.getCausaProbable(),
    accionesRecomendadas: diagnostico.getAccionesRecomendadas(),
  };
}
