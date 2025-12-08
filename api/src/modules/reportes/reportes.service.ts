import { prisma } from '../../config/database.js';
import { logger } from '../../config/logger.js';
import { AppError } from '../../shared/errors/AppError.js';

// Types for order items
interface OrderItem {
  descripcion: string;
  cantidad: number;
  completado: boolean;
}

interface Cost {
  concepto: string;
  tipo: string;
  monto: number;
}



// Simple PDF generation without external dependency
// For production, consider using pdfkit or puppeteer

export class ReportesService {
  /**
   * Generar informe técnico ejecutado en formato texto/HTML
   */
  async generarInformeTecnico(ordenId: string): Promise<{ content: string; filename: string }> {
    try {
      const orden = await prisma.order.findUnique({
        where: { id: ordenId },
        include: {
          asignado: true,
          items: true,
          evidenciasEjecucion: true,
          costos: true,
          planeacion: {
            include: { kit: true },
          },
        },
      });

      if (!orden) {
        throw AppError.notFound('Orden');
      }

      // Generar contenido HTML del informe
      const content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Informe Técnico - ${orden.numero}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
    h2 { color: #1e40af; margin-top: 30px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #f3f4f6; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .info-item { margin-bottom: 10px; }
    .info-label { font-weight: bold; color: #6b7280; }
    .footer { margin-top: 50px; text-align: center; color: #9ca3af; }
  </style>
</head>
<body>
  <h1>INFORME TÉCNICO EJECUTADO</h1>
  <p style="text-align: center; font-size: 18px;">Orden No. ${orden.numero}</p>
  
  <h2>Información General</h2>
  <div class="info-grid">
    <div class="info-item">
      <span class="info-label">Cliente:</span> ${orden.cliente}
    </div>
    <div class="info-item">
      <span class="info-label">Responsable:</span> ${orden.asignado?.name || 'No asignado'}
    </div>
    <div class="info-item">
      <span class="info-label">Estado:</span> ${orden.estado.toUpperCase()}
    </div>
    <div class="info-item">
      <span class="info-label">Prioridad:</span> ${orden.prioridad.toUpperCase()}
    </div>
    <div class="info-item">
      <span class="info-label">Fecha Inicio:</span> ${orden.fechaInicio?.toLocaleDateString('es-CO') || 'N/A'}
    </div>
    <div class="info-item">
      <span class="info-label">Fecha Fin:</span> ${orden.fechaFin?.toLocaleDateString('es-CO') || 'Pendiente'}
    </div>
  </div>

  <h2>Descripción del Trabajo</h2>
  <p>${orden.descripcion}</p>

  <h2>Items de Trabajo</h2>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Descripción</th>
        <th>Cantidad</th>
        <th>Estado</th>
      </tr>
    </thead>
    <tbody>
      ${orden.items.map((item: OrderItem, idx: number) => `
        <tr>
          <td>${idx + 1}</td>
          <td>${item.descripcion}</td>
          <td>${item.cantidad}</td>
          <td>${item.completado ? '✓ Completado' : '○ Pendiente'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>Costos</h2>
  <table>
    <thead>
      <tr>
        <th>Concepto</th>
        <th>Tipo</th>
        <th>Monto</th>
      </tr>
    </thead>
    <tbody>
      ${orden.costos.map((costo: Cost) => `
        <tr>
          <td>${costo.concepto}</td>
          <td>${costo.tipo}</td>
          <td>$${costo.monto.toLocaleString('es-CO')}</td>
        </tr>
      `).join('')}
      <tr style="font-weight: bold; background-color: #f3f4f6;">
        <td colspan="2">TOTAL</td>
        <td>$${orden.costos.reduce((sum: number, c: Cost) => sum + c.monto, 0).toLocaleString('es-CO')}</td>
      </tr>
    </tbody>
  </table>

  <h2>Evidencias (${orden.evidenciasEjecucion.length})</h2>
  <ul>
    ${orden.evidenciasEjecucion.map((ev: any) => `<li>${ev.tipo}: ${ev.descripcion || ev.nombreArchivo}</li>`).join('')}
  </ul>

  <div class="footer">
    <p>Generado el ${new Date().toLocaleDateString('es-CO')} a las ${new Date().toLocaleTimeString('es-CO')}</p>
    <p>Sistema Cermont - Gestión de Órdenes de Servicio</p>
  </div>
</body>
</html>
      `;

      return {
        content,
        filename: `informe-tecnico-${orden.numero}.html`,
      };
    } catch (error) {
      logger.error('Error al generar informe técnico:', error);
      throw error;
    }
  }

  /**
   * Generar acta de entrega
   */
  async generarActaEntrega(ordenId: string): Promise<{ content: string; filename: string }> {
    try {
      const orden = await prisma.order.findUnique({
        where: { id: ordenId },
        include: {
          asignado: true,
        },
      });

      if (!orden) {
        throw AppError.notFound('Orden');
      }

      const content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Acta de Entrega - ${orden.numero}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #2563eb; text-align: center; }
    .firma { margin-top: 100px; display: flex; justify-content: space-around; }
    .firma-item { text-align: center; }
    .firma-linea { border-top: 1px solid #000; width: 200px; margin-bottom: 10px; }
  </style>
</head>
<body>
  <h1>ACTA DE ENTREGA FINAL</h1>
  <p style="text-align: center;">Orden No. <strong>${orden.numero}</strong></p>
  
  <p style="margin-top: 50px;">
    Se deja constancia que <strong>${orden.asignado?.name || 'el técnico asignado'}</strong> 
    ha completado satisfactoriamente los trabajos descritos en la orden de trabajo 
    No. <strong>${orden.numero}</strong>.
  </p>

  <h3>Detalles:</h3>
  <ul>
    <li><strong>Cliente:</strong> ${orden.cliente}</li>
    <li><strong>Descripción:</strong> ${orden.descripcion}</li>
    <li><strong>Fecha de Entrega:</strong> ${new Date().toLocaleDateString('es-CO')}</li>
  </ul>

  <p>
    El cliente confirma la recepción a satisfacción de los trabajos realizados.
  </p>

  <div class="firma">
    <div class="firma-item">
      <div class="firma-linea"></div>
      <p>Firma Responsable</p>
      <p>${orden.asignado?.name || ''}</p>
    </div>
    <div class="firma-item">
      <div class="firma-linea"></div>
      <p>Firma Cliente</p>
      <p>${orden.cliente}</p>
    </div>
  </div>
</body>
</html>
      `;

      return {
        content,
        filename: `acta-entrega-${orden.numero}.html`,
      };
    } catch (error) {
      logger.error('Error al generar acta de entrega:', error);
      throw error;
    }
  }

  /**
   * Generar reporte de costos por período
   */
  async generarReporteCostos(fechaInicio: Date, fechaFin: Date): Promise<{ content: string; filename: string }> {
    try {
      const ordenes = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: fechaInicio,
            lte: fechaFin,
          },
        },
        include: {
          costos: true,
        },
      });

      let totalGeneral = 0;
      const resumen: { numero: string; cliente: string; total: number }[] = [];

      for (const orden of ordenes) {
        const totalOrden = orden.costos.reduce((sum: number, c: { monto: number }) => sum + c.monto, 0);
        totalGeneral += totalOrden;
        resumen.push({
          numero: orden.numero,
          cliente: orden.cliente,
          total: totalOrden,
        });
      }

      const content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reporte de Costos</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #2563eb; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #f3f4f6; }
    .total-row { font-weight: bold; background-color: #2563eb; color: white; }
  </style>
</head>
<body>
  <h1>REPORTE DE COSTOS</h1>
  <p>Período: ${fechaInicio.toLocaleDateString('es-CO')} - ${fechaFin.toLocaleDateString('es-CO')}</p>
  
  <table>
    <thead>
      <tr>
        <th>Orden</th>
        <th>Cliente</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${resumen.map((r: { numero: string; cliente: string; total: number }) => `
        <tr>
          <td>${r.numero}</td>
          <td>${r.cliente}</td>
          <td>$${r.total.toLocaleString('es-CO')}</td>
        </tr>
      `).join('')}
      <tr class="total-row">
        <td colspan="2">TOTAL GENERAL</td>
        <td>$${totalGeneral.toLocaleString('es-CO')}</td>
      </tr>
    </tbody>
  </table>

  <p>Total de órdenes: ${ordenes.length}</p>
  <p>Generado el ${new Date().toLocaleDateString('es-CO')}</p>
</body>
</html>
      `;

      return {
        content,
        filename: `reporte-costos-${fechaInicio.toISOString().split('T')[0]}-${fechaFin.toISOString().split('T')[0]}.html`,
      };
    } catch (error) {
      logger.error('Error al generar reporte de costos:', error);
      throw error;
    }
  }

  /**
   * Generar reporte de productividad de técnicos
   */
  async generarReporteProductividad(fechaInicio: Date, fechaFin: Date): Promise<{ content: string; filename: string }> {
    try {
      const tecnicos = await prisma.user.findMany({
        where: { role: 'tecnico' },
        include: {
          asignaciones: {
            where: {
              createdAt: { gte: fechaInicio, lte: fechaFin },
            },
          },
        },
      });

      const content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reporte de Productividad</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #2563eb; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #f3f4f6; }
  </style>
</head>
<body>
  <h1>REPORTE DE PRODUCTIVIDAD</h1>
  <p>Período: ${fechaInicio.toLocaleDateString('es-CO')} - ${fechaFin.toLocaleDateString('es-CO')}</p>
  
  <table>
    <thead>
      <tr>
        <th>Técnico</th>
        <th>Email</th>
        <th>Órdenes Asignadas</th>
        <th>Completadas</th>
      </tr>
    </thead>
    <tbody>
      ${tecnicos.map((t: { name: string; email: string; asignaciones: { estado: string }[] }) => `
        <tr>
          <td>${t.name}</td>
          <td>${t.email}</td>
          <td>${t.asignaciones.length}</td>
          <td>${t.asignaciones.filter((o: { estado: string }) => o.estado === 'completada').length}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <p>Generado el ${new Date().toLocaleDateString('es-CO')}</p>
</body>
</html>
      `;

      return {
        content,
        filename: `reporte-productividad-${fechaInicio.toISOString().split('T')[0]}.html`,
      };
    } catch (error) {
      logger.error('Error al generar reporte de productividad:', error);
      throw error;
    }
  }
}

export const reportesService = new ReportesService();
