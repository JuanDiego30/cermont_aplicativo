# Revisión por Capítulos

## Capítulo 1: Introducción general y planteamiento del problema

- **Problema detectado:** El planteamiento del problema describe correctamente la fragmentación documental y operativa en CERMONT S.A.S., pero falta contextualizar con datos o referencias que demuestren su magnitud. La pregunta de investigación (“¿Cómo diseñar e implementar un aplicativo web modular…” ) es amplia y muy alineada al objetivo de software, pero no enfatiza la reducción de la fragmentación como tal. Los objetivos específicos son exhaustivos, pero el **objetivo 3** incluye detalles técnicos muy concretos (“Zero Trust con Zod… tokens JWT… Service Worker”), que no habrían sido demostrados o validados en el documento. Esto puede prometer más de lo que el proyecto muestra.

  - **Por qué es un problema:** Un problema poco cuantificado carece de sustento para argumentar la necesidad del sistema. Objetivos con tecnicismos específicos en el enunciado (como “Zod” o “Zero Trust”) confunden al lector sobre qué se espera demostrar; además, si luego no se comprueban, el jurado puede cuestionar si se cumplió todo lo prometido.

  - **Corrección sugerida:** Agregar referencias o cifras concretas del contexto de CERMONT (por ejemplo, número de órdenes anuales, tiempos de generación de informes actuales, porcentajes de retrasos) para respaldar la relevancia del problema. Reformular la pregunta de investigación incluyendo explícitamente la reducción de la fragmentación (“…reduciendo la fragmentación documental operativa en CERMONT S.A.S.”). Simplificar los objetivos: el **objetivo general** puede ser “Desarrollar un aplicativo web modular…”, y los específicos deben enfocarse en etapas (diagnosticar flujo, diseñar arquitectura, implementar módulos, validar con usuarios). Evitar incluir herramientas o librerías en los enunciados de los objetivos; esas decisiones se justifican en metodología o desarrollo, no en la formulación de objetivos.

  - **Texto sugerido:**  
    - *Objetivo general:* “Diseñar e implementar un aplicativo web modular e interoperable para centralizar la gestión de órdenes de trabajo y evidencias en CERMONT S.A.S., reduciendo la fragmentación de información entre soporte físico y digital”.  
    - *Objetivo específico 3 (reformular):* “Implementar los módulos principales del sistema que incluyan planificación de recursos, registro de evidencias fotográficas y generación automática de informes técnicos, asegurando integridad de datos en todos los procesos”.

- **Problema detectado:** La delimitación y justificación actuales se centran en beneficios genéricos de la digitalización (reducción de errores, tiempos, papel), pero no especifican cómo el aplicativo resolverá los problemas particulares identificados en las 4 fases críticas. Además, en la justificación se mencionan normas de cómputo (IEEE, APA) y conceptos muy generales (“importancia de la trazabilidad”), desviando el foco del proyecto.

  - **Por qué es un problema:** La justificación debe argumentar **por qué este proyecto en particular** es necesario para CERMONT. Incluir aspectos externos (como estándares IEEE o historia de la tecnología) distrae y no aporta evidencia relevante. El jurado esperará entender exactamente qué falta en CERMONT hoy y cómo el sistema propuesto lo soluciona.

  - **Corrección sugerida:** Reescribir la justificación centrando el discurso en CERMONT: resaltar las fallas actuales (sin cuestionarios, con hojas de Excel, etc.), los efectos (retrasos en facturación, pérdida de evidencias) y cómo el aplicativo aborda cada uno (checklists digitales, base de datos centralizada, trazabilidad de estado). Eliminar secciones genéricas o teóricas. Resaltar aportes concretos (por ejemplo, “unificar la traza del proceso desde la solicitud hasta el pago”, “permitir anexar fotos directamente desde la app”, “automatizar actas con datos del sistema”).

  - **Texto sugerido:**  
    - “En CERMONT S.A.S., la planificación de obra y el registro de evidencias se basan en formatos manuales dispersos (Excel y papel), lo cual genera omisiones, duplicación de esfuerzos y demoras en la elaboración de informes y facturas. Esta dispersión documental impide comparar eficientemente los costos reales frente a los presupuestados. Por tanto, es necesario un sistema que integre todos los pasos operativos (solicitud, planeación, ejecución, acta final, factura) en una única plataforma. El aplicativo web propuesto digitaliza los formularios existentes, asegura la trazabilidad fotográfica en tiempo real y automatiza la generación de documentos técnicos, garantizando cierres administrativos más rápidos y transparentes para CERMONT S.A.S.”

## Capítulo 2: Marco teórico

- **Problema detectado:** Existe una sección extensa de “Registros de decisión arquitectónica (ADR)” dentro del cuerpo principal. En general, el marco teórico parece más una colección de definiciones y listados de tecnologías (PWA, CMMS, seguridad, patrones de diseño) sin relacionarlos críticamente con el proyecto. Algunos conceptos se tratan a nivel teórico (ej. “arquitectura modular”, “seguridad robusta”) pero no se analizan sus implicaciones reales para la app de CERMONT.

  - **Por qué es un problema:** El marco teórico debe contextualizar y fundamentar la solución propuesta, no enumerar conceptos aislados. Incluir los ADR en esta sección es poco usual para un trabajo final (son más propios de documentación técnica interna). Además, el discurso actual mezcla definiciones de normas y arquitectura con pasajes de CTA (cita de teoría) sin centrarse en cómo ese conocimiento guía el proyecto. Esto puede confundir o aburrir al lector.

  - **Corrección sugerida:** Mover la sección de ADR al anexo técnico o a una sola tabla resumen en el apéndice. En el cuerpo del marco teórico, reorganizar los contenidos de forma lógica y vinculada al proyecto: por ejemplo, un subcapítulo sobre “Gestión de órdenes de trabajo y FSM”, otro sobre “Sistemas de gestión de mantenimiento (CMMS)” comparando con el caso de CERMONT, uno sobre “Aplicaciones web progresivas y operación offline” centrado en la necesidad de campo, y otro sobre “Seguridad y control de acceso” donde se justifique brevemente el uso de autenticación y roles. Cada párrafo teórico debe concluir con *“Aplicación al proyecto”*, explicando cómo el concepto respalda alguna parte del diseño propuesto.

- **Problema detectado:** Se incluyen conceptos muy técnicos o recientes (PWA, Zod, monorepo) sin explicación suficiente. Por ejemplo, se menciona la validación declarativa con esquemas estructurados y luego en ADR aparece “Zustand” o “Zero Trust”, pero estos términos no se explican a nivel conceptual para un lector académico.

  - **Por qué es un problema:** El jurado puede no estar familiarizado con librerías o prácticas específicas (Zod, Serwist, Turborepo, etc.). Mencionarlas sin aclarar su papel específico en el sistema deja lagunas conceptuales. Además, un marco teórico debe construir un puente entre teoría y proyecto: es necesario explicar *por qué* algunas tecnologías se eligieron, no simplemente nombrarlas.

  - **Corrección sugerida:** Simplificar la sección teórica enfocándose en conceptos, no en marcas. Por ejemplo, en lugar de nombrar “Zustand” o “TanStack Query” en el marco, hablar de “gestión de estado en la interfaz” y “sincronización con el servidor”. Cualquier tecnología específica puede justificarse más adelante en el desarrollo o anexos, pero en el marco debe explicarse el principio: p.ej. “Para mejorar la experiencia en terreno sin conexión, se adoptan aplicaciones web progresivas (PWA) que permiten funcionar offline y sincronizar datos”. Aquí, un lector entendible puede aceptar la idea sin saber qué es Serwist. Citar fuentes académicas o manuales técnicos para PWA, FSM y seguridad complementa este marco.

## Capítulo 3: Estado del Arte e investigación de software

- **Problema detectado:** La revisión de soluciones existentes (CMMS, FSM, CMMS) está poco conectada con la realidad de CERMONT. Se listan sistemas como Fiix, UpKeep, Fracttal, etc., pero no se analiza comparativamente qué ofrecen y qué limitaciones tienen frente a las necesidades de CERMONT. Tampoco se menciona si se evaluó algún software existente como posible alternativa o caso de estudio.

  - **Por qué es un problema:** El estado del arte debe justificar por qué desarrollar una solución a medida en vez de adoptar o adaptar herramientas ya existentes. Si no se argumenta por qué sistemas comerciales/OSS no cubren las necesidades de CERMONT, faltará soporte para el proyecto de desarrollo propio. Además, los párrafos parecen descriptivos (qué hace cada sistema) pero faltan criterios de comparación (precios, adaptabilidad, cobertura de funciones críticas, facilidad de integración).

  - **Corrección sugerida:** Incluir cuadros comparativos cortos donde se destaquen las funcionalidades de estos sistemas (p.ej. manejo de órdenes de trabajo, offline, reportes) vs. las restricciones de CERMONT (formato de formularios, necesidad de módulos específicos, presupuesto). Señalar explícitamente qué carencias encontró (por ejemplo: “estos sistemas no contemplan la flexibilidad de generar formularios personalizados con campos variables según tipo de servicio, lo cual es crucial para CERMONT”). Si hay informes o casos de uso de estas herramientas, citarlos. Enfatizar que la solución de grado adopta funciones inspiradas en estas, pero adaptadas al contexto local.

- **Problema detectado:** El capítulo parece más una enumeración de opciones que un análisis crítico. Algunas secciones no citan fuentes (ni académicas ni institucionales) para las afirmaciones generales sobre estos productos.

  - **Por qué es un problema:** Reproducir información sin citarla va en contra de la rigurosidad académica. El jurado puede objetar la falta de referencias concretas al describir las herramientas existentes.

  - **Corrección sugerida:** Añadir referencias concretas cuando se mencione un sistema (p.ej. estudios de caso en la industria, documentación oficial) para sustentar afirmaciones. Reformular párrafos muy descriptivos en tono analítico (“Aunque Fracttal ofrece gestión de órdenes, no permite definir los formularios propios de CERMONT [Cita], por lo cual…”).

## Capítulo 4: Marco conceptual y normativo

- **Problema detectado:** La sección de normatividad (facturación electrónica, etc.) debe aplicarse estrictamente a lo que afecta al proyecto. Si algunas normas no son relevantes o no se aplican directamente a CERMONT, su inclusión puede parecer relleno.

  - **Por qué es un problema:** Incluir normativa sin conexión directa con la solución (por ejemplo, regulaciones complejas de facturación que CERMONT ya cumple manualmente) desvía la atención. Además, puede confundir sobre el alcance real del proyecto (¿Debe el aplicativo cumplir normas legales? ¿Será legalmente certificado?).

  - **Corrección sugerida:** Mantener solo la normativa exigible a CERMONT que el aplicativo ayuda a cumplir (p.ej. generar automáticamente actas de cierre que incluyan firma digital acorde a SES, o formatos PDF con validación de firma electrónica). El resto puede mencionarse brevemente como contexto. Si hay implicaciones legales (p.ej. retención de documentos por X años), aclarar si el sistema soporta estos requisitos. Cualquier afirmación normativa debe ir acompañada de referencia (ley, decreto, etc.). Textos técnicos excesivos (como explicaciones de impuestos) deben resumirse o trasladarse a anexos de normas de interés.

## Capítulo 5: Metodología

- **Problema detectado:** Se menciona que se usó DSR (Design Science Research) y se listan fases. Sin embargo, falta detallar los **instrumentos de recolección** y cómo se obtuvieron datos empíricos del contexto (¿habló con residentes o usó los formatos reales de CERMONT? ¿Cómo se midió la efectividad?). También no se ha explicitado qué indicadores de validación se aplicaron o cómo se prueba cada módulo.

  - **Por qué es un problema:** Si se adoptó DSR, el jurado esperará ver claramente las fases (diagnóstico, diseño, implementación, evaluación) y qué tareas corresponden a cada fase. Falta mención de entrevistas, encuestas o análisis de documentos en la fase diagnóstica. Sin esto, no queda claro cómo se validaron las decisiones de diseño ni cómo se midió el impacto. Además, faltan criterios para evaluar el éxito (¿qué significa “apoyar el cierre oportuno”?).

  - **Corrección sugerida:** Describir brevemente cada fase con sus actividades e insumos: por ejemplo, "Fase 1: Diagnóstico – reuniones con personal de campo, revisión de formatos existentes y cronogramas para entender el flujo actual. Se usó una matriz de requisitos para vincular fallas con necesidades." Incluir criterios de validación asociados (p.ej. Tiempos de informe actuales vs. meta). En Fase 4 (validación) detallar qué tipo de prueba se hará: “pruebas de escritorio con datos de órdenes reales” o “encuesta de satisfacción a los usuarios pilotos” etc. Si se definió un prototipo funcional, indicar cómo se probó (cantidad de casos de prueba, criterios de aceptación). En la matriz de requisitos, asegúrese de vincular cada objetivo específico con un output verificable.

- **Problema detectado:** Se usa terminología muy técnica (p.ej. “microservicio de autenticación con JWT en cookies HTTPOnly”, “estructura monolítica”) en la metodología, pero no se menciona cómo se tradujo esto a la práctica. En general, la Metodología lee más como diseño arquitectónico que como “metodología de investigación”.

  - **Por qué es un problema:** Es importante diferenciar **qué se hizo** (metodología) de **qué se implementó** (desarrollo). El capítulo de metodología debería enfocarse en el proceso de investigación, no en la arquitectura final detallada. Mezclar ambos confunde la estructura lógica del documento.

  - **Corrección sugerida:** Reubicar detalles arquitectónicos y tecnológicos en el capítulo de Desarrollo (Capítulo 6). En Metodología, limitarse a describir el método (por qué DSR, cómo se planificó el proyecto, qué instrumentos se utilizaron). Por ejemplo, separar la parte de “validación” como fase final con sus actividades (pruebas unitarias, pruebas de usuario, análisis de cobertura). Esto fortalecerá la coherencia: objetivos → método → desarrollo → resultados.

## Capítulo 6: Desarrollo del proyecto (arquitectura y tecnologías)

- **Problema detectado:** Se describen múltiples decisiones técnicas específicas (p. ej. uso de MongoDB con Mongoose, Node.js con Express, Next.js, librerías Zod y Zustand, uso de un monorepo, herramientas de pruebas). Aunque es necesario documentarlas, el texto a veces suena **promocional** o demasiado detallado sin justificar cada elección frente a alternativas. Además, hay listados de características (“La app es PWA”, “uso de TLS1.3”) más que análisis de su impacto.

  - **Por qué es un problema:** El jurado espera entender por qué se eligieron esas tecnologías, no sólo qué se usó. Sin explicar la motivación de cada elección (y sus ventajas/desventajas), el capítulo puede parecer un simple manual o marketing técnico. Además, frases como “Zero Trust con Zod” o “pila robusta con estas versiones” pueden no agregar valor argumentativo en la exposición.

  - **Corrección sugerida:** Incluir breves razones al describir cada módulo: por ejemplo, al elegir MongoDB/Mongoose se podría decir “por su flexibilidad para formularios dinámicos” y comparar con otras opciones (SQL) si se evaluaron. Agrupar la explicación de la arquitectura monorepo (p. ej. “se optó por un monorepo para unificar dependencias y facilitar integración continua”) con alternativas (multi-repositorio) comentadas. Convertir descripciones técnicas en un lenguaje ligeramente más narrativo: en lugar de listar librerías, exponer sus funciones en el sistema. Si no se evaluó nada distinto, al menos alegar cómo la elección satisface requerimientos ( rendimiento, escalabilidad, familiaridad). Todo fundamento importante debe tener respaldo (lógica o referencia).

- **Problema detectado:** Algunos conceptos en este capítulo aparecen como exagerados o no demostrados. Por ejemplo, se afirma la adopción de patrones SOLID y eficiencia de pruebas (“garantiza testabilidad”), pero no se muestran métricas de cobertura o ejemplos de código. Asimismo, se mencionan altos niveles de seguridad (“protección con TLS1.3, JWT en HttpOnly”) sin una evaluación real de vulnerabilidades.

  - **Por qué es un problema:** El jurado puede cuestionar afirmaciones fuertes sin evidencia concreta. Decir que “se garantizó la seguridad según OWASP Top 10” (si eso se dijo) o que “se controla deuda técnica con lint/test/build en CI” necesita sustento con resultados (por ejemplo, “resultados de análisis de SonarQube” o “último reporte de cobertura 72%”). Si no se pueden mostrar, es mejor atenuar esas afirmaciones.

  - **Corrección sugerida:** Señalar claramente qué fue implementado y qué quedó como propuesta. Por ejemplo: “Se implementó autenticación con JWT en cookies seguras, lo que **favorece** la protección contra XSS y CSRF. No se realizaron pruebas formales de penetración, por lo que esto se propone como mejora futura.” Incluir capturas de código o esquemas (ya presentes en anexos) en este capítulo ayudaría a ilustrar la arquitectura. Si hay gráficos de flujo (p.ej. la figura 6.3), verificar que estén completos y describir sus componentes clave en el texto.

- **Problema detectado:** El subcapítulo 6.3 (arquitectura del monorepo) y las figuras de arquitectura parecen ocupar páginas enteras. En particular, **Figura 6.3** y otras diagramas son grandes y detallados, pero en el documento PDF extraído estos ocuparon páginas completas. También, el uso de siglas sin definición previa (“RBAC”) puede dificultar la lectura de un lector nuevo.

  - **Por qué es un problema:** Figuras demasiado grandes o con texto pequeño pueden no ser legibles en la impresión/jurado, y no añaden tanto si no se explican claramente en el texto. Del mismo modo, introducir acrónimos sin expandirlos puede confundir al jurado no técnico.

  - **Corrección sugerida:** Verificar en el LaTeX que las figuras se ajusten al margen (usar escalado, dividir diagramas complejos en partes si es necesario). Asegurarse de incluir un pie de figura explicativo sencillo. Definir todas las siglas al usarlas por primera vez (p.ej. “Role-Based Access Control (RBAC)”). Si una figura requiere un texto largo, intentar simplificar o mover detalles a anexos. Incluir breves referencias cruzadas desde el texto (“ver Figura 6.3”) para contextualizarlas.

## Capítulo 7: Resultados

- **Problema detectado:** Los resultados funcionales se describen en detalle (módulos operativos, flujos, estados de órdenes), pero no se presentan **datos numéricos o comparativos**. No hay mediciones de reducción de tiempos ni ejemplos de órdenes procesadas o indicadores de eficiencia. Solo se mencionan "pruebas exitosas" genéricas y cobertura de tests.

  - **Por qué es un problema:** En un proyecto de ingeniería, se espera evidencia empírica que los cambios propuestos realmente mejoran algo. Si se afirma que “se redujo el tiempo de cierre en un 50%”, debe haber datos. Sin esto, cualquier afirmación de “se facilita el proceso” queda poco apoyada.

  - **Corrección sugerida:** Indicar claramente que la validación funcional se basó en escenarios simulados o reales (p.ej. “Se cargaron N órdenes de prueba basadas en proyectos anteriores de CERMONT; el tiempo para generar informes se redujo de X minutos a Y minutos en promedio.”) Si esos datos no existen, marcar como *“requiere evidencia”*. En la sección de resultados, además de describir el flujo nuevo (ya hecho), incluir al menos un ejemplo ilustrativo (tabla con tiempos antes vs después, o captura de pantalla de un informe generado). Si no hubo datos, decirlo y proponer generarlos para la sustentación.

- **Problema detectado:** Hay menciones de pruebas automatizadas y cobertura (por ejemplo, se muestra output de pruebas). Sin embargo, no está claro cuántas pruebas se hicieron y qué casos incluyen (solo se ve resumen de cobertura). Tampoco se muestra validación de usuario final (p. ej. test de usuario en campo o retroalimentación de un residente de obra).

  - **Por qué es un problema:** El jurado puede preguntar por la exhaustividad de las pruebas: “¿Cómo sabes que todo funciona correctamente?” Si sólo existe cobertura de código, no mide la usabilidad o la idoneidad del sistema en contexto. Además, no hay evidencias de interacción con usuarios reales.

  - **Corrección sugerida:** Documentar el plan de pruebas: número de casos, escenarios cubiertos (incluir al menos uno en texto o anexo, p.ej. un checklist lleno con la app). Si se hicieron pruebas con usuarios o personal técnico de CERMONT, mencionar los resultados (aun anecdóticos). Dejar como requerimiento futuro encuestar usuarios pilotos. Incluir un apartado breve sobre las pruebas automatizadas en el texto principal (dónde se ejecutaron, qué herramientas) y referir a un anexo con detalles.

## Capítulo 8: Análisis de resultados

- **Problema detectado:** El análisis actual repite en gran medida los resultados funcionales en forma narrativa, con énfasis en validaciones técnicas (tipo de datos, tests). Hay poca discusión sobre los resultados alcanzados en términos de objetivos planteados. No se comparan los resultados reales frente a las expectativas iniciales.

  - **Por qué es un problema:** Esta sección debería interpretar los datos y evidencia, no solo re-describir lo hecho. Falta crítica: por ejemplo, si se esperaba un cierto grado de cobertura o reducción de tiempos, evaluar si se cumplió o por qué no. Sin eso, es difícil ver la relación causa-efecto del proyecto.

  - **Corrección sugerida:** Reorganizar el análisis vinculando cada objetivo específico con los resultados obtenidos. Por ejemplo: “Objetivo 1 (diagnóstico) – Se logró identificar X cuellos de botella tal como planificado. Objetivo 2 (diseño) – La arquitectura propuesta permite Y; sin embargo, no se implementó Z por tiempo limitado, lo que se deja como mejora”. Indicar logros y limitaciones. Interpretar los hallazgos: “Se observó que el login via JWT satisfizo la autenticación, pero no se realizaron pruebas de rendimiento en CERMONT debido a falta de datos de carga real.” Dejar marcadores “requiere evidencia” donde falten datos cuantitativos (“no se dispone de datos para medir el impacto en tiempos de informe”).

- **Problema detectado:** En esta sección no se suelen incluir tablas o gráficos, pero hay oportunidad de resumir resultados en tablas comparativas o listados clave. Actualmente es todo texto largo sin apoyos visuales (a excepción de las pruebas unitarias).

  - **Por qué es un problema:** El lenguaje tan denso dificulta la lectura. Además, presentar indicadores (por ejemplo, “% de reducción de tiempo” o “cobertura de pruebas”) en forma de gráfico o tabla haría el argumento más contundente.

  - **Corrección sugerida:** Incorporar al menos una tabla o gráfico pequeño: por ejemplo, “Tabla de resultados de pruebas de usabilidad (tiempo antes/después)”, o un gráfico de porcentaje de avance por caso de prueba. En un trabajo técnico, esto añade claridad. Si no hay datos reales, una tabla resumida de los casos de prueba ejecutados con sus resultados (éxito/fallo) es útil.

## Capítulo 9: Conclusiones

- **Problema detectado:** Las conclusiones listan hallazgos importantes, pero a veces introducen información nueva o exageran logros. Por ejemplo, se afirma que “la principal dificultad no era ausencia de documentos sino fragmentación” (bueno) pero también se dice que se aplicaron patrones de diseño SOLID y se confirma su pertinencia, lo cual es más una descripción del proceso que una conclusión analítica. Además, no se mencionan las limitaciones (por ejemplo, ausencia de métricas, o módulos no implementados).

  - **Por qué es un problema:** En conclusiones no deben aparecer nuevos datos o detalles no discutidos antes, ni afirmaciones grandilocuentes sin sustento. Tampoco deben omitirse las limitaciones del estudio. La conclusión debe responder directamente a los objetivos, enumerar brevemente los resultados clave y sugerir lineas futuras, no convencer con tecnicismos.

  - **Corrección sugerida:** Reescribir las conclusiones para que reflejen objetivamente lo cumplido. Incluir una conclusión sobre cada objetivo (p.ej. “Se confirmó el diagnóstico de las 4 fases problemáticas.”, “El sistema prototipo opera según lo esperado en condiciones de prueba.”). Expresar con humildad (por ejemplo, “este estudio **evidencia** ventajas potenciales…” en lugar de “demuestra”) y añadir una frase de limitación: “Si bien el prototipo fue validado funcionalmente, su eficacia en escenarios reales solo se podrá medir en trabajo futuro con usuarios”. Los patrones SOLID o la arquitectura monorepo, si bien implementados, no añaden conclusiones de negocio, por lo que conviene resumirlos más genéricamente (“la arquitectura empleada contribuye a la mantenibilidad”).

- **Problema detectado:** Se reconoció que no se incluyeron datos cuantitativos ni análisis de ROI. Sin embargo, en las conclusiones no se cierra este tema (solo se menciona “falta de datos”). El jurado podría preguntar explícitamente por métricas de mejora o retorno de inversión, que no están presentes.

  - **Por qué es un problema:** Dejar el tema de la validación económica/técnica tan abierto puede parecer una omisión. Aunque no se tengan datos, se debe explicar cómo se planea obtenerlos o por qué no se pudieron obtener (limitaciones de tiempo).

  - **Corrección sugerida:** Añadir en conclusiones/recomendaciones que se recomienda realizar un estudio posterior con métricas (tiempo, costos) comparando la operación antes y después de la implementación del sistema. Dejar claro que las conclusiones actuales son de orden cualitativo (“se presume que…” vs “se concluye que...” requiere evidencia). Mencionar explícitamente el alcance de la sustentación: “Los resultados actuales se basan en pruebas controladas; se requiere un piloto real para cuantificar mejoras operativas”.

## Capítulo 10: Recomendaciones y trabajo futuro

- **Problema detectado:** El capítulo de recomendaciones actual debe atender directamente las limitaciones observadas. Verificar si se sugieren mejoras concretas (p.ej. “implementar aplicación móvil nativa” o “analizar uso de IA”) fuera de lo que se alcanzó.

  - **Por qué es un problema:** Recomendaciones demasiado generales o no alineadas con las fallas detectadas (por ejemplo, añadir un CRM sin relación) no serán útiles. El jurado valorará recomendaciones que deriven de lo visto en el proyecto (p.ej. “integrar los formularios dinámicos pendientes” o “aplicar encuestas a usuarios técnicos”).

  - **Corrección sugerida:** Incluir mejoras realistas: mejorar la capa offline (si faltó manejo de conflictos), extender la validación (contrato con APIs externas si CERMONT la usa), implementar métricas de rendimiento (tiempos de generación de informes), etc. Relacionar estas recomendaciones con cada hallazgo importante (por ejemplo, “Para abordar la falta de datos reales, se recomienda realizar un piloto en una sucursal de CERMONT recolectando métricas de operación” o “Añadir formularios dinámicos basados en plantillas escaneadas, como mejora futura al enfoque de formularios estáticos”).

## Aspectos de redacción y formato

- **Problema detectado:** Se identifican repeticiones y oraciones extensas en varios capítulos. Por ejemplo, frases muy largas en las conclusiones y desarrollo (como el Objetivo 4 en el PDF) pueden perder claridad. Además, se usó lenguaje coloquial o de ingeniería interna (“HES”, “Serwist”, “Ciclovid” en apéndices) que debería explicarse o evitarse en la redacción final.

  - **Por qué es un problema:** Párrafos muy largos o tecnicismos sin explicación comprometen la claridad académica. El jurado espera un estilo formal y conciso, con frases bien conectadas. Abreviaturas sin definición (“HES”, que quizás es “Health, Environment and Safety”, no queda claro) pueden confundir lectores no familiarizados con el argot interno de la empresa.

  - **Corrección sugerida:** Revisar ortografía y gramática: por ejemplo, separar párrafos demasiado largos en oraciones más cortas con conectores (p.ej. “Además, …” y “Por tanto, …”). Definir siglas la primera vez que aparecen (ej. “Seguridad y Salud en el Trabajo (SST) – si HES se refiere a eso” o sustituir “Personal Contable” por “Departamento de Contabilidad”). Simplificar estructura de frases (p.ej. evitar encadenar muchas cláusulas seguidas). Se deben eliminar redundancias (no repetir “altamente robusta” o “riguroso” en varias partes). En el Índice y numeración, asegurarse de usar los estilos de lista automáticos (los títulos parecen pegados al número) y corregir posibles errores de consistencia (p.ej. algunos títulos con mayúsculas al inicio de palabras, otros sin).

- **Problema detectado:** Hay varios errores tipográficos en el texto extraído (falta de espacios, palabras pegadas). Por ejemplo, en el índice aparecen numeraciones y títulos pegados (probablemente error de compilación). También se observan faltas de acentos en palabras como “facilidad operativa” (quizá “operativa” lleva acento) y otros posibles erratas.

  - **Por qué es un problema:** Errores ortográficos y de formato restan profesionalismo. El jurado revisará ortografía, así que deben corregirse todos los casos (“desarrollový diseño” mal separado, etc.) y el texto debe formatearse con los márgenes adecuados (como lo indicó la revisión anterior del LaTeX). Los títulos de tablas y figuras deben ser claros, p.ej. “Tabla 1.1: …” con mayúscula solo inicial.

  - **Corrección sugerida:** Ejecutar corrector ortográfico completo. Verificar que cada tabla y figura tenga su número correcto, título capitalizado uniformemente. En el LaTeX, ajustar el estilo de numeración (por ejemplo, que “Capítulo 1 – Introducción” tenga doble guion o segmento correcto). Corregir la concatenación de palabras en la extracción (posiblemente era un PDF con ligaduras; revisar las fuentes en el .tex si las partes “de” se pegaron). Mantener consistencia en el uso de acrónimos (ej. decide entre CERMONT o CERMONTS, pues en texto sale a veces sin la “S” final, uniforme).

## Riesgos para la sustentación y preguntas del jurado

- **Posibles preguntas difíciles:**  
  - *“¿Cómo se midió concretamente la mejora operativa tras usar el sistema?”* – Espera evidencias o se enfatizará en la falta de métricas.  
  - *“¿Por qué no se utilizó un ERP/CMMS ya existente en lugar de desarrollar uno propio?”* – Se debe defender con la comparación del estado del arte y necesidades específicas.  
  - *“¿Cómo asegura el sistema la seguridad de datos y cumplimiento normativo (p. ej. facturación electrónica)?”* – Debe responderse con las implementaciones (TLS, cookies seguras, firmas en PDFs) y citar que los formatos generados cumplen con la normativa vigente.  
  - *“Se menciona la arquitectura monorepo y patrones SOLID: ¿cómo se validó que esto mejore la mantenibilidad?”* – Aquí podría preguntar por “¿Se usó alguna métrica de calidad de código?”. Debe reconocerse que no se midió formalmente y proponer usar herramientas (p.ej. SonarQube) como futuro.  
  - *“Explique el enfoque DSR: ¿Por qué se eligió y cómo se aplicó cada fase?”* – Es necesario demostrar coherencia entre objetivos, fases metodológicas y resultados.  
  - *“La validación incluye pruebas, pero ¿se hizo una prueba piloto con usuarios de campo real?”* – En ausencia de ello, se debe reconocer y quizá mencionar simulaciones o equipos de prueba como alcance actual.  
  - *“¿Cómo se integra este sistema con las herramientas existentes de CERMONT (p.ej. software de clientes o contabilidad)?”* – Si no hay integración real, decir que actualmente es un prototipo aislado y sugerir futura integración (API, exportar SES, etc.).  
  - *“¿Qué sucede si un técnico trabaja sin conexión y luego hay datos conflictivos?”* – Aclarar cómo los Service Workers gestionan sincronización e indicar planes de reconciliación.  
  - *“Se habla de extensibilidad (formularios dinámicos): ¿eso está implementado?”* – Si no, reconocerlo como mejora y explicar la arquitectura propuesta para ello.  

- **Partes cuestionables:**  
  - Uso de terminología sin definir (“HES”, “monorepo” en la defensa necesita explicación clara).  
  - Objetivos muy ambiciosos: el jurado podría señalar que no se alcanzaron todos (por ejemplo, objetivos de seguridad o métricas cuantitativas).  
  - Alcances no cubiertos: e.g. formularios dinámicos propuestos como futuros, análisis financiero (ROI) ausente.  
  - Coherencia entre tablas/figuras y texto: debe asegurarse que todo elemento visual esté descrito en el texto, o el jurado lo señalará.  
  - Estructura de anexos: si se muestran archivos de código, debe saber qué representen (puede pedir explicación de un anexo complejo).  

- **Fortalecimiento sugerido:**  
  - Preparar ejemplos concretos (una orden antes y después, flujos de uso) para ilustrar diferencias.  
  - Tener argumentos sobre escalabilidad y mantenibilidad (incluso si teóricas) para respaldar elecciones técnicas.  
  - Reforzar con evidencia indirecta (por ejemplo, documentación oficial de estándares usados para decir “cumple con X”.  
  - Revisar que el glossario de términos esté claro para no atorar al jurado con jerga desconocida.  
  - Practicar explicaciones breves de la arquitectura (“3 capas: UI Next.js, API Node, DB Mongo”) con sus ventajas para este caso.

## Resumen de cambios

- **Cambios urgentes (correcciones imprescindibles):**  
  1. **Mover las decisiones ADR a anexos:** eliminar la sección de ADR del marco teórico principal.  
  2. **Reformular objetivos y pregunta de investigación:** eliminar detalles técnicos de los objetivos, hacerlos medibles y alineados al problema real. Ajustar la pregunta para enfatizar la fragmentación.  
  3. **Reescribir justificación y conclusión para centrarse en CERMONT:** eliminar contenido genérico (normas IEEE, APA) y enfocarse en problemas y hallazgos específicos de CERMONT.  
  4. **Unificar tablas del flujo de 14 pasos:** consolidar en una sola tabla con contenido completo, corrigiendo formato (ancho de columna).  
  5. **Corregir ortografía y formato:** revisar todo el documento con un corrector (acentos, espacios en blanco, numeración coherente de figuras/tablas).

- **Cambios recomendados (importantes pero secundarios):**  
  1. **Añadir evidencia y referencias:** incluir datos concretos en el planteamiento del problema (número de órdenes al año, tiempos de reporte) y citas para afirmaciones de marco teórico/estado del arte.  
  2. **Clarificar metodología:** detallar instrumentos de recolección (entrevistas, revisiones) y criterios de evaluación.  
  3. **Ajustar redacción académica:** simplificar frases largas, definir siglas al inicio, eliminar lenguaje informal o coloquial.  
  4. **Resumir tecnología en desarrollo:** mover descripciones muy técnicas del desarrollo al apéndice y describir funcionalmente en el cuerpo.  
  5. **Incluir ejemplos o tablas en resultados:** mostrar al menos un caso de uso real o ficticio con cifras de mejora (aunque sea en anexo) para hacer el resultado más tangible.

- **Cambios menores (detalles de forma):**  
  1. Unificar estilo de títulos (uso de mayúscula inicial en tablas, figuras, secciones).  
  2. Ajustar márgenes en LaTeX para evitar que texto o figuras se salgan del límite (como se detectó con LaTeX debug).  
  3. Revisar la tabla de contenidos y encabezados para que correspondan exactamente a los nombres de secciones (e.g. “Marco teórico” vs. “MarcoTeórico”).  
  4. Verificar numeración continua de páginas, tablas y figuras luego de modificar contenido.  
  5. Completar pie de figura y fuente para todas las ilustraciones (muchas dicen “Elaboración propia” ya, asegurarse de que cada figura lo tenga).

Este análisis exhaustivo debe servir de guía para depurar y reforzar el documento antes de su presentación ante el jurado. Las correcciones urgentes atienden a la coherencia estructural y de contenido; las recomendadas mejoran la sustancia investigativa; y los detalles menores aseguran un formato profesional y libre de errores. Buen trabajo, y éxito en la sustentación.