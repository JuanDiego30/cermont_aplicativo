import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';

// PDFKit está instalado - generación nativa de PDFs sin Chromium

export interface GeneratedPDF {
  nombreArchivo: string;
  rutaArchivo: string;
  url: string;
  tamano: number;
  formato: 'pdf' | 'html';
}

@Injectable()
export class PdfGenerationService {
  private readonly logger = new Logger(PdfGenerationService.name);
  private readonly uploadsPath = path.join(process.cwd(), 'uploads', 'pdfs');

  constructor(private readonly prisma: PrismaService) {
    // Crear directorio si no existe
    if (!fs.existsSync(this.uploadsPath)) {
      fs.mkdirSync(this.uploadsPath, { recursive: true });
    }
  }

  // =====================================================
  // GENERACIÓN PDF NATIVA CON PDFKIT (LIGERO - SIN CHROMIUM)
  // =====================================================

  /**
   * Genera un PDF nativo usando PDFKit (sin dependencia de Chromium)
   * Ideal para VPS con recursos limitados
   */
  async generarPDFNativo(
    ordenId: string,
    tipo: 'informe-tecnico' | 'acta-entrega' = 'informe-tecnico',
  ): Promise<GeneratedPDF> {
    const orden = await this.prisma.order.findUnique({
      where: { id: ordenId },
      include: {
        planeacion: { include: { kit: true, items: true } },
        ejecucion: {
          include: {
            checklists: true,
            tareas: true,
            evidenciasEjecucion: true,
          },
        },
        costos: true,
        acta: true,
      },
    });

    if (!orden) throw new NotFoundException('Orden no encontrada');

    const nombreArchivo = `${tipo}-${orden.numero.replace(/\//g, '-')}.pdf`;
    const rutaArchivo = path.join(this.uploadsPath, nombreArchivo);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        info: {
          Title: `${tipo === 'informe-tecnico' ? 'Informe Técnico' : 'Acta de Entrega'} - ${orden.numero}`,
          Author: 'CERMONT S.A.S.',
          Subject: `Orden de Trabajo ${orden.numero}`,
          Creator: 'Sistema Cermont',
        },
      });

      const writeStream = fs.createWriteStream(rutaArchivo);
      doc.pipe(writeStream);

      // Generar contenido según tipo
      if (tipo === 'informe-tecnico') {
        this.generarContenidoInformeTecnicoPDF(doc, orden);
      } else {
        this.generarContenidoActaEntregaPDF(doc, orden);
      }

      doc.end();

      writeStream.on('finish', () => {
        const stats = fs.statSync(rutaArchivo);
        this.logger.log(`PDF generado: ${nombreArchivo} (${stats.size} bytes)`);
        resolve({
          nombreArchivo,
          rutaArchivo,
          url: `/uploads/pdfs/${nombreArchivo}`,
          tamano: stats.size,
          formato: 'pdf',
        });
      });

      writeStream.on('error', (error) => {
        this.logger.error(`Error generando PDF: ${error.message}`);
        reject(error);
      });
    });
  }

  private generarContenidoInformeTecnicoPDF(doc: PDFKit.PDFDocument, orden: any): void {
    const fecha = new Date().toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Header
    doc.fontSize(24).fillColor('#2563eb').text('CERMONT S.A.S.', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(16).fillColor('#1a365d').text('INFORME TÉCNICO DE EJECUCIÓN', { align: 'center' });
    doc.fontSize(10).fillColor('#4a5568').text('Construcción y Mantenimiento Industrial', { align: 'center' });
    doc.moveDown(1);

    // Línea separadora
    doc.moveTo(50, doc.y).lineTo(562, doc.y).stroke('#1a365d');
    doc.moveDown(1);

    // Información General
    doc.fontSize(12).fillColor('#1a365d').text('1. INFORMACIÓN GENERAL', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#333');
    doc.text(`Orden de Trabajo: ${orden.numero}`);
    doc.text(`Fecha del Informe: ${fecha}`);
    doc.text(`Cliente: ${orden.cliente}`);
    doc.text(`Ubicación: ${orden.planeacion?.ubicacion || 'No especificada'}`);
    doc.text(`Estado: ${orden.estado.toUpperCase()}`);
    doc.text(`Prioridad: ${orden.prioridad.toUpperCase()}`);
    doc.moveDown(1);

    // Descripción
    doc.fontSize(12).fillColor('#1a365d').text('2. DESCRIPCIÓN DEL TRABAJO', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#333').text(orden.descripcion, { align: 'justify' });
    doc.moveDown(1);

    // Actividades
    const tareas = orden.ejecucion?.tareas || [];
    doc.fontSize(12).fillColor('#1a365d').text('3. ACTIVIDADES EJECUTADAS', { underline: true });
    doc.moveDown(0.5);
    if (tareas.length > 0) {
      tareas.forEach((t: any, i: number) => {
        doc.fontSize(10).fillColor('#333');
        doc.text(`${i + 1}. ${t.descripcion} - ${t.completada ? '✓ Completada' : '○ Pendiente'}`);
      });
    } else {
      doc.fontSize(10).fillColor('#718096').text('Sin tareas registradas');
    }
    doc.moveDown(1);

    // Checklist
    const checklists = orden.ejecucion?.checklists || [];
    doc.fontSize(12).fillColor('#1a365d').text('4. VERIFICACIÓN DE CHECKLIST', { underline: true });
    doc.moveDown(0.5);
    const completados = checklists.filter((c: any) => c.completada).length;
    doc.fontSize(10).fillColor('#333').text(`Completados: ${completados} / ${checklists.length}`);
    doc.moveDown(1);

    // Datos de ejecución
    doc.fontSize(12).fillColor('#1a365d').text('5. DATOS DE EJECUCIÓN', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#333');
    doc.text(`Fecha Inicio: ${orden.ejecucion?.fechaInicio ? new Date(orden.ejecucion.fechaInicio).toLocaleDateString('es-CO') : 'N/A'}`);
    doc.text(`Fecha Término: ${orden.ejecucion?.fechaTermino ? new Date(orden.ejecucion.fechaTermino).toLocaleDateString('es-CO') : 'En progreso'}`);
    doc.text(`Horas Estimadas: ${orden.ejecucion?.horasEstimadas || 0} horas`);
    doc.text(`Horas Reales: ${orden.ejecucion?.horasActuales || 0} horas`);
    doc.text(`Avance: ${orden.ejecucion?.avancePercentaje || 0}%`);
    doc.moveDown(1);

    // Observaciones
    doc.fontSize(12).fillColor('#1a365d').text('6. OBSERVACIONES', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#333').text(orden.ejecucion?.observaciones || 'Sin observaciones adicionales.', { align: 'justify' });
    doc.moveDown(2);

    // Firmas
    doc.fontSize(10).fillColor('#333');
    const firmaY = doc.y;
    doc.text('_________________________', 100, firmaY);
    doc.text('Técnico Responsable', 100, firmaY + 15);
    doc.text('_________________________', 350, firmaY);
    doc.text('Supervisor', 350, firmaY + 15);

    // Footer
    doc.fontSize(8).fillColor('#718096');
    doc.text(`CERMONT S.A.S. - Arauca, Colombia | Generado el ${fecha}`, 50, 720, { align: 'center' });
  }

  private generarContenidoActaEntregaPDF(doc: PDFKit.PDFDocument, orden: any): void {
    const fecha = new Date().toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const totalCostos = orden.costos?.reduce((sum: number, c: any) => sum + c.monto, 0) || 0;

    // Header
    doc.fontSize(24).fillColor('#2563eb').text('CERMONT S.A.S.', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(16).fillColor('#1a365d').text('ACTA DE ENTREGA DE TRABAJOS', { align: 'center' });
    doc.fontSize(10).fillColor('#4a5568').text('NIT: XXX.XXX.XXX-X | Arauca, Colombia', { align: 'center' });
    doc.moveDown(1);

    doc.moveTo(50, doc.y).lineTo(562, doc.y).stroke('#1a365d');
    doc.moveDown(1);

    // Datos del servicio
    doc.fontSize(12).fillColor('#1a365d').text('DATOS DEL SERVICIO', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#333');
    doc.text(`Orden N°: ${orden.numero}`);
    doc.text(`Cliente: ${orden.cliente}`);
    doc.text(`Fecha de Entrega: ${fecha}`);
    doc.text(`Acta N°: ${orden.acta?.numero || 'Pendiente'}`);
    doc.moveDown(1);

    // Descripción
    doc.fontSize(12).fillColor('#1a365d').text('DESCRIPCIÓN DE TRABAJOS REALIZADOS', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#333').text(orden.descripcion, { align: 'justify' });
    doc.moveDown(1);

    // Resumen
    doc.fontSize(12).fillColor('#1a365d').text('RESUMEN DE EJECUCIÓN', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#333');
    doc.text(`Fecha Inicio: ${orden.ejecucion?.fechaInicio ? new Date(orden.ejecucion.fechaInicio).toLocaleDateString('es-CO') : 'N/A'}`);
    doc.text(`Fecha Término: ${orden.ejecucion?.fechaTermino ? new Date(orden.ejecucion.fechaTermino).toLocaleDateString('es-CO') : 'N/A'}`);
    doc.text(`Horas Trabajadas: ${orden.ejecucion?.horasActuales || 0} horas`);
    doc.text(`Evidencias: ${orden.ejecucion?.evidenciasEjecucion?.length || 0} archivos`);
    doc.moveDown(1);

    // Conformidad
    doc.fontSize(12).fillColor('#1a365d').text('CONFORMIDAD', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#333').text(
      'El Cliente declara que ha recibido a satisfacción los trabajos descritos en la presente acta, ' +
      'los cuales fueron ejecutados conforme a las especificaciones técnicas acordadas.',
      { align: 'justify' }
    );
    doc.moveDown(0.5);
    doc.fontSize(11).text(`Valor del servicio: $ ${totalCostos.toLocaleString('es-CO')} COP`);
    doc.moveDown(2);

    // Firmas
    const firmaY = doc.y;
    doc.fontSize(10).fillColor('#333');
    doc.text('_________________________', 100, firmaY);
    doc.text('ENTREGA - CERMONT S.A.S.', 100, firmaY + 15);
    doc.text('_________________________', 350, firmaY);
    doc.text('RECIBE - CLIENTE', 350, firmaY + 15);

    // Footer
    doc.fontSize(8).fillColor('#718096');
    doc.text(`Este documento constituye constancia de la entrega formal | Generado el ${fecha}`, 50, 720, { align: 'center' });
  }

  // =====================================================
  // GENERACIÓN DE INFORME TÉCNICO (PASO 7)
  // =====================================================

  async generarInformeTecnico(ordenId: string): Promise<GeneratedPDF> {
    const orden = await this.prisma.order.findUnique({
      where: { id: ordenId },
      include: {
        planeacion: {
          include: { kit: true, items: true },
        },
        ejecucion: {
          include: {
            checklists: true,
            tareas: true,
            evidenciasEjecucion: true,
          },
        },
        costos: true,
      },
    });

    if (!orden) throw new NotFoundException('Orden no encontrada');

    const nombreArchivo = `informe-tecnico-${orden.numero.replace(/\//g, '-')}.html`;
    const rutaArchivo = path.join(this.uploadsPath, nombreArchivo);

    // Generar HTML del informe
    const htmlContent = this.generarHTMLInformeTecnico(orden);

    fs.writeFileSync(rutaArchivo, htmlContent, 'utf8');

    const stats = fs.statSync(rutaArchivo);

    return {
      nombreArchivo,
      rutaArchivo,
      url: `/uploads/pdfs/${nombreArchivo}`,
      tamano: stats.size,
      formato: 'html' as const,
    };
  }

  private generarHTMLInformeTecnico(orden: any): string {
    const fecha = new Date().toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const evidencias = orden.ejecucion?.evidenciasEjecucion || [];
    const checklists = orden.ejecucion?.checklists || [];
    const tareas = orden.ejecucion?.tareas || [];

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Informe Técnico - ${orden.numero}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.5; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
    .header h1 { color: #1a365d; font-size: 24px; margin-bottom: 10px; }
    .header .logo { font-weight: bold; font-size: 28px; color: #2563eb; }
    .section { margin-bottom: 25px; }
    .section h2 { background: #1a365d; color: white; padding: 8px 15px; font-size: 14px; margin-bottom: 15px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .info-item { padding: 8px; background: #f7fafc; border-left: 3px solid #2563eb; }
    .info-item label { font-weight: bold; display: block; color: #4a5568; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
    th { background: #edf2f7; font-weight: bold; }
    .checklist-item { padding: 5px 10px; border-bottom: 1px solid #e2e8f0; }
    .checklist-item.completed { color: #38a169; }
    .checklist-item.pending { color: #e53e3e; }
    .evidence-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 15px; }
    .evidence-item { border: 1px solid #e2e8f0; padding: 10px; text-align: center; }
    .evidence-item img { max-width: 100%; height: 150px; object-fit: cover; }
    .signature-section { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
    .signature-box { text-align: center; padding-top: 60px; border-top: 1px solid #333; }
    .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #718096; }
    @media print {
      body { padding: 0; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">CERMONT S.A.S.</div>
    <h1>INFORME TÉCNICO DE EJECUCIÓN</h1>
    <p>Construcción y Mantenimiento Industrial</p>
    <p>Campo Petrolero Caño Limón - Sierracol Energy</p>
  </div>

  <div class="section">
    <h2>1. INFORMACIÓN GENERAL</h2>
    <div class="info-grid">
      <div class="info-item">
        <label>Orden de Trabajo:</label>
        ${orden.numero}
      </div>
      <div class="info-item">
        <label>Fecha del Informe:</label>
        ${fecha}
      </div>
      <div class="info-item">
        <label>Cliente:</label>
        ${orden.cliente}
      </div>
      <div class="info-item">
        <label>Ubicación:</label>
        ${orden.planeacion?.ubicacion || 'No especificada'}
      </div>
      <div class="info-item">
        <label>Estado:</label>
        ${orden.estado.toUpperCase()}
      </div>
      <div class="info-item">
        <label>Prioridad:</label>
        ${orden.prioridad.toUpperCase()}
      </div>
    </div>
  </div>

  <div class="section">
    <h2>2. DESCRIPCIÓN DEL TRABAJO</h2>
    <p style="padding: 10px; background: #f7fafc;">${orden.descripcion}</p>
    ${orden.planeacion?.descripcionTrabajo ? `<p style="padding: 10px; margin-top: 10px;">${orden.planeacion.descripcionTrabajo}</p>` : ''}
  </div>

  <div class="section">
    <h2>3. ACTIVIDADES EJECUTADAS</h2>
    <table>
      <thead>
        <tr>
          <th>N°</th>
          <th>Descripción</th>
          <th>Estado</th>
          <th>Horas</th>
        </tr>
      </thead>
      <tbody>
        ${tareas.map((t: any, i: number) => `
          <tr>
            <td>${i + 1}</td>
            <td>${t.descripcion}</td>
            <td>${t.completada ? '✓ Completada' : '○ Pendiente'}</td>
            <td>${t.horasReales || t.horasEstimadas}h</td>
          </tr>
        `).join('')}
        ${tareas.length === 0 ? '<tr><td colspan="4" style="text-align:center;">Sin tareas registradas</td></tr>' : ''}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>4. VERIFICACIÓN DE CHECKLIST</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
      ${checklists.map((c: any) => `
        <div class="checklist-item ${c.completada ? 'completed' : 'pending'}">
          ${c.completada ? '☑' : '☐'} ${c.item}
        </div>
      `).join('')}
    </div>
    <p style="margin-top: 15px; font-weight: bold;">
      Completados: ${checklists.filter((c: any) => c.completada).length} / ${checklists.length}
    </p>
  </div>

  <div class="section">
    <h2>5. REGISTRO FOTOGRÁFICO</h2>
    ${evidencias.length > 0 ? `
      <p>Total de evidencias: ${evidencias.length}</p>
      <div class="evidence-grid">
        ${evidencias.slice(0, 9).map((e: any) => `
          <div class="evidence-item">
            <p><strong>${e.tipo}</strong></p>
            <p>${e.descripcion || e.nombreArchivo}</p>
            <p style="font-size: 10px; color: #718096;">
              ${new Date(e.createdAt).toLocaleDateString('es-CO')}
            </p>
          </div>
        `).join('')}
      </div>
      ${evidencias.length > 9 ? `<p style="text-align:center; margin-top:10px;">... y ${evidencias.length - 9} evidencias más</p>` : ''}
    ` : '<p>Sin evidencias fotográficas registradas</p>'}
  </div>

  <div class="section">
    <h2>6. DATOS DE EJECUCIÓN</h2>
    <div class="info-grid">
      <div class="info-item">
        <label>Fecha Inicio:</label>
        ${orden.ejecucion?.fechaInicio ? new Date(orden.ejecucion.fechaInicio).toLocaleDateString('es-CO') : 'N/A'}
      </div>
      <div class="info-item">
        <label>Fecha Término:</label>
        ${orden.ejecucion?.fechaTermino ? new Date(orden.ejecucion.fechaTermino).toLocaleDateString('es-CO') : 'En progreso'}
      </div>
      <div class="info-item">
        <label>Horas Estimadas:</label>
        ${orden.ejecucion?.horasEstimadas || 0} horas
      </div>
      <div class="info-item">
        <label>Horas Reales:</label>
        ${orden.ejecucion?.horasActuales || 0} horas
      </div>
      <div class="info-item">
        <label>Avance:</label>
        ${orden.ejecucion?.avancePercentaje || 0}%
      </div>
      <div class="info-item">
        <label>Estado Ejecución:</label>
        ${orden.ejecucion?.estado || 'NO_INICIADA'}
      </div>
    </div>
  </div>

  <div class="section">
    <h2>7. OBSERVACIONES</h2>
    <p style="padding: 15px; background: #f7fafc; min-height: 60px;">
      ${orden.ejecucion?.observaciones || 'Sin observaciones adicionales.'}
    </p>
  </div>

  <div class="signature-section">
    <div class="signature-box">
      <strong>Técnico Responsable</strong>
      <p style="margin-top: 10px;">Nombre: _________________________</p>
      <p>Cédula: _________________________</p>
    </div>
    <div class="signature-box">
      <strong>Supervisor</strong>
      <p style="margin-top: 10px;">Nombre: _________________________</p>
      <p>Cédula: _________________________</p>
    </div>
  </div>

  <div class="footer">
    <p>CERMONT S.A.S. - Arauca, Colombia</p>
    <p>Este documento fue generado automáticamente el ${fecha}</p>
    <p>Sistema de Gestión de Órdenes de Trabajo</p>
  </div>
</body>
</html>
    `.trim();
  }

  // =====================================================
  // GENERACIÓN DE ACTA DE ENTREGA (PASO 8)
  // =====================================================

  async generarActaEntrega(ordenId: string): Promise<GeneratedPDF> {
    const orden = await this.prisma.order.findUnique({
      where: { id: ordenId },
      include: {
        ejecucion: {
          include: {
            evidenciasEjecucion: true,
          },
        },
        acta: true,
        costos: true,
      },
    });

    if (!orden) throw new NotFoundException('Orden no encontrada');

    const nombreArchivo = `acta-entrega-${orden.numero.replace(/\//g, '-')}.html`;
    const rutaArchivo = path.join(this.uploadsPath, nombreArchivo);

    const htmlContent = this.generarHTMLActaEntrega(orden);

    fs.writeFileSync(rutaArchivo, htmlContent, 'utf8');

    const stats = fs.statSync(rutaArchivo);

    // Generar número de acta si no existe
    if (!orden.acta) {
      const countActas = await this.prisma.acta.count();
      const numeroActa = `ACT-${new Date().getFullYear()}-${String(countActas + 1).padStart(4, '0')}`;

      await this.prisma.acta.create({
        data: {
          numero: numeroActa,
          ordenId,
          estado: 'GENERADA',
          trabajosRealizados: orden.descripcion,
          archivoActaPDF: `/uploads/pdfs/${nombreArchivo}`,
        },
      });
    } else {
      await this.prisma.acta.update({
        where: { id: orden.acta.id },
        data: {
          estado: 'GENERADA',
          archivoActaPDF: `/uploads/pdfs/${nombreArchivo}`,
        },
      });
    }

    return {
      nombreArchivo,
      rutaArchivo,
      url: `/uploads/pdfs/${nombreArchivo}`,
      tamano: stats.size,
      formato: 'html' as const,
    };
  }

  private generarHTMLActaEntrega(orden: any): string {
    const fecha = new Date().toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const totalCostos = orden.costos?.reduce((sum: number, c: any) => sum + c.monto, 0) || 0;

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Acta de Entrega - ${orden.numero}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12px; padding: 30px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { font-size: 22px; margin-bottom: 10px; }
    .logo { font-weight: bold; font-size: 28px; color: #2563eb; }
    .section { margin-bottom: 20px; }
    .section-title { background: #1a365d; color: white; padding: 8px 15px; font-size: 13px; }
    .section-content { padding: 15px; border: 1px solid #e2e8f0; border-top: none; }
    .info-row { display: flex; margin-bottom: 8px; }
    .info-label { width: 150px; font-weight: bold; }
    .signature-area { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; }
    .signature-box { text-align: center; }
    .signature-line { border-top: 1px solid #333; padding-top: 10px; margin-top: 60px; }
    .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #718096; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">CERMONT S.A.S.</div>
    <h1>ACTA DE ENTREGA DE TRABAJOS</h1>
    <p>NIT: XXX.XXX.XXX-X | Arauca, Colombia</p>
  </div>

  <div class="section">
    <div class="section-title">DATOS DEL SERVICIO</div>
    <div class="section-content">
      <div class="info-row"><span class="info-label">Orden N°:</span> ${orden.numero}</div>
      <div class="info-row"><span class="info-label">Cliente:</span> ${orden.cliente}</div>
      <div class="info-row"><span class="info-label">Fecha de Entrega:</span> ${fecha}</div>
      <div class="info-row"><span class="info-label">Acta N°:</span> ${orden.acta?.numero || 'Pendiente'}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">DESCRIPCIÓN DE TRABAJOS REALIZADOS</div>
    <div class="section-content">
      <p>${orden.descripcion}</p>
      <br>
      <p>${orden.ejecucion?.observaciones || ''}</p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">RESUMEN DE EJECUCIÓN</div>
    <div class="section-content">
      <div class="info-row"><span class="info-label">Fecha Inicio:</span> ${orden.ejecucion?.fechaInicio ? new Date(orden.ejecucion.fechaInicio).toLocaleDateString('es-CO') : 'N/A'}</div>
      <div class="info-row"><span class="info-label">Fecha Término:</span> ${orden.ejecucion?.fechaTermino ? new Date(orden.ejecucion.fechaTermino).toLocaleDateString('es-CO') : 'N/A'}</div>
      <div class="info-row"><span class="info-label">Horas Trabajadas:</span> ${orden.ejecucion?.horasActuales || 0} horas</div>
      <div class="info-row"><span class="info-label">Evidencias:</span> ${orden.ejecucion?.evidenciasEjecucion?.length || 0} archivos</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">CONFORMIDAD</div>
    <div class="section-content">
      <p>El Cliente declara que ha recibido a satisfacción los trabajos descritos en la presente acta, 
      los cuales fueron ejecutados conforme a las especificaciones técnicas acordadas y dentro de los 
      estándares de calidad, seguridad y salud en el trabajo establecidos para operaciones en el 
      Campo Petrolero Caño Limón.</p>
      <br>
      <p><strong>Valor del servicio:</strong> $ ${totalCostos.toLocaleString('es-CO')} COP</p>
    </div>
  </div>

  <div class="signature-area">
    <div class="signature-box">
      <div class="signature-line">
        <strong>ENTREGA - CERMONT S.A.S.</strong>
        <p style="margin-top: 10px;">Nombre: _________________________</p>
        <p>Cédula: _________________________</p>
        <p>Cargo: Técnico Responsable</p>
      </div>
    </div>
    <div class="signature-box">
      <div class="signature-line">
        <strong>RECIBE - CLIENTE</strong>
        <p style="margin-top: 10px;">Nombre: _________________________</p>
        <p>Cédula: _________________________</p>
        <p>Cargo: _________________________</p>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>Este documento constituye constancia de la entrega formal de los trabajos.</p>
    <p>CERMONT S.A.S. - Construcción y Mantenimiento Industrial</p>
    <p>Generado el ${fecha}</p>
  </div>
</body>
</html>
    `.trim();
  }

  // =====================================================
  // LISTAR PDFs GENERADOS
  // =====================================================

  async listarPDFs(ordenId?: string) {
    const where = ordenId ? { ordenId } : {};

    const actas = await this.prisma.acta.findMany({
      where,
      include: {
        orden: { select: { numero: true, cliente: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Listar archivos físicos
    const archivos = fs.readdirSync(this.uploadsPath).filter((f) => f.endsWith('.html'));

    return {
      actas: actas.map((a) => ({
        id: a.id,
        numero: a.numero,
        ordenNumero: a.orden.numero,
        cliente: a.orden.cliente,
        estado: a.estado,
        archivoPDF: a.archivoActaPDF,
        fechaGeneracion: a.createdAt,
      })),
      archivosDisponibles: archivos.length,
    };
  }
}
