"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cctvSchema, type CctvFormData } from "@/lib/schemas/cctv";
import Link from "next/link";
import "@/styles/components/forms.css";
import ImagePicker from '@/components/forms/ImagePicker';
import { useState, useEffect } from "react";


export default function CctvForm() {
  const [currentDate, setCurrentDate] = useState<string>('');

  // Establecer la fecha solo en el cliente para evitar errores de hidratación
  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('es-CO'));
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<CctvFormData>({
    resolver: zodResolver(cctvSchema),
    defaultValues: {
      camaraNo: undefined,
      rutinaNo: undefined,
      camara: {},
      encoderPoe: { tipo: undefined, modelo: undefined, serial: undefined },
      radio: {},
      antenaExterna: { nombre: undefined, tipo: undefined, serial: undefined },
      switchEquipo: { tipo: undefined, modelo: undefined, serial: undefined },
      master: { radio: {} },
      electrico: {
        ac110: false,
        fotovoltaico: false,
        cajaConexion: false,
        transferenciaAutomatica: false,
        puestaTierraOk: false,
        alimentacionOrigen: "",
        sistemaActivo: undefined,
        gabineteBaseTorre: "",
        tbt: "",
        lucesObstruccion: "",
      },
      distanciaCamCaja: undefined,
      fotos: {},
      alcance: '',
    },
  });

  function onSubmit(data: CctvFormData) {
    const toNum = (v: string | number | undefined) =>
      typeof v === "string" && v.trim() !== "" ? Number(v) : v;

    data.alturaEstructura = toNum(data.alturaEstructura);
    data.alturaCamara = toNum(data.alturaCamara);
    data.distanciaCamCaja = toNum(data.distanciaCamCaja);

    const toBool = (v: unknown): boolean | unknown => (v === "true" || v === true ? true : v === "false" ? false : v);
    if (data.electrico) {
      data.electrico.ac110 = toBool(data.electrico.ac110) as boolean;
      data.electrico.fotovoltaico = toBool(data.electrico.fotovoltaico) as boolean;
      data.electrico.cajaConexion = toBool(data.electrico.cajaConexion) as boolean;
      data.electrico.transferenciaAutomatica = toBool(data.electrico.transferenciaAutomatica) as boolean;
      data.electrico.puestaTierraOk = toBool(data.electrico.puestaTierraOk) as boolean;
    }

    console.log("CCTV payload:", data);
    alert("Formulario OK (ver consola). Listo para guardar en backend/IndexedDB.");
  }

  /* Guardar PDF: usa estilos @media print para un PDF limpio */
  function handleSavePdf() {
    // puedes setear un title temporal si quieres personalizar el nombre sugerido
    const prev = document.title;
    document.title = "Informe_Mantenimiento_CCTV";
    window.print();
    document.title = prev;
  }

  return (
    <form className="form-card page-3-per-sheet" onSubmit={handleSubmit(onSubmit)}>
      {/* Encabezado sólo para impresión (aparece en PDF) */}
      <div className="print-header">
        <h2>Informe Mantenimiento Preventivo CCTV</h2>
          <small>Cermont · {currentDate || 'Cargando...'}</small>
      </div>

      {/* A. GENERALIDADES */}
      <fieldset className="form-section">
        <legend>Generalidades</legend>
        <div className="grid-3">
          <div className="field">
            <label htmlFor="camaraNo">Cámara No <span className="badge">opcional</span></label>
            <input id="camaraNo" placeholder="Número de cámara" {...register("camaraNo")} />
          </div>

          <div className="field">
            <label htmlFor="rutinaNo">Rutina No <span className="badge">opcional</span></label>
            <input id="rutinaNo" placeholder="Número de rutina" {...register("rutinaNo")} />
          </div>

          <div className="field">
            <label htmlFor="lugar">Lugar *</label>
            <input id="lugar" placeholder="Campo / Locación" {...register("lugar")} />
            {errors.lugar && <small className="err">{errors.lugar.message}</small>}
          </div>

          <div className="field">
            <label htmlFor="fecha">Fecha *</label>
            <input id="fecha" type="date" {...register("fecha")} />
            {errors.fecha && <small className="err">{errors.fecha.message}</small>}
          </div>

          <div className="field">
            <label htmlFor="alturaEstructura">Altura estructura (m)</label>
            <input id="alturaEstructura" inputMode="decimal" {...register("alturaEstructura")} />
          </div>

          <div className="field">
            <label htmlFor="distanciaCamCaja">Distancia entre cámara y caja conexión (m)</label>
            <input id="distanciaCamCaja" inputMode="decimal" {...register("distanciaCamCaja")} />
          </div>

          <div className="field">
            <label htmlFor="alturaCamara">Altura cámara (m)</label>
            <input id="alturaCamara" inputMode="decimal" {...register("alturaCamara")} />
          </div>
        </div>
      </fieldset>

      {/* B. CCTV */}
      <fieldset className="form-section">
        <legend>CCTV</legend>
        <div className="grid-3">
          <div className="field">
            <label>Tipo de cámara</label>
            <input {...register("camara.tipo")} />
          </div>
          <div className="field">
            <label>Modelo</label>
            <input {...register("camara.modelo")} />
          </div>
          <div className="field">
            <label>Serial</label>
            <input {...register("camara.serial")} />
          </div>
        </div>

        <div className="grid-3">
          <div className="field">
            <label>Encoder/ PoE</label>
            <input {...register("encoderPoe.tipo")} />
          </div>
          <div className="field">
            <label>Modelo</label>
            <input {...register("encoderPoe.modelo")} />
          </div>
          <div className="field">
            <label>Serial</label>
            <input {...register("encoderPoe.serial")} />
          </div>
        </div>
      </fieldset>

      {/* C. CONEXIÓN REMOTA */}
      <fieldset className="form-section">
        <legend>Conexión remota</legend>

        <div className="grid-3">
          <div className="field">
            <label>Tipo de radio</label>
            <input {...register("radio.tipo")} />
          </div>
          <div className="field">
            <label>Modelo</label>
            <input {...register("radio.modelo")} />
          </div>
          <div className="field">
            <label>Serial</label>
            <input {...register("radio.serial")} />
          </div>
        </div>

        <div className="grid-3">
          <div className="field">
            <label>Antena externa</label>
            <input {...register("antenaExterna.nombre")} />
          </div>
          <div className="field">
            <label>Tipo antena</label>
            <input {...register("antenaExterna.tipo")} />
          </div>
          <div className="field">
            <label>Serial</label>
            <input {...register("antenaExterna.serial")} />
          </div>
        </div>

        <div className="grid-3">
          <div className="field">
            <label>Switch</label>
            <input {...register("switchEquipo.tipo")} />
          </div>
          <div className="field">
            <label>Modelo</label>
            <input {...register("switchEquipo.modelo")} />
          </div>
          <div className="field">
            <label>Serial</label>
            <input {...register("switchEquipo.serial")} />
          </div>
        </div>
      </fieldset>

      {/* D. CONEXIÓN MASTER */}
      <fieldset className="form-section">
        <legend>Conexión master</legend>
        <div className="grid-3">
          <div className="field grid-span-3">
            <label htmlFor="ubicacion">Ubicación</label>
            <input id="ubicacion" placeholder="Base de torre, sala de equipos, etc." {...register("ubicacion")} />
          </div>
        </div>

        <div className="grid-3">
          <div className="field">
            <label>Tipo de radio</label>
            <input {...register("master.radio.tipo")} />
          </div>
          <div className="field">
            <label>Modelo</label>
            <input {...register("master.radio.modelo")} />
          </div>
          <div className="field">
            <label>Serial</label>
            <input {...register("master.radio.serial")} />
          </div>
        </div>
      </fieldset>

      {/* E. SISTEMA ELÉCTRICO */}
      <fieldset className="form-section electrico-section">
        <legend>Sistema eléctrico</legend>

        <div className="grid-12">
          <div className="field grid-span-3">
            <label>Alimentación AC 110 VAC</label>
            <div className="inline-controls">
              <label><input type="radio" value="true" {...register("electrico.ac110")} /> SI</label>
              <label><input type="radio" value="false" {...register("electrico.ac110")} /> NO</label>
            </div>
          </div>

          <div className="field grid-span-3">
            <label>Sistema fotovoltaico</label>
            <div className="inline-controls">
              <label><input type="radio" value="true" {...register("electrico.fotovoltaico")} /> SI</label>
              <label><input type="radio" value="false" {...register("electrico.fotovoltaico")} /> NO</label>
            </div>
          </div>

          <div className="field grid-span-3">
            <label>Caja de conexión</label>
            <div className="inline-controls">
              <label><input type="radio" value="true" {...register("electrico.cajaConexion")} /> SI</label>
              <label><input type="radio" value="false" {...register("electrico.cajaConexion")} /> NO</label>
            </div>
          </div>

          <div className="field grid-span-3">
            <label>Gabinete en base de torre</label>
            <input {...register("electrico.gabineteBaseTorre")} />
          </div>
        </div>

        <div className="grid-12" style={{ marginTop: 8 }}>
          <div className="field grid-span-4">
            <label>Sistema eléctrico activo</label>
            <div className="inline-controls">
              <label><input type="radio" value="AC" {...register("electrico.sistemaActivo")} /> AC</label>
              <label><input type="radio" value="SOL" {...register("electrico.sistemaActivo")} /> SOL</label>
            </div>
          </div>

          <div className="field grid-span-4">
            <label>Transferencia automática</label>
            <div className="inline-controls">
              <label><input type="radio" value="true" {...register("electrico.transferenciaAutomatica")} /> SI</label>
              <label><input type="radio" value="false" {...register("electrico.transferenciaAutomatica")} /> NO</label>
            </div>
          </div>

          <div className="field grid-span-4">
            <label>Alimentación proviene de</label>
            <input placeholder="Especifica la fuente de alimentación" {...register("electrico.alimentacionOrigen")} />
          </div>
        </div>

        <div className="grid-12" style={{ marginTop: 8 }}>
          <div className="field grid-span-12">
            <label>Luces de obstrucción</label>
            <input placeholder="Descripción de luces de obstrucción (si aplica)" {...register("electrico.lucesObstruccion")} />
          </div>
        </div>
      </fieldset>

      {/* G. OBSERVACIONES */}
      <fieldset className="form-section">
        <legend>Observaciones</legend>
        <div className="field">
          <textarea rows={3} placeholder="Notas técnicas, hallazgos, recomendaciones..." {...register("observaciones")} />
        </div>
      </fieldset>

      {/* G.1 ALCANCE */}
      <fieldset className="form-section">
        <legend>Alcance</legend>
        <div className="field">
          <textarea rows={3} placeholder="Describe el alcance del trabajo realizado" {...register("alcance")} />
        </div>
      </fieldset>

      {/* H. REGISTRO FOTOGRÁFICO */}
      <fieldset className="form-section card">
  <legend>Registro fotográfico</legend>
  <div className="grid-2">
    <ImagePicker name="fotos.camaraAntes"      label="Cámara · ANTES"                     setValue={setValue} max={8} />
    <ImagePicker name="fotos.camaraDespues"    label="Cámara · DESPUÉS"                  setValue={setValue} max={8} />

    <ImagePicker name="fotos.radioAntes"       label="Radioenlace · ANTES"               setValue={setValue} max={4} />
    <ImagePicker name="fotos.radioDespues"     label="Radioenlace · DESPUÉS"            setValue={setValue} max={4} />

    <ImagePicker name="fotos.cajaAntes"        label="Caja conexiones CCTV · ANTES"     setValue={setValue} max={4} />
    <ImagePicker name="fotos.cajaDespues"      label="Caja conexiones CCTV · DESPUÉS"  setValue={setValue} max={4} />

    <ImagePicker name="fotos.electricaAntes"   label="Conexión eléctrica · ANTES"       setValue={setValue} max={8} />
    <ImagePicker name="fotos.electricaDespues" label="Conexión eléctrica · DESPUÉS"    setValue={setValue} max={8} />

    <ImagePicker name="fotos.patAntes"         label="Puesta a tierra (PAT) · ANTES"    setValue={setValue} max={4} />
    <ImagePicker name="fotos.patDespues"       label="Puesta a tierra (PAT) · DESPUÉS" setValue={setValue} max={4} />

    <ImagePicker name="fotos.generalAntes"     label="Área general · ANTES"              setValue={setValue} max={4} />
    <ImagePicker name="fotos.generalDespues"   label="Área general · DESPUÉS"           setValue={setValue} max={4} />
  </div>
</fieldset>


      {/* ACCIONES */}
      <div className="form-actions">
        <button type="button" className="btn ghost hover-raise pressable" onClick={() => alert("Guardado local (borrador).") }>
          Guardar borrador
        </button>

        <button type="button" className="btn pdf hover-raise pressable" onClick={handleSavePdf} title="Guardar como PDF">
          🧾 Guardar PDF
        </button>

        <div style={{ flex: 1 }} />

        <Link href="/" className="btn light hover-raise pressable">Cancelar</Link>
        <button type="submit" className="btn primary hover-raise pressable" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar informe"}
        </button>
      </div>
    </form>
  );
}

