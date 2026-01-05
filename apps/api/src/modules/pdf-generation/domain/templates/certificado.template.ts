import { BaseTemplate } from "./base.template";

/**
 * Typed interface for CertificadoTemplate data
 * Replaces `any` with proper typing (Agent 06 fix)
 */
export interface CertificadoPDFData {
  tipo: string;
  numeroCertificado?: string;
  fechaInspeccion: Date | string;
  fechaVencimiento: Date | string;
  aprobado: boolean;
  observaciones?: string;
  elemento: {
    codigo: string;
    tipo: string;
    ubicacion: string;
  };
  inspector?: {
    nombre: string;
    licencia?: string;
  };
}

export class CertificadoTemplate extends BaseTemplate {
  static generate(data: CertificadoPDFData): string {
    const content = `
      <div style="text-align: center; margin: 50px 0;">
        <h1 style="font-size: 32px; color: #0066cc; margin-bottom: 10px;">
          CERTIFICADO DE INSPECCIÓN
        </h1>
        <p style="font-size: 18px; color: #666;">
          ${data.tipo.replace(/_/g, " ")}
        </p>
      </div>

      <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border: 3px solid #0066cc;">
        <div style="font-size: 14px; color: #666; margin-bottom: 10px;">
          Certificado No.
        </div>
        <div style="font-size: 24px; font-weight: bold; color: #0066cc;">
          ${data.numeroCertificado || "CERT-" + Date.now()}
        </div>
      </div>

      <h2>Información del Elemento Inspeccionado</h2>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Código</div>
          <div class="info-value">${data.elemento.codigo}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Tipo</div>
          <div class="info-value">${data.elemento.tipo}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Ubicación</div>
          <div class="info-value">${data.elemento.ubicacion}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Fecha de Inspección</div>
          <div class="info-value">${new Date(data.fechaInspeccion).toLocaleDateString("es-CO")}</div>
        </div>
      </div>

      ${
        data.inspector
          ? `
        <h2>Inspector Certificador</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Nombre</div>
            <div class="info-value">${data.inspector.nombre}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Licencia</div>
            <div class="info-value">${data.inspector.licencia || "N/A"}</div>
          </div>
        </div>
      `
          : ""
      }

      <h2>Resultado de la Inspección</h2>
      <div style="text-align: center; padding: 30px; margin: 20px 0;">
        <div class="badge badge-${data.aprobado ? "success" : "danger"}" 
             style="font-size: 18px; padding: 15px 30px;">
          ${data.aprobado ? "✓ APROBADO" : "✗ NO APROBADO"}
        </div>
      </div>

      ${
        data.observaciones
          ? `
        <h2>Observaciones</h2>
        <p>${data.observaciones}</p>
      `
          : ""
      }

      <div style="margin-top: 80px; padding-top: 30px; border-top: 2px solid #0066cc;">
        <p style="text-align: center; font-size: 11px; color: #666;">
          Este certificado tiene validez hasta: 
          <strong>${new Date(data.fechaVencimiento).toLocaleDateString("es-CO")}</strong>
        </p>
      </div>

      <div class="signature-section" style="margin-top: 60px;">
        <div class="signature-box">
          <div class="signature-line">
            <strong>Inspector Certificador</strong><br>
            <small>${data.inspector?.nombre || ""}</small>
          </div>
        </div>
        <div class="signature-box">
          <div class="signature-line">
            <strong>Representante Legal</strong><br>
            <small>CERMONT</small>
          </div>
        </div>
      </div>
    `;

    return this.wrap(
      `Certificado de Inspección - ${data.numeroCertificado}`,
      content,
    );
  }
}
