import { BaseTemplate } from './base.template';

export class MantenimientoTemplate extends BaseTemplate {
    static generate(data: any): string {
        const content = `
      <h1>Reporte de Mantenimiento</h1>
      
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Título</div>
          <div class="info-value">${data.titulo}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Tipo</div>
          <div class="info-value">${data.tipo}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Estado</div>
          <div class="info-value">
            <span class="badge badge-${this.getEstadoBadgeClass(data.estado)}">
              ${data.estado}
            </span>
          </div>
        </div>
        <div class="info-item">
          <div class="info-label">Prioridad</div>
          <div class="info-value">${data.prioridad}</div>
        </div>
      </div>

      <h2>Fechas</h2>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Fecha Programada</div>
          <div class="info-value">${new Date(data.fechaProgramada).toLocaleDateString('es-CO')}</div>
        </div>
        ${data.fechaInicio ? `
          <div class="info-item">
            <div class="info-label">Fecha Inicio Real</div>
            <div class="info-value">${new Date(data.fechaInicio).toLocaleString('es-CO')}</div>
          </div>
        ` : ''}
        ${data.fechaFin ? `
          <div class="info-item">
            <div class="info-label">Fecha Finalización</div>
            <div class="info-value">${new Date(data.fechaFin).toLocaleString('es-CO')}</div>
          </div>
        ` : ''}
        ${data.duracionEstimada ? `
          <div class="info-item">
            <div class="info-label">Duración Estimada</div>
            <div class="info-value">${data.duracionEstimada} horas</div>
          </div>
        ` : ''}
      </div>

      ${data.descripcion ? `
        <h2>Descripción</h2>
        <p>${data.descripcion}</p>
      ` : ''}

      ${data.tecnico ? `
        <h2>Técnico Responsable</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Nombre</div>
            <div class="info-value">${data.tecnico.nombre}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Email</div>
            <div class="info-value">${data.tecnico.email || 'N/A'}</div>
          </div>
        </div>
      ` : ''}

      ${data.tareas && data.tareas.length > 0 ? `
        <h2>Tareas Programadas</h2>
        <ul>
          ${data.tareas.map((tarea: string) => `<li>${tarea}</li>`).join('')}
        </ul>
      ` : ''}

      ${data.tareasCompletadas && data.tareasCompletadas.length > 0 ? `
        <h2>Tareas Completadas</h2>
        <ul>
          ${data.tareasCompletadas.map((tarea: string) => `<li>✓ ${tarea}</li>`).join('')}
        </ul>
      ` : ''}

      ${data.problemasEncontrados && data.problemasEncontrados.length > 0 ? `
        <h2>Problemas Encontrados</h2>
        <ul>
          ${data.problemasEncontrados.map((problema: string) => `<li>⚠ ${problema}</li>`).join('')}
        </ul>
      ` : ''}

      ${data.repuestosUtilizados && data.repuestosUtilizados.length > 0 ? `
        <h2>Repuestos Utilizados</h2>
        <ul>
          ${data.repuestosUtilizados.map((repuesto: string) => `<li>${repuesto}</li>`).join('')}
        </ul>
      ` : ''}

      ${data.trabajoRealizado ? `
        <h2>Trabajo Realizado</h2>
        <p>${data.trabajoRealizado}</p>
      ` : ''}

      ${data.recomendaciones ? `
        <h2>Recomendaciones</h2>
        <p>${data.recomendaciones}</p>
      ` : ''}

      ${data.calificacionFinal ? `
        <h2>Calificación Final</h2>
        <div class="info-item">
          <div class="info-value">
            <strong>${data.calificacionFinal}/10</strong>
          </div>
        </div>
      ` : ''}

      ${data.costoTotal ? `
        <h2>Costo Total</h2>
        <div class="info-item">
          <div class="info-value">
            <strong>$${data.costoTotal.toLocaleString('es-CO')}</strong>
          </div>
        </div>
      ` : ''}

      <div class="signature-section">
        <div class="signature-box">
          <div class="signature-line">
            <strong>Firma del Técnico</strong>
          </div>
        </div>
        <div class="signature-box">
          <div class="signature-line">
            <strong>Firma del Supervisor</strong>
          </div>
        </div>
      </div>
    `;

        return this.wrap('Reporte de Mantenimiento', content);
    }

    private static getEstadoBadgeClass(estado: string): string {
        const map: Record<string, string> = {
            COMPLETADO: 'success',
            EN_PROGRESO: 'info',
            PROGRAMADO: 'warning',
            CANCELADO: 'danger',
            VENCIDO: 'danger',
        };
        return map[estado] || 'info';
    }
}
