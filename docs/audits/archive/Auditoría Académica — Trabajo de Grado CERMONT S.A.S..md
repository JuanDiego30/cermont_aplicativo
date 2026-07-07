# Auditoría Académica — Trabajo de Grado
## "Desarrollo de un aplicativo web para la gestión de órdenes de trabajo, trazabilidad y cierre administrativo de procesos operativos en CERMONT S.A.S."

**Autor:** Juan Diego Arévalo Pidiache  
**Programa:** Ingeniería Electrónica — Universidad de Pamplona  
**Modalidad:** Práctica Empresarial  
**Rol del revisor:** Jurado académico y corrector experto de trabajos de grado en ingeniería

***

> **Criterio general de revisión:** Este informe no emite juicios globales vagos. Cada hallazgo sigue la estructura: Sección → Problema detectado → Por qué es un problema → Corrección sugerida → Texto sugerido (si aplica). Al final se clasifican los cambios por urgencia.

***

## 1. COHERENCIA GENERAL DEL DOCUMENTO

### 1.1 Alineación título – problema – objetivos – resultados

**Evaluación general:** La coherencia vertical del documento es **buena en lo estructural y débil en lo evidencial**. El título, el problema, los objetivos específicos y los módulos implementados están razonablemente alineados. El hilo conductor "fragmentación documental → flujo de 14 pasos → módulos del aplicativo → pruebas" es visible y sostenido.

**Fortaleza notable:** La Tabla 6.1 (Matriz de estado de implementación) y la Sección 1.7.3 (Delimitación Académica) son ejemplos de responsabilidad metodológica que muchos trabajos de grado no tienen. El autor distingue explícitamente entre "implementado", "propuesto" y "fuera de alcance". Eso reduce el riesgo de que el jurado cuestione afirmaciones falsas.

**Problema detectado: Desajuste entre estructura descrita en §1.9 y estructura real del documento**

- **Por qué es un problema:** La sección 1.9 describe los capítulos así: el Capítulo 7 se llama "Validación Técnica y Pruebas Funcionales" y el Capítulo 8 "Discusión y Análisis Crítico". Sin embargo, en el documento real el Capítulo 7 son "Resultados Técnicos y Evidencias" y el Capítulo 8 es "Validación y Pruebas del Sistema". Este cruce de numeración genera inconsistencia en el índice general y en las referencias cruzadas del texto.

- **Corrección sugerida:** Revisar la sección 1.9 y hacerla coincidir exactamente con los títulos del índice. No modificar los capítulos; solo corregir la descripción en 1.9.

- **Texto sugerido:**
  > *Capítulo 7 – Resultados Técnicos y Evidencias del Desarrollo: presenta los resultados obtenidos por módulo, la matriz de trazabilidad entre objetivos y resultados, y los indicadores pendientes de medición operativa.*
  >
  > *Capítulo 8 – Validación y Pruebas del Sistema: describe la arquitectura del entorno de pruebas automatizadas, las suites ejecutadas, la validación cualitativa por rol y la revisión de seguridad basada en OWASP.*

***

### 1.2 Contradicciones entre capítulos

**Problema detectado: "Capítulo 7 – Validación" / "Capítulo 8 – Validación" — doble capítulo de validación con roles confusos**

- **Por qué es un problema:** El Capítulo 7 tiene resultados por módulo con pruebas asociadas; el Capítulo 8 vuelve a presentar pruebas con suites y matrices. Un jurado preguntará: "¿por qué hay dos capítulos de validación? ¿cuál es el definitivo?". La separación entre "resultados técnicos" y "validación y pruebas" no está suficientemente justificada en la narrativa.

- **Corrección sugerida:** Agregar en la introducción del Capítulo 8 (§8.1) una frase que explique la diferencia de alcance: el Capítulo 7 presenta qué se construyó y cuáles son sus resultados funcionales; el Capítulo 8 explica cómo se verificó técnicamente mediante pruebas automatizadas estructuradas.

- **Texto sugerido para §8.1:**
  > *Mientras el Capítulo 7 organizó los resultados obtenidos por módulo a partir de los objetivos del proyecto, este capítulo describe el proceso sistemático de verificación técnica mediante pruebas automatizadas, detalla las suites ejecutadas, reporta los resultados por nivel de prueba y plantea la validación cualitativa pendiente con usuarios reales.*

***

## 2. PLANTEAMIENTO DEL PROBLEMA (Capítulo 1)

### 2.1 Pregunta de investigación

**Sección:** 1.4

**Problema detectado:** La pregunta de investigación es técnicamente válida pero anticipa la solución en lugar de formular el problema.

> *Pregunta actual: "¿Cómo diseñar e implementar un aplicativo web modular dotado de una arquitectura desacoplada, validación dual estricta de esquemas, sincronización offline de datos y control de acceso basado en roles…?"*

- **Por qué es un problema:** Una pregunta de investigación bien formulada identifica el fenómeno problemático y la brecha de conocimiento. Al mencionar "arquitectura desacoplada", "validación dual" y "sincronización offline" dentro de la pregunta, se está describiendo la solución antes de justificarla. Un jurado riguroso objetará que la pregunta ya contiene la respuesta.

- **Corrección sugerida:** Reformular la pregunta para que exprese la necesidad del proyecto sin prescribir la solución tecnológica.

- **Texto sugerido:**
  > *¿Cómo puede diseñarse e implementarse un aplicativo web modular que centralice la gestión de órdenes de trabajo, evidencias, informes y cierre administrativo en CERMONT S.A.S., reduciendo la fragmentación documental presente en su flujo operativo de catorce pasos?*

***

### 2.2 Evidencia del diagnóstico

**Sección:** 1.2 y 1.3

**Problema detectado:** Las Tablas 1.1, 1.2, 1.3 y 1.4 fragmentan el flujo de 14 pasos en cuatro tablas de 2–3 filas, cada una ocupando una página separada.

- **Por qué es un problema:** Es un problema de formato, no de contenido. Estas cuatro tablas idénticas en estructura y separadas visualmente interrumpen la lectura, generan páginas casi vacías y dan la impresión de relleno de páginas. El jurado notará que una sola tabla de 14 filas habría bastado.

- **Corrección sugerida:** Unificar las cuatro tablas en una sola tabla con `longtable` o `adjustbox`, con `\footnotesize` para que quepan en dos páginas como máximo.

***

### 2.3 Justificación Técnica (§1.5.1)

**Problema detectado:** La justificación técnica mezcla el qué del problema con el cómo de la solución. En el mismo párrafo donde se enuncia la necesidad, ya se menciona `Express 5.2.1`, `Mongoose 9.5.0`, `Next.js 16.2.4`, `Serwist 9.x` y `Zod 4.x`.

- **Por qué es un problema:** Las versiones exactas de librerías no pertenecen a la justificación del problema. Pertenecen a los anexos técnicos o a la sección de desarrollo. Su presencia en la justificación convierte una argumentación académica en una ficha técnica de producto. Además, si en el repositorio real hay versiones diferentes, el documento queda desactualizado.

- **Corrección sugerida:** En §1.5.1, eliminar todas las versiones exactas (`5.2.1`, `9.5.0`, `16.2.4`, `9.x`, `4.x`) y mantener solo los nombres generales. Mover las versiones exactas al Anexo D o al Anexo F.

- **Texto sugerido para §1.5.1 (fragmento):**
  > *Desde la perspectiva de la ingeniería de software aplicada, el proyecto propone resolver desafíos complejos mediante la integración de un stack tecnológico moderno y desacoplado. El backend se sustenta sobre Node.js y Express, aprovechando un modelo de módulos para construir controladores independientes de alto rendimiento, en conjunto con MongoDB y Mongoose para la persistencia de datos orientada a documentos. En el frontend, React y Next.js con App Router permiten separar limpiamente las vistas de la lógica de red.*

***

## 3. OBJETIVOS (Sección 1.6)

### 3.1 Objetivo General

**Sección:** 1.6.1

**Evaluación:** El objetivo general es **claro, coherente y alcanzable** dentro del alcance del proyecto. No promete resultados operativos no medidos (no dice "reducirá tiempos" ni "aumentará eficiencia"). El verbo rector es "Diseñar e implementar", que es medible. **No requiere corrección de fondo.**

**Observación menor:** La expresión "optimizando las fases operativas críticas" puede ser cuestionada por un jurado: ¿cómo se mide "optimizar" si no hay indicadores antes/después? Considerar cambiar a "apoyando la mejora de las fases operativas críticas" o "soportando técnicamente las fases operativas críticas".

***

### 3.2 Objetivo Específico 3

**Sección:** 1.6.2, objetivo 3

**Problema detectado:** El tercer objetivo menciona explícitamente "enfoque de confianza cero (Zero Trust) con Zod" como parte de los términos del objetivo.

- **Por qué es un problema:** Un objetivo específico de trabajo de grado debe enunciar qué se logrará (capacidad funcional), no con qué herramienta tecnológica puntual. Si el estudiante cambia de librería de validación durante el desarrollo (por ejemplo, de Zod a Valibot), el objetivo quedaría incumplido formalmente aunque la funcionalidad de validación esté implementada.

- **Corrección sugerida:**
  > *Implementar los módulos centrales del aplicativo web integrando autenticación de usuarios con control de acceso basado en roles (RBAC), registro de planeación mediante kits típicos, checklists interactivos con captura de evidencias fotográficas en campo con capacidad offline, y exportación automática a formato PDF de informes técnicos preliminares, bajo un esquema de validación declarativa de datos en frontend y backend.*

***

### 3.3 Objetivo Específico 4

**Sección:** 1.6.2, objetivo 4

**Problema detectado:** El objetivo menciona "auditorías de seguridad basadas en lineamientos OWASP Top 10". En §7.10 y §8, lo que se presenta es una **revisión de seguridad cualitativa por capas**, no una auditoría formal OWASP. El término "auditoría" implica un proceso con herramientas específicas (OWASP ZAP, Burp Suite), reporte de hallazgos documentados y remediaciones verificadas. Lo que el documento demuestra es una revisión arquitectónica de amenazas.

- **Por qué es un problema:** El jurado puede preguntar: "¿Dónde está el reporte de auditoría OWASP? ¿Usó OWASP ZAP o Burp Suite? ¿Cuántas vulnerabilidades encontró?". Si la respuesta es "no usé esas herramientas", el objetivo queda parcialmente incumplido.

- **Corrección sugerida:** Cambiar "auditorías de seguridad" por "revisión de seguridad".

- **Texto sugerido:**
  > *Validar el funcionamiento del aplicativo desarrollado mediante pruebas funcionales por escenarios de uso real y una revisión de seguridad estructurada con base en los lineamientos del OWASP Top 10, documentando su desempeño técnico e idoneidad operativa antes de su eventual despliegue.*

***

## 4. METODOLOGÍA (Capítulo 5)

### 4.1 Evaluación general

La metodología es **una de las secciones más sólidas del documento**. La adopción de Design Science Research (DSR) está bien justificada, el flujo Contract-First está detallado paso a paso (§5.7), las compuertas de calidad están documentadas (Tabla 5.3), y los instrumentos de recolección son reales y verificables (§5.9). El procedimiento de validación en cascada (§5.12) es académicamente riguroso.

**Fortaleza mayor:** La Tabla 5.2 (Indicadores propuestos para validación con datos reales) honestamente marca todos los indicadores como "Pendiente por medir". Esto es metodológicamente correcto y protege el trabajo de cuestionamientos sobre datos inventados.

***

### 4.2 Problema: "Contract-First" como metodología o como práctica de desarrollo

**Sección:** 5.7

**Problema detectado:** La sección 5.7 describe en detalle los once pasos del flujo de desarrollo Contract-First. Esta descripción es técnicamente precisa, pero ocupa un lugar metodológico incorrecto: no es una fase de la metodología de investigación (DSR), sino una práctica de ingeniería de software dentro del ciclo de desarrollo.

- **Por qué es un problema:** Un jurado de metodología podría preguntar: "¿Cómo se relaciona este flujo de once pasos con las fases de DSR?". La conexión no se explicita. Parece un procedimiento técnico insertado dentro de un capítulo de metodología investigativa.

- **Corrección sugerida:** Agregar al inicio de §5.7 una frase que ancle el flujo Contract-First dentro de la fase de *Desarrollo* del DSR, especificando que este procedimiento operacionaliza la fase de diseño y construcción del artefacto.

- **Texto sugerido (frase de anclaje):**
  > *Dentro de la fase de *Construcción del Artefacto* del marco DSR, el desarrollo de cada módulo siguió un flujo de trabajo estandarizado de once pasos denominado Contract-First, diseñado para garantizar la trazabilidad entre el contrato de datos, la lógica de negocio, la API y la interfaz de usuario.*

***

### 4.3 Problema: Tabla 5.5 (Cronograma) sin fechas exactas

**Sección:** 5.14

**Problema detectado:** La Tabla 5.5 presenta solo rangos de semanas ("Semanas 2 a 6", "Semanas 6 a 20") sin fechas de inicio y fin del proyecto, sin hito de inicio y sin fecha de cierre.

- **Por qué es un problema:** El jurado puede preguntar: "¿Cuándo empezó la práctica? ¿En qué fecha se completó el desarrollo? ¿Cuántas semanas duró realmente el proyecto?". El propio documento admite: *"Las fechas exactas... deben verificarse con el cronograma aprobado en el anteproyecto"*. Esto transfiere la responsabilidad al lector, cuando debería estar resuelta en el texto.

- **Corrección sugerida:** Completar la Tabla 5.5 con las fechas reales de inicio y fin de cada fase, o en su defecto agregar una nota al pie con la fecha de inicio de la práctica empresarial y la fecha de entrega estimada.

***

## 5. MARCO TEÓRICO (Capítulo 2) y ESTADO DEL ARTE (Capítulo 3)

### 5.1 Sección ADR en el Marco Teórico

**Sección:** 2.8 (ADR-001 a ADR-005)

**Problema detectado (CRÍTICO):** Los Registros de Decisión Arquitectónica (ADR) están ubicados como sección principal del Marco Teórico (§2.8), al mismo nivel que los fundamentos conceptuales de FSM, PWA, seguridad y arquitectura web.

- **Por qué es un problema:** El marco teórico debe contener **conceptos disciplinarios preexistentes** que fundamentan el proyecto (teorías, modelos, normas, paradigmas). Los ADR son **decisiones propias del autor** tomadas durante el diseño del artefacto. Incluirlos en el marco teórico mezcla la fundamentación con el desarrollo, creando una confusión estructural que el jurado señalará de inmediato. Además, los ADR contienen versiones exactas de librerías (`Express 5.2.1`, `Next.js 16`) que no tienen lugar en el marco teórico.

- **Corrección sugerida:** Mover §2.8 (ADR-001 a ADR-005) al Capítulo 6 como una subsección titulada "Justificación de las decisiones arquitectónicas del sistema". En el Marco Teórico, reemplazar §2.8 con un párrafo de transición que introduzca los criterios de selección tecnológica como categoría teórica.

- **Texto sugerido para reemplazar §2.8 en el Marco Teórico:**
  > *La selección de componentes tecnológicos en proyectos de desarrollo de software aplicado responde a criterios de idoneidad contextual documentados en la literatura de arquitectura de software como Attribute-Driven Design (ADD) y Architecture Decision Records (ADR). Estos marcos proponen que cada decisión tecnológica sea justificada explícitamente mediante la descripción del contexto, las alternativas evaluadas, los criterios de selección y las consecuencias conocidas de la decisión adoptada [ref]. La aplicación de este enfoque en el presente proyecto se detalla en el Capítulo 6, sección 6.X, donde se documenta la justificación del stack tecnológico seleccionado.*

***

### 5.2 Marco Teórico — Secciones 2.9 a 2.12

**Sección:** 2.9 (Teoría de costos), 2.10 (Modelo de madurez FSM), 2.11 (Patrones de diseño), 2.12 (Principios SOLID)

**Problema detectado:** Estas cuatro secciones no tienen un cierre que explique su aplicación al proyecto CERMONT. El documento pasa de describir el concepto a la siguiente sección sin una conexión explícita.

- **Por qué es un problema:** En un trabajo de grado aplicado, cada concepto del marco teórico debe demostrar para qué sirve en el proyecto. Un jurado puede preguntar: "¿Cómo aplicó los principios SOLID en su código? ¿Puede mostrar un ejemplo concreto?". Si no hay conexión explícita en el texto, la respuesta será difícil de articular.

- **Corrección sugerida:** Agregar al final de §2.9, §2.10, §2.11 y §2.12 un párrafo de una a tres oraciones titulado **"Aplicación al proyecto CERMONT"**.

- **Texto sugerido para §2.12:**
  > *Aplicación al proyecto CERMONT: El Principio de Responsabilidad Única (SRP) se aplicó separando la lógica de negocio en servicios de dominio independientes del controlador HTTP. El Principio Abierto/Cerrado (OCP) orientó el diseño del motor de formularios dinámicos, permitiendo agregar nuevos tipos de campo sin modificar el motor existente. La inversión de dependencias se implementa en la capa de pruebas, donde los servicios se testean de forma aislada mediante inyección de dependencias simuladas.*

***

### 5.3 Estado del Arte — Antecedentes colombianos (§3.10)

**Sección:** 3.10

**Problema detectado:** La Tabla 3.6 ("Antecedentes académicos colombianos relacionados con la problemática") lista trabajos de grado colombianos, pero el documento no proporciona referencias bibliográficas numeradas para estos trabajos. Si los trabajos existen, deben estar en la bibliografía con autor, universidad, año y repositorio. Si no existen o no fueron consultados directamente, no deben listarse.

- **Por qué es un problema:** Un jurado puede pedir el acceso a cualquiera de estos trabajos. Si no tienen referencia verificable, la tabla es indefendible.

- **Corrección sugerida:** Para cada entrada de la Tabla 3.6, incluir la referencia bibliográfica correspondiente (número de cita IEEE). Si algún trabajo no fue consultado directamente, eliminarlo de la tabla o marcarlo como "identificado en repositorio pero no consultado en su versión completa".

***

## 6. DESARROLLO TÉCNICO (Capítulo 6)

### 6.1 Títulos de secciones con tecnicismos sin explicación

**Secciones:** 6.4, 6.7

**Problema detectado:**
- §6.4 se titula: *"El contrato compartido: validación bajo enfoque de confianza cero (Zero Trust) con Zod"*
- §6.7 se titula: *"Pipeline de Sincronización Offline mediante Serwist 9.x"*

- **Por qué es un problema:** Estos títulos pueden resultar incomprensibles para un jurado que no sea especialista en desarrollo web moderno. Además, mezclan el qué (contrato compartido, sincronización offline) con el cómo (Zod, Serwist), violando una convención académica básica: los títulos nombran la función, no la herramienta.

- **Corrección sugerida:**
  - §6.4: *"Validación declarativa de datos: contrato compartido entre frontend y backend"*
  - §6.7: *"Mecanismo de operación offline y sincronización en segundo plano"*

***

### 6.2 Figuras como tablas de texto ASCII

**Secciones:** Figuras 1.1, 1.2, 1.3, 6.1, 6.2

**Problema detectado:** Los diagramas BPMN (Figura 1.1), el flujo de 14 pasos (Figura 1.2), el diagrama de fallas (Figura 1.3) y los flujos del Capítulo 6 están implementados como tablas de texto o filas de texto separadas por pipes (`|`). No son figuras vectoriales reales.

- **Por qué es un problema:** Esto genera tres riesgos:
  1. Visualmente, una tabla de texto no tiene la credibilidad académica de un diagrama BPMN generado con TikZ, Draw.io o Lucidchart.
  2. LaTeX puede procesar estas "figuras" como tablas flotantes, causando problemas de posicionamiento.
  3. El pie de figura dice "Modelado del flujo operativo actual (BPMN)" pero lo que se muestra no es BPMN; es texto en tabla. El jurado puede observar esto.

- **Corrección sugerida:**
  - Para Figura 1.1 (flujo BPMN): Generar el diagrama con TikZ usando nodos conectados, o exportar desde Draw.io como PDF e incluirlo con `\includegraphics`.
  - Para Figuras 1.2 y 6.2 (flujos lineales): Una tabla LaTeX bien formateada con `\toprule`, `\midrule`, `\bottomrule` es preferible a una tabla de pipes. Para diagramas reales, usar `\tikzstyle` o importar imagen.
  - Si no es posible regenerar las figuras antes de la sustentación: Cambiar el caption de Figura 1.1 de "Modelado del flujo operativo actual (BPMN)" a "Representación del flujo operativo actual. Fuente: elaboración propia."

***

### 6.3 Matriz de estado de implementación — Validación cualitativa sin acta

**Sección:** Tabla 6.1 y Tabla 8.2

**Problema detectado:** La Tabla 8.2 (Matriz de aceptación cualitativa por perfil de usuario) muestra "Aprobado" para todos los roles. Sin embargo, el propio documento aclara: *"Cuando existan actas o formatos firmados por usuarios, deberán anexarse como evidencia de aceptación"*. No hay actas en los anexos.

- **Por qué es un problema:** El jurado preguntará: "¿Qué usuarios reales de CERMONT probaron el sistema? ¿Hay evidencia de esa prueba?". Si la respuesta es "los resultados son proyectados, no medidos con usuarios reales", entonces la columna "Resultado: Aprobado" no puede mantenerse sin calificación.

- **Corrección sugerida:** Cambiar la columna "Resultado" en Tabla 8.2 de "Aprobado" a "Aprobado (simulación de escenario)" o "Verificado en ambiente de desarrollo" para todos los roles, y agregar una nota al pie: *"La validación con usuarios reales de CERMONT S.A.S. está prevista para la fase de despliegue y queda como trabajo futuro, conforme a lo indicado en §1.7.3"*.

***

### 6.4 Sección 6.12 — "Experiencia de desarrollo y curva de aprendizaje"

**Sección:** 6.12

**Problema detectado:** Esta sección incluye reflexiones personales del autor sobre las dificultades técnicas encontradas durante el desarrollo (curva de aprendizaje de frameworks, desafíos con PWA, etc.).

- **Por qué es un problema:** Las reflexiones personales sobre la experiencia de desarrollo no son parte del capítulo técnico. Pertenecen a la sección de discusión (Capítulo 9) o a las lecciones aprendidas (§9.16). En el capítulo de desarrollo técnico, el lector espera decisiones de diseño, no narrativas de experiencia personal.

- **Corrección sugerida:** Mover el contenido de §6.12 a §9.16 ("Lecciones aprendidas del proceso de desarrollo"), que es el lugar académicamente correcto para reflexiones sobre el proceso de construcción.

***

## 7. RESULTADOS Y VALIDACIÓN (Capítulos 7 y 8)

### 7.1 Capítulo 7 — Resultados sin capturas del sistema

**Sección:** §7.6 (Evidencias recomendadas)

**Problema detectado (CRÍTICO):** El Capítulo 7 reporta resultados por módulo sin incluir ni una sola captura de pantalla del sistema funcionando. La sección §7.6 admite explícitamente que se recomienda incorporar capturas, pero el capítulo no las incluye.

- **Por qué es un problema:** Para un trabajo de grado que desarrolla un aplicativo web, la ausencia de capturas de pantalla es una de las debilidades más señaladas por jurados. Un jurado puede preguntar: "¿Puedo ver el sistema funcionando?". Si no hay capturas en el documento, el sistema parece existir solo en el código, no como aplicativo utilizable.

- **Corrección sugerida:** Incorporar al menos una captura por módulo principal (mínimo 7 capturas para los 7 módulos de §7.8), con una breve descripción de qué muestra cada captura. Si el diseño visual no está terminado, incluir capturas del backend (respuestas de API en Postman o Insomnia) como evidencia funcional alternativa.

***

### 7.2 Capítulo 8 — Suites de pruebas sin número de casos

**Sección:** §8.3 (suites 8.3.1 a 8.3.7)

**Problema detectado:** Cada suite de pruebas describe su alcance y resultado ("Aprobado") pero no indica cuántos casos de prueba contiene. No hay un número total de pruebas ejecutadas en el documento principal.

- **Por qué es un problema:** El jurado preguntará: "¿Cuántas pruebas tiene en total? ¿Cuántas por módulo?". La Tabla G.1 (Anexo G) puede tener esta información, pero no está referenciada desde §8.3 y el PDF del anexo no fue accesible en la revisión.

- **Corrección sugerida:** En §8.4 (Matriz consolidada de pruebas), agregar una columna "Nº de casos" con el conteo real por nivel de prueba. Si el total está en el Anexo G, agregar una referencia explícita desde §8.3: *"El desglose numérico de casos por suite se presenta en la Tabla G.1 del Anexo G."*

***

### 7.3 Validación OWASP — Afirmaciones sin herramienta documentada

**Sección:** §7.10 y §10.4

**Problema detectado:** §7.10 afirma que se realizó una "revisión de seguridad basada en los lineamientos del OWASP Top 10" y §10.4 dice que el artefacto constituye "evidencia verificable". Sin embargo, no se menciona ninguna herramienta de análisis de seguridad (OWASP ZAP, Semgrep, npm audit, Snyk) ni se incluye un reporte de hallazgos.

- **Por qué es un problema:** La revisión descrita es una **revisión arquitectónica** (analizar si el diseño aborda los riesgos del OWASP Top 10), no una auditoría de seguridad dinámica. Esta distinción es importante académicamente. Afirmar "se realizó revisión OWASP" sin herramienta documentada puede ser cuestionado como revisión informal.

- **Corrección sugerida:** Cambiar la denominación de "revisión de seguridad basada en OWASP Top 10" a "análisis de cobertura arquitectónica de riesgos OWASP Top 10" y explicar que se trata de una revisión por diseño, no de un pentesting dinámico. Agregar una nota indicando que el análisis dinámico con herramientas especializadas queda como trabajo futuro recomendado en §10.3.

***

## 8. REDACCIÓN ACADÉMICA

### 8.1 Palabras de alto riesgo ante jurado

Los siguientes términos aparecen repetidamente y pueden generar preguntas difíciles si no tienen evidencia de respaldo:

| Término problemático | Frecuencia | Riesgo | Corrección sugerida |
|---|---|---|---|
| "certifica su estabilidad" (§10.4) | 1 vez | Alto | "los resultados de prueba documentados respaldan su estabilidad en el entorno de desarrollo" |
| "robusto" | Múltiple | Medio | Sustituir por el atributo específico: "con validación dual", "con control de errores centralizado" |
| "riguroso/rigurosamente" | Múltiple | Medio | Sustituir por la evidencia específica que justifica el calificativo |
| "altamente desacoplado" (§1.5.1) | 1 vez | Medio | "con separación de responsabilidades entre presentación, lógica y persistencia" |
| "garantiza" (§1.5.2 y otros) | Múltiple | Alto | Cambiar a "favorece", "soporta", "habilita" |
| "trazabilidad total" (Tabla 1.5) | 1 vez | Medio | "trazabilidad de cada orden desde su creación hasta el cierre" |

***

### 8.2 Secciones con tono autocomplaciente

**Secciones:** §10.4 (Cierre del trabajo), §10.5 (Síntesis de contribuciones), §10.6 (Reflexión sobre la formación), "Contribuciones Académicas del Autor"

**Problema detectado:** §10.4 contiene frases como: *"El proyecto cumplió su propósito académico"*, *"constituye evidencia verificable de las competencias adquiridas"*. La sección "Contribuciones Académicas del Autor" (pág. 132) hace una autoevaluación extensa del trabajo.

- **Por qué es un problema:** En un trabajo de grado, quien evalúa si se cumplió el propósito y si hay evidencia de competencias es el jurado, no el autor. Estas afirmaciones suenan a autocalificación.

- **Corrección sugerida:**
  - En §10.4, cambiar el tiempo verbal de afirmativo a propositivo: *"El proyecto abordó un problema real con una solución tecnológica coherente, documentada y lista para evaluación."*
  - En §10.5 y "Contribuciones Académicas del Autor", mantener el tono descriptivo (qué se hizo) sin el tono valorativo (qué tan bien se hizo).

***

### 8.3 Párrafos excesivamente largos

**Sección:** §1.5.1, §6.3, §6.8

**Problema detectado:** Varios párrafos en el Capítulo 1 y el Capítulo 6 superan las 8-10 oraciones sin pausa, combinando contexto, justificación y detalle técnico en el mismo bloque de texto.

- **Corrección sugerida:** Dividir párrafos de más de 6 oraciones en dos párrafos diferenciados por tema. Una regla práctica: si un párrafo toca más de una idea principal, debe dividirse.

***

## 9. ORTOGRAFÍA, GRAMÁTICA Y FORMATO

### 9.1 Inconsistencia en mayúsculas en títulos de secciones y anexos

**Problema detectado:** El Anexo D se titula "Esquema de la ARQUITECTURA Tecnológica" con "ARQUITECTURA" en mayúsculas, mientras que los demás anexos usan mayúsculas solo en la primera letra. La sección §6.4 mezcla mayúsculas: "Zero Trust" se escribe a veces con mayúscula y a veces sin ella.

- **Corrección sugerida:** 
  - Renombrar Anexo D: "Arquitectura tecnológica del sistema"
  - Unificar "Zero Trust" / "confianza cero" con una convención: usar siempre la forma en español ("confianza cero") en el cuerpo y reservar el término en inglés para la primera mención con nota explicativa o entre paréntesis.

***

### 9.2 Numeración inconsistente de capítulos en el índice

**Problema detectado:** El índice general muestra los primeros capítulos con numeración romana en las páginas del índice ("v", "VI", "VII") pero luego pasa a numeración romana-lowercase para la primera parte y arábiga para el resto, lo que puede indicar un problema de configuración de `\frontmatter`, `\mainmatter` y `\backmatter` en LaTeX.

- **Corrección sugerida:** Revisar la configuración de numeración de páginas en el preámbulo LaTeX. El `\frontmatter` debe aplicarse antes del resumen y el `\mainmatter` debe iniciarse antes del Capítulo 1.

***

### 9.3 Siglas sin definición en primera aparición

**Problema detectado:** Las siglas PWA, BPMN, FSM, CMMS, RBAC, JWT, SES, HES aparecen en el resumen y el primer capítulo sin definición explícita en todos los casos. Algunas se definen bien (RBAC en §1.7.1), pero otras aparecen sin paréntesis explicativo (HES en §1.1).

- **Corrección sugerida:** En la primera aparición de cada sigla no trivial, agregar la definición entre paréntesis. Verificar especialmente: HES, SES, ATS, CCTV, SST.

***

### 9.4 Referencias en el texto sin correspondencia en bibliografía

**Problema detectado:** En §3.10 y §5.9, el documento menciona documentos de CERMONT S.A.S. con citas numéricas, , , ,  que corresponden a documentos internos de la empresa. En la lista de referencias (pág. 139), estas fuentes deben estar claramente identificadas como "Documento interno, CERMONT S.A.S., confidencial, fecha" y no como publicaciones académicas.[^1]

- **Corrección sugerida:** Verificar que en la bibliografía IEEE cada referencia – esté correctamente tipificada como documento interno no publicado, con la nota "(Documento interno, uso con autorización de CERMONT S.A.S.)".[^1]

***

## 10. RIESGOS PARA LA SUSTENTACIÓN

### 10.1 Preguntas difíciles que el jurado probablemente hará

**Sobre el problema y justificación:**
1. *"¿Cómo cuantificó la fragmentación documental? ¿Tiene datos de cuántas órdenes se pierden o se retrasan mensualmente?"*
   - **Preparación recomendada:** Responder con la Sección 1.7.3 y la Tabla 5.2: los indicadores están propuestos pero no medidos porque el sistema aún no está en producción. El diagnóstico se basó en análisis documental de los cinco formatos reales y observación del flujo de 14 pasos.

2. *"¿Por qué no adoptó directamente Jobber, Fracttal u Odoo Field Service, que ya resuelven gestión de órdenes de trabajo?"*
   - **Preparación recomendada:** Tabla 3.7 (criterios de evaluación) y §3.12 (justificación de solución a medida). Enfatizar: flujo de 14 pasos específico de CERMONT, necesidad de operar offline en Arauca, requisito de integrar SES/Ariba como espejo interno, y diversidad de formatos por tipo de servicio que no se adapta a plantillas genéricas.

**Sobre los objetivos:**
3. *"¿Cumplió el objetivo 4? ¿Hay un reporte de auditoría OWASP?"*
   - **Preparación recomendada:** Aclarar que se realizó una revisión de cobertura arquitectónica (no un pentesting). Mostrar §7.10 como evidencia de que cada categoría OWASP fue considerada en el diseño.

4. *"¿Qué métricas demuestran que el sistema cumple con los requisitos no funcionales (rendimiento, disponibilidad, escalabilidad)?"*
   - **Preparación recomendada:** El documento no incluye pruebas de rendimiento (load testing). Esta es una brecha real. Responder: "Las pruebas realizadas son funcionales y de integración. Las pruebas de rendimiento están identificadas como trabajo futuro en §10.3."

**Sobre el desarrollo:**
5. *"¿Puedo ver el sistema funcionando en este momento?"*
   - **Preparación recomendada:** Tener el sistema corriendo en localhost o en un servidor VPS antes de la sustentación. Preparar una demostración de 5-10 minutos que muestre: login, creación de orden, planeación, carga de evidencia, generación de PDF.

6. *"¿Qué diferencia hay entre el Capítulo 7 (Resultados) y el Capítulo 8 (Validación)? ¿No es lo mismo?"*
   - **Preparación recomendada:** Ver corrección en §1.2 de este informe. Responder: el Capítulo 7 presenta qué se construyó; el Capítulo 8 explica cómo se verificó técnicamente.

7. *"¿Por qué los ADR están en el Marco Teórico?"*
   - **Preparación recomendada:** Anticipar esta observación corrigiendo la ubicación antes de la sustentación (ver §5.1 de este informe).

**Sobre la validación:**
8. *"¿Algún usuario real de CERMONT probó el sistema?"*
   - **Preparación recomendada:** Si no hubo pruebas con usuarios reales, responder honestamente: "La validación con usuarios reales está planificada para la fase de adopción. Durante el desarrollo, la validación fue funcional mediante suites de prueba automatizadas y simulación de escenarios por rol."

9. *"La Tabla 8.2 muestra 'Aprobado' para todos los roles. ¿Quién aprobó estas pruebas?"*
   - **Preparación recomendada:** Ver corrección en §7.3 de este informe. Si el sistema fue probado solo por el autor, cambiar "Aprobado" a "Verificado por el autor en ambiente de desarrollo".

**Sobre la redacción:**
10. *"En §10.4 dice que el proyecto 'certifica su estabilidad'. ¿Cómo la certifica?"*
    - **Preparación recomendada:** Ver corrección en §8.1 de este informe. Responder: "Las pruebas automatizadas documentadas en §8.3 respaldan la estabilidad funcional en el entorno de desarrollo. La certificación formal requeriría pruebas en producción, que están identificadas como trabajo futuro."

***

## RESUMEN DE CAMBIOS POR URGENCIA

### 🔴 Cambios URGENTES (bloquean la defensa si no se corrigen)

| # | Sección | Problema | Acción |
|---|---|---|---|
| U1 | §2.8 | ADR en el Marco Teórico | Mover §2.8 al Capítulo 6 como "Justificación de decisiones arquitectónicas" |
| U2 | §1.4 | Pregunta de investigación anticipa la solución | Reformular (ver texto sugerido en §2.1 de este informe) |
| U3 | §8.2 y Tablas 8.1, 8.2 | Resultados "Aprobado" sin actas de usuario | Cambiar a "Verificado en ambiente de desarrollo" con nota explicativa |
| U4 | Cap. 7 | Resultados sin capturas del sistema | Incorporar mínimo 7 capturas (una por módulo) o capturas de API |
| U5 | §1.5.1 | Versiones exactas de librerías en la justificación del problema | Eliminar versiones del cuerpo; mover al Anexo D o F |
| U6 | §1.9 | Numeración de capítulos no coincide con el documento real | Corregir descripciones en §1.9 para que coincidan con los títulos reales |

***

### 🟡 Cambios RECOMENDADOS (debilitan la defensa si no se corrigen)

| # | Sección | Problema | Acción |
|---|---|---|---|
| R1 | §1.6.2, obj. 3 | Objetivo menciona librería específica (Zod) | Reformular (ver texto sugerido en §3.2 de este informe) |
| R2 | §1.6.2, obj. 4 | "Auditoría OWASP" vs. "revisión arquitectónica" | Cambiar a "revisión de seguridad" (ver §3.3) |
| R3 | §2.9–2.12 | Marco teórico sin conexión explícita al proyecto | Agregar párrafo "Aplicación al proyecto CERMONT" al final de cada sección |
| R4 | §3.10, Tabla 3.6 | Antecedentes sin referencias bibliográficas verificables | Agregar citas IEEE a cada trabajo listado o eliminar si no fue consultado |
| R5 | §5.14, Tabla 5.5 | Cronograma sin fechas reales | Completar con fechas de inicio/fin o agregar nota con fecha de inicio de práctica |
| R6 | §6.12 | Reflexiones personales en capítulo técnico | Mover a §9.16 (Lecciones aprendidas) |
| R7 | §8.3 | Suites sin número de casos de prueba | Agregar columna "Nº de casos" en Tabla 8.4 o referenciar Tabla G.1 |
| R8 | Figuras 1.1, 1.3, 6.1 | Diagramas BPMN implementados como texto | Regenerar con TikZ o importar desde Draw.io; corregir captions |

***

### 🟢 Cambios MENORES (mejoran la presentación, no afectan la defensa)

| # | Sección | Problema | Acción |
|---|---|---|---|
| M1 | Anexo D | Título "ARQUITECTURA" en mayúsculas | Renombrar a "Arquitectura tecnológica del sistema" |
| M2 | §6.4, §6.7 | Títulos de secciones con herramientas en lugar de funciones | Renombrar (ver §6.1 de este informe) |
| M3 | §10.4, §10.5 | Tono autocomplaciente | Cambiar a tono descriptivo (ver §8.2 de este informe) |
| M4 | General | Siglas HES, SES, ATS sin definición en primera aparición | Agregar definición entre paréntesis en primera mención |
| M5 | Tabla 1.1–1.4 | Cuatro tablas de 2-3 filas en cuatro páginas | Unificar en una `longtable` con `\footnotesize` |
| M6 | General | Palabras "garantiza", "robusto", "riguroso" sin evidencia | Sustituir por verbos específicos (ver Tabla §8.1 de este informe) |
| M7 | §5.7 | Contract-First sin anclaje al marco DSR | Agregar frase introductoria (ver §4.2 de este informe) |
| M8 | Índice | Numeración de páginas inconsistente | Revisar configuración `\frontmatter`/`\mainmatter` en LaTeX |

***

*Revisión realizada sobre el PDF del documento principal (main.pdf). Los anexos G y C no fueron accesibles en versión completa; sus contenidos se infirieron desde las referencias en el texto principal. Se recomienda que el director revise este informe junto con el autor antes de la entrega final.*

---

## References

1. [main.pdf](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/bef0986a-6bf8-4181-9217-632a772f04e6/main.pdf?AWSAccessKeyId=ASIA2F3EMEYE3U4LVAGV&Signature=6u%2FGaTt%2FNz9Gk8jQiyW8J29GDcM%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEBEaCXVzLWVhc3QtMSJGMEQCIB%2FcgiJ7kU5oqtRwTuBMAWvk4GYQX31%2F%2FlLhWlGM3DCVAiAS7dJxrFOZOiF1yCyx45WOCDDppNuUWTtpj7p8b9SnkSr8BAja%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDY5OTc1MzMwOTcwNSIMeNts%2FF8qQee%2Ba7cIKtAE6BXnTtGMIsaGGoahTZwLch6LtBXRxZgnoTtrSTUs3RECmsQRKwdSiSw35hBoD88neN%2FccrHgg6si4nXZNCUj7PrARH7usFqVFyFuB1Gy%2Bwg%2BvfdNbTuZfss%2BJ5ArSjIX7sdBU0DCr%2BHm6tbyo%2BHyLQ618G9HogbGYL1128kFOfdowtBvBIoASP5AyKFrgrjn3Rvc7B5Q37AfLMsyxY1wxq6iWnJa%2F24G5%2F5QavP3fcRN3g86xY54q33kxtFNnHs82lZxqjDnD4hMp7wJxPSpZ%2FsHDetbJYqk15IHsgZ4JAD%2Fr1so5OvXF5JH9QC3eoy65ITvKyp%2FdgKe7nhOhf5DtBngXPx4v7lbraV0vzHVeHyUah4WiMyuH6hB3Bq3ninLqUe8NKbaYz8Fb3N%2BZMlE6evblt9MXN1QWRHr0qoyLxlA0zwSPMxLEVVTEukes6mgIfv1hk7L3azrvMI%2FsrYNGOA0MK8LUkaondyB0QHSpGYnxsu3wu376QnfLqG4fO0qIKGAZRGx2G8NnEbQC8bgKcQeyJi80RTWaVM1hn5O4GzCuaXgYIojMQpy4bA3duAoK2l1YQiIB1eM0wCdCxJ3ZHN7Jc3OtmZ9dehpUura8ZCST9pbQALboL8E7tKoaK%2B7EZC547nKuEgoY7jpcdaoq6WImHE7XCIvUY6aaS2NeN2OSmeMTg2wo7WOqXdDP7JGvuSv5vqhHb5W7VhUmAkEc8Bvp54KyJsNW0W4M56LVWUszGQGDJmfQy7obI%2BOdHw7xk1s9Hn1YE%2B9bYHPOQW50jCCr7LQBjqZAaXy4pWG%2F8hTV8hP6OFGdwtasIzp5zjkjJaFd3%2Fzreu6UN%2FwJV3Lle5RBPAg%2FLXFcoYFDscujXR9xmYjc9oyPqe%2BnKEO5KEmc%2FXKTIAHs8CqFXD83Qqx5AcgYINak9t3EIWqM8VWh2NxscEKzqGwDmEa2hT%2FKxxyokaiq5oDNsivzoot04kIq6HurviTmHJu1is5HihOymR5lw%3D%3D&Expires=1779213653) - page-1 DESARROLLO DE UN APLICATIVO WEB PARA LA GESTIN DE RDENES DE TRABAJO, TRAZABILIDAD Y CIERRE AD...

