/**
 * Mapper: HESPrismaMapper
 * 
 * Mapea entre Domain Entities y Prisma models
 */

import { HES } from '../../domain/entities/hes.entity';
import { HESId } from '../../domain/value-objects/hes-id.vo';
import { HESNumero } from '../../domain/value-objects/hes-numero.vo';
import { EstadoHES } from '../../domain/value-objects/estado-hes.vo';
import { TipoServicio } from '../../domain/value-objects/tipo-servicio.vo';
import { Prioridad } from '../../domain/value-objects/prioridad.vo';
import { NivelRiesgo } from '../../domain/value-objects/nivel-riesgo.vo';
import { ClienteInfo } from '../../domain/entities/cliente-info.entity';
import { CondicionesEntrada } from '../../domain/entities/condiciones-entrada.entity';
import { DiagnosticoPreliminar } from '../../domain/entities/diagnostico-preliminar.entity';
import { RequerimientosSeguridad } from '../../domain/entities/requerimientos-seguridad.entity';
import { FirmaDigital } from '../../domain/entities/firma-digital.entity';
import { Telefono } from '../../domain/value-objects/telefono.vo';
import { Direccion } from '../../domain/value-objects/direccion.vo';
import { CoordenadasGPS } from '../../domain/value-objects/coordenadas-gps.vo';
import { Email } from '../../../../common/domain/value-objects/email.vo';
import { EPPRequerido } from '../../domain/value-objects/epp-requerido.vo';

export class HESPrismaMapper {
  static toPrisma(hes: HES): any {
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
        coordenadasGPS: clienteInfo.getCoordenadasGPS(),
      },
      condicionesEntrada: condicionesEntrada
        ? {
            estadoGeneral: condicionesEntrada.getEstadoGeneral(),
            equipoFuncional: condicionesEntrada.isEquipoFuncional(),
            daniosVisibles: condicionesEntrada.getDaniosVisibles(),
            observaciones: condicionesEntrada.getObservaciones(),
            fotosEntrada: condicionesEntrada.getFotosEntrada(),
          }
        : null,
      diagnosticoPreliminar: diagnostico
        ? {
            descripcion: diagnostico.getDescripcion(),
            causaProbable: diagnostico.getCausaProbable(),
            accionesRecomendadas: diagnostico.getAccionesRecomendadas(),
            requiereRepuestos: diagnostico.requiereRepuestos(),
            repuestosNecesarios: diagnostico.getRepuestosNecesarios(),
            tiempoEstimado: diagnostico.getTiempoEstimado(),
          }
        : null,
      requerimientosSeguridad: seguridad
        ? {
            eppRequerido: seguridad.getEPPRequerido().map((epp) => ({
              tipo: epp.getTipo(),
              descripcion: epp.getDescripcion(),
            })),
            permisosNecesarios: seguridad.getPermisosNecesarios(),
            riesgosIdentificados: seguridad.getRiesgosIdentificados(),
            medidasControl: seguridad.getMedidasControl(),
            checklistItems: Object.fromEntries(seguridad.getChecklistItems()),
            observaciones: seguridad.getObservaciones(),
          }
        : null,
      firmaCliente: firmaCliente
        ? {
            imagenBase64: firmaCliente.getImagenBase64(),
            metadata: firmaCliente.toJSON(),
          }
        : null,
      firmaTecnico: firmaTecnico
        ? {
            imagenBase64: firmaTecnico.getImagenBase64(),
            metadata: firmaTecnico.toJSON(),
          }
        : null,
      firmadoClienteAt: (hes as any)._firmadoClienteAt,
      firmadoTecnicoAt: (hes as any)._firmadoTecnicoAt,
      creadoPor: (hes as any)._creadoPor,
      completadoEn: (hes as any)._completadoEn,
      anuladoEn: (hes as any)._anuladoEn,
      anuladoPor: (hes as any)._anuladoPor,
      motivoAnulacion: (hes as any)._motivoAnulacion,
      version: (hes as any)._version,
    };
  }

  static fromPrisma(data: any): HES {
    // Reconstruir Value Objects
    const id = HESId.create(data.id);
    const numero = HESNumero.create(data.numero);
    const estado = EstadoHES.fromString(data.estado);
    const tipoServicio = TipoServicio.fromString(data.tipoServicio);
    const prioridad = Prioridad.fromString(data.prioridad);
    const nivelRiesgo = NivelRiesgo.fromString(data.nivelRiesgo);

    // Reconstruir ClienteInfo
    const clienteInfoData = data.clienteInfo || {};
    const clienteInfo = ClienteInfo.create({
      nombre: clienteInfoData.nombre,
      identificacion: clienteInfoData.identificacion,
      telefono: clienteInfoData.telefono,
      email: clienteInfoData.email,
      direccion: this.parseDireccion(clienteInfoData.direccion),
      coordenadasGPS: clienteInfoData.coordenadasGPS
        ? { latitud: clienteInfoData.coordenadasGPS.lat, longitud: clienteInfoData.coordenadasGPS.lon }
        : undefined,
    });

    // Reconstruir CondicionesEntrada
    const condicionesEntrada = data.condicionesEntrada
      ? CondicionesEntrada.create(data.condicionesEntrada)
      : undefined;

    // Reconstruir DiagnosticoPreliminar
    const diagnostico = data.diagnosticoPreliminar
      ? DiagnosticoPreliminar.create(data.diagnosticoPreliminar)
      : undefined;

    // Reconstruir RequerimientosSeguridad
    const seguridad = data.requerimientosSeguridad
      ? RequerimientosSeguridad.create({
          eppRequerido: data.requerimientosSeguridad.eppRequerido,
          permisosNecesarios: data.requerimientosSeguridad.permisosNecesarios,
          riesgosIdentificados: data.requerimientosSeguridad.riesgosIdentificados,
          medidasControl: data.requerimientosSeguridad.medidasControl,
          checklistItems: data.requerimientosSeguridad.checklistItems,
          observaciones: data.requerimientosSeguridad.observaciones,
        })
      : undefined;

    // Reconstruir FirmaDigital
    const firmaCliente = data.firmaCliente
      ? FirmaDigital.create({
          imagenBase64: data.firmaCliente.imagenBase64,
          firmadoPor: data.firmaCliente.metadata.firmadoPor,
          identificacion: data.firmaCliente.metadata.identificacion,
          ipAddress: data.firmaCliente.metadata.ipAddress,
        })
      : undefined;

    const firmaTecnico = data.firmaTecnico
      ? FirmaDigital.create({
          imagenBase64: data.firmaTecnico.imagenBase64,
          firmadoPor: data.firmaTecnico.metadata.firmadoPor,
          identificacion: data.firmaTecnico.metadata.identificacion,
          ipAddress: data.firmaTecnico.metadata.ipAddress,
        })
      : undefined;

    // Crear instancia de HES (usando constructor privado vía método estático)
    // Nota: Esto requiere acceso a propiedades privadas, por lo que usamos un método helper
    const hes = HES.create({
      numero,
      ordenId: data.ordenId,
      tipoServicio,
      prioridad,
      clienteInfo,
      condicionesEntrada,
      diagnosticoPreliminar: diagnostico,
      requerimientosSeguridad: seguridad,
      creadoPor: data.creadoPor,
    });

    // Asignar propiedades que no se pueden establecer en create
    (hes as any)._id = id;
    (hes as any)._numero = numero;
    (hes as any)._estado = estado;
    (hes as any)._nivelRiesgo = nivelRiesgo;
    (hes as any)._firmaCliente = firmaCliente;
    (hes as any)._firmaTecnico = firmaTecnico;
    (hes as any)._firmadoClienteAt = data.firmadoClienteAt ? new Date(data.firmadoClienteAt) : undefined;
    (hes as any)._firmadoTecnicoAt = data.firmadoTecnicoAt ? new Date(data.firmadoTecnicoAt) : undefined;
    (hes as any)._creadoEn = data.createdAt ? new Date(data.createdAt) : new Date();
    (hes as any)._completadoEn = data.completadoEn ? new Date(data.completadoEn) : undefined;
    (hes as any)._anuladoEn = data.anuladoEn ? new Date(data.anuladoEn) : undefined;
    (hes as any)._anuladoPor = data.anuladoPor;
    (hes as any)._motivoAnulacion = data.motivoAnulacion;
    (hes as any)._version = data.version || 1;

    return hes;
  }

  private static parseDireccion(direccionStr: string): any {
    // Parsear dirección desde string a objeto
    // Formato: "Calle, #Numero, Barrio, Ciudad, Departamento, País"
    const parts = direccionStr.split(',').map((p) => p.trim());
    
    return {
      calle: parts[0] || '',
      numero: parts[1]?.replace('#', '') || undefined,
      barrio: parts[2]?.replace('Barrio ', '') || undefined,
      ciudad: parts[3] || '',
      departamento: parts[4] || undefined,
      pais: parts[5] || 'Colombia',
    };
  }
}

