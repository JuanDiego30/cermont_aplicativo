import { BaseTemplate } from './base.template';

export class OrdenTemplate extends BaseTemplate {
    static generate(data: any): string {
        const content = `
      <h1>Orden de Trabajo #${data.numero}</h1>
      
      <div class="info-grid">
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
          <div class="info-value">
            <span class="badge badge-${this.getPrioridadBadgeClass(data.prioridad)}">
              ${data.prioridad}
            </span>
          </div>
        </div>
        <div class="info-item">
          <div class="info-label">Tipo</div>
          <div class="info-value">${data.tipo}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Fecha Creación</div>
          <div class="info-value">${new Date(data.createdAt).toLocaleDateString('es-CO')}</div>
        </div>
      </div>

      <h2>Información General</h2>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Título</div>
          <div class="info-value">${data.titulo}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Ubicación</div>
          <div class="info-value">${data.ubicacion || 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Fecha Programada</div>
          <div class="info-value">
            ${data.fechaInicio ? new Date(data.fechaInicio).toLocaleDateString('es-CO') : 'N/A'}
          </div>
        </div>
        <div class="info-item">
          <div class="info-label">Costo Estimado</div>
          <div class="info-value">
            ${data.costoEstimado ? `$${data.costoEstimado.toLocaleString('es-CO')}` : 'N/A'}
          </div>
        </div>
      </div>

      ${data.descripcion ? `
        <h2>Descripción</h2>
        <p>${data.descripcion}</p>
      ` : ''}

      ${data.cliente ? `
        <h2>Información del Cliente</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Nombre/Empresa</div>
            <div class="info-value">${data.cliente.nombre}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Email</div>
            <div class="info-value">${data.cliente.email || 'N/A'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Teléfono</div>
            <div class="info-value">${data.cliente.telefono || 'N/A'}</div>
          </div>
        </div>
      ` : ''}

      ${data.tecnico ? `
        <h2>Técnico Asignado</h2>
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

      ${data.lineasVida && data.lineasVida.length > 0 ? `
        <h2>Líneas de Vida</h2>
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Tipo</th>
              <th>Material</th>
              <th>Ubicación</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${data.lineasVida.map((lv: any) => `
              <tr>
                <td>${lv.codigo}</td>
                <td>${lv.tipo}</td>
                <td>${lv.material}</td>
                <td>${lv.ubicacion}</td>
                <td><span class="badge badge-info">${lv.estado}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}

      ${data.observaciones ? `
        <h2>Observaciones</h2>
        <p>${data.observaciones}</p>
      ` : ''}

      <div class="signature-section">
        <div class="signature-box">
          <div class="signature-line">
            <strong>Firma del Técnico</strong>
          </div>
        </div>
        <div class="signature-box">
          <div class="signature-line">
            <strong>Firma del Cliente</strong>
          </div>
        </div>
      </div>
    `;

        return this.wrap(`Orden de Trabajo #${data.numero}`, content);
    }

    private static getEstadoBadgeClass(estado: string): string {
        const map: Record<string, string> = {
            COMPLETADA: 'success',
            EN_PROGRESO: 'info',
            PENDIENTE: 'warning',
            CANCELADA: 'danger',
            ASIGNADA: 'info',
        };
        return map[estado] || 'info';
    }

    private static getPrioridadBadgeClass(prioridad: string): string {
        const map: Record<string, string> = {
            CRITICA: 'danger',
            URGENTE: 'danger',
            ALTA: 'warning',
            MEDIA: 'info',
            BAJA: 'success',
        };
        return map[prioridad] || 'info';
    }
}
