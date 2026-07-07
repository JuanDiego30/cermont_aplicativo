# Informe de Auditoría Académica
## Trabajo de Grado: Desarrollo de un Aplicativo Web para la Gestión de Órdenes de Trabajo, Trazabilidad y Cierre Administrativo de Procesos Operativos en CERMONT S.A.S.

**Autor:** Juan Diego Arévalo Pidiache  
**Director:** MSc. Luis Alberto Muñoz Bedoya  
**Programa:** Ingeniería Electrónica — Universidad de Pamplona  
**Modalidad:** Práctica Empresarial  
**Fecha de auditoría:** Mayo 2026  
**Versión del documento auditado:** main.pdf (PDF generado del repositorio LaTeX)

***

## 1. Evaluación General del Documento

El trabajo de grado presenta una estructura académica reconocible y un problema real bien delimitado. La empresa CERMONT S.A.S., el flujo operativo de 14 pasos, las cuatro fases críticas y el aplicativo web desarrollado guardan coherencia temática a lo largo del documento. Sin embargo, se identifican deficiencias formales, de enfoque investigativo y de redacción que deben corregirse antes de la entrega definitiva al director y al jurado de evaluación. Este informe clasifica los problemas encontrados, propone correcciones específicas y establece una hoja de ruta editorial para la versión final.[^1]

**Calificación preliminar por dimensiones:**

| Dimensión | Estado actual | Calificación (1–5) | Acción requerida |
|---|---|---|---|
| Coherencia con el título | Alta — el documento responde al título declarado | 4/5 | Ajuste menor |
| Coherencia con la modalidad práctica | Alta — problema real, empresa real, documentos reales | 4/5 | Ajuste menor |
| Coherencia entre capítulos | Media — la numeración de capítulos en el índice no coincide con la descripción interna | 2/5 | Corrección urgente |
| Lenguaje universitario | Media — mezcla registro técnico de programador con redacción académica | 3/5 | Revisión sistemática |
| Calidad investigativa | Media-alta — pregunta de investigación presente pero excesivamente técnica | 3/5 | Reescritura puntual |
| Formato LaTeX / PDF | Bajo — tablas del flujo de 14 pasos fragmentadas en 4 páginas, figuras en tabla HTML, normas mixtas | 2/5 | Corrección urgente |
| Citación (IEEE) | Media — uso de IEEE en bibliografía pero citas en texto con signos mixtos | 3/5 | Revisión bibliográfica |
| Originalidad académica | Alta — propuesta contextualizada, no copia de manuales de terceros | 4/5 | Mantenimiento |

***

## 2. Problemas Críticos Detectados

### 2.1 Error de numeración de capítulos (URGENTE)

El índice general declara 10 capítulos en el siguiente orden:

> 1. Introducción y Planteamiento — 2. Marco Teórico — 3. Estado del Arte — 4. Marco Legal — 5. Metodología — 6. Desarrollo del Aplicativo — 7. Resultados — 8. Validación — 9. Discusión — 10. Conclusiones

Sin embargo, la sección 1.9 "Estructura general del documento" describe el mismo contenido con numeración diferente:

> "Capítulo 7 — Validación y Pruebas Funcionales; Capítulo 8 — Discusión y Análisis Crítico; Capítulo 9 — Conclusiones; Capítulo 10 — Recomendaciones"

Esto significa que en el PDF los capítulos 7, 8, 9 y 10 del índice real son descritos como capítulos 7, 8, 9 y 10 en la descripción interna, pero el capítulo 9 del PDF es "Discusión" mientras que la descripción lo llama "Capítulo 8". Esta inconsistencia afecta la defensa ante jurados.

**Corrección requerida:** Revisar la sección 1.9 para que describa fielmente los 10 capítulos con su número, título exacto y contenido real tal como aparecen en el índice definitivo del PDF compilado.

***

### 2.2 Tablas 1.1, 1.2, 1.3 y 1.4 — Fragmentación innecesaria (URGENTE)

Las cuatro tablas que describen el ciclo operativo de 14 pasos en CERMONT S.A.S. se distribuyen en cuatro páginas separadas, con apenas dos o tres filas por tabla. Esto genera desperdicio editorial y dificulta la lectura comparativa del flujo completo.[^1]

**Corrección LaTeX requerida — unificar en una sola tabla:**

```latex
\begin{table}[htbp]
\centering
\small
\caption{Ciclo de vida operativo y administrativo unificado de 14 pasos
  en CERMONT S.A.S. Fuente: elaboración propia con base en documentos
  suministrados por la empresa.}
\label{tab:flujo-14-pasos}
\begin{adjustbox}{max width=\textwidth}
\begin{tabular}{p{0.7cm} p{3cm} p{6cm} p{3.2cm}}
\toprule
\textbf{Paso} & \textbf{Etapa} & \textbf{Descripción del proceso}
  & \textbf{Entidad digital} \\
\midrule
1  & Solicitud      & Recepción del requerimiento técnico del cliente.         & Solicitud \\
2  & Visita técnica & Inspección en sitio para definir alcance y mediciones.   & Visita \\
3  & Propuesta      & Elaboración de cotización y recursos requeridos.          & Propuesta \\
4  & Aprobación PO  & Validación de la propuesta y emisión de la orden de compra. & Orden de compra \\
5  & Planeación     & Definición de recursos, personal y permisos.             & Planeación \\
6  & Ejecución      & Ejecución y captura de evidencias.                       & Ejecución \\
7  & Informe        & Generación del informe técnico.                          & Informe \\
8  & Acta entrega   & Documento formal de entrega al cliente.                  & Acta \\
9  & Firma acta     & Revisión y firma por supervisor autorizado.              & Aceptación \\
10 & SES Ariba      & Carga de la SES en SAP Ariba.                            & SES \\
11 & Aprobación SES & Validación documental y aprobación de la SES.            & Aprobación \\
12 & Factura        & Registro y seguimiento de la factura emitida.            & Seguimiento \\
13 & Aprobación factura & Validación contable y radicación en tesorería.       & Aprobación \\
14 & Pago           & Conciliación bancaria y cierre financiero.               & Pago \\
\bottomrule
\end{tabular}
\end{adjustbox}
\end{table}
```

El paquete `adjustbox` debe estar cargado en el preámbulo:
```latex
\usepackage{adjustbox}
\usepackage{booktabs}
```

***

### 2.3 Sección 2.8 — Los ADR pertenecen al capítulo de desarrollo, no al marco teórico (URGENTE)

La sección 2.8 "Registros de decisión arquitectónica (ADR) aplicados al proyecto" se ubica dentro del capítulo "Marco Teórico". Este es el error conceptual más grave del libro. Un marco teórico fundamenta el conocimiento existente (FSM, PWA, OWASP, arquitectura de software). Las decisiones arquitectónicas son consecuencia del diseño realizado por el autor, no conceptos teóricos de la disciplina.

**Acción requerida:**

1. Mover la sección 2.8 completa (ADR-001 a ADR-005) al capítulo 6 "Desarrollo del Aplicativo", como subsección 6.X titulada "Justificación del stack tecnológico y decisiones arquitectónicas".
2. Eliminar la sección 2.8 del capítulo 2. En su lugar, cerrar el capítulo con la síntesis conceptual (Tabla 2.1) que ya existe y está correctamente redactada.
3. Ajustar la numeración de las secciones 2.9 a 2.12 que quedan en el marco teórico.

**Texto de transición recomendado para la nueva ubicación en el capítulo 6:**

> "Las decisiones tecnológicas del proyecto no respondieron a preferencias arbitrarias sino a necesidades operativas concretas de CERMONT S.A.S. Para documentar este proceso de selección con rigor metodológico, se adoptó la práctica de los Registros de Decisión Arquitectónica (ADR), que formaliza el contexto, las alternativas evaluadas y los criterios de elección de cada componente del sistema."

***

### 2.4 Pregunta de investigación — Exceso de tecnicismo (CORRECCIÓN REQUERIDA)

La pregunta de investigación actual es:

> "¿Cómo diseñar e implementar un aplicativo web modular dotado de una arquitectura desacoplada, validación dual estricta de esquemas, sincronización offline de datos y control de acceso basado en roles, que permita unificar la gestión operativa de órdenes de trabajo con el cierre administrativo y la documentación técnica en CERMONT S.A.S.?"

Esta redacción anticipa la solución técnica dentro de la pregunta misma, lo que limita su valor investigativo. Una pregunta de investigación no debe contener la respuesta.

**Versión corregida recomendada:**

> "¿Cómo puede diseñarse e implementarse un aplicativo web modular que centralice la gestión de órdenes de trabajo, evidencias, informes, actas y cierre administrativo en CERMONT S.A.S., reduciendo la fragmentación documental presente en su flujo operativo de catorce pasos?"

**Preguntas específicas a agregar o verificar (sección 1.4):**

1. ¿Cuáles son las fallas documentales y operativas presentes en las fases críticas del flujo de 14 pasos de CERMONT S.A.S.?
2. ¿Qué requisitos funcionales y no funcionales debe satisfacer el aplicativo para atender las necesidades de técnicos, residentes, personal administrativo y gerencia?
3. ¿Qué arquitectura de software permite centralizar la información, controlar roles, operar parcialmente sin conexión y generar soportes documentales verificables?
4. ¿Por qué el conjunto tecnológico seleccionado resulta adecuado frente a las necesidades del proyecto y frente a alternativas comerciales o de código abierto disponibles?
5. ¿Qué módulos del aplicativo resuelven cada una de las fallas identificadas en planeación, ejecución, informes y actas, y cierre administrativo?
6. ¿Qué pruebas funcionales permiten verificar que el sistema cumple con los requisitos definidos antes de su despliegue en CERMONT S.A.S.?

***

### 2.5 Justificación técnica (sección 1.5.1) — Lenguaje de repositorio en cuerpo principal (CORRECCIÓN REQUERIDA)

La sección 1.5.1 contiene fragmentos como:

> "El backend se sustenta sobre Express 5.2.1, aprovechando la propagación nativa de excepciones asíncronas... en conjunto con Mongoose 9.5.0 y MongoDB... el uso de React 19 y Next.js 16.2.4 (App Router)... TanStack Query v5 para el estado del servidor y Zustand v5 para el estado UI del cliente."

Las versiones exactas de librerías pertenecen a los anexos técnicos, no a la justificación académica del capítulo introductorio. En el cuerpo principal, la justificación debe responder al problema, no describir el stack.

**Versión recomendada para la sección 1.5.1:**

> "Desde la perspectiva de la ingeniería de software aplicada, el proyecto propone resolver los desafíos de fragmentación documental de CERMONT S.A.S. mediante una arquitectura web modular que separa la lógica de presentación, la lógica de negocio y la persistencia de datos. Se adoptó un entorno basado en Node.js para el backend y React con renderizado mixto para el frontend, tecnologías con amplia adopción en el desarrollo de plataformas empresariales web y compatibles con el paradigma de Aplicaciones Web Progresivas (PWA) que permite operación sin conectividad. La selección de estas tecnologías responde a criterios de bajo costo de implementación, compatibilidad con el modelo documental flexible requerido por los formularios operativos de la empresa y disponibilidad de infraestructura de despliegue en servidores de tipo VPS. Las versiones específicas de cada biblioteca y los detalles de configuración del entorno se documentan en los anexos técnicos del trabajo."

***

### 2.6 Sección G (Anexo) — Afirmación fuerte sin precisión epistemológica (CORRECCIÓN REQUERIDA)

El Anexo G cierra con la siguiente afirmación:

> "La ejecución exitosa de estas suites confirma que el aplicativo es estable y cumple rigurosamente con los requisitos funcionales documentados en el presente trabajo de grado."

Esta afirmación es epistemológicamente imprecisa para un trabajo de grado. Las pruebas automatizadas confirman el comportamiento del código ante los casos de prueba diseñados; no constituyen certificación de estabilidad en producción.

**Versión corregida:**

> "La ejecución exitosa de estas suites de prueba, realizada en el entorno de desarrollo del monorepo, verifica el comportamiento del sistema ante los escenarios funcionales documentados. Los resultados obtenidos respaldan la implementación de los módulos descritos en el trabajo de grado; la validación en entorno productivo queda como tarea posterior al despliegue en CERMONT S.A.S."

***

### 2.7 Secciones 10.4, 10.5 y 10.6 — Tono autocomplaciente (CORRECCIÓN REQUERIDA)

Las secciones "Cierre del trabajo", "Síntesis de contribuciones" y "Reflexión sobre la formación en Ingeniería Electrónica" presentan un tono que no es propio de la sección de conclusiones de un trabajo de grado académico. Afirmaciones del tipo "El autor logró..." o "se certifica la estabilidad..." no deben aparecer en el cuerpo principal.

**Acción requerida:**

- Mantener sección 10.1 (Conclusiones) — está bien estructurada y sobria.
- Mantener sección 10.2 (Recomendaciones) y 10.3 (Líneas de continuidad) — pertinentes.
- Reescribir 10.4 y 10.5 fusionándolas en una sola sección titulada "Síntesis del proyecto" con tono neutro y referencias a los objetivos cumplidos, sin elogios al autor.
- Convertir 10.6 en una nota breve de máximo dos párrafos, situada antes de las referencias bibliográficas, con título "Reflexión metodológica sobre la modalidad de práctica empresarial".

***

### 2.8 "Contribuciones Académicas del Autor" — Sección fuera de estructura estándar (CORRECCIÓN REQUERIDA)

Esta sección aparece después del capítulo 10 y antes de las referencias bibliográficas. No existe en la estructura estándar de trabajos de grado de la Universidad de Pamplona ni en el estándar IEEE de presentación de resultados. Si se desea preservar, debe convertirse en el Anexo H o incorporarse como parte de la sección de conclusiones con redacción sobria.

**Versión aceptable del contenido (fragmento):**

> "En el marco de este trabajo de grado, se desarrollaron competencias en análisis de procesos operativos, arquitectura de software web modular, validación técnica y documentación académica de soluciones de ingeniería. El artefacto construido constituye un aporte concreto a la digitalización de los procesos de CERMONT S.A.S. y una referencia metodológica para proyectos similares en organizaciones contratistas del sector industrial colombiano."

***

### 2.9 Título del Anexo D — Mayúsculas innecesarias (CORRECCIÓN MENOR)

El índice de tablas registra:

> "D Esquema de la ARQUITECTURA Tecnológica"

**Corrección:** "D. Arquitectura tecnológica del sistema"

Ninguna palabra dentro de un título de sección o anexo debe ir en mayúsculas sostenidas a menos que sea un acrónimo reconocido.

***

## 3. Problemas de Formato LaTeX Detectados

### 3.1 Figuras como tablas HTML en el PDF

Las Figuras 1.1, 1.2, 1.3, 6.1, 6.2 y el diagrama de la máquina de estados (Figura 6.7) se representan como tablas Markdown o texto ASCII en el PDF, lo que indica que el LaTeX fuente las genera mediante entornos `tabular` o bloques de texto, no mediante `tikzpicture` o archivos gráficos externos.

**Problema académico:** Un jurado puede considerar que el trabajo carece de calidad gráfica suficiente si los diagramas BPMN son tablas de texto.

**Recomendación:** Para cada figura crítica, evaluar si puede generarse con `tikzpicture` o si existe un archivo `.pdf` o `.png` de alta calidad que pueda incluirse con:

```latex
\begin{figure}[htbp]
  \centering
  \includegraphics[width=0.85\textwidth]{Figuras/flujo_14_pasos.pdf}
  \caption{Ciclo de vida operativo y administrativo de 14 pasos en CERMONT S.A.S.
    Fuente: elaboración propia.}
  \label{fig:flujo-14-pasos}
\end{figure}
```

Si se usan `tikzpicture`, aplicar:

```latex
\begin{figure}[htbp]
  \centering
  \resizebox{0.85\textwidth}{!}{%
    \begin{tikzpicture}
      % contenido del diagrama
    \end{tikzpicture}
  }
  \caption{...}
  \label{fig:...}
\end{figure}
```

***

### 3.2 Figuras en páginas completas — uso de [H]

El PDF presenta páginas casi vacías o figuras aisladas sin texto alrededor, síntoma del abuso del especificador `[H]` (del paquete `float`).

**Corrección global:** Reemplazar `[H]` por `[htbp]` en todas las figuras. Aplicar `\FloatBarrier` únicamente cuando sea estrictamente necesario separar secciones con muchas figuras consecutivas.

```latex
% Incorrecto:
\begin{figure}[H]

% Correcto:
\begin{figure}[htbp]
```

***

### 3.3 Configuración de párrafos — inconsistencia

El PDF presenta mezcla de párrafos con sangría y párrafos sin sangría. La norma editorial debe ser uniforme en todo el documento.

**Opción recomendada para trabajos de ingeniería (sin sangría, con espacio entre párrafos):**

```latex
\setlength{\parindent}{0pt}
\setlength{\parskip}{6pt}
```

Esta configuración va en el preámbulo, después de `\begin{document}` no, sino antes, y aplica globalmente. Si la plantilla de la Universidad de Pamplona exige sangría, usar:

```latex
\setlength{\parindent}{1.25cm}
\setlength{\parskip}{0pt}
```

No mezclar ambas opciones.

***

### 3.4 Nombres de tablas con mayúsculas en el índice

El índice de tablas registra entradas como:

> "D.1 Componentes tecnológicos del sistema — Stack Verificado en el Repositorio"

La frase "Stack Verificado en el Repositorio" usa mayúsculas innecesarias. Los títulos de tablas deben seguir reglas de oración: solo mayúscula inicial y nombres propios.

**Corrección:** "D.1 Componentes tecnológicos del sistema — stack verificado en el repositorio"

***

### 3.5 Norma de citación — uso de IEEEtran

El documento usa citación numérica `[^1]`, ``, `` en el texto, lo cual es correcto para IEEE. Sin embargo, la bibliografía (páginas 135–138) presenta un formato inconsistente: las entradas están entre comillas dobles `"..."` lo cual no es propio del formato IEEEtran.

**Formato IEEEtran estándar para una entrada web:**

```bibtex
@misc{cermont2026web,
  author       = {{CERMONT S.A.S.}},
  title        = {Inicio},
  howpublished = {Sitio web oficial. [En línea].
                  Disponible: \url{https://www.cermont.co/}},
  note         = {Accedido: mayo 17, 2026}
}
```

**Configuración del preámbulo:**

```latex
\bibliographystyle{IEEEtran}
\bibliography{referencias}
```

No usar simultáneamente `\usepackage{natbib}` con `\citep{}` y `IEEEtran`. Elegir uno.

***

### 3.6 Secuencia de compilación recomendada

Para que las referencias, el índice de figuras y el índice de tablas queden correctamente generados:

```bash
xelatex main.tex
bibtex main
xelatex main.tex
xelatex main.tex
```

Si se usa `biblatex`:

```bash
xelatex main.tex
biber main
xelatex main.tex
xelatex main.tex
```

***

## 4. Problemas de Lenguaje y Redacción

### 4.1 Expresiones que deben reubicarse o reescribirse

Las siguientes expresiones aparecen en el cuerpo principal del trabajo y deben tratarse según la regla: en el cuerpo explicar la decisión con lenguaje académico; en los anexos dejar los detalles técnicos específicos.

| Expresión encontrada | Ubicación actual | Corrección requerida |
|---|---|---|
| "Express 5.2.1 como framework HTTP" | Sección 2.8.2 (título de ADR) | Mover al Capítulo 6; en cuerpo usar "entorno backend basado en Node.js y Express" |
| "Mongoose 9.5.0 y MongoDB" | Sección 1.5.1 y 2.8.3 | Versiones al anexo; cuerpo usa "base de datos documental MongoDB con mapeador Mongoose" |
| "Next.js 16.2.4 (App Router)" | Sección 1.5.1 | Versión al anexo; cuerpo usa "framework de renderizado React con Next.js" |
| "Serwist 9.x" | Sección 6.7 | Versión al anexo; cuerpo usa "biblioteca de Service Workers" |
| "Zustand v5 para el estado UI del cliente" | Sección 1.5.1 | Reescribir como "gestión de estado del cliente en el frontend" |
| "proxy local programable" | Sección 1.5.1 | Reescribir como "Service Worker configurado para interceptar peticiones de red" |
| "pipeline de sincronización" | Sección 6.7 (título) | Reescribir título como "Mecanismo de sincronización offline" |
| "gates de calidad" | Sección 5.8 (título) | Corregir a "compuertas de calidad por iteración" — ya corregido en el cuerpo |
| "typechecks unitarios" | Sección 1.5.4 | Reescribir como "verificación estática de tipos en tiempo de compilación" |
| "ADR-001", "ADR-002" | Sección 2.8 | Mover al Capítulo 6; referenciar como decisiones arquitectónicas con nombre descriptivo |
| "Zero Trust con Zod" | Sección 6.4 (título) | Reescribir como "Validación de entradas mediante esquemas tipados estrictos" |
| "monorepo" | Múltiples secciones | En la primera mención explicar: "repositorio unificado (monorepo)"; luego puede usarse la abreviatura |

***

### 4.2 Palabras que deben limitarse

| Palabra | Veces detectadas | Recomendación |
|---|---|---|
| "robusto / robusta" | 9+ | Usar máx. 2 veces; sustituir por "bien estructurado", "verificado", "con pruebas" |
| "riguroso / rigurosamente" | 7+ | Usar máx. 2 veces; sustituir por "sistemático", "documentado" |
| "resiliente" | 4+ | Explicar la propiedad específica en lugar de usar el adjetivo |
| "transaccional" | 6+ | Usar cuando se refiera explícitamente a operaciones de base de datos con atomicidad |
| "garantiza" | 8+ | Sustituir por "favorece", "se diseñó para", "se verificó mediante" cuando no exista certificación formal |
| "certifica" | 2+ | Usar solo cuando exista certificación institucional real |
| "total" (como "trazabilidad total") | 3+ | Eliminar; ningún sistema garantiza cobertura total en producción antes de operación real |

***

### 4.3 Frases que no deben aparecer en el cuerpo principal

Las siguientes frases se encontraron en el documento y deben corregirse:

| Frase original | Frase corregida |
|---|---|
| "certificando su estabilidad bajo el estricto cumplimiento" | "verificando su comportamiento ante los escenarios de prueba definidos" |
| "certifica la validación funcional de los 14 pasos operativos" | "verifica el comportamiento del sistema ante los escenarios de prueba de los 14 pasos" |
| "cumple rigurosamente con los requisitos funcionales" | "responde a los requisitos funcionales definidos, según lo verificado en las pruebas del entorno de desarrollo" |
| "se logró digitalizar el flujo completo" | "se implementó un sistema que cubre el flujo completo de 14 pasos, con las limitaciones documentadas en la sección de alcance" |

***

## 5. Evaluación del Marco Teórico (Capítulo 2)

### 5.1 Fortalezas del marco teórico actual

El capítulo 2 cubre correctamente las siguientes dimensiones que son pertinentes al proyecto:

- Ingeniería de software y arquitectura web (2.1) — bien fundamentado con Sommerville, Pressman, Bass.
- FSM y órdenes de trabajo (2.2) — directamente conectado con el problema de CERMONT.
- Sistemas CMMS/ERP y su convergencia (2.3) — relevante y bien contextualizado.
- PWA y operación offline (2.4) — necesario para la justificación del módulo de campo.
- Validación declarativa y esquemas (2.5) — pertinente para la propuesta de formularios dinámicos.
- Seguridad web y OWASP (2.6) — necesario y bien referenciado.
- Síntesis conceptual (2.7, Tabla 2.1) — excelente recurso editorial.

### 5.2 Problema de la sección 2.8 (ADR)

Como se indicó en el punto 2.3, los ADR pertenecen al capítulo de desarrollo, no al marco teórico. Su traslado mejora la coherencia académica del capítulo 2.

### 5.3 Secciones 2.10, 2.11 y 2.12 — Pertinencia condicionada

Las secciones sobre modelo de madurez FSM (2.10), patrones de diseño (2.11) y principios SOLID (2.12) son conceptualmente válidas. Sin embargo, cada una debe cerrar con un párrafo explícito de aplicación al proyecto:

> "En este proyecto, el principio de responsabilidad única (SRP) se aplicó al diseñar cada módulo del sistema para gestionar únicamente una entidad del dominio: el módulo de órdenes de trabajo no gestiona usuarios, y el módulo de evidencias no genera documentos PDF. Esta separación facilita el mantenimiento del código y reduce el impacto de cambios futuros."

***

## 6. Evaluación del Estado del Arte (Capítulo 3)

### 6.1 Fortalezas

- La comparación de plataformas comerciales (Tabla 3.1) incluye herramientas relevantes: Fiix, UpKeep, Fracttal, Jobber, Odoo, SAP FSM, OCA, Atlas CMMS.
- La sección 3.12 "Justificación de la solución a medida" responde bien la pregunta de por qué no se adoptó un producto existente.
- La sección 3.13 "Análisis de costos del ecosistema" está bien delimitada a precios públicos, sin especulación financiera.

### 6.2 Problema con antecedentes colombianos (sección 3.10)

La Tabla 3.6 presenta "Antecedentes académicos colombianos relacionados con la problemática". Si estos trabajos de grado no están referenciados con DOI, repositorio institucional o código de acceso verificable, el jurado puede cuestionar su existencia. Cada fila debe incluir la referencia bibliográfica completa y el número de cita `[N]` correspondiente. Si no existe evidencia verificable, la fila debe eliminarse.

**Regla:** No afirmar "se revisaron N trabajos de grado" sin listar sus referencias exactas.

***

## 7. Evaluación del Capítulo de Desarrollo (Capítulo 6)

### 7.1 Fortalezas

- La Tabla 6.1 (Matriz de estado de implementación) es excelente: distingue claramente lo implementado, lo propuesto y lo excluido del alcance. Este nivel de transparencia es valorado por los jurados.
- La sección 6.9 (arquitectura de módulos del sistema) explica bien qué hace cada paso y qué entidad digital lo soporta.
- La Tabla 6.2 (módulos operativos) vincula cada módulo con el paso del flujo CERMONT.
- La Tabla 6.3 (comparativa del stack) es la ubicación correcta para las versiones específicas.

### 7.2 Problema del título de sección 6.7

> "6.7 Pipeline de Sincronización Offline mediante Serwist 9.x"

**Corrección:** "6.7 Mecanismo de sincronización offline para operación en campo"

El contenido puede mencionar Serwist como la biblioteca utilizada, pero el título de la sección debe describir el propósito funcional, no la herramienta.

### 7.3 Problema del título de sección 6.4

> "6.4 El contrato compartido: validación bajo enfoque de confianza cero (Zero Trust) con Zod"

**Corrección:** "6.4 Contrato de datos compartido y estrategia de validación de entradas"

***

## 8. Evaluación de Resultados y Validación (Capítulos 7 y 8)

### 8.1 Fortalezas

- La separación entre "resultados funcionales observables" (7.3) e "indicadores por medir con evidencia verificable" (7.4) es metodológicamente correcta y diferencia este trabajo de otros que afirman impactos sin evidencia.
- La Tabla 5.2 y la Tabla 7.1 reconocen que los indicadores cuantitativos están pendientes de medición en producción. Esto es académicamente honesto y debe mantenerse.
- La cobertura de pruebas automatizadas (153 pruebas, 22 archivos, 100% de aprobación) está documentada con detalle en el Anexo G.

### 8.2 Problema con el porcentaje de cobertura declarado

El Anexo G reporta:

> "All files: % Stmts 70.4 | % Branch 51.53 | % Funcs 69.49 | % Lines 70.42"

Este nivel de cobertura (70% de sentencias, 51% de ramas) es razonable para un proyecto académico individual, pero debe contextualizarse en el cuerpo del capítulo 8. No puede afirmarse "cumplimiento riguroso" cuando la cobertura de ramas es del 51%.

**Texto recomendado para la sección 8.6 "Síntesis de la validación":**

> "La cobertura general del monorepo alcanzó el 70% en sentencias y el 51% en ramas de decisión, con niveles superiores al 90% en los módulos críticos del dominio (order-rules.ts, authorize.ts). Estos valores son coherentes con el alcance de un proyecto de desarrollo individual y cubren los flujos transaccionales definidos como prioritarios. Los módulos de soporte (analytics, sincronización, AI) presentan menor cobertura formal, dado que su validación se plantea como tarea posterior en el entorno productivo."

***

## 9. Matriz de Auditoría del Software

La siguiente tabla consolida el estado de los módulos declarados en el libro frente a la evidencia disponible en el repositorio:

| Módulo declarado | Evidencia en código mencionada | Relación con problema CERMONT | Estado | Corrección requerida |
|---|---|---|---|---|
| Autenticación JWT + RBAC | `backend/src/auth`, suite auth | Control de acceso por rol en todos los pasos | Evidenciado | Ninguna |
| FSM 15 estados (órdenes) | `orders/domain/order-rules.ts` | Ciclo de vida de la orden de trabajo | Evidenciado | Ninguna |
| PWA Offline (Service Worker) | `frontend/src/sw.ts` | Ejecución en campo sin conectividad (Paso 6) | Evidenciado | Ninguna |
| Generación PDF (pdf-lib) | Módulo `reports/` | Informes técnicos y actas (Pasos 7–9) | Evidenciado | Ninguna |
| Evidencias geolocalizadas | Módulo `evidences/` con metadatos EXIF | Captura contextual en campo (Paso 6) | Evidenciado | Ninguna |
| Cierre administrativo | Registro interno de actas, SES, facturas | Seguimiento de Pasos 8–14 | Evidenciado (parcial — no integra SAP Ariba ni DIAN) | Declarar explícitamente la limitación en la sección de resultados |
| Dashboard Analytics | `analytics.schema.ts` | Visibilidad gerencial | Evidenciado | Ninguna |
| Asistente AI (Chat) | Módulo `ai/` | Sin relación directa con fallas de CERMONT | Complementario / no crítico | No presentar como resultado principal del trabajo |
| OCR / Extracción documental | No implementado | Digitalización de formatos heredados | Propuesto v2.0 | No afirmar implementación; citar como trabajo futuro |
| Firma digital criptográfica | No implementado | Validación legal de actas | Propuesto v2.0 | No afirmar implementación |
| Integración SAP Ariba | Fuera de alcance | Radicación automática de SES | Fuera de alcance | Mantener declaración explícita de exclusión |
| Emisión facturación electrónica DIAN | Fuera de alcance | Facturación al cliente (Paso 12) | Fuera de alcance | Mantener declaración explícita de exclusión |

***

## 10. Matriz de Preguntas de Investigación → Capítulos

| Pregunta de investigación | Capítulo donde se responde | Evidencia textual | Evidencia técnica | Estado |
|---|---|---|---|---|
| ¿Cuáles son las fallas documentales en el flujo de 14 pasos? | Capítulo 1 (secciones 1.2 y 1.3) | Tablas 1.1–1.4, Figura 1.3, cuatro fases críticas | Documentos internos CERMONT [3–7] | Respondida |
| ¿Qué requisitos funcionales y no funcionales debe satisfacer el sistema? | Capítulos 1 y 5 | Sección 1.7.1, Tabla 5.2, Tabla 5.4 | Matriz de estado (Tabla 6.1) | Respondida |
| ¿Qué arquitectura permite centralizar información, roles y operación offline? | Capítulos 2 y 6 | Secciones 2.1–2.6, 6.3, 6.8 | Estructura del monorepo (Anexo F) | Respondida |
| ¿Por qué el stack tecnológico seleccionado es adecuado? | Capítulo 6 (ADR trasladados) | Sección 6.13, Tabla 6.3 | ADR-001 a ADR-005 (una vez trasladados al Cap. 6) | Parcialmente respondida — mejorar con traslado de ADR |
| ¿Qué módulos resuelven cada falla identificada? | Capítulo 6 | Secciones 6.9.1 a 6.9.9, Tabla 6.2 | Suites de prueba (Anexo G) | Respondida |
| ¿Qué pruebas verifican el cumplimiento de requisitos? | Capítulo 8 | Secciones 8.3, 8.4, 8.5, Tabla 8.1 | 153 pruebas en Vitest (Anexo G) | Respondida |

***

## 11. Matriz Falla CERMONT → Módulo → Evidencia

| Falla identificada | Paso del flujo | Causa | Módulo del sistema | Cómo lo atiende | Evidencia | Estado |
|---|---|---|---|---|---|---|
| Planeación sin kits normalizados | Paso 5 | Sin biblioteca centralizada de recursos | Módulo Planeación / PlanningPacket | Precarga kits típicos por tipo de servicio; valida vigencia de certificaciones del personal | Sección 6.9.6; suite de kits | Implementado |
| Evidencias en WhatsApp sin trazabilidad | Paso 6 | Captura en canales informales sin vinculación a la orden | Módulo Evidencias / ExecutionSession PWA | Captura fotográfica offline con geolocalización, vinculada a la orden | Módulo `evidences/`; suite foto-geolocalizada | Implementado |
| Recaptura manual de informes en Word/Excel | Pasos 7–9 | Datos dispersos en papel y chat | Módulo Generación Documental / pdf-lib | Exportación automática a PDF desde datos transaccionales del sistema | Módulo `reports/`; suite documental | Implementado |
| Desconexión entre técnico y contabilidad | Pasos 10–14 | Sin panel de trazabilidad común | Módulo Cierre Administrativo | Panel de seguimiento de actas, SES, facturas y pagos | Sección 6.9.9; suite FSM | Implementado (seguimiento interno; no integra SAP Ariba ni DIAN) |
| Falta de control de acceso por rol | Transversal | Sin sistema de permisos formal | Módulo RBAC / Auth | JWT HttpOnly + 8 roles + middleware de autorización | `backend/src/auth`; suite RBAC | Implementado |
| Sin historial auditable de cambios | Transversal | Registros en papel sin versión | AuditLog | Registro inmutable de cada cambio de estado de la orden | Sección 6.8.5; campos de auditoría en modelos | Implementado |

***

## 12. Checklist de Antiplagio y Trazabilidad de Afirmaciones

| N.° | Afirmación o dato del documento | Clasificación | Estado |
|---|---|---|---|
| 1 | Descripción de servicios de CERMONT S.A.S. | Fuente institucional [^1] | Citada correctamente |
| 2 | Formato de planeación de obra, listas de inspección | Documento interno CERMONT  | Citado correctamente |
| 3 | Flujo de 14 pasos | Documento de proceso CERMONT  | Citado correctamente |
| 4 | PWA / Service Workers | Fuente técnica oficial MDN  | Citado correctamente |
| 5 | OWASP Top 10 | Fuente técnica oficial  | Citado correctamente |
| 6 | Design Science Research (DSR) | Fuente académica: Hevner et al. 2004  | Citado correctamente |
| 7 | "El sistema reduce tiempos de planeación en X%" | No encontrada en el documento | — | No se afirma — correcto |
| 8 | "ROI de la implementación" | No encontrada en el documento | — | No se afirma — correcto |
| 9 | "Se certificó la seguridad OWASP" | Encontrada en Anexo G (versión fuerte) | Interpretación del autor sin certificación formal | Corregir con versión matizada propuesta en sección 2.6 de este informe |
| 10 | Cobertura de pruebas 70.4% / 51.53% | Evidencia del repositorio (Anexo G) | Evidencia técnica | Contextualizar en capítulo 8 como se indica |
| 11 | Antecedentes colombianos (Tabla 3.6) | Pendiente verificación de referencias | Revisar que cada fila tenga referencia bibliográfica completa |

***

## 13. Checklist de Criterios de Aceptación Final

| Criterio | Estado actual | Acción requerida |
|---|---|---|
| No mezcla IEEE / APA | Cumple (uso numérico [N]) | Uniformizar formato de entradas bibliográficas con IEEEtran |
| Párrafos con espaciado uniforme | Incumple | Aplicar configuración global `\parindent` y `\parskip` |
| Sin sangrías inconsistentes | Incumple | Aplicar configuración global |
| Figuras no ocupan páginas completas | Incumple | Reemplazar tablas ASCII por figuras reales con `[htbp]` |
| Tablas no aisladas innecesariamente | Incumple | Unificar Tablas 1.1–1.4 en una sola |
| Tablas dentro del margen | Cumple en la mayoría | Verificar con `adjustbox` en tablas amplias |
| Figuras dentro del margen | A verificar | Usar `\resizebox{0.85\textwidth}{!}` |
| Sección ADR reubicada al Capítulo 6 | Incumple | Mover sección 2.8 completa al Capítulo 6 |
| Stack justificado con criterios académicos | Cumple parcialmente | La sección 6.13 y Tabla 6.3 lo hacen bien; limpiar 1.5.1 |
| Pregunta de investigación respondida por capítulos | Cumple (ver Sección 10 de este informe) | Agregar preguntas específicas a la sección 1.4 |
| Desarrollo no es lista de librerías | Cumple parcialmente | Reescribir sección 1.5.1 y títulos de secciones 6.4 y 6.7 |
| El libro explica cómo el aplicativo resuelve las fallas | Cumple (secciones 1.3 y 6.9) | Verificar que la Tabla de la sección 11 de este informe esté incluida en el libro |
| Sin datos inventados | Cumple — el libro es honesto con indicadores pendientes | Mantener |
| Funcionalidades no evidenciadas como "futuras" | Cumple (Tabla 6.1) | Ninguna |
| Tono universitario | Cumple parcialmente | Corregir secciones identificadas en secciones 2.6–2.8 de este informe |
| PDF compila sin errores | Por verificar | Ejecutar secuencia xelatex → bibtex → xelatex → xelatex |
| Índice coherente con capítulos | Incumple (error de numeración en sección 1.9) | Corregir sección 1.9 |
| Listo para revisión de director y jurados | Condicionado | Resolver todos los ítems marcados como "Incumple" |

***

## 14. Lista Consolidada de Issues

### Issues Críticos (bloquean la entrega)

1. **Sección 2.8 (ADR) en el marco teórico** — debe trasladarse al Capítulo 6.
2. **Tablas 1.1–1.4 fragmentadas** — deben unificarse en una sola tabla con `longtable` o `adjustbox`.
3. **Error de numeración en sección 1.9** — la descripción de capítulos no coincide con el índice real.
4. **Pregunta de investigación excesivamente técnica** — reescribir según versión recomendada.
5. **Figuras como tablas ASCII** — reemplazar por figuras vectoriales o imágenes de alta calidad.

### Issues Importantes (deben resolverse antes de la defensa)

6. **Sección 1.5.1 con versiones de librerías** — mover versiones exactas a los anexos.
7. **Títulos de secciones 6.4 y 6.7** — corregir para que describan propósito funcional, no herramienta.
8. **Secciones 10.4, 10.5, 10.6** — reescribir con tono académico sobrio.
9. **"Contribuciones Académicas del Autor"** — reubicar como Anexo H o sección de conclusiones.
10. **Afirmación en Anexo G** — "certifica estabilidad" → reescribir con versión matizada.
11. **Configuración global de párrafos** — aplicar `\parindent` / `\parskip` uniformes.
12. **Formato bibliográfico** — uniformizar con IEEEtran eliminando comillas dobles en entradas.

### Issues Menores (deseables antes de la entrega)

13. **Título del Anexo D** — eliminar mayúsculas innecesarias en "ARQUITECTURA".
14. **Palabras repetidas** — reducir uso de "robusto", "riguroso", "garantiza", "certifica".
15. **Preguntas específicas** — agregar a la sección 1.4 las seis preguntas recomendadas en la sección 2.4 de este informe.
16. **Párrafo de aplicación al proyecto** — agregar cierre de aplicación en secciones 2.10, 2.11 y 2.12.
17. **Cobertura de pruebas** — contextualizar el 51% de ramas en la síntesis del capítulo 8.

***

## 15. Fortalezas del Documento que Deben Preservarse

Antes de realizar cualquier corrección, es importante reconocer los elementos que ya están bien logrados y que no deben modificarse:

- **Tabla 6.1 (Matriz de estado de implementación):** Es un ejemplo de transparencia académica. Distingue con claridad lo implementado, lo complementario, lo propuesto y lo excluido del alcance. Debe preservarse íntegramente.
- **Sección 1.7.3 (Delimitación académica):** La renuncia explícita a afirmar ROI, porcentajes de mejora y despliegues en producción es metodológicamente correcta y diferencia positivamente este trabajo.
- **Tabla 2.1 (Síntesis conceptual del marco teórico):** Excelente recurso editorial que conecta teoría con aplicación.
- **Tabla 5.2 (Indicadores propuestos para validación):** La honestidad de clasificar los indicadores como "pendiente por medir" es académicamente valiosa.
- **Sección 3.12 (Justificación de la solución a medida):** Bien argumentada y con criterios verificables.
- **Estructura de la sección 1.3 (Cuatro fases críticas):** El formato causa/evidencia/respuesta del aplicativo es pedagógicamente efectivo y conecta directamente el problema con la solución.
- **Referencia a documentos reales de CERMONT** : La base documental interna de la empresa da solidez empírica al diagnóstico.

***

*Este informe de auditoría fue elaborado con base en la lectura integral del documento main.pdf suministrado por el autor. Las correcciones propuestas tienen como objetivo fortalecer la calidad académica del trabajo sin modificar el contenido investigativo ni las decisiones técnicas del proyecto.*

---

## References

1. [main.pdf](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/88f6aba5-75f9-4131-a627-073c74e2053c/main.pdf?AWSAccessKeyId=ASIA2F3EMEYET2CM732P&Signature=aHT8E1WJtRV95kA%2BWAOq5gO9ZJM%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEBEaCXVzLWVhc3QtMSJGMEQCIEVZn1kiNoMXFNyYXkxoLY8dp8gUBdgUZn6N%2Bj5%2FCe9xAiBg0FOMv60rpFx2ltWwaj6Pwun5iXXMoQAHdt679eR0tyr8BAja%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDY5OTc1MzMwOTcwNSIMrf0oZvFwWVNz7AaZKtAEIbNMQBEvgUll8HG2W0Y5xEleP%2BW7iSDG0YJt72bovPp4HeNLm0p%2BwnZVWxz8Fwzk97KXlocb8bodjk8B7bNthyS0KzTvsjDqYwkBTugQuG9NtKvHamEZyBgqXghHcstdoUOHlEjqD7C%2F%2BT8YKE%2FHcan%2FX9MOUENxr%2FbO0v1kGqnbIcqRq3BTPkfh%2FG8O597R92T%2FqAbydq7W8a%2FCoRVANKNBOJ0%2BQgawKKq8wXtis0%2FD%2F9lXH9%2BWOFZasQitYpjSD6TKMTcOTqKfhMCdYqFxVIF61Nx%2Bdt5WLhzdutlISdNVRGqMKFfoKta9e3ThPsyEt7xhlkNh2fp6u%2BnqPDKHcB9bVa4g0g2Y5JtT5nbm0FHcxVyZM8AKBJCf5HoYtVlZ5GP114JCISN1tz7nn0G3g59ihDKRVN7m%2FWpCXy0281J3SRIDR9l5%2B%2BxKk%2Fri8L6n1BeoBFHrBtba%2FIDwUewSnQ4j%2Bi%2FFt6WApRvLSguiMGtr2Ory4vquY54Nw401OxfkBdhmyIEkUFy7XzOgA2D4r0GZbhBiYOuLuv%2FB6l27JvRVNRLLeqz3sjbvA5qKbpVEQndeSD1YwRldRs0gYO2a1LKQxcgzDhGWTSrSPw19rLNdWuN19zt1AvoJ8xJXNrcb5XRvlMJLEnyfVKqFMEKu9D7Py73s1WRMbf4BhXb2NtaR77tuewcR5sRT9Qm%2Fw69nAnrjTYixzy775fE25vxA3Ge%2FmN7zK3UlRJJSORyp%2Foq6HYncM1NeobQzH6xHPm1XxycNCLE78Wvoct4RntxAzTCYr7LQBjqZAezye7GV260pKm5OFOTSO%2FOUPnpKZR%2BsDObmRuhefefEADabr9pHEkwEAknYMjzwNh%2FqXD2QYkt53fjS1PV%2FGWqlrPl4wIbBprw0BSCrUW79gEBDIOnOsdQdnw05pVxasIYkl%2FlsfAdAzQawlnUtXA2zzBaX5bYM01W%2F4a6%2F51eIEmFfHmeu6wW%2FRBVTZnyPnNPDHtdBWNpWMQ%3D%3D&Expires=1779213675) - **page-1**
**DESARROLLO DE UN APLICATIVO WEB PARA LA GESTIÓN DE**
**ÓRDENES DE TRABAJO, TRAZABILIDAD...

