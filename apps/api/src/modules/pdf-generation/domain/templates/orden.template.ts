import { BaseTemplate } from "./base.template";

/**
 * Typed interface for OrdenTemplate data
 * Replaces `any` with proper typing (Agent 06 fix)
 */
export interface OrdenPDFData {
  numero: string;
  estado?: string;
  prioridad?: string;
  subEstado?: string;
  descripcion?: string;
  direccion?: string;
  observaciones?: string;
  createdAt: Date | string;
  fechaInicio?: Date | string;
  presupuestoEstimado?: number;
  cliente?:
    | string
    | {
        nombre: string;
        email?: string;
        telefono?: string;
        contacto?: string;
        direccion?: string;
      };
  tecnico?: { nombre?: string; name?: string; email?: string };
  asignado?: { nombre?: string; name?: string; email?: string };
  lineasVida?: LineaVidaItem[];
}

interface LineaVidaItem {
  codigo: string;
  tipo: string;
  material: string;
  ubicacion: string;
  estado: string;
}

export class OrdenTemplate extends BaseTemplate {
  static generate(data: OrdenPDFData): string {
    const estado = String(data.estado ?? "").toLowerCase();
    const prioridad = String(data.prioridad ?? "").toLowerCase();

    const cliente = this.normalizeCliente(data.cliente);
    const tecnico = this.normalizeTecnico(data.tecnico ?? data.asignado);

    const content = `
      <h1>Orden de Trabajo #${data.numero}</h1>
      
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Estado</div>
          <div class="info-value">
            <span class="badge badge-${this.getEstadoBadgeClass(data.estado ?? "")}">
              ${estado || "N/A"}
            </span>
          </div>
        </div>
        <div class="info-item">
          <div class="info-label">Prioridad</div>
          <div class="info-value">
            <span class="badge badge-${this.getPrioridadBadgeClass(data.prioridad ?? "")}">
              ${prioridad || "N/A"}
            </span>
          </div>
        </div>
        <div class="info-item">
          <div class="info-label">Tipo</div>
          <div class="info-value">${data.subEstado || "N/A"}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Fecha Creación</div>
          <div class="info-value">${new Date(data.createdAt).toLocaleDateString("es-CO")}</div>
        </div>
      </div>

      <h2>Información General</h2>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Descripción</div>
          <div class="info-value">${data.descripcion || "N/A"}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Ubicación</div>
          <div class="info-value">${data.direccion || "N/A"}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Fecha Programada</div>
          <div class="info-value">
            ${data.fechaInicio ? new Date(data.fechaInicio).toLocaleDateString("es-CO") : "N/A"}
          </div>
        </div>
        <div class="info-item">
          <div class="info-label">Costo Estimado</div>
          <div class="info-value">
            ${data.presupuestoEstimado ? `$${Number(data.presupuestoEstimado).toLocaleString("es-CO")}` : "N/A"}
          </div>
        </div>
      </div>

      ${
        data.descripcion
          ? `
        <h2>Detalle</h2>
        <p>${data.descripcion}</p>
      `
          : ""
      }

      ${
        data.observaciones
          ? `
        <h2>Observaciones</h2>
        <p>${data.observaciones}</p>
      `
          : ""
      }

      ${
        cliente
          ? `
        <h2>Información del Cliente</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Nombre/Empresa</div>
            <div class="info-value">${cliente.nombre}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Email</div>
            <div class="info-value">${cliente.email || "N/A"}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Teléfono</div>
            <div class="info-value">${cliente.telefono || "N/A"}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Contacto</div>
            <div class="info-value">${cliente.contacto || "N/A"}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Dirección</div>
            <div class="info-value">${cliente.direccion || "N/A"}</div>
          </div>
        </div>
      `
          : ""
      }

      ${
        tecnico
          ? `
        <h2>Técnico Asignado</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Nombre</div>
            <div class="info-value">${tecnico.nombre}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Email</div>
            <div class="info-value">${tecnico.email || "N/A"}</div>
          </div>
        </div>
      `
          : ""
      }

      ${
        data.lineasVida && data.lineasVida.length > 0
          ? `
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
            ${data.lineasVida
              .map(
                (lv: any) => `
              <tr>
                <td>${lv.codigo}</td>
                <td>${lv.tipo}</td>
                <td>${lv.material}</td>
                <td>${lv.ubicacion}</td>
                <td><span class="badge badge-info">${lv.estado}</span></td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      `
          : ""
      }

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
    const normalized = String(estado || "").toLowerCase();
    const map: Record<string, string> = {
      completada: "success",
      ejecucion: "info",
      planeacion: "info",
      pendiente: "warning",
      cancelada: "danger",
      pausada: "warning",
    };
    return map[normalized] || "info";
  }

  private static getPrioridadBadgeClass(prioridad: string): string {
    const normalized = String(prioridad || "").toLowerCase();
    const map: Record<string, string> = {
      urgente: "danger",
      alta: "warning",
      media: "info",
      baja: "success",
    };
    return map[normalized] || "info";
  }

  private static normalizeCliente(
    cliente: any,
  ): {
    nombre: string;
    email?: string;
    telefono?: string;
    contacto?: string;
    direccion?: string;
  } | null {
    if (!cliente) return null;

    // Caso antiguo: { nombre, email, telefono }
    if (typeof cliente === "object") {
      const nombre = String(cliente.nombre ?? "").trim();
      if (!nombre) return null;
      return {
        nombre,
        email: cliente.email ? String(cliente.email) : undefined,
        telefono: cliente.telefono ? String(cliente.telefono) : undefined,
        contacto: cliente.contacto ? String(cliente.contacto) : undefined,
        direccion: cliente.direccion ? String(cliente.direccion) : undefined,
      };
    }

    // Caso prisma actual: string
    const nombre = String(cliente).trim();
    if (!nombre) return null;
    return { nombre };
  }

  private static normalizeTecnico(
    tecnico: any,
  ): { nombre: string; email?: string } | null {
    if (!tecnico || typeof tecnico !== "object") return null;

    // soporta { nombre } (antiguo) y { name } (User prisma)
    const nombre = String(tecnico.nombre ?? tecnico.name ?? "").trim();
    if (!nombre) return null;

    return {
      nombre,
      email: tecnico.email ? String(tecnico.email) : undefined,
    };
  }
}
