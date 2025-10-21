"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type WorkPlanFormData,
  workPlanSchema,
} from "@/lib/schemas/work-plan";
import {
  WORK_PLAN_DEFAULTS,
  WORK_PLAN_TOOLS_LIBRARY,
} from "@/lib/constants";
import Link from "next/link";
import "@/styles/components/forms.css";

const actividadDefault: WorkPlanFormData["actividades"][number] = {
  nombre: "",
  responsable: "",
  fechaInicioPrevista: "",
  fechaFinPrevista: "",
  recursos: "",
  estado: "pendiente",
  notas: "",
};

function toNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") {
      return undefined;
    }
    const parsed = Number(trimmed.replace(/,/g, "."));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

export default function WorkPlanForm() {
  const [currentDate, setCurrentDate] = useState<string>("");
  const [customTool, setCustomTool] = useState("");

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString("es-CO"));
  }, []);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<WorkPlanFormData>({
    resolver: zodResolver(workPlanSchema) as Resolver<WorkPlanFormData>,
    defaultValues: WORK_PLAN_DEFAULTS,
  });

  const actividades = useFieldArray({ control, name: "actividades" });

  const selectedTools = watch("herramientas.checklist") ?? [];
  const additionalTools = watch("herramientas.adicionales") ?? [];

  const toggleTool = (toolId: string) => {
    const tools = new Set(selectedTools);
    if (tools.has(toolId)) {
      tools.delete(toolId);
    } else {
      tools.add(toolId);
    }
    setValue("herramientas.checklist", Array.from(tools), {
      shouldDirty: true,
    });
  };

  const addCustomTool = () => {
    const trimmed = customTool.trim();
    if (!trimmed) return;
    if (additionalTools.includes(trimmed)) {
      setCustomTool("");
      return;
    }
    setValue("herramientas.adicionales", [...additionalTools, trimmed], {
      shouldDirty: true,
    });
    setCustomTool("");
  };

  const removeCustomTool = (tool: string) => {
    setValue(
      "herramientas.adicionales",
      additionalTools.filter((item) => item !== tool),
      { shouldDirty: true }
    );
  };

  const onSubmit = (data: WorkPlanFormData) => {
    const payload: WorkPlanFormData = {
      ...data,
      costos: {
        ...data.costos,
        costoEstimado: toNumber(data.costos.costoEstimado) as typeof data.costos.costoEstimado,
        costoReal: toNumber(data.costos.costoReal) as typeof data.costos.costoReal,
        gastosNoPlaneados: toNumber(data.costos.gastosNoPlaneados) as typeof data.costos.gastosNoPlaneados,
      },
    };

    console.log("Planeación de obra:", payload);
    alert("Planeación registrada. Revisa la consola para el payload completo.");
  };

  const handleSavePdf = () => {
    const previousTitle = document.title;
    document.title = "Planeacion_Obra_Cermont";
    window.print();
    document.title = previousTitle;
  };

  return (
    <form className="form-card print-sheet" onSubmit={handleSubmit(onSubmit)}>
      <div className="print-header">
        <h2>Planeación Integral de Obra</h2>
        <small>Cermont · {currentDate || "Cargando..."}</small>
      </div>

      <fieldset className="form-section">
        <legend>Información general</legend>
        <div className="grid-3">
          <div className={`field ${errors.proyecto?.nombre ? "error" : ""}`}>
            <label htmlFor="proyecto-nombre">Nombre del proyecto *</label>
            <input
              id="proyecto-nombre"
              placeholder="Instalación / mantenimiento programado"
              {...register("proyecto.nombre")}
            />
            {errors.proyecto?.nombre && (
              <small className="error-text">{errors.proyecto.nombre.message}</small>
            )}
          </div>
          <div className={`field ${errors.proyecto?.cliente ? "error" : ""}`}>
            <label htmlFor="proyecto-cliente">Cliente *</label>
            <input id="proyecto-cliente" placeholder="Cliente" {...register("proyecto.cliente")} />
            {errors.proyecto?.cliente && (
              <small className="error-text">{errors.proyecto.cliente.message}</small>
            )}
          </div>
          <div className={`field ${errors.proyecto?.responsable ? "error" : ""}`}>
            <label htmlFor="proyecto-responsable">Responsable interno *</label>
            <input
              id="proyecto-responsable"
              placeholder="Nombre del coordinador"
              {...register("proyecto.responsable")}
            />
            {errors.proyecto?.responsable && (
              <small className="error-text">{errors.proyecto.responsable.message}</small>
            )}
          </div>
          <div className={`field ${errors.proyecto?.ubicacion ? "error" : ""}`}>
            <label htmlFor="proyecto-ubicacion">Ubicación *</label>
            <input
              id="proyecto-ubicacion"
              placeholder="Ciudad, sede, coordenadas"
              {...register("proyecto.ubicacion")}
            />
            {errors.proyecto?.ubicacion && (
              <small className="error-text">{errors.proyecto.ubicacion.message}</small>
            )}
          </div>
          <div className={`field ${errors.proyecto?.fechaPlaneacion ? "error" : ""}`}>
            <label htmlFor="proyecto-fecha">Fecha de planeación *</label>
            <input id="proyecto-fecha" type="date" {...register("proyecto.fechaPlaneacion")} />
            {errors.proyecto?.fechaPlaneacion && (
              <small className="error-text">{errors.proyecto.fechaPlaneacion.message}</small>
            )}
          </div>
          <div className="field">
            <label htmlFor="proyecto-supervisor">Supervisor en campo</label>
            <input
              id="proyecto-supervisor"
              placeholder="Nombre del supervisor / interventor"
              {...register("proyecto.supervisor")}
            />
          </div>
          <div className="field">
            <label htmlFor="proyecto-contacto">Contacto del cliente</label>
            <input
              id="proyecto-contacto"
              placeholder="Persona y teléfono de contacto"
              {...register("proyecto.contactoCliente")}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>Objetivo y alcance</legend>
        <div className="grid-2">
          <div className={`field ${errors.alcance?.objetivoGeneral ? "error" : ""}`}>
            <label htmlFor="objetivo-general">Objetivo general *</label>
            <textarea
              id="objetivo-general"
              rows={4}
              placeholder="Garantizar la disponibilidad del sistema, cumplir normativa, etc."
              {...register("alcance.objetivoGeneral")}
            />
            {errors.alcance?.objetivoGeneral && (
              <small className="error-text">{errors.alcance.objetivoGeneral.message}</small>
            )}
          </div>
          <div className="field">
            <label htmlFor="alcance-detallado">Alcance detallado</label>
            <textarea
              id="alcance-detallado"
              rows={4}
              placeholder="Describe las actividades, recursos previstos y entregables"
              {...register("alcance.alcanceDetallado")}
            />
          </div>
        </div>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="riesgos">Riesgos principales identificados</label>
            <textarea
              id="riesgos"
              rows={3}
              placeholder="Falta de herramientas, trabajos en altura, acceso restringido, clima"
              {...register("alcance.riesgosPrincipales")}
            />
          </div>
          <div className="field">
            <label htmlFor="mitigaciones">Medidas de mitigación</label>
            <textarea
              id="mitigaciones"
              rows={3}
              placeholder="Verificación logística, plan de seguridad, comunicación anticipada"
              {...register("alcance.mitigaciones")}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>Plan de actividades</legend>
        <div className="grid-12" style={{ paddingTop: 0 }}>
          {actividades.fields.map((actividad, index) => (
            <div key={actividad.id} className="field grid-span-12" style={{ padding: 12 }}>
              <div className="grid-3">
                <div className={`field ${errors.actividades?.[index]?.nombre ? "error" : ""}`}>
                  <label>Actividad *</label>
                  <input
                    placeholder="Inspeccionar sitio, montaje, pruebas"
                    {...register(`actividades.${index}.nombre` as const)}
                  />
                  {errors.actividades?.[index]?.nombre && (
                    <small className="error-text">
                      {errors.actividades[index]?.nombre?.message}
                    </small>
                  )}
                </div>
                <div className="field">
                  <label>Responsable</label>
                  <input
                    placeholder="Nombre del técnico / cuadrilla"
                    {...register(`actividades.${index}.responsable` as const)}
                  />
                </div>
                <div className="field">
                  <label>Recursos / herramientas clave</label>
                  <input
                    placeholder="Elevador, kit alturas, radio enlace"
                    {...register(`actividades.${index}.recursos` as const)}
                  />
                </div>
                <div className="field">
                  <label>Fecha inicio prevista</label>
                  <input type="date" {...register(`actividades.${index}.fechaInicioPrevista` as const)} />
                </div>
                <div className="field">
                  <label>Fecha fin prevista</label>
                  <input type="date" {...register(`actividades.${index}.fechaFinPrevista` as const)} />
                </div>
                <div className="field">
                  <label>Estado</label>
                  <select {...register(`actividades.${index}.estado` as const)}>
                    <option value="pendiente">Pendiente</option>
                    <option value="programada">Programada</option>
                    <option value="en_progreso">En progreso</option>
                    <option value="finalizada">Finalizada</option>
                  </select>
                </div>
                <div className="field grid-span-3">
                  <label>Notas</label>
                  <textarea
                    rows={2}
                    placeholder="Validar disponibilidad de energía, coordinar permisos"
                    {...register(`actividades.${index}.notas` as const)}
                  />
                </div>
                {actividades.fields.length > 1 && (
                  <button
                    type="button"
                    className="btn danger pressable"
                    onClick={() => actividades.remove(index)}
                    style={{ alignSelf: "flex-start" }}
                  >
                    Eliminar actividad
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="form-actions" style={{ position: "static", marginTop: 12 }}>
          <button
            type="button"
            className="btn secondary"
            onClick={() => actividades.append(actividadDefault)}
          >
            Añadir actividad
          </button>
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>Checklist de herramientas y equipos</legend>
        <div className="grid-2">
          {WORK_PLAN_TOOLS_LIBRARY.map((categoria) => (
            <div key={categoria.id} className="field">
              <label>
                {categoria.nombre}{" "}
                <span className="badge">Típico</span>
              </label>
              <div className="checks">
                {categoria.items.map((item) => {
                  const checked = selectedTools.includes(item.id);
                  return (
                    <label key={item.id} className="inline-controls" style={{ gap: 6 }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleTool(item.id)}
                      />
                      <span>
                        {item.nombre}
                        {item.critico ? <span className="badge danger">Crítico</span> : null}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="grid-3">
          <div className="field">
            <label>Agregar elemento personalizado</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={customTool}
                onChange={(event) => setCustomTool(event.target.value)}
                placeholder="Plataforma elevadora, repuesto específico"
              />
              <button type="button" className="btn primary" onClick={addCustomTool}>
                Añadir
              </button>
            </div>
          </div>
          <div className="field">
            <label>Responsable logística</label>
            <input
              placeholder="Nombre encargado de la verificación"
              {...register("herramientas.responsableLogistica")}
            />
          </div>
          <div className="field">
            <label>Fecha de verificación</label>
            <input type="date" {...register("herramientas.fechaVerificacion")}
            />
          </div>
        </div>
        {additionalTools.length > 0 && (
          <div className="field">
            <label>Herramientas personalizadas</label>
            <div className="checks">
              {additionalTools.map((tool) => (
                <span key={tool} className="badge" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  {tool}
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => removeCustomTool(tool)}
                    style={{ padding: "2px 6px", fontSize: "0.75rem" }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="field">
          <label>Observaciones logísticas</label>
          <textarea
            rows={3}
            placeholder="Registrar faltantes, proveedores alternos, seguimiento de compras"
            {...register("herramientas.observaciones")}
          />
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>Documentación y entregables</legend>
        <div className="grid-3">
          <div className="field">
            <label>Entregables previstos</label>
            <div className="checks">
              <label className="inline-controls">
                <input type="checkbox" {...register("documentacion.actaInicio")} />
                <span>Acta de inicio</span>
              </label>
              <label className="inline-controls">
                <input type="checkbox" {...register("documentacion.informeTecnico")} />
                <span>Informe técnico</span>
              </label>
              <label className="inline-controls">
                <input type="checkbox" {...register("documentacion.reportesFotograficos")} />
                <span>Registro fotográfico</span>
              </label>
              <label className="inline-controls">
                <input type="checkbox" {...register("documentacion.planosActualizados")} />
                <span>Planos/diagramas actualizados</span>
              </label>
              <label className="inline-controls">
                <input type="checkbox" {...register("documentacion.envioFacturacion")} />
                <span>Documentación para facturación</span>
              </label>
            </div>
          </div>
          <div className={`field ${errors.documentacion?.fechaEntregaComprometida ? "error" : ""}`}>
            <label htmlFor="fecha-entrega">Fecha de entrega comprometida *</label>
            <input id="fecha-entrega" type="date" {...register("documentacion.fechaEntregaComprometida")} />
            {errors.documentacion?.fechaEntregaComprometida && (
              <small className="error-text">
                {errors.documentacion.fechaEntregaComprometida.message}
              </small>
            )}
          </div>
          <div className="field">
            <label>Responsable de entrega</label>
            <input
              placeholder="Coordinador / responsable administrativo"
              {...register("documentacion.responsableEntrega")}
            />
          </div>
        </div>
        <div className="field">
          <label>Anotaciones</label>
          <textarea rows={3} {...register("documentacion.notas")} placeholder="Compromisos, dependencias, etc." />
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>Costos y control financiero</legend>
        <div className="grid-3">
          <div className="field">
            <label htmlFor="costo-estimado">Costo estimado (COP)</label>
            <input id="costo-estimado" inputMode="decimal" {...register("costos.costoEstimado")} />
          </div>
          <div className="field">
            <label htmlFor="costo-real">Costo real proyectado (COP)</label>
            <input id="costo-real" inputMode="decimal" {...register("costos.costoReal")} />
          </div>
          <div className="field">
            <label htmlFor="gastos-noplan">Gastos no planeados (COP)</label>
            <input id="gastos-noplan" inputMode="decimal" {...register("costos.gastosNoPlaneados")} />
          </div>
        </div>
        <div className="field">
          <label>Comentarios financieros</label>
          <textarea rows={3} {...register("costos.comentarios")} placeholder="Impuestos, logística, transportes, ajustes" />
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>Observaciones generales</legend>
        <div className="field">
          <textarea
            rows={3}
            placeholder="Registrar compromisos de seguimiento, necesidades del cliente, hitos de facturación"
            {...register("observacionesGenerales")}
          />
        </div>
      </fieldset>

      <div className="form-actions">
        <button
          type="button"
          className="btn ghost"
          onClick={() => alert("Guardado local pendiente de integrar con backend.")}
        >
          Guardar borrador
        </button>
        <button type="button" className="btn pdf" onClick={handleSavePdf}>
          🧾 Guardar PDF
        </button>
        <div style={{ flex: 1 }} />
        <Link href="/ordenes" className="btn light">
          Cancelar
        </Link>
        <button type="submit" className="btn primary" disabled={isSubmitting}>
          {isSubmitting ? "Procesando..." : "Confirmar planeación"}
        </button>
      </div>
    </form>
  );
}
