/**
 * Entity: RequerimientosSeguridad
 *
 * Requerimientos de seguridad y checklist
 */

import { EPPRequerido } from "../value-objects/epp-requerido.vo";

export interface CreateRequerimientosSeguridadProps {
  eppRequerido?: Array<{ tipo: string; descripcion?: string }>;
  permisosNecesarios?: string[];
  riesgosIdentificados?: string[];
  medidasControl?: string[];
  checklistItems?: Record<string, boolean>;
  observaciones?: string;
}

export class RequerimientosSeguridad {
  private readonly _checklistItems: Map<string, boolean>;

  private constructor(
    private readonly _eppRequerido: EPPRequerido[],
    private readonly _permisosNecesarios: string[],
    private readonly _riesgosIdentificados: string[],
    private readonly _medidasControl: string[],
    private readonly _observaciones?: string,
  ) {
    this._checklistItems = new Map();
    this.initializeChecklist();
  }

  public static create(
    props: CreateRequerimientosSeguridadProps,
  ): RequerimientosSeguridad {
    const requerimientos = new RequerimientosSeguridad(
      (props.eppRequerido || []).map((epp) =>
        EPPRequerido.fromString(epp.tipo, epp.descripcion),
      ),
      props.permisosNecesarios || [],
      props.riesgosIdentificados || [],
      props.medidasControl || [],
      props.observaciones,
    );

    // Si se proporcionan items de checklist, aplicarlos
    if (props.checklistItems) {
      for (const [item, completado] of Object.entries(props.checklistItems)) {
        requerimientos.marcarChecklistItem(item, completado);
      }
    }

    return requerimientos;
  }

  private initializeChecklist(): void {
    // Checklist obligatorio según normativa
    const itemsObligatorios = [
      "Área de trabajo despejada",
      "Herramientas en buen estado",
      "EPP completo",
      "Señalización colocada",
      "Permisos obtenidos",
      "Cliente informado de riesgos",
    ];

    itemsObligatorios.forEach((item) => {
      this._checklistItems.set(item, false);
    });
  }

  public marcarChecklistItem(item: string, completado: boolean): void {
    if (!this._checklistItems.has(item)) {
      // Permitir agregar nuevos items
      this._checklistItems.set(item, completado);
    } else {
      this._checklistItems.set(item, completado);
    }
  }

  public checklistCompletado(): boolean {
    return Array.from(this._checklistItems.values()).every((v) => v === true);
  }

  public getPorcentajeCompletitud(): number {
    const total = this._checklistItems.size;
    if (total === 0) return 100;
    const completados = Array.from(this._checklistItems.values()).filter(
      (v) => v,
    ).length;
    return Math.round((completados / total) * 100);
  }

  public getEPPRequerido(): EPPRequerido[] {
    return [...this._eppRequerido];
  }

  public getPermisosNecesarios(): string[] {
    return [...this._permisosNecesarios];
  }

  public getRiesgosIdentificados(): string[] {
    return [...this._riesgosIdentificados];
  }

  public getMedidasControl(): string[] {
    return [...this._medidasControl];
  }

  public getChecklistItems(): Map<string, boolean> {
    return new Map(this._checklistItems);
  }

  public tieneRiesgosAltos(): boolean {
    // Palabras clave que indican riesgo alto
    const palabrasRiesgoAlto = [
      "electrico",
      "altura",
      "espacios confinados",
      "quimicos",
      "explosivo",
    ];

    return this._riesgosIdentificados.some((riesgo) =>
      palabrasRiesgoAlto.some((palabra) =>
        riesgo.toLowerCase().includes(palabra),
      ),
    );
  }

  public getObservaciones(): string | undefined {
    return this._observaciones;
  }
}
