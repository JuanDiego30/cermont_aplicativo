# IMPLEMENTACIÓN DE TECNICAS OPTICAS DE SEGURIDAD INFORMÁTICA MEDIANTE EL USO DE MEDIOS OPTICOS NO LINEALES

> Conversión automática desde PDF a Markdown. Se conserva la separación por páginas para facilitar revisión y trazabilidad.

## Metadatos

- Archivo original: `ATG JUAN DIEGO AREVALO-1(3).pdf`
- Páginas: 12
- Tamaño: 1750954 bytes
- SHA-256: `c61c1c55c6bbcc8d52237191a4dcc74509d5e1c505c000a9e24308194f04c415`
- Autor PDF: jrueda

---

## Página 1

Propuesta trabajo de grado, Departamento de Código 00
                               Ingenierías E.E.S.T.
                                                           Página  1 de 12


           DESARROLLO     DE UN  APLICATIVO   WEB  PARA  LA GESTIÓN   DE

                  ÓRDENES   DE TRABAJO,   TRAZABILIDAD    Y CIERRE
           ADMINISTRATIVO     DE  PROCESOS   OPERATIVOS    EN CERMONT

                                       S.A.S.


                                         autor
                               JUAN DIEGO AREVALO PIDIACHE

                                        Director
                               LUIS ALBERTO MUÑOZ BEDOYA
                                  Magister en Controles Industriales
                      Investigador del Grupo de Ingeniería Biomédica de la Universidad de Pamplona – GIBUP


                             INGENIERÍA  ELECTRÓNICA

                   FACULTAD   DE INGENIERÍAS   Y ARQUITECTURA


                                UNIVERSIDAD DE PAMPLONA

                              PAMPLONA, septiembre 15 de 2025

---

## Página 2

Propuesta trabajo de grado, Departamento de Código 00
                               Ingenierías E.E.S.T.
                                                           Página  2 de 12


           1.   INFORMACIÓN GENERAL DE LA TESIS

            Título: DESARROLLO DE UN APLICATIVO WEB PARA LA GESTIÓN DOCUMENTAL Y APOYO A LOS PROCESOS OPERATIVOS
            EN CERMONT SAS – ARAUCA
            Nombre Autor: Juan Diego Arevalo Pidiache   C.C.
                                                        FIRMA:

            E-mail: juan.arevalo2@unipamplona.edu.co    Teléfono: 3138752441
            Lugar de Ejecución del Proyecto:

            Duración de Proyecto (en meses):
            Modalidad:

                 Independiente Práctica Empresarial* x Diplomado Docencia
            *Deberá adjuntar carta de aceptación de la empresa o copia del convenio o contrato

            OBJETIVO GENERAL
              1. Desarrollar un aplicativo web que permita gestionar de forma centralizada las órdenes de trabajo y optimizar
                 la trazabilidad de los procesos operativos y administrativos en CERMONT S.A.S., mejorando la planeación,
                 ejecución y cierre administrativo de los servicios técnicos.
            OBJETIVOS ESPECÍFICOS
              1. Analizar el flujo actual de los procesos operativos y administrativos de CERMONT S.A.S. para identificar las
                 fallas críticas en la planeación, ejecución e informes técnicos.
              2. Diseñar la arquitectura funcional del sistema web, definiendo los módulos de planeación, ejecución, evidencias
                 y cierre administrativo, junto con la estructura de base de datos y los roles de usuario.
              3. Implementar los módulos principales del aplicativo web, que incluyan la planeación con kits típicos, listas de
                 verificación digitales, registro de evidencias fotográficas y generación automática de informes técnicos.
              4. Validar la efectividad del aplicativo mediante pruebas piloto con un grupo de 5 usuarios durante un ciclo
                 operativo de 2 semanas, midiendo la reducción de los tiempos de reporte, el aumento en la trazabilidad de la
                 información y la eficiencia del cierre administrativo.

            Aceptación director de la tesis: Autorización director del programa: SI NO
            NOMBRE: Luis Alberto Muñoz Bedoya
                                            FIRMA:
            FIRMA:
            Acepto y certifico que revisé el presente anteproyecto
            antes de firmarlo.

            Jurado 1: Luis Alberto Muñoz Bedoya
                                            Firma Jurado 1:
            Jurado 2: Victor Julio Vargas Sarmiento
                                            Firma Jurado 2:
            Jurado 3:
                                            Firma Jurado 3:

            Sustentación Anteproyecto:
            Lugar : ____________________________________Fecha: _____________________ Hora__________________
            Aprobado            Incompleto          Rechazado

            Observaciones del jurado: Se atendió la observación del jurado relacionada con la identificación de aplicaciones
            existentes en el mercado que ofrecen funciones similares (Fiix CMMS, UpKeep, Fracttal, entre otras), incorporando su
            análisis en el estado del arte. Se precisó además el valor diferencial del aplicativo propuesto para CERMONT S.A.S.,
            basado en la integración entre la operación en campo, el cierre administrativo y la trazabilidad documental, adaptado
            al entorno industrial del campo Caño Limón y con capacidad de funcionamiento offline–online para garantizar
            continuidad operativa.
            Realización de Correcciones
            Lugar : ____________________________________Fecha: _____________________ Hora__________________
            Aprobado                               Rechazado

            Firma Jurado 1: ____________________ Firma Jurado 2: _________________ Firma Jurado 3: ______________

---

## Página 3

Propuesta trabajo de grado, Departamento de Código 00
                               Ingenierías E.E.S.T.
                                                           Página  2 de 12


           2. RESUMEN DEL PROYECTO

           El presente anteproyecto propone el desarrollo de un aplicativo web orientado a la gestión

           integral de las órdenes de trabajo y el cierre administrativo de las actividades operativas
           realizadas por CERMONT S.A.S. La empresa presenta dificultades en la planeación, ejecución
           y seguimiento de sus procesos, debido al uso de formatos físicos, hojas de cálculo y registros
           dispersos que dificultan la trazabilidad y generan demoras en la elaboración de informes
           técnicos, actas y facturación.

           La solución planteada consiste en un sistema web que centraliza y automatiza las etapas

           críticas del proceso, incorporando módulos de planeación con kits típicos de materiales y
           equipos, checklists digitales para la ejecución en campo, registro de evidencias fotográficas,
           autogeneración de informes técnicos en formato PDF y un tablero de control para el
           seguimiento de actas, SES y facturas. Además, incluirá un submódulo de costeo en tiempo real
           que permitirá comparar los costos reales frente a los presupuestados.

           Con esta herramienta, CERMONT S.A.S. podrá optimizar la comunicación entre sus áreas
           operativas y administrativas, reducir los tiempos de cierre de servicio, eliminar errores

           manuales y fortalecer la trazabilidad de la información, contribuyendo así a la eficiencia y
           transformación digital de la empresa.

           2.1. Palabras clave:

           Aplicativo web, órdenes de trabajo, trazabilidad, mantenimiento, gestión administrativa.

           3. PLANTEAMIENTO DEL PROBLEMA Y JUSTIFICACIÓN


           3.1 PLANTEAMIENTO DEL PROBLEMA
           CERMONT S.A.S. es una empresa dedicada a la ejecución de actividades técnicas en el sector
           industrial, eléctrico y de telecomunicaciones. Actualmente, presta servicios de construcción y
           mantenimiento en el campo petrolero Caño Limón, administrado por Sierracol Energy, lo que
           implica operar en un entorno de alta exigencia técnica y con condiciones logísticas complejas.
           La empresa enfrenta limitaciones en la planeación, ejecución y cierre administrativo de sus
           procesos operativos, debido al uso de formatos físicos, hojas de cálculo y registros dispersos

           que dificultan la trazabilidad y el control del flujo de trabajo.

           Durante el diagnóstico del proceso, se evidenciaron fallas en varias etapas críticas: en la
           planeación, no se definen claramente las herramientas, materiales y elementos de protección
           requeridos para cada tipo de trabajo; en la ejecución, se presentan olvidos de ítems críticos y
           falta de verificación de actividades; en la elaboración de informes, los formatos se diligencian
           de manera manual, generando demoras y errores; y en el cierre administrativo, se identifican
           retrasos en la gestión de actas, SES y facturas por falta de seguimiento y alertas automáticas.


           Estas deficiencias generan pérdida de tiempo, duplicidad de información, errores humanos y
           demoras en los procesos de facturación, afectando la productividad y la eficiencia general de
           la empresa. Por lo tanto, se hace necesario desarrollar un aplicativo web integral que permita
           digitalizar, controlar y optimizar las etapas críticas del proceso operativo y administrativo de
           CERMONT S.A.S.

           3.2 JUSTIFICACIÓN

           El desarrollo de este proyecto se justifica por la necesidad de optimizar la gestión operativa y
           administrativa de CERMONT S.A.S., empresa que actualmente presenta dificultades en la
           planeación, ejecución y cierre de sus actividades debido a la ausencia de una plataforma
           tecnológica que integre y controle el flujo completo de trabajo. Estas deficiencias han
           generado retrasos en la elaboración de informes, pérdida de información, reprocesos y

---

## Página 4

Propuesta trabajo de grado, Departamento de Código 00
                               Ingenierías E.E.S.T.
                                                           Página  2 de 12


           demoras en los procesos de facturación, lo que afecta la productividad y la eficiencia
           organizacional.


           Con la implementación de un aplicativo web integral, la empresa podrá centralizar sus
           procesos, garantizando la trazabilidad de las actividades desde la planeación hasta el cierre
           administrativo. El sistema permitirá automatizar tareas repetitivas, reducir errores manuales,
           mejorar la comunicación entre el personal operativo y administrativo, y disponer de
           información en tiempo real para la toma de decisiones.

           Además, el proyecto contribuye a la transformación digital de la organización, promoviendo

           la adopción de herramientas tecnológicas que aumentan la competitividad y aseguran la
           calidad del servicio. De esta manera, la propuesta no solo mejora la eficiencia interna, sino
           que fortalece el cumplimiento de los compromisos operativos y financieros de la empresa.

           4. MARCO TEÓRICO Y ESTADO DEL ARTE

           4.1 MARCO TEÓRICO


           4.1.1 Gestión Documental y su Impacto en Empresas de Servicios
           La gestión documental comprende el conjunto de políticas, procedimientos y tecnologías
           orientadas a la captura, almacenamiento, control y recuperación de la información generada
           por una organización. Su propósito es garantizar la disponibilidad, integridad, trazabilidad y
           seguridad de los datos necesarios para la operación y la toma de decisiones. En el contexto de
           empresas de servicios técnicos como CERMONT S.A.S., una gestión documental deficiente se
           traduce en riesgos operativos significativos: pérdida de certificados de calibración, extravío de
           reportes fotográficos que sustentan evidencias contractuales y dificultad para consultar

           historiales de mantenimiento. Estas fallas impactan directamente la calidad del servicio y la
           capacidad de respuesta ante auditorías o reclamaciones. Implementar un sistema centralizado
           con control de versiones, flujos de trabajo (workflows) y respaldo automático permite
           asegurar la trazabilidad documental y cumplir con los estándares de gestión de calidad ISO
           9001 y de seguridad industrial. Un módulo de gestión documental bien diseñado dentro del
           aplicativo web será la base para mantener la coherencia y validez de la información operativa
           y administrativa de la empresa.


           4.1.2 Transformación Digital en PYMES del Sector Industrial
           La transformación digital va más allá de convertir formatos físicos en digitales; implica una
           reingeniería de procesos apoyada en tecnología para mejorar la eficiencia, reducir errores
           humanos y aumentar la productividad. En las PYMES industriales, la digitalización permite
           modernizar procesos operativos, asegurar la trazabilidad de las actividades y fortalecer la
           comunicación entre las áreas técnica y administrativa. Diversos estudios (CEPAL, 2023; BID,
           2024) evidencian que las PYMES que adoptan soluciones digitales modulares incrementan su
           productividad hasta en un 40%. Sin embargo, enfrentan barreras como la resistencia al

           cambio, la falta de infraestructura tecnológica y los recursos limitados. En este contexto, la
           transformación digital en CERMONT S.A.S. debe implementarse de forma escalable y
           progresiva, priorizando la automatización de procesos críticos como el registro de actividades
           en campo, el acceso a reportes de mantenimiento y la generación de informes. Este enfoque
           permite obtener resultados inmediatos y sentar las bases para una expansión tecnológica
           futura más sólida.

           4.1.3 Aplicaciones Web como Herramienta de Gestión Estratégica

           Las aplicaciones web representan la herramienta ideal para integrar procesos en empresas
           con personal distribuido geográficamente. Sus ventajas incluyen accesibilidad desde cualquier
           dispositivo, actualizaciones centralizadas, menor costo de mantenimiento y control de acceso
           por roles. Desde el punto de vista técnico, una arquitectura REST (Representational State
           Transfer) que separa la capa cliente (front-end) y la capa servidor (back-end) es la más

---

## Página 5

Propuesta trabajo de grado, Departamento de Código 00
                               Ingenierías E.E.S.T.
                                                           Página  2 de 12


           adecuada para este proyecto. En el front-end se recomienda el uso de tecnologías modernas
           como HTML5, CSS3 y frameworks JavaScript como React.js o Vue.js, que permiten crear
           interfaces responsivas, intuitivas y rápidas. En el back-end, Node.js con Express o PHP con

           Laravel ofrecen robustez y escalabilidad, mientras que sistemas gestores de bases de datos
           como PostgreSQL o MySQL garantizan integridad, seguridad y trazabilidad de la información.
           Esta arquitectura modular permitirá al aplicativo web de CERMONT S.A.S. evolucionar
           fácilmente e incorporar nuevas funciones según las necesidades de la empresa.

           4.1.4 Seguridad y Conectividad en Entornos Operativos Remotos
           La seguridad de la información es un pilar fundamental en cualquier sistema web. El aplicativo

           deberá implementar autenticación y autorización por roles, cifrado de contraseñas mediante
           algoritmos seguros (como bcrypt o Argon2), transmisión de datos bajo protocolos HTTPS y
           copias de seguridad programadas. El entorno operativo de CERMONT S.A.S., que incluye zonas
           de difícil acceso como la refinería de Caño Limón, plantea desafíos de conectividad
           intermitente. Por ello, el sistema incorporará una funcionalidad offline, que permita registrar
           datos y evidencias en campo sin conexión, sincronizándolos automáticamente al restablecer
           el acceso a la red. Investigaciones recientes sobre digitalización en MIPYMES de Iberoamérica
           (García, 2021; Restrepo y Morales, 2024) destacan que esta capacidad de trabajo híbrido

           (offline–online) es esencial para garantizar la continuidad operativa y la confiabilidad de los
           datos en contextos de infraestructura limitada.


           Fig 1 Diagramas de Casos de Uso

           4.1.5 Herramientas de desarrollo de aplicaciones web
           El front-end corresponde a la capa visual y de interacción con el usuario. Tecnologías
           fundamentales son:

             •  HTML5 (HyperText Markup Language), encargado de la estructura semántica del
                contenido web [6].
             •  CSS3 (Cascading Style Sheets), que define estilos y adaptaciones responsivas para
                distintos dispositivos, crucial en entornos móviles [7].
             •  JavaScript, como lenguaje dinámico de scripting que permite la manipulación de
                eventos y mejora de la interactividad [8].
             •  Frameworks modernos como React.js, Vue.js o Angular, que facilitan el desarrollo
                modular, escalable y reutilizable de interfaces [9].

           En el caso de Cermont SAS, la interfaz debe ser responsiva y ligera, con prioridad en
           formularios rápidos de carga de evidencias, consultas ágiles de certificados y notificaciones
           claras.

           El back-end constituye la lógica de negocio y conexión con bases de datos. Entre las opciones
           destacadas:
             •  PHP y Laravel, framework que agiliza el desarrollo estructurado con patrones MVC
                (Modelo–Vista–Controlador), ampliamente usado en PYMES por su curva de

                aprendizaje accesible [10].
             •  Node.js con Express, que permite manejar múltiples conexiones concurrentes con alto
                rendimiento, ideal si se proyecta integrar notificaciones en tiempo real o
                sincronización desde campo [11].
             •  Python con Django o Flask, recomendado en proyectos que requieran mayor
                escalabilidad y analítica futura [12].

           El aplicativo requiere un sistema gestor de base de datos (SGBD) que garantice integridad,

           escalabilidad y seguridad:
             •  MySQL/MariaDB, gratuito y eficiente para sistemas transaccionales [13].
             •  PostgreSQL, de código abierto, con mayor robustez en integridad y escalabilidad [14].

---

## Página 6

Propuesta trabajo de grado, Departamento de Código 00
                               Ingenierías E.E.S.T.
                                                           Página  2 de 12


             •  Para entornos con conectividad limitada, puede usarse SQLite o mecanismos de
                sincronización offline-online.


           4.1.5.4 Arquitectura Cliente-Servidor y API REST
           El modelo cliente-servidor bajo arquitectura REST (Representational State Transfer) es la
           práctica estándar para aplicaciones web. Permite separar front-end (interfaz) y back-end
           (servicios), conectados mediante endpoints que procesan peticiones HTTP (GET, POST, PUT,
           DELETE) [15].

           4.1.5.5 Seguridad y control de acceso

           Un aspecto crítico es la seguridad, que debe contemplar:
             •  Autenticación y autorización por roles.
             •  Cifrado de contraseñas (bcrypt o Argon2).
             •  Respaldo periódico de la base de datos.
             •  Protocolos HTTPS para acceso seguro [16].


           Fig 2 Diagrama de herramientas de desarrollo de aplicaciones web

           4.2 ESTADO DEL ARTE

           S. D. García Batanero [1]
           "Desarrollo de un aplicativo web para la gestión y administración de requerimientos solicitados
           por clientes a la empresa Servicios Productivos S.A."

           Tesis de pregrado (Universidad de Pamplona). Describe el proceso de identificación de
           requisitos, diseño de interfaz y pruebas de usuario para un aplicativo web en una empresa de
           servicios colombiana. Aporta metodología para el levantamiento de requerimientos y destaca
           la importancia de la capacitación de usuarios.

           B. Carrión Rojas & G. J. Gómez Muje [2]

---

## Página 7

Propuesta trabajo de grado, Departamento de Código 00
                               Ingenierías E.E.S.T.
                                                           Página  2 de 12


           "Plataforma web para la mejora de la gestión documental en la Universidad Tecnológica de
           los Andes"
           Tesis universitaria desarrollada en Perú, cuyo objetivo fue implementar una plataforma web

           para optimizar los procesos administrativos y académicos de gestión documental. Los autores
           emplearon metodologías ágiles (Scrum) en el ciclo de desarrollo y realizaron pruebas de
           usabilidad con personal administrativo y estudiantes. Entre los resultados destacan una
           reducción significativa en los tiempos de búsqueda de documentos (de 15 minutos en
           promedio a menos de 3), además de una mayor satisfacción de los usuarios, medida a través
           de encuestas con un nivel de aceptación del 87%.


           J. Canales Idone [3]
           "Implementación de una aplicación web para la gestión documental"
           Trabajo académico realizado en la Universidad Tecnológica del Perú. La propuesta se enfocó
           en la construcción de una aplicación web open-source basada en tecnologías como PHP,
           MySQL y Bootstrap, orientada a la gestión de expedientes y certificados. Se aplicaron
           encuestas al personal administrativo para levantar requisitos, y se desarrolló un sistema que
           permitió disminuir el tiempo de registro de documentos en un 45% y mejorar la trazabilidad
           de los expedientes mediante reportes automáticos.


           Y. Fernández Cabanillas & V. A. Flores Orosco [4]
           "Plataformas digitales para la gestión documental. Una revisión de literatura 2004–2024"
           Revisión sistemática que analiza más de 60 publicaciones académicas sobre plataformas
           digitales de gestión documental en diferentes contextos (educativo, empresarial y
           gubernamental). Los autores identifican tendencias clave como la migración hacia entornos
           cloud, la incorporación de accesos móviles y la integración de flujos de trabajo automatizados
           (workflows).


           S. Sternad Zabukovšek et al. [5]
           "Managing Document Management Systems’ Life Cycle in Relation to an Organization’s
           Maturity for Digital Transformation"
           Este estudio internacional analiza la relación entre el ciclo de vida de los sistemas de gestión
           documental (DMS) y la madurez digital de las organizaciones. Se aplicaron cuestionarios en
           más de 150 empresas europeas, encontrando que aquellas con mayor preparación
           organizacional en procesos digitales alcanzaron hasta un 60% más de eficiencia en el uso de

           sus DMS.

           J. A. Restrepo-Morales et al. [6]
           "Breaking the digitalization barrier for SMEs: a fuzzy logic approach"
           Investigación aplicada a PYMES latinoamericanas que analiza las barreras para la digitalización
           utilizando un modelo basado en lógica difusa. Los resultados identifican factores críticos como
           la falta de liderazgo digital, la resistencia al cambio y las limitaciones económicas, pero
           también destacan que la implementación de soluciones modulares y de bajo costo puede

           superar gran parte de estas barreras.

           E. B. G. Navas et al. [7]
           "Determining factors for the digitization of micro, small and medium-sized enterprises in Ibero-
           America"
           Estudio regional que evalúa factores de éxito y limitaciones en la digitalización de MIPYMES
           en Iberoamérica. Basado en más de 400 encuestas, los resultados indican que la conectividad
           deficiente y la falta de infraestructura tecnológica son los principales obstáculos. Los autores

           proponen la adopción de soluciones que incluyan funcionalidades offline con sincronización
           posterior, lo cual es especialmente útil en sectores con baja cobertura de red, como ocurre en
           operaciones industriales remotas.

           “Gestión operativa y documental”

---

## Página 8

Propuesta trabajo de grado, Departamento de Código 00
                               Ingenierías E.E.S.T.
                                                           Página  2 de 12


           La gestión de los procesos operativos y documentales en empresas de servicios técnicos, como
           CERMONT S.A.S., se apoya actualmente en un ecosistema de soluciones tecnológicas
           consolidadas que buscan digitalizar y optimizar el ciclo de vida completo de un servicio. Estas

           plataformas integran el registro de órdenes de trabajo, la ejecución en campo, la recopilación
           de evidencias y la generación de reportes técnicos y administrativos.
           El mercado actual se divide principalmente en tres categorías de software:
           1. Software de Gestión de Servicios de Campo (FSM – Field Service Management): orientado
           al   control y    supervisión de  equipos  móviles  en   campo.
           2. Sistemas de Gestión de Mantenimiento (GMAO/CMMS): enfocados en la planificación de
           mantenimientos preventivos, correctivos y en la administración de activos.

           3. Sistemas de Planificación de Recursos Empresariales (ERP): soluciones integrales que
           incorporan módulos financieros, logísticos y operativos, pero con altos costos de
           implementación y complejidad técnica.
           Ejemplos comerciales representativos incluyen:
             •  ServiceMax: plataforma FSM robusta, orientada a grandes corporaciones industriales.
             •  Jobber: solución ampliamente utilizada por PYMES, con interfaz amigable, aunque
                limitada para flujos administrativos complejos.
             •  SAP Field Service Management: herramienta potente y configurable, pero de alto costo

                y rigidez estructural.
             •  Fracttal: software GMAO/FSM popular en Latinoamérica, centrado en mantenimiento
                y control de activos.

           El valor diferencial del aplicativo propuesto para CERMONT S.A.S. radica en la integración
           precisa entre la operación en campo, el cierre administrativo y la gestión documental,
           adaptada a las necesidades del sector petrolero y contratista en el campo Caño Limón,
           administrado por Sierracol Energy. A diferencia de las soluciones existentes, el sistema

           propuesto busca optimizar los flujos de trabajo diarios y, al mismo tiempo, garantizar la
           trazabilidad y accesibilidad de la información histórica, sin comprometer la velocidad del
           sistema ni aumentar los costos de implementación.

           5. DELIMITACIÓN

           5.1. OBJETIVO GENERAL
           Desarrollar un aplicativo web que permita gestionar de forma centralizada las órdenes de

           trabajo y optimizar la trazabilidad de los procesos operativos y administrativos en CERMONT
           S.A.S., mejorando la planeación, ejecución y cierre administrativo de los servicios técnicos.

           5.2. OBJETIVOS ESPECÍFICOS

             1. Analizar el flujo actual de los procesos operativos y administrativos de CERMONT S.A.S.
                para identificar las fallas críticas en la planeación, ejecución e informes técnicos.


             2. Diseñar la arquitectura funcional del sistema web, definiendo los módulos de
                planeación, ejecución, evidencias y cierre administrativo, junto con la estructura de
                base de datos y los roles de usuario.

             3. Implementar los módulos principales del aplicativo web, que incluyan la planeación
                con kits típicos, listas de verificación digitales, registro de evidencias fotográficas y
                generación automática de informes técnicos.


             4. Validar la efectividad del aplicativo mediante pruebas piloto con un grupo de 5
                usuarios durante un ciclo operativo de 2 semanas, midiendo la reducción de los
                tiempos de reporte, el aumento en la trazabilidad de la información y la eficiencia del

---

## Página 9

Propuesta trabajo de grado, Departamento de Código 00
                               Ingenierías E.E.S.T.
                                                           Página  2 de 12


                cierre administrativo.

           5.3. ACOTACIONES

           El presente proyecto se desarrollará bajo la modalidad de práctica empresarial en CERMONT
           S.A.S., empresa contratista ubicada en la ciudad de Arauca, la cual presta servicios de
           construcción y mantenimiento en el campo petrolero Caño Limón, administrado por Sierracol
           Energy. En este contexto industrial, caracterizado por altos estándares técnicos y exigencias
           de trazabilidad, el cronograma y los entregables del proyecto se ajustarán a la duración de la
           práctica, culminando con la entrega de un prototipo funcional del aplicativo web.


           El alcance del sistema se enfocará en la gestión integral de las órdenes de trabajo y el cierre
           administrativo de los servicios técnicos de la empresa. Para ello, el aplicativo integrará los
           siguientes módulos y funcionalidades principales:

                Módulo 1. Ejecución en campo con modo online/offline: Permitirá el registro de
                información desde dispositivos móviles incluso sin conexión a internet. El sistema
                almacenará temporalmente los datos y sincronizará automáticamente con el servidor
                central cuando la conexión esté disponible, garantizando la continuidad operativa.


                Módulo 2. Dashboard informativo con métricas: Incluirá un panel de control donde se
                visualizarán las órdenes de trabajo activas, su estado de avance y los indicadores clave
                de gestión (KPIs), como el tiempo promedio de ejecución o la tasa de cumplimiento,
                actualizados en tiempo real.

                Módulo 3. Administración: Permitirá configurar plantillas de kits típicos y listas de
                verificación dinámicas, estandarizando la planeación y ejecución de actividades.

                Además, incluirá un sistema de gestión de usuarios y roles (RBAC) para controlar
                accesos y garantizar la seguridad de la información.

                Módulo 4. Mantenimiento y respaldo de datos: Incluirá procesos automáticos de
                archivado mensual para trasladar órdenes completadas a una base de datos histórica,
                manteniendo optimizado el rendimiento del servidor. El sistema dispondrá de un
                portal de descarga de históricos, desde el cual se podrán exportar registros, informes
                y evidencias en formatos estándar (CSV o ZIP), facilitando auditorías, consultas legales

                o análisis de tendencias.

           Desde el punto de vista técnico, el desarrollo se basará en herramientas open-source,
           empleando PHP con Laravel o Node.js con Express en el back-end y MySQL o PostgreSQL como
           sistema gestor de bases de datos. Se reconoce que el alcance del prototipo estará
           condicionado por limitaciones temporales y de infraestructura, derivadas de la duración de la
           práctica y las condiciones de conectividad en campo. Por ello, el sistema contempla la
           sincronización offline–online, asegurando la operatividad en entornos de baja conectividad y

           garantizando la trazabilidad de la información operativa y administrativa.

           Durante la revisión de las soluciones comerciales existentes, se identificó que la mayoría de
           los sistemas GMAO y FSM disponibles en el mercado —como Fiix CMMS, Fracttal, Jobber o
           Praxedo— operan bajo modelos de licencia de pago por usuario o por suscripción, lo cual
           limita su adopción en empresas medianas o contratistas como CERMONT S.A.S.. En contraste,
           el presente desarrollo se fundamenta en el uso de herramientas open-source, sin costos de
           licenciamiento, lo que reduce la inversión inicial y permite la personalización total del sistema

           según las necesidades operativas y administrativas de la empresa. Este enfoque representa el
           valor agregado del proyecto, al ofrecer una solución económica, adaptable y sostenible a largo

---

## Página 10

Propuesta trabajo de grado, Departamento de Código 00
                               Ingenierías E.E.S.T.
                                                           Página  2 de 12


           plazo.


           Fig 3 Diagrama de Flujo General del Proyecto

           6. TAREAS Y CRONOGRAMA DE ACTIVIDADES

           6.1 Cronograma y descripción de Actividades.


                           Tabla 6.1. Cronograma y descripción de Actividades
                                  SEMANAS (Añada más columnas si es necesario)
                      ACTIVIDAD 1 2 3 4  5 6  7  8  9 10  11 12
                     1       x  x
                     2          x  x
                     3             x  x
                     4                x  x x  x
                     5                        x  x  x x
                     6                           x  x  x  X
                     7                              x  x  x   x

           Descripción de actividades:
                1. Levantamiento de información y diagnóstico de procesos documentales: Se
                  realizará la identificación de los flujos actuales de manejo documental, el uso de
                  formatos físicos y las principales dificultades operativas que afectan la trazabilidad
                  de la información.

                2. Análisis de requerimientos y definición de funcionalidades: Se recopilarán las
                  necesidades del personal administrativo y operativo, estableciendo prioridades

                  para los módulos del sistema y los procesos que serán automatizados.

                3. Diseño de la arquitectura del sistema: Se elaborarán los diagramas de flujo y de
                  casos de uso, así como el modelo entidad–relación, definiendo las tecnologías a
                  emplear en el front-end, back-end y la base de datos.

                4. Desarrollo del prototipo del aplicativo web: Se implementará una versión inicial
                  funcional de la plataforma digital, que integrará los módulos de planeación,

                  ejecución y gestión documental.

                5. Pruebas piloto: Se ejecutarán pruebas controladas con usuarios de la empresa para
                  validar la usabilidad del sistema, los tiempos de respuesta y el correcto
                  funcionamiento de las funcionalidades principales.

                6. Ajustes y documentación técnica: Se realizarán las correcciones identificadas en la

                  etapa de pruebas, se optimizará la interfaz de usuario y se elaborarán los manuales
                  técnicos y de usuario.

                7. Se validará la efectividad del aplicativo mediante pruebas piloto con un grupo de 5
                  usuarios de la empresa durante un ciclo operativo de 2 semanas, midiendo la
                  reducción de tiempos de reporte, la mejora en la trazabilidad de la información y
                  la eficiencia del cierre administrativo.


           7. RESULTADOS/PRODUCTOS ESPERADOS Y POTENCIALES BENEFICIARIOS

---

## Página 11

Propuesta trabajo de grado, Departamento de Código 00
                               Ingenierías E.E.S.T.
                                                           Página  2 de 12


           7.1Resultados/Productos Esperados


                1. Aplicativo web funcional para la gestión integral de las órdenes de trabajo en
                  CERMONT S.A.S., que incluya módulos de planeación con kits típicos, listas de
                  verificación digitales, registro de evidencias fotográficas, generación automática de
                  informes técnicos y seguimiento del estado de actas, SES y facturas.

                2. Digitalización y trazabilidad completa de los procesos administrativos y operativos,
                  reemplazando el uso de formatos físicos y hojas de cálculo, con acceso en línea a

                  la información desde cualquier ubicación autorizada.

                3. Prototipo escalable y adaptable, desarrollado bajo una arquitectura modular
                  cliente–servidor, que permita integrar en el futuro nuevas funcionalidades como
                  control de costos en tiempo real, indicadores (KPIs) o conexión con plataformas
                  externas como SAP Ariba.

                4. Documentación técnica y manual de usuario, que sirva como guía para la

                  instalación, operación y mantenimiento del sistema, facilitando la capacitación del
                  personal administrativo y operativo.

                5. Informe de evaluación del impacto, resultado de una prueba piloto con un grupo
                  de 5 usuarios durante un ciclo operativo de 2 semanas, con indicadores de
                  reducción de tiempos de reporte, mejora en la trazabilidad documental,
                  optimización del cierre administrativo y nivel de satisfacción de los usuarios con el
                  aplicativo implementado.


           7.2Potenciales Beneficiarios
                1. Cermont SAS: como empresa contratista, mejorará la eficiencia en el manejo
                  documental, el cumplimiento de auditorías y la trazabilidad de sus actividades de
                  campo.
                2. Personal administrativo: tendrá acceso rápido y seguro a la información,
                  reduciendo tiempos en la consulta y elaboración de reportes.

                3. Personal operativo en campo: podrá cargar evidencias y registros en tiempo real,
                  evitando pérdida de formatos físicos y mejorando la comunicación con la
                  administración.
                4. Clientes y empresas contratantes (como Sierracol): recibirán información más
                  organizada y confiable, lo que genera confianza y respaldo en la ejecución de los
                  contratos.
                5. Instituciones académicas: el desarrollo del aplicativo servirá como caso práctico
                  para futuras investigaciones o proyectos relacionados con transformación digital
                  en PYMES del sector industrial.

---

## Página 12

Propuesta trabajo de grado, Departamento de Código 00
                               Ingenierías E.E.S.T.
                                                           Página  2 de 12


           8.REFERENCIAS BIBLIOGRÁFICAS


           [1] B. y. G. M. G. J. Carrión Rojas, «Plataforma web para la mejora de la gestión
              documental en la Universidad Tecnológica de los Andes.,» Tesis de pregrado.
              Universidad Tecnológica de los Andes, peru, 2023.
           [2] J. Canales Idone, « Implementación de una aplicación web para la gestión
              documental.,» Tesis de pregrado. Universidad Tecnológica del Perú, peru, 2022.

           [3] Y. y. F. O. V. A. Fernández Cabanillas, «Plataformas digitales para la gestión
              documental.,» 2024.
           [4] S. D. García Batanero, «Desarrollo de un aplicativo web para la gestión y
              administración de requerimientos solicitados por clientes a la empresa Servicios
              Productivos S.A.,» pamplona, 2022.

           [5] J. Mendoza González, «Arquitectura cliente-servidor en aplicaciones web:
              fundamentos y aplicaciones.,» 2010.
           [6] E. B. G. e. a. Navas, «Determining factors for the digitization of micro, small and
              medium-sized enterprises in Ibero-America.,» de Journal of Business Research, 2025,

              pp. vol. 165, pp. 245–258,.
           [7] R. Pérez, «Lenguajes de programación para el desarrollo de aplicaciones web.,» 2017.
           [8] J. A. e. a. Restrepo-Morales, «Breaking the digitalization barrier for SMEs: a fuzzy logic
              approach.,» de Journal of Innovation and Entrepreneurship, pp. vol. 13, núm. 4, pp. 1–

              19,.
           [9] S. J. S. y. B. S. Sternad Zabukovšek, «Managing Document Management Systems’ Life
              Cycle in Relation to an Organization’s Maturity for Digital Transformation.,» de
              Sustainability, 2023, pp. vol. 15, núm. 7, pp. 1–18.
           [10] A. J. Vega, «Sistemas CRM y su aplicación en empresas de servicios,» bogota.

           [11] S. Winer, « estrategias para la gestión de clientes,» McGraw Hill, madrid.

---
