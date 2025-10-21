"use client";

import { useMemo, useState } from "react";
import "@/styles/components/forms.css";

type CampoTipo = "texto" | "textarea" | "checkbox" | "numero";

type CustomCampo = {
  id: string;
  etiqueta: string;
  tipo: CampoTipo;
};

type CustomSection = {
  id: string;
  titulo: string;
  notas?: string;
  campos: CustomCampo[];
};

const initialSections: CustomSection[] = [
  {
    id: "section-plan-basico",
    titulo: "Resumen editable",
    notas: "Personaliza este bloque con campos que necesites capturar al vuelo.",
    campos: [
      { id: "campo-personalizado-1", etiqueta: "Título del reporte", tipo: "texto" },
      { id: "campo-personalizado-2", etiqueta: "Descripción corta", tipo: "textarea" },
    ],
  },
];

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function CustomFormatBuilder() {
  const [sections, setSections] = useState<CustomSection[]>(initialSections);
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionNotes, setSectionNotes] = useState("");
  const [selectedSection, setSelectedSection] = useState<string>(initialSections[0]?.id ?? "");
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldType, setFieldType] = useState<CampoTipo>("texto");

  const activeSection = useMemo(
    () => sections.find((section) => section.id === selectedSection) ?? sections[0] ?? null,
    [sections, selectedSection],
  );

  const addSection = () => {
    const title = sectionTitle.trim();
    if (!title) return;

    const id = createId("section");
    const newSection: CustomSection = {
      id,
      titulo: title,
      notas: sectionNotes.trim() || undefined,
      campos: [],
    };

    setSections((prev) => [...prev, newSection]);
    setSectionTitle("");
    setSectionNotes("");
    setSelectedSection(id);
  };

  const removeSection = (id: string) => {
    setSections((prev) => {
      const updated = prev.filter((section) => section.id !== id);
      if (selectedSection === id) {
        setSelectedSection(updated[0]?.id ?? "");
      }
      return updated;
    });
  };

  const addField = () => {
    if (!activeSection) return;
    const label = fieldLabel.trim();
    if (!label) return;

    const newField: CustomCampo = {
      id: createId("campo"),
      etiqueta: label,
      tipo: fieldType,
    };

    setSections((prev) =>
      prev.map((section) =>
        section.id === activeSection.id
          ? { ...section, campos: [...section.campos, newField] }
          : section,
      ),
    );

    setFieldLabel("");
  };

  const removeField = (sectionId: string, campoId: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? { ...section, campos: section.campos.filter((campo) => campo.id !== campoId) }
          : section,
      ),
    );
  };

  const handleSavePdf = () => {
    const previousTitle = document.title;
    document.title = "Formato_personalizado_Cermont";
    window.print();
    document.title = previousTitle;
  };

  return (
    <div className="form-card" style={{ display: "grid", gap: 24 }}>
      <header className="print-header">
        <h2>Constructor de formato personalizado</h2>
        <small>Taller visual para crear plantillas propias</small>
      </header>

      <section className="form-section">
        <legend>Crear nueva sección</legend>
        <div className="grid-3">
          <div className="field">
            <label htmlFor="builder-section-title">Título</label>
            <input
              id="builder-section-title"
              placeholder="Ej: Control de riesgos"
              value={sectionTitle}
              onChange={(event) => setSectionTitle(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="builder-section-notes">Notas</label>
            <input
              id="builder-section-notes"
              placeholder="Visible como subtítulo opcional"
              value={sectionNotes}
              onChange={(event) => setSectionNotes(event.target.value)}
            />
          </div>
          <div className="field" style={{ alignSelf: "end" }}>
            <button type="button" className="btn primary" onClick={addSection}>
              Añadir sección
            </button>
          </div>
        </div>
      </section>

      {sections.length > 0 && (
        <section className="form-section">
          <legend>Agregar campos</legend>
          <div className="grid-3">
            <div className="field">
              <label htmlFor="builder-section-select">Selecciona sección</label>
              <select
                id="builder-section-select"
                value={activeSection?.id ?? ""}
                onChange={(event) => setSelectedSection(event.target.value)}
              >
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.titulo}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="builder-field-label">Etiqueta de campo</label>
              <input
                id="builder-field-label"
                value={fieldLabel}
                onChange={(event) => setFieldLabel(event.target.value)}
                placeholder="Ej: Responsable del frente A"
              />
            </div>
            <div className="field">
              <label htmlFor="builder-field-type">Tipo de campo</label>
              <select
                id="builder-field-type"
                value={fieldType}
                onChange={(event) => setFieldType(event.target.value as CampoTipo)}
              >
                <option value="texto">Texto corto</option>
                <option value="textarea">Texto largo</option>
                <option value="checkbox">Casilla de verificación</option>
                <option value="numero">Número</option>
              </select>
            </div>
          </div>
          <div className="form-actions" style={{ position: "static", marginTop: 16 }}>
            <button type="button" className="btn secondary" onClick={addField}>
              Añadir campo
            </button>
          </div>
        </section>
      )}

      <section className="form-section">
        <legend>Vista previa imprimible</legend>
        <div className="grid-1" style={{ display: "grid", gap: 20 }}>
          {sections.map((section) => (
            <fieldset key={section.id} className="form-section" style={{ margin: 0 }}>
              <legend>{section.titulo}</legend>
              <div className="field">
                {section.notas ? <small className="helper-text">{section.notas}</small> : null}
              </div>
              <div className="grid-2">
                {section.campos.length === 0 && (
                  <div className="field">
                    <small className="helper-text">No hay campos en esta sección todavía.</small>
                  </div>
                )}
                {section.campos.map((campo) => (
                  <div key={campo.id} className="field">
                    <label>{campo.etiqueta}</label>
                    {campo.tipo === "texto" && <input placeholder="Texto" />}
                    {campo.tipo === "textarea" && <textarea rows={3} placeholder="Descripción" />}
                    {campo.tipo === "checkbox" && (
                      <label className="inline-controls" style={{ justifyContent: "flex-start" }}>
                        <input type="checkbox" />
                        <span>Marcar al ejecutar</span>
                      </label>
                    )}
                    {campo.tipo === "numero" && <input type="number" placeholder="0" />}
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={() => removeField(section.id, campo.id)}
                      style={{ marginTop: 8, alignSelf: "flex-start" }}
                    >
                      Quitar campo
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn danger"
                style={{ margin: 12 }}
                onClick={() => removeSection(section.id)}
              >
                Eliminar sección
              </button>
            </fieldset>
          ))}
        </div>
      </section>

      <div className="form-actions">
        <button type="button" className="btn pdf" onClick={handleSavePdf}>
          🧾 Exportar como PDF
        </button>
      </div>
    </div>
  );
}
