# **Análisis Directivo, Corrección Arquitectónica y Auditoría Estructural del Trabajo de Grado: CERMONT S.A.S.**

## **1\. Introducción y Fundamentación de la Auditoría Académica**

El presente documento constituye una revisión integral, analítica y directiva del estado actual del manuscrito de trabajo de grado titulado *Desarrollo de un aplicativo web para la gestión de órdenes de trabajo, trazabilidad y cierre administrativo de procesos operativos en CERMONT S.A.S.*, desarrollado en el marco del programa de Ingeniería Electrónica.1 La evaluación se enfoca en auditar la estructura académica del documento principal, la justificación teórica de las decisiones tecnológicas adoptadas, la coherencia metodológica y la corrección de errores tipográficos críticos detectados en los archivos fuente de compilación (LaTeX).  
El análisis aborda de manera frontal las deficiencias identificadas en la redacción, la cual exhibe una fuerte inclinación hacia el lenguaje corporativo y técnico, alejándose del rigor científico esperado en un entorno universitario de pregrado o posgrado.1 Un trabajo de grado no constituye un manual operativo ni un repositorio de documentación interna; representa la culminación de un proceso de investigación aplicada donde cada decisión tecnológica debe formularse como la respuesta a un problema científico o de ingeniería debidamente planteado. Adicionalmente, el documento disecciona la convergencia anómala de normativas de estilo (mezcla de estándares APA e IEEE) que ha corrompido la maquetación del texto, y provee los mecanismos exactos de depuración (debugging) para estabilizar la compilación del documento principal y corregir el desbordamiento espacial de los entornos gráficos.

## **2\. Contexto Organizacional y Diagnóstico del Problema Operativo**

Para que la investigación ostente validez académica, es imperativo establecer un vínculo inquebrantable entre la necesidad organizacional y la arquitectura de software propuesta. La corporación objeto de estudio opera en un ecosistema multiservicio que abarca la construcción, la electricidad, la refrigeración, el mantenimiento preventivo y correctivo, la instalación de circuitos cerrados de televisión (CCTV), obras civiles, telecomunicaciones y el suministro general de personal técnico y herramientas.1 La complejidad de gestionar simultáneamente estas disciplinas en campo ha generado un colapso en la trazabilidad documental de la organización.  
El diagnóstico central de la investigación revela que los procesos operativos sufren de una fragmentación severa a través de formatos físicos, hojas de cálculo dispersas y documentos de cierre manuales.1 Esta división entrópica imposibilita la consulta de registros históricos, dificulta la coordinación interdepartamental y retrasa dramáticamente la consolidación de documentos de soporte.1 El documento complementario sobre el cierre de brechas operativas detalla diez factores de fallo en el ciclo de vida del negocio, los cuales representan el verdadero núcleo de la formulación del problema y deben ser el eje transversal de la justificación del sistema.1  
La siguiente tabla sintetiza la relación causal entre las brechas operativas detectadas en campo y el requerimiento arquitectónico que la investigación debe resolver metodológicamente:

| Brecha Operativa Identificada en CERMONT S.A.S. | Consecuencia en el Ciclo Administrativo | Solución Arquitectónica y Documental Requerida |
| :---- | :---- | :---- |
| **Desconexión de la Propuesta Económica** | La propuesta inicial no se enlaza algorítmicamente con una orden ejecutable, perdiendo la trazabilidad del presupuesto base. | Implementación de integridad referencial obligatoria entre la entidad de propuesta y la entidad de orden de trabajo. |
| **Órdenes de Compra (POs) no Validadas** | Las órdenes ingresan al sistema sin validación contra los parámetros comerciales inicialmente pactados con el cliente. | Establecimiento de un estado de validación estricto donde la PO hereda las restricciones de la propuesta económica. |
| **Confirmaciones de Planeación Incompletas** | Fallos en la verificación de herramientas, equipos, materiales y requisitos de Seguridad, Salud y Medio Ambiente (HES). | Formularios dinámicos de pre-condición que bloquean la ejecución en campo si el checklist de planeación está incompleto. |
| **Dispersión de Evidencia Técnica** | Las fotografías y soportes técnicos terminan aislados en aplicaciones de mensajería (WhatsApp), correos o carpetas físicas locales. | Unificación del almacenamiento mediante repositorios en la nube (MongoDB) enlazados unívocamente al ID de la orden. |
| **Latencia en Informes Técnicos** | La creación manual en Word/Excel/PDF genera cuellos de botella por latencia humana y errores de transcripción. | Generación algorítmica de documentos estructurados (GeneratedDocument) a partir de plantillas predefinidas en el sistema. |
| **Retrasos en Actas de Entrega** | Los registros de recibo a satisfacción no se generan en sitio ni se firman a tiempo por los supervisores del cliente. | Captura de firmas digitales en sitio mediante dispositivos móviles habilitados con Aplicación Web Progresiva (PWA). |
| **Incapacidad de Radicación de SES** | Imposibilidad administrativa de registrar la Hoja de Entrada de Servicios (SES) en plataformas externas (ej. Ariba) por falta de soportes. | Pipeline controlado por estados que consolida automáticamente el informe, el acta y las evidencias en un paquete auditable. |
| **Retraso en la Generación de Facturas** | El departamento contable no puede emitir la facturación debido a la ausencia de una SES aprobada y validada. | Restricción algorítmica: La interfaz de facturación requiere un token de aprobación de SES para habilitar la emisión fiscal. |
| **Pagos sin Trazabilidad** | Dificultad para rastrear la conciliación bancaria debido a la carencia de una entidad de pago dedicada en el modelo de datos. | Creación de una entidad de dominio específica para pagos vinculada bidireccionalmente a la factura y a la orden de trabajo. |
| **Ausencia de Auditoría de Costos** | Los costos reales de ejecución nunca se comparan sistemáticamente contra los valores presupuestados en la propuesta original. | Módulo de análisis de datos que cruza los gastos registrados en la fase de ejecución con los topes de la propuesta económica. |

El trabajo de grado debe articular cómo cada una de estas fallas no es simplemente un error administrativo, sino un problema de concurrencia, asimetría de información y pérdida de linaje de datos que requiere una intervención formal desde la disciplina de la ingeniería de software.1

## **3\. Diagnóstico Epistemológico: Lenguaje Corporativo versus Rigor Académico**

Una de las falencias más críticas detectadas en el documento principal radica en su dependencia de un lenguaje estrictamente técnico, corporativo y pragmático, en detrimento del lenguaje académico, investigativo y analítico esperado en una tesis universitaria.1 Un trabajo de grado en ingeniería no debe estructurarse como un documento de requerimientos ágiles, un registro de cambios (changelog) o un manual de usuario. Su propósito subyacente es demostrar la capacidad del autor para aplicar el método científico y los principios fundamentales de la ingeniería a la resolución de problemas complejos.

### **3.1. La Incompatibilidad de los Registros de Decisión Arquitectónica (ADR) Directos**

El Capítulo 2 del manuscrito hace mención explícita a los Registros de Decisión Arquitectónica (ADR), catalogándolos como *2.8.1 ADR-001: Monorepo con npm workspaces* y *2.8.2 ADR-002: Express 5.2.1 como framework HTTP*.1 Si bien el paradigma de los ADRs es una práctica excepcional en la industria del software para documentar históricamente el "por qué" de una decisión técnica de manera concisa e inmutable, su transposición literal y cruda a un marco teórico o metodológico universitario resulta epistemológicamente insuficiente.  
En un entorno corporativo, la justificación de un ADR puede reducirse a criterios de eficiencia de mercado, velocidad de entrega de valor o familiaridad del equipo de desarrollo con la herramienta.1 Por ejemplo, un ADR interno podría argumentar que se eligió Next.js "porque permite integrar frontend y backend rápidamente y el equipo ya conoce React". En el contexto de la literatura académica, este nivel de análisis es superficial e inaceptable. La justificación técnica debe transformarse orgánicamente en una respuesta estructurada a una pregunta de investigación, evaluando las características intrínsecas de la tecnología frente a la complejidad teórica del problema a resolver.

### **3.2. Transición del Pragmatismo Técnico a la Argumentación Científica**

Para corregir la desviación en el tono y la profundidad del manuscrito, es perentorio modificar sustancialmente la narrativa de todas las secciones arquitectónicas. El documento debe abandonar las explicaciones instrumentales y adoptar un enfoque centrado en los principios de las ciencias de la computación.  
La siguiente tabla establece un marco comparativo para guiar la refactorización narrativa del documento, ilustrando la diferencia entre las justificaciones inaceptables y las argumentaciones académicas requeridas para sustentar el marco metodológico:

| Componente Tecnológico | Lenguaje Técnico/Corporativo (Inaceptable en Tesis) | Lenguaje Académico/Investigativo (Requerido) |
| :---- | :---- | :---- |
| **Arquitectura Monorepo** | "Se utilizó un monorepo con npm workspaces para no tener el código separado y que los desarrolladores puedan compartir tipos fácilmente." | "La investigación adoptó una arquitectura de repositorio unificado para mantener alta cohesión inter-modular y bajo acoplamiento, garantizando que los contratos esquemáticos y las entidades de dominio se propaguen bidireccionalmente sin generar entropía en los ecosistemas distribuidos." |
| **Uso de Zod para Validación** | "Se usa Zod 4 porque es la mejor librería para validar datos de formularios y revisar lo que llega al backend, evitando errores molestos." | "Para asegurar la integridad del ciclo de vida de los datos, el sistema implementa una capa de validación isomórfica basada en el principio de Única Fuente de Verdad (SSOT), estableciendo contratos estrictos tanto en tiempo de compilación como en tiempo de ejecución." |
| **Persistencia con MongoDB** | "Elegimos MongoDB porque las actas de Cermont cambian mucho y una base de datos SQL sería muy difícil de actualizar todo el tiempo." | "La naturaleza polimórfica de los registros operativos demanda una persistencia orientada a documentos no relacionales. Esta estructura relaja las restricciones de la tercera forma normal (3NF), permitiendo una evolución dinámica del esquema de datos sin comprometer la disponibilidad del sistema." |
| **Gestión de Estado (Zustand)** | "Usamos Zustand en vez de Redux porque es más ligero, requiere menos código repetitivo y no mezcla la lógica del negocio en la interfaz." | "El manejo del estado local de la interfaz de usuario se desacopla mediante el patrón de diseño Store, implementado a través de funciones puras y actualizaciones inmutables, mitigando los efectos secundarios en el Árbol de Objetos del Documento (DOM)." |
| **Operación Offline (PWA)** | "La app es PWA con IndexedDB para que los técnicos puedan usarla en lugares sin internet y no pierdan las fotos que toman." | "Frente a entornos operacionales con redes estocásticas y alta latencia, el aplicativo implementa capacidades de procesamiento diferido y almacenamiento distribuido, asegurando la consistencia eventual de la información mediante algoritmos de sincronización de colas de comandos." |

La exigencia académica demanda que el autor explique sistemáticamente qué problema computacional resuelve la herramienta, por qué es metodológicamente superior a otras alternativas del estado del arte, y cómo su integración permite alcanzar los objetivos planteados en la sección de formulación del proyecto.

## **4\. Justificación Científica y Exhaustiva del Ecosistema Tecnológico (Stack)**

El núcleo metodológico del trabajo de grado reside en la disección de las herramientas que conforman la solución tecnológica. El manuscrito actual enumera las tecnologías pero carece de un análisis profundo que explique las mecánicas internas que justifican su selección.1 A continuación, se provee el desarrollo teórico necesario que debe ser incorporado y expandido dentro del cuerpo del trabajo de grado.

### **4.1. Fundamentación de la Arquitectura Base: Repositorios Unificados (Monorepo)**

La elección de una arquitectura de repositorio unificado mediante *npm workspaces*, la cual consolida de manera organizada los directorios backend/, frontend/, y múltiples paquetes bajo packages/\*, transciende la mera conveniencia del control de versiones.1 Esta macro-estructura es una respuesta directa al problema clásico de la integración continua y la divergencia semántica en arquitecturas distribuidas.  
En ecosistemas de software tradicionales donde el cliente (frontend) y el servidor (backend) habitan en repositorios aislados, la evolución asimétrica de las interfaces de programación (API) conduce invariablemente a la desincronización de los objetos de transferencia de datos (DTOs). Al instituir un enfoque denominado "Contract-First" (Principio 9.1), el proyecto determina que todo punto de acceso al sistema debe ser modelado y definido primero desde el directorio compartido packages/shared-types antes de cualquier implementación empírica.1 En la teoría de la ingeniería de software, esta práctica encapsula el paradigma del "Diseño Guiado por el Dominio" (Domain-Driven Design), permitiendo que la lógica de negocio subyacente alojada en packages/domain permanezca abstracta y agnóstica a los mecanismos de infraestructura o presentación.1

### **4.2. Persistencia y Flexibilidad Ontológica: Mongoose, MongoDB y Zod**

La complejidad operacional de CERMONT S.A.S. implica el procesamiento de estructuras de datos altamente volátiles. Los formularios dinámicos, las plantillas de recolección de información en campo y la consolidación de evidencias fotográficas no estructuradas representan un reto formidable para los modelos de datos clásicos.1 La adopción dogmática de una base de datos relacional (RDBMS) habría impuesto una rigidez sintáctica perjudicial frente a la variabilidad constante de las inspecciones, reportes técnicos y actas de finalización de obra civil.  
La selección del motor de base de datos MongoDB se fundamenta teóricamente en su modelo de persistencia orientada a documentos (JSON/BSON), el cual provee el polimorfismo estructural indispensable para manejar respuestas dinámicas y adjuntos sin requerir migraciones destructivas del esquema.1 Sin embargo, la flexibilidad absoluta es incompatible con las garantías de integridad requeridas para el cierre administrativo y la facturación fiscal. Es en este punto de convergencia donde la justificación de Mongoose 9 adquiere peso investigativo. Mongoose opera como una capa de Mapeo Objeto-Documento (ODM) que impone restricciones de esquema estricto a nivel de la capa de aplicación, actuando como un mediador entre la flexibilidad del almacenamiento subyacente y la rigidez de los contratos de negocio.1  
De manera concurrente, el proyecto adopta la biblioteca Zod 4 para instituir un paradigma de tipado isomórfico.1 Históricamente, el desarrollo web con TypeScript ha sufrido de una ilusión de seguridad: las interfaces estáticas se desvanecen durante el proceso de transpilación a JavaScript, dejando al sistema expuesto a anomalías estructurales en tiempo de ejecución. La investigación resuelve este paradigma al utilizar Zod como el validador final que garantiza matemáticamente que cualquier mutación procesada por Express 5 o consumida por la arquitectura de Next.js respeta ineludiblemente el axioma de datos definido, previniendo fallos en cascada y corrupciones silenciosas del estado del aplicativo.1

### **4.3. Capa de Presentación, Declaratividad e Interacción: Next.js 16 y React 19**

El diseño arquitectónico del sistema prohíbe explícitamente la incrustación de lógica de negocio dentro de la interfaz de usuario (Principio 9.2). Las responsabilidades del frontend quedan confinadas a la renderización determinista de estados, la delegación de comandos a las capas subyacentes, la validación visual de formularios mediante React Hook Form y la presentación de restricciones devueltas por el servidor.1 Esta segmentación es una manifestación formal del patrón de Arquitectura Limpia (Clean Architecture), cuyo objetivo es aislar las reglas operacionales de los mecanismos volátiles de presentación.  
La incorporación del marco de trabajo Next.js 16, específicamente mediante su mecanismo de enrutamiento avanzado (App Router), se justifica por su capacidad para manejar jerarquías estructurales complejas. En un entorno de gestión de órdenes de trabajo, donde la navegación depende de entidades anidadas y estados secuenciales (por ejemplo, rutas como /orders/\[id\]), Next.js proporciona mecanismos nativos de aislamiento de errores (Error Boundaries) y optimización de cargas de recursos.1 Paralelamente, la adopción de React 19 introduce componentes funcionales declarativos que aseguran que la representación visual sea una proyección matemáticamente predecible del estado actual de los datos, eliminando las mutaciones manuales y propensas a errores sobre el DOM.1

### **4.4. Dinámica del Estado: TanStack Query y Zustand**

El análisis de la gestión de la memoria temporal en aplicaciones modernas requiere distinguir estrictamente entre dos naturalezas ontológicas de datos: el estado del servidor y el estado del cliente. El documento técnico estipula que la biblioteca Zustand debe ser utilizada exclusivamente para gestionar el estado local o efímero de la interfaz (UI), quedando terminantemente prohibido su uso para replicar o almacenar información proveniente de la base de datos.1  
Para orquestar el flujo de la información persistente, el sistema implementa TanStack Query v5. Desde la perspectiva investigativa, esta herramienta no es un simple mecanismo de peticiones HTTP, sino un sofisticado gestor de concurrencia asíncrona. Resuelve problemas fundamentales de las ciencias computacionales como la invalidación sistemática de cachés estancados, los algoritmos de reintentos exponenciales frente a fallos de red y la deduplicación de consultas simultáneas, garantizando que la aplicación minimice el consumo de ancho de banda y los ciclos de procesamiento redundantes.1

### **4.5. Tolerancia a Fallos y Operación en Ambientes Estocásticos (Offline-First)**

El análisis de las fases críticas del flujo operativo resalta que la captura de evidencias en campo (Paso 6\) ocurre frecuentemente en zonas con infraestructura de telecomunicaciones deficiente o inexistente, como instalaciones subterráneas, obras civiles alejadas o cuartos de control industrial.1 Solucionar este desafío impone la necesidad de trascender la arquitectura de cliente-servidor tradicional.  
La disertación académica debe detallar cómo el aplicativo se metamorfosea en una Aplicación Web Progresiva (PWA) utilizando tecnologías como *Serwist* para la gestión de Service Workers y la base de datos relacional embebida del navegador, *IndexedDB*.1 Cuando el sistema detecta una pérdida de conectividad, transiciona hacia un estado estocástico de retención. En lugar de abortar las transacciones y rechazar el progreso del operario, la aplicación encola las operaciones (comandos de mutación) y persiste de forma segura los formularios y evidencias localmente en el dispositivo. Una vez el Service Worker identifica la recuperación del canal de comunicación bidireccional, ejecuta un proceso de conciliación asíncrona, sincronizando la cola local con el servidor central de Mongoose. Este comportamiento resiliente ataca de raíz el cuarto factor crítico operacional: la pérdida y dispersión de la evidencia documental por fallos de plataforma o entorno.1

## **5\. Modelado del Dominio: Paradigma de Máquina de Estados Finitos (FSM)**

El diseño del software carecería de impacto si no modelara con precisión la realidad de las operaciones de la empresa. El documento "DOC-22 — Plan de Cierre de Brechas Operativas" establece un axioma funcional ineludible para la plataforma: *Ningún paso administrativo puede proceder si sus artefactos técnicos previos están incompletos, carecen de aprobación o no han sido auditados*.1  
Esta regla de negocio debe ser descrita en el trabajo de grado como la implementación formal de una Máquina de Estados Finitos (Finite State Machine \- FSM) y un grafo dirigido acíclico (DAG).1 La innovación de la investigación no radica simplemente en digitalizar documentos, sino en forzar un pipeline de secuencias inmutables donde las entidades transicionan a través de nodos de validación.  
El sistema debe mapear matemáticamente la evolución del servicio a través de las siguientes etapas documentales secuenciales, las cuales requieren ser detalladas exhaustivamente en el manuscrito para demostrar cómo se previene la corrupción del flujo de caja:

| Nodo Documental (Estado FSM) | Artefactos Técnicos Exigidos para la Transición | Restricciones de Sistema y Lógica de Negocio |
| :---- | :---- | :---- |
| **1\. Solicitud Inicial** | Correos electrónicos, requerimientos iniciales, PDFs y fotografías de levantamiento previo. | Registro obligatorio del requerimiento del cliente. Sin este origen, no se puede iniciar la apertura de expediente. |
| **2\. Visita de Inspección** | Acta de visita estructurada, inspecciones preliminares. | Los técnicos deben subir el formato digital. El estado permanece bloqueado hasta la firma de campo. |
| **3\. Propuesta Económica** | Presupuesto detallado, anexos técnicos y cálculo de costos base. | La propuesta establece el límite máximo de inversión. Debe ser estructurada, no un simple archivo adjunto. |
| **4\. Orden de Compra (PO)** | PO del cliente validada formalmente contra la propuesta. | Cruce algorítmico de montos. Una discrepancia económica bloquea la autorización de despliegue operativo. |
| **5\. Planeación de Actividad** | Formulario dinámico de planeación, Análisis de Trabajo Seguro (AST), Permisos de Trabajo (PTW). | Asignación obligatoria de personal, herramientas y equipos de protección (EPP) mediante contratos *Zod* antes de permitir salidas a terreno. |
| **6\. Ejecución y Evidencia** | Listas de chequeo operativas, fotografías georreferenciadas y firmas digitales in-situ. | Persistencia offline mediante *IndexedDB* si no hay red. La captura de evidencia es bloqueante para el cierre de obra. |
| **7\. Informe Técnico** | Consolidación algorítmica del registro fotográfico y observaciones técnicas de la intervención. | Generación automatizada usando el modelo DocumentTemplate, minimizando la manipulación manual de procesadores de texto. |
| **8\. Acta de Entrega** | Acta de recibo a satisfacción avalada por el cliente. | Sin la estampa de tiempo y firma de aprobación final, la orden se considera pendiente y no liquidable. |
| **9\. Hoja de Servicio (SES)** | Documento soporte consolidado con el ID de orden, fechas, actas e informes para plataformas externas (Ariba). | Nodo crítico: Agrupa automáticamente todos los nodos anteriores en un paquete inviolable para justificar el cobro. |
| **10\. Facturación y Cobro** | Documentos tributarios, anexos contables configurables y factura final. | Restricción terminal: Las facturas únicamente pueden ser emitidas y vinculadas contra una entidad SES previamente validada y en estado "Aprobado".1 |

El grado académico debe basarse en la demostración empírica de que la implementación de estas restricciones computacionales en Next.js y Express reduce la tasa de errores administrativos y acorta el ciclo de facturación, solventando el problema original planteado.

## **6\. Evaluación Crítica de la Estructura Documental y Vacíos Metodológicos**

Al analizar el índice general extraído del archivo fuente principal (main.pdf) y las consultas documentales, se identifican severos vacíos en la estructura macroscópica de la investigación.1 La narrativa académica sufre discontinuidades profundas que comprometen la trazabilidad lógica de la disertación.

### **6.1. Carencia de un Capítulo Metodológico Estructurado**

El índice evidencia que el documento transiciona abruptamente del Capítulo 1 ("Introducción General y Planteamiento del Problema") al Capítulo 2 ("Marco Teórico").1 Resulta altamente atípico e inconsistente la ausencia de un marco metodológico delineado. Aunque la subsección 1.5.4 menciona periféricamente una "Justificación Metodológica", esto no sustituye la obligación de formalizar el Ciclo de Vida del Desarrollo de Software (SDLC). El autor debe explicar si el proyecto se rige bajo esquemas iterativos e incrementales, metodologías ágiles como Scrum o Kanban, o enfoques guiados por pruebas (TDD). La omisión de estas fases despoja al desarrollo de su validación procedimental, haciéndolo parecer producto de la improvisación en lugar de la ingeniería planificada.

### **6.2. La Relegación Inaceptable de la Evaluación y las Métricas**

Uno de los errores conceptuales más delicados reside en la declaración contenida en la sección "1.7.3 Delimitación Académica y Límites de Medición".1 El texto postula que los "indicadores de impacto cuantitativo se añadirán solo si se incluye evidencia verificable en los apéndices de la versión final".1 En el ámbito de las ingenierías, la medición cuantitativa y cualitativa de la solución no es un componente opcional o periférico destinado a un apéndice condicional.  
El núcleo de validación de la hipótesis de ingeniería recae precisamente en las métricas de éxito. Se requiere la inclusión de un capítulo dedicado exclusivamente a los resultados y la discusión, donde se expongan las pruebas de integración, los ensayos de carga computacional, las métricas de rendimiento del servidor y la demostración cuantitativa de la reducción de los tiempos de radicación de facturas y SES.1 Un sistema de software sin validación verificable expuesta en su cuerpo principal carece de rigor científico.

### **6.3. Disparidad de Calidad y Compuertas de Validación (Quality Gates)**

Existe una dicotomía notable en la ejecución del proyecto. Por un lado, la arquitectura de software ostenta parámetros de aseguramiento de calidad (Quality Gates) extremadamente rigurosos: cero tolerancias a errores de TypeScript, prohibición absoluta del uso del tipo explícito any, ausencia de datos quemados (hardcoded) y requerimiento de pruebas exitosas.1 Sin embargo, el documento escrito exhibe falencias tipográficas, ausencia de capítulos críticos y lenguaje corporativo. Es fundamental que la meticulosidad técnica que rige el repositorio de código se refleje simétricamente en el cuidado editorial y en la profundidad investigativa del manuscrito.

## **7\. Auditoría Tipográfica: Colisión de Normativas APA e IEEE en el Motor LaTeX**

Adicional a los problemas de contenido, el requerimiento de análisis señala un grave conflicto de maquetación en el documento compilado, descrito como: *"un espacio adelante no combinar normas de IEEE con las normativas apa al iniciar el parrafo hay un espaciado"* y la presencia de gráficos desbordados. Estos fenómenos son síntomas inequívocos de un preámbulo de LaTeX corrupto o mal configurado.

### **7.1. Análisis de la Desalineación de Estilos de Párrafo**

En la diagramación de documentos científicos, el motor de composición tipográfica (Typesetting Engine) requiere instrucciones precisas e inequívocas sobre cómo separar visualmente los bloques de texto. Las directrices institucionales a menudo generan confusión al solicitar el estándar de referencias IEEE, pero manteniendo márgenes e interlineados basados en las normativas APA. La mezcla irreflexiva de ambos paradigmas en LaTeX destruye la estética de la lectura.  
El estándar visual APA dictamina que la transición entre párrafos del mismo nivel se señala exclusivamente mediante una sangría o indentación de la primera línea (típicamente 1.27 cm o media pulgada), sin aplicar ningún espacio vertical adicional (conocido en LaTeX como \\parskip). Por el contrario, el estilo técnico típico de las columnas IEEE prescinde totalmente de la sangría (\\parindent \= 0\) y separa los bloques de texto insertando un espacio vertical evidente entre ellos.  
Cuando el autor introduce comandos contradictorios en el preámbulo, tales como incluir el paquete parskip para forzar separaciones IEEE, y simultáneamente conserva o fuerza la macro de indentación para cumplir con APA, el resultado es la anomalía reportada: el lector observa un espacio vertical gigante seguido de una línea incrustada artificialmente hacia la derecha. Esto se considera una aberración tipográfica inaceptable en tesis de grado, ya que distrae la atención del revisor y denota descuido en la diagramación.

## **8\. Mecanismos de Resolución LaTeX: Entornos Flotantes y Motor de Compilación**

Para rectificar la integridad visual del documento main.pdf, es necesario intervenir directamente el código fuente. Se deben establecer políticas de anulación paramétrica para obligar al algoritmo a respetar un solo estándar de separación textual (APA) y restringir el comportamiento espacial de los objetos gráficos.

### **8.1. Corrección del Comportamiento de Gráficas Extralimitadas**

El problema de las figuras que consumen páginas completas se deriva de la fricción entre el tamaño absoluto de la imagen insertada y los cálculos de penalización del algoritmo de posicionamiento de flotantes (float placement algorithm) en LaTeX. Si una imagen insertada mediante \\includegraphics es marginalmente más ancha o alta que el bloque de texto permitido (\\textwidth o \\textheight), LaTeX determina que no puede coexistir con el texto sin invadir los márgenes. En consecuencia, el motor expulsa la imagen hacia la siguiente página disponible. Si se fuerza su posición usando el especificador rígido \[H\], el motor rompe el flujo del documento, dejando enormes espacios en blanco y aislando la gráfica en una hoja independiente.  
Para resolverlo, la inserción de gráficos no debe poseer medidas estáticas. Debe ser relativa al contexto espacial, utilizando el paquete graphicx para instruir al compilador a escalar dinámicamente la imagen preservando su relación de aspecto (aspect ratio), y permitiendo que la figura flote armónicamente (\[htbp\]).

### **8.2. Preámbulo de Depuración (Debug Preamble)**

El autor del manuscrito debe aplicar de inmediato las siguientes correcciones algorítmicas en la cabecera de su archivo principal (main.tex). Este código ha sido diseñado para estabilizar las directrices APA, eliminar la colisión de espaciado IEEE y contener el desbordamiento de las figuras:

Fragmento de código  
% \=========================================================================  
% BLOQUE DE DEPURACIÓN Y ESTABILIZACIÓN TIPOGRÁFICA (APA ESTRICTO)  
% \=========================================================================

% 1\. Resolución del Conflicto de Párrafos (Indentación vs Espaciado)  
\\usepackage{indentfirst} % Fuerza la indentación del primer párrafo de cada sección  
\\setlength{\\parindent}{1.27cm} % Define la sangría exacta requerida por normas APA  
\\setlength{\\parskip}{0pt} % Elimina el espaciado vertical anómalo entre párrafos (Estilo IEEE)

% 2\. Control de Entornos Flotantes y Contención Gráfica  
\\usepackage{graphicx}  
\\usepackage{float}

% Configuración global para restringir el tamaño máximo de las imágenes  
% Previene matemáticamente que una figura supere el tamaño del área de texto  
\\makeatletter  
\\def\\maxwidth{\\ifdim\\Gin@nat@width\>\\linewidth\\linewidth\\else\\Gin@nat@width\\fi}  
\\def\\maxheight{\\ifdim\\Gin@nat@height\>\\textheight\\textheight\\else\\Gin@nat@height\\fi}  
\\makeatother  
% La inserción de imágenes deberá hacerse obligatoriamente con la siguiente sintaxis:  
% \\includegraphics\[width=0.8\\maxwidth, keepaspectratio\]{ruta\_imagen.png}

% 3\. Relajación de los parámetros del algoritmo de posicionamiento  
% Esto disminuye la probabilidad de aislar figuras en páginas vacías  
\\renewcommand{\\topfraction}{0.9}  
\\renewcommand{\\bottomfraction}{0.8}  
\\renewcommand{\\textfraction}{0.1}  
\\renewcommand{\\floatpagefraction}{0.85}

% 4\. Interlineado Académico Convencional  
\\usepackage{setspace}  
\\spacing{1.5} % Establece el espacio y medio canónico para documentos de tesis

## **9\. Herramientas de Depuración Documental y Prompts de Refactorización**

Reconociendo que la conversión de un texto corporativo a uno académico es un proceso iterativo extenuante, se proporciona al estudiante una herramienta de ingeniería de instrucciones (Prompt Engineering). Este recurso está diseñado para interactuar con sistemas de Modelos de Lenguaje Grande (LLM) que asistan en la reestructuración del contenido sin alterar la veracidad de la investigación subyacente.  
El autor deberá emplear el siguiente marco de instrucciones sistemáticas (Prompt) para procesar iterativamente los capítulos de su tesis:  
**PROMPT MAESTRO DE REFACTORIZACIÓN ACADÉMICA**  
"Actúa como un director de tesis doctoral especializado en ingeniería de software y un tipógrafo experto en LaTeX. Poseo segmentos de texto de mi trabajo de grado titulado *Desarrollo de un aplicativo web para la gestión de órdenes de trabajo, trazabilidad y cierre administrativo de procesos operativos en CERMONT S.A.S.*. Necesito someter el texto adjunto a las siguientes transformaciones ineludibles:

1. **Erradicación del Lenguaje Corporativo:** Identifica y elimina cualquier jerga empresarial, descripciones pragmáticas simplistas (por ejemplo, 'es más rápido', 'es más fácil') o lenguaje coloquial. Transforma las referencias literales a 'ADRs' (Registros de Decisión Arquitectónica) en disertaciones teóricas profundas que justifiquen el uso de tecnologías como Monorepos, PWA, Zustand, Mongoose y Zod desde la perspectiva de las ciencias de la computación (cohesión, mitigación de entropía, tipos isomórficos, consistencia eventual).  
2. **Transición a Voz Pasiva e Impersonal:** Asegúrate de que el resultado final esté redactado de manera formal y abstracta en tercera persona. Todo debe sonar a una investigación científica aplicada.  
3. **Corrección de Código LaTeX subyacente:** Si el texto proporcionado contiene etiquetas LaTeX, revisa que cumplan estrictamente con las directrices APA. Garantiza que los párrafos se rijan por la indentación (\\parindent) sin espacios extra (\\parskip), e inyecta parámetros como \[htbp\] y width=0.8\\textwidth, keepaspectratio a los entornos de figuras (\\begin{figure}) para impedir que la gráfica escale asimétricamente y acapare una página completa de manera indeseada.

Devuelve únicamente el texto corregido, garantizando un flujo narrativo denso, impecable y propio del nivel universitario de ingeniería."  
El uso disciplinado de este comando asegurará la homogeneidad narrativa exigida para la aprobación final del documento.

## **10\. Conclusión Directiva y Hoja de Ruta de Cumplimiento**

El proyecto emprendido para la corporación CERMONT S.A.S. ostenta un nivel de complejidad técnica verdaderamente notable.1 La conceptualización del sistema —que transita desde la captura offline de evidencias geolocalizadas hasta la consolidación inmutable de Hojas de Entrada de Servicios (SES) en arquitecturas orientadas a documentos— representa un aporte significativo a la modernización de los procesos operativos multiservicio.1 La adopción de principios como *Contract-First* y tipado isomórfico evidencia una comprensión madura del estado del arte en el desarrollo de software.  
No obstante, esta excelencia algorítmica no se ve reflejada en la redacción actual del documento principal. El manuscrito languidece bajo el peso del pragmatismo corporativo, la omisión inaceptable de secciones vitales como el marco metodológico y las métricas de validación cuantitativa, y los errores de maquetación tipográfica que denotan inmadurez en la presentación académica.1  
La viabilidad de la disertación para optar al título universitario está condicionada a la ejecución expedita de las siguientes modificaciones sustanciales:  
En primera instancia, la reingeniería tipográfica debe aplicarse inmediatamente utilizando el código proporcionado para purgar el preámbulo LaTeX de conflictos entre normativas APA e IEEE, restaurando la sobriedad visual del documento. Paralelamente, se debe ejecutar una auditoría completa del Capítulo 2, transformando el inventario pasivo de librerías y repositorios en un profundo análisis computacional sobre concurrencia, resiliencia y diseño guiado por el dominio.  
Finalmente, es mandato incuestionable la integración de un capítulo conclusivo y de validación empírica en el cuerpo principal del trabajo.1 La hipótesis investigativa solo se sostiene si el autor demuestra mediante evidencias medibles que la imposición de las compuertas documentales dinámicas acortó exitosamente el ciclo de vida, redujo los cuellos de botella en la radicación de reportes, y viabilizó sin contratiempos el cierre administrativo final para la facturación. El cumplimiento riguroso de estas directrices transformará el presente manuscrito en un trabajo de grado riguroso, cohesionado y académicamente incuestionable.

#### **Fuentes citadas**

1. Optimizing Field Work Lifecycle and Administrative Closure