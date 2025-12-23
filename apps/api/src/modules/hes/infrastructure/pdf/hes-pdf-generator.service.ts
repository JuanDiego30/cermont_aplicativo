/**
 * Service: HESPDFGeneratorService
 * 
 * Genera PDF de HES usando pdfkit
 */

import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { HES } from '../../domain/entities/hes.entity';

@Injectable()
export class HESPDFGeneratorService {
  async generate(hes: HES): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, left: 50, right: 50, bottom: 50 },
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      this.renderHeader(doc, hes);

      // Cliente
      this.renderClienteInfo(doc, hes.getClienteInfo());

      // Servicio
      this.renderServicioInfo(doc, hes);

      // Condiciones de entrada
      const condicionesEntrada = hes.getCondicionesEntrada();
      if (condicionesEntrada) {
        this.renderCondicionesEntrada(doc, condicionesEntrada);
      }

      // Diagnóstico
      const diagnostico = hes.getDiagnosticoPreliminar();
      if (diagnostico) {
        this.renderDiagnostico(doc, diagnostico);
      }

      // Seguridad
      const seguridad = hes.getRequerimientosSeguridad();
      if (seguridad) {
        this.renderSeguridad(doc, seguridad);
      }

      // Firmas
      this.renderFirmas(doc, hes);

      // Footer
      this.renderFooter(doc);

      doc.end();
    });
  }

  private renderHeader(doc: PDFKit.PDFDocument, hes: HES): void {
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('HOJA DE ENTRADA DE SERVICIO', { align: 'center' });

    doc
      .fontSize(12)
      .font('Helvetica')
      .text(`Número: ${hes.getNumero()}`, { align: 'center' })
      .moveDown();

    doc
      .fontSize(10)
      .text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, { align: 'center' })
      .moveDown(2);
  }

  private renderClienteInfo(doc: any, cliente: any): void {
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('INFORMACIÓN DEL CLIENTE')
      .moveDown(0.5);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Nombre: ${cliente.getNombre()}`)
      .text(`Identificación: ${cliente.getIdentificacion()}`)
      .text(`Teléfono: ${cliente.getTelefono()}`);

    if (cliente.getEmail()) {
      doc.text(`Email: ${cliente.getEmail()}`);
    }

    doc.text(`Dirección: ${cliente.getDireccionCompleta()}`).moveDown();
  }

  private renderServicioInfo(doc: any, hes: HES): void {
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('INFORMACIÓN DEL SERVICIO')
      .moveDown(0.5);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Tipo de Servicio: ${hes.getTipoServicio().toString()}`)
      .text(`Prioridad: ${hes.getPrioridad().toString()}`)
      .text(`Nivel de Riesgo: ${hes.getNivelRiesgo().toString()}`)
      .text(`Orden ID: ${hes.getOrdenId()}`)
      .moveDown();
  }

  private renderCondicionesEntrada(doc: any, condiciones: any): void {
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('CONDICIONES DE ENTRADA')
      .moveDown(0.5);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Estado General: ${condiciones.getEstadoGeneral()}`)
      .text(`Equipo Funcional: ${condiciones.isEquipoFuncional() ? 'Sí' : 'No'}`);

    if (condiciones.tieneDanios()) {
      doc.text(`Daños Visibles: ${condiciones.getDaniosVisibles().join(', ')}`);
    }

    if (condiciones.getObservaciones()) {
      doc.text(`Observaciones: ${condiciones.getObservaciones()}`);
    }

    doc.moveDown();
  }

  private renderDiagnostico(doc: any, diagnostico: any): void {
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('DIAGNÓSTICO PRELIMINAR')
      .moveDown(0.5);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Descripción: ${diagnostico.getDescripcion()}`);

    if (diagnostico.getCausaProbable()) {
      doc.text(`Causa Probable: ${diagnostico.getCausaProbable()}`);
    }

    if (diagnostico.getAccionesRecomendadas().length > 0) {
      doc.text('Acciones Recomendadas:');
      diagnostico.getAccionesRecomendadas().forEach((accion: string) => {
        doc.text(`  • ${accion}`, { indent: 20 });
      });
    }

    doc.moveDown();
  }

  private renderSeguridad(doc: any, seguridad: any): void {
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('REQUERIMIENTOS DE SEGURIDAD')
      .moveDown(0.5);

    doc.fontSize(10).font('Helvetica');

    if (seguridad.getEPPRequerido().length > 0) {
      doc.text('EPP Requerido:');
      seguridad.getEPPRequerido().forEach((epp: any) => {
        doc.text(`  • ${epp.toString()}`, { indent: 20 });
      });
    }

    doc.moveDown(0.5);
    doc.text('CHECKLIST DE SEGURIDAD:');
    const checklistItems = seguridad.getChecklistItems();
    checklistItems.forEach((completado: boolean, item: string) => {
      const check = completado ? '✓' : '✗';
      doc.text(`  ${check} ${item}`, { indent: 20 });
    });

    doc
      .text(`Porcentaje de Completitud: ${seguridad.getPorcentajeCompletitud()}%`)
      .moveDown();
  }

  private renderFirmas(doc: any, hes: HES): void {
    doc.moveDown(2);

    const y = doc.y;

    // Firma Cliente (izquierda)
    if (hes.clienteFirmo()) {
      const firmaCliente = hes.getFirmaCliente();
      if (firmaCliente) {
        doc.fontSize(10).text('Firma Cliente:', 50, y);

        try {
          // Insertar imagen de firma
          const base64Data = firmaCliente.getImagenBase64().split(',')[1];
          const imageBuffer = Buffer.from(base64Data, 'base64');
          doc.image(imageBuffer, 50, y + 20, { width: 200, height: 60 });

          doc
            .fontSize(8)
            .text(`Firmado por: ${firmaCliente.getFirmadoPor()}`, 50, y + 90)
            .text(`Fecha: ${firmaCliente.getFechaHora().toLocaleDateString('es-CO')}`, 50, y + 105);
        } catch (error) {
          doc.text('Error al cargar firma', 50, y + 20);
        }
      }
    }

    // Firma Técnico (derecha)
    if (hes.tecnicoFirmo()) {
      const firmaTecnico = hes.getFirmaTecnico();
      if (firmaTecnico) {
        doc.fontSize(10).text('Firma Técnico:', 320, y);

        try {
          const base64Data = firmaTecnico.getImagenBase64().split(',')[1];
          const imageBuffer = Buffer.from(base64Data, 'base64');
          doc.image(imageBuffer, 320, y + 20, { width: 200, height: 60 });

          doc
            .fontSize(8)
            .text(`Firmado por: ${firmaTecnico.getFirmadoPor()}`, 320, y + 90)
            .text(`Fecha: ${firmaTecnico.getFechaHora().toLocaleDateString('es-CO')}`, 320, y + 105);
        } catch (error) {
          doc.text('Error al cargar firma', 320, y + 20);
        }
      }
    }
  }

  private renderFooter(doc: any): void {
    const pageHeight = doc.page.height;
    const pageWidth = doc.page.width;

    doc
      .fontSize(8)
      .font('Helvetica')
      .text(
        'Este documento es generado automáticamente por el sistema Cermont',
        pageWidth / 2,
        pageHeight - 30,
        { align: 'center' },
      );
  }
}

