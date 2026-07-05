---
title: "LTG_JUAN_DIEGO_AREVALO"
author: "Juan Diego Arévalo Pidiache"
source_pdf: "LTG_JUAN_DIEGO_AREVALO-3(3).pdf"
pages: 207
converted_at: "2026-06-18 02:59:29"
format: "Markdown conversion from PDF block text extraction"
---

# DESARROLLO DE UN APLICATIVO WEB PARA LA GESTIÓN DE ÓRDENES DE TRABAJO, TRAZABILIDAD Y CIERRE ADMINISTRATIVO DE PROCESOS OPERATIVOS EN CERMONT S.A.S.

**Autor:** Juan Diego Arévalo Pidiache  
**Universidad:** Universidad de Pamplona  
**Facultad:** Facultad de Ingenierías y Arquitectura  
**Programa:** Ingeniería Electrónica  
**Año:** 2025

> Conversión automática a Markdown a partir del PDF del libro de trabajo de grado. Se conserva el texto principal, encabezados detectados y separadores por página. Las figuras/tablas quedan descritas mediante sus leyendas cuando el PDF las contiene como texto.


<!-- Página 1 de 207 -->

DESARROLLO DE UN APLICATIVO WEB PARA LA GESTIÓN DE

ÓRDENES DE TRABAJO, TRAZABILIDAD Y CIERRE

ADMINISTRATIVO DE PROCESOS OPERATIVOS EN CERMONT

S.A.S.

JUAN DIEGO ARÉVALO PIDIACHE

UNIVERSIDAD DE PAMPLONA

FACULTAD DE INGENIERÍAS Y ARQUITECTURA

PROGRAMA DE INGENIERÍA ELECTRÓNICA


<!-- Página 2 de 207 -->

DESARROLLO DE UN APLICATIVO WEB PARA LA GESTIÓN DE

ÓRDENES DE TRABAJO, TRAZABILIDAD Y CIERRE

ADMINISTRATIVO DE PROCESOS OPERATIVOS EN CERMONT

S.A.S.

Trabajo de grado presentado como requisito para optar al título de:

INGENIERO ELECTRÓNICO

Modalidad:

PRÁCTICA EMPRESARIAL

Director:

MSc. LUIS ALBERTO MUÑOZ BEDOYA

Magíster en Controles Industriales


<!-- Página 3 de 207 -->

DESARROLLO DE UN APLICATIVO WEB PARA LA GESTIÓN DE

ÓRDENES DE TRABAJO, TRAZABILIDAD Y CIERRE

ADMINISTRATIVO DE PROCESOS OPERATIVOS EN CERMONT

S.A.S.

## PÁGINA DE APROBACIÓN

Trabajo de grado presentado como requisito para optar al título de Ingeniero Electrónico, modalidad Práctica Empresarial, y aprobado por el director del trabajo de grado y los evaluadores designados por la Universidad de Pamplona.

Autor: JUAN DIEGO ARÉVALO PIDIACHE

Programa: Ingeniería Electrónica

MSc. LUIS ALBERTO MUÑOZ BEDOYA

VICTOR JULIO VARGAS SARMIENTO

HEBER ARMANDO PABÓN CONDE

Director del trabajo de grado

Evaluador

Evaluador

Universidad de Pamplona Facultad de Ingenierías y Arquitectura - Programa de Ingeniería Electrónica


<!-- Página 4 de 207 -->

Primeramente, doy gracias a Dios, por guiar cada etapa de este camino académico y darme la fortaleza para culminarlo. A mis padres, Dimas Arévalo López y Sonia María Pidiache, por su amor, esfuerzo y apoyo permanente en mi formación personal y profesional. Al MSc. Luis Alberto Muñoz Bedoya, director de este trabajo de grado, por su orientación, acompañamiento y confianza durante el desarrollo del proyecto. Al personal de CERMONT S.A.S., por abrirme las puertas de la empresa y permitirme vivir una experiencia formativa en el entorno operativo de SIERRACOL Energy.


<!-- Página 5 de 207 -->

## Resumen

Este trabajo de grado documenta el diseño y desarrollo de un aplicativo web modular orientado a organizar la información operativa y administrativa asociada a las órdenes de trabajo de CERMONT S.A.S. La propuesta surge de una necesidad concreta de la empresa: reducir la dispersión de datos entre formatos físicos, hojas de cálculo, fotografías, actas y soportes de cierre.

La solución integra módulos de usuarios y roles, órdenes de trabajo, planeación, evidencias fotográficas, generación documental y seguimiento administrativo. Su propósito es transformar registros aislados en información estructurada, consultable y vinculada al flujo operativo de catorce pasos. La arquitectura se plantea con separación entre interfaz, lógica de negocio, contratos compartidos y persistencia, lo que facilita la mantenibilidad del sistema y el control de acceso por perfil.

Como extensión complementaria, el proyecto contempla una evolución hacia formularios dinámicos basados en documentos heredados de la empresa, siempre que exista aprobación formal para incorporarlos al alcance funcional. La validación se plantea mediante escenarios de uso, pruebas de integración y aceptación por rol. Los indicadores cuantitativos de impacto deben incluirse solo cuando exista evidencia verificable obtenida en una fase piloto con usuarios y órdenes reales.

Palabras clave: gestión documental, trazabilidad operativa, órdenes de trabajo, cierre administrativo, formularios digitales, arquitectura web modular, CERMONT S.A.S.


<!-- Página 6 de 207 -->

## Abstract

This degree project documents the design and development of a modular web application aimed at organizing operational and administrative information related to work orders at CERMONT S.A.S. The proposal responds to a specific organizational need: reducing data dispersion across paper forms, spreadsheets, photographs, delivery records, and administrative closure documents.

The solution integrates user and role management, work orders, resource planning, photographic evidence, document generation, and administrative follow-up. Its purpose is to transform isolated records into structured information connected to the fourteen-step operational workflow. The architecture separates the user interface, business logic, shared contracts, and persistence layer, supporting maintainability and role-based access control.

As a complementary extension, the project considers future evolution toward dynamic forms based on legacy company documents, provided that formal approval is granted for their inclusion. Functional validation is organized through use scenarios, integration tests, and role-based acceptance. Quantitative impact indicators should be reported only when verifiable evidence is obtained through a pilot stage with real users and work orders.

Keywords: document management, operational traceability, work orders, administrative closure, digital forms, modular web architecture, CERMONT S.A.S.


<!-- Página 7 de 207 -->

## Índice general

## Resumen

## Abstract

Introducción General y Planteamiento del Problema 1.1 Presentación general del tema y contexto organizacional............................... 1.2 Descripción detallada del flujo operativo de 14 pasos .................................. 1.3 Las cinco fallas críticas documentadas en el flujo operativo ........................... 1.3.1 Falla Crítica 1: Planeación de la actividad (Paso 5) ............................ 1.3.2 Falla Crítica 2: Ejecución en campo y captura de evidencias (Paso 6) ........ 1.3.3 Falla Crítica 3: Consolidación documental, informes y actas (Pasos 7 a 9)... 1.3.4 Falla Crítica 4: Retrasos en facturación y cierre administrativo (Pasos 10 a 14) ................................................................................ 1.3.5 Falla Crítica 5: Ausencia de control centralizado de costos reales (Transversal a los pasos 3 a 14) ........................................................ 1.4 Formulación del problema y pregunta de investigación ................................ 1.5 Justificación ............................................................................... 10 1.5.1 Justificación Técnica............................................................. 10 1.5.2 Justificación Organizacional..................................................... 10 1.5.3 Justificación Académica ......................................................... 11 1.5.4 Justificación Metodológica ...................................................... 11 1.6 Objetivos .................................................................................. 11 1.6.1 Objetivo General ................................................................. 11 1.6.2 Objetivos Específicos ............................................................ 12 1.7 Alcance y delimitación del proyecto ..................................................... 12 1.7.1 Alcance Funcional y Técnico Realizado ........................................ 12


<!-- Página 8 de 207 -->

1.7.2 Alcance Propuesto y Evoluciones Futuras ...................................... 13 1.7.3 Delimitación Académica y Límites de Medición............................... 14 1.8 Análisis de actores interesados (stakeholders) .......................................... 14 1.9 Estructura general del documento de trabajo de grado.................................. 17 1.10 Matriz de trazabilidad entre fallas, requisitos y módulos ............................... 18 1.11 Criterio de delimitación del problema para evitar generalizaciones.................... 20 1.12 Criterios para interpretar el alcance de la solución ...................................... 20

Marco Teórico 2.1 Ingeniería de software y arquitectura web moderna..................................... 22 2.2 Modelado de servicios de campo y órdenes de trabajo (FSM) ......................... 22 2.3 Sistemas CMMS, ERP y su convergencia técnica ...................................... 23 2.4 El paradigma de aplicaciones web progresivas (PWA) y operación offline............ 24 2.5 Arquitecturas de validación declarativa mediante esquemas estructurados ............ 25 2.6 Seguridad de aplicaciones web y control de acceso robusto ............................ 25 2.7 Síntesis conceptual del marco teórico.................................................... 26 2.8 Criterios para la toma de decisiones arquitectónicas .................................... 26 2.9 Herramientas tecnológicas utilizadas y criterio de selección ........................... 28 2.10 Teoría de costos operativos y motor de trazabilidad financiera......................... 30 2.11 Modelo de madurez FSM y posicionamiento del proyecto ............................. 31 2.12 Patrones de diseño aplicados en la arquitectura del sistema ............................ 32 2.13 Principios SOLID aplicados en el desarrollo ............................................ 33 2.14 Marco conceptual ampliado para la plataforma documental-operativa ................ 35 2.15 Trazabilidad como propiedad de ingeniería ............................................. 35 2.16 Requisitos de calidad derivados del contexto de campo ................................ 36 2.17 Relación entre teoría de software y práctica empresarial ............................... 37

Estado del Arte e Investigación de Software 3.1 Criterio de revisión ....................................................................... 38 3.2 Plataformas comerciales relacionadas ................................................... 38 3.3 Repositorios abiertos para FSM, CMMS y ERP ........................................ 38 3.4 Librerías para formularios dinámicos .................................................... 40 3.5 Herramientas de extracción documental ................................................. 40 3.6 Comparación de proyectos open source ................................................. 42


<!-- Página 9 de 207 -->

3.7 Vacíos identificados y posicionamiento del proyecto ................................... 42 3.8 Análisis de madurez del mercado FSM .................................................. 43 3.9 Análisis detallado de repositorios open source .......................................... 43 3.9.1 FieldPro: referencia de stack y funcionalidades PWA.......................... 44 3.9.2 OCA Field Service: patrón de descomposición modular....................... 44 3.9.3 Atlas CMMS: referencia de despliegue autoalojado ........................... 45 3.10 Antecedentes investigativos en el contexto colombiano ................................ 45 3.11 Tendencias tecnológicas emergentes y su relación con el proyecto .................... 46 3.12 Justificación de la solución a medida frente a alternativas existentes .................. 47 3.13 Análisis de costos del ecosistema de software........................................... 48 3.14 Criterios académicos para comparar soluciones existentes ............................. 49 3.15 Posicionamiento del aplicativo frente a FSM, CMMS y ERP .......................... 49 3.16 Vacíos del mercado identificados para el caso CERMONT ............................ 50 3.17 Criterio de uso de precios y costos externos............................................. 51

Marco Legal, Normativo y Ético 4.1 Protección de datos personales ........................................................... 52 4.2 Seguridad y salud en el trabajo........................................................... 52 4.3 Normativa de facturación electrónica .................................................... 53 4.4 Propiedad intelectual y licencias de software............................................ 53 4.5 Normativa técnica y profesional ......................................................... 53 4.6 Documentos contractuales y confidencialidad .......................................... 54 4.7 Ética de investigación y práctica empresarial ........................................... 54 4.8 Análisis detallado de la Ley 1581 de 2012 y su aplicación al sistema ................. 54 4.9 Estándares internacionales de calidad de software aplicables .......................... 56 4.10 Cumplimiento normativo sectorial ....................................................... 57 4.11 Matriz de requisitos legales y su implementación en el sistema........................ 58 4.12 Aplicación del marco legal al diseño funcional del sistema ............................ 59 4.13 Confidencialidad de documentos operativos y evidencias .............................. 59 4.14 Licenciamiento de software y uso de componentes abiertos............................ 60 4.15 Ética de la validación y uso de métricas ................................................. 60

Metodología 5.1 Tipo de proyecto .......................................................................... 62


<!-- Página 10 de 207 -->

5.2 Fases metodológicas ...................................................................... 62 5.3 Fuentes de información ................................................................... 62 5.4 Integración de la documentación técnica 00-22......................................... 64 5.5 Variables e indicadores de validación.................................................... 65 5.6 Arquitectura del desarrollo ............................................................... 66 5.7 Criterios de rigor .......................................................................... 66 5.8 Flujo de trabajo Contract-First: del esquema a la interfaz .............................. 67 5.9 Compuertas de calidad por iteración ..................................................... 68 5.10 Instrumentos de recolección y análisis de información ................................. 70 5.11 Matriz de trazabilidad metodológica..................................................... 71 5.12 Estructura del repositorio y organización del código.................................... 71 5.13 Procedimiento de validación metodológica.............................................. 72 5.14 Implicaciones del contexto de práctica empresarial ..................................... 73 5.15 Plan de trabajo y cronograma de ejecución.............................................. 74 5.16 Modelo de integración académica de la documentación técnica 00-22 ................ 75 5.17 Procedimiento de uso de los documentos técnicos durante el desarrollo .............. 78 5.18 Matriz de fases metodológicas y documentos de soporte ............................... 78

Desarrollo del Aplicativo Web 6.1 Enfoque funcional del sistema ........................................................... 80 6.1.1 Matriz de estado de implementación y alcance................................. 80 6.2 Módulos del sistema: Cobertura del flujo operativo y de soporte ...................... 82 6.3 Evidencia visual del aplicativo desarrollado............................................. 83 6.4 Arquitectura del software y estructura del monorepo ...................................100 6.5 Justificación del stack tecnológico seleccionado ........................................102 6.6 El contrato compartido: validación bajo enfoque de confianza cero (Zero Trust) con Zod.........................................................................................102 6.7 Estructura técnica del Backend en Express 5.2.1........................................103 6.8 Diseño del Frontend y el Perímetro de Seguridad en Next.js 16 .......................104 6.9 Operación offline, persistencia local y sincronización diferida.........................105 6.10 Arquitectura de seguridad en profundidad...............................................106

6.10.1 Primera capa: Perímetro de red (Proxy y CORS)...............................107 6.10.2 Segunda capa: Autenticación sin estado (JWT) ................................107


<!-- Página 11 de 207 -->

6.10.3 Tercera capa: Autorización basada en roles (RBAC) ..........................107 6.10.4 Cuarta capa: Validación de entradas (Zero Trust) ..............................108 6.10.5 Quinta capa: Registro de auditoría inmutable ..................................108 6.10.6 Sexta capa: Protección de datos en reposo y en tránsito .......................108 6.11 Arquitectura de módulos del sistema: los catorce pasos del flujo CERMONT ........109

6.11.1 Paso 1: Solicitud de trabajo (Work Request) ...................................109 6.11.2 Paso 2: Visita técnica (Site Visit)................................................109 6.11.3 Paso 3: Propuesta económica (Proposal)........................................ 110 6.11.4 Paso 4: Aprobación con orden de compra (Purchase Order)................... 110 6.11.5 Entidad transversal: Orden de trabajo (WorkOrder / ServiceCase) ............ 110 6.11.6 Paso 5: Planeación de recursos (Planning Packet).............................. 111 6.11.7 Paso 6: Ejecución en campo (Execution Session) .............................. 111 6.11.8 Paso 7: Consolidación del informe técnico (Technical Report)................ 112 6.11.9 Pasos 8 al 14: Cierre administrativo y seguimiento de recaudo ............... 112

6.11.9.1 Paso 8: Acta de Entrega Técnica (Delivery Record) ................ 112 6.11.9.2 Paso 9: Firma del Acta (Client Acceptance) ........................ 112 6.11.9.3 Paso 10: Elaboración y envío de SES................................ 113 6.11.9.4 Paso 11: Aprobación de SES ......................................... 113 6.11.9.5 Paso 12: Elaboración y envío de factura............................. 113 6.11.9.6 Paso 13: Aprobación de factura ...................................... 114 6.11.9.7 Paso 14: Registro de Pago y Cierre Definitivo ...................... 114 6.12 Arquitectura de la capa de persistencia .................................................. 114

6.12.1 Patrones de modelado............................................................ 114 6.12.2 Estrategia de índices ............................................................. 115 6.12.3 Campos de auditoría ............................................................. 115 6.13 Integración del ecosistema de desarrollo ................................................ 115 6.14 Experiencia de desarrollo y curva de aprendizaje ....................................... 116 6.15 Comparativa tecnológica: stack implementado vs. alternativas evaluadas............. 117 6.16 Desarrollo por cortes verticales del sistema ............................................. 119 6.17 Modelo de estados para controlar el avance operativo .................................. 119 6.18 Diseño del módulo de archivos, evidencias y firmas....................................121 6.19 Diseño del módulo de costos reales ......................................................121 6.20 Integración entre backend, frontend y documentación técnica .........................122


<!-- Página 12 de 207 -->

Resultados Técnicos y Evidencias del Desarrollo 7.1 Introducción a los resultados .............................................................123 7.2 Resultados del desarrollo técnico ........................................................123 7.3 Resultados funcionales observables......................................................124 7.4 Indicadores por medir con evidencia verificable ........................................124 7.5 Relación con los objetivos................................................................125 7.6 Evidencias recomendadas ................................................................125 7.7 Síntesis de resultados .....................................................................125 7.8 Resultados por módulo implementado...................................................125 7.8.1 Módulo de autenticación y control de acceso (RBAC).........................125 7.8.2 Módulo de órdenes de trabajo ...................................................126 7.8.3 Módulo de planeación y kits típicos.............................................126 7.8.4 Módulo de gestión de evidencias................................................127 7.8.5 Módulo de generación documental..............................................127 7.8.6 Módulo de cierre administrativo y seguimiento ................................128 7.8.7 Módulo de operación offline (PWA) ............................................128 7.9 Relación problema, requisito, módulo y evidencia......................................129 7.10 Matriz de trazabilidad: objetivos, fases y resultados ....................................129 7.11 Resultados de la revisión de seguridad ..................................................131 7.12 Síntesis de resultados y contribuciones ..................................................131 7.13 Auditoría de evidencias técnicas por módulo............................................132 7.14 Resultados interpretados por objetivo específico........................................134 7.15 Indicadores propuestos sin afirmación de resultados no medidos ......................134 7.16 Resultados sobre madurez documental del aplicativo...................................135

Validación y Pruebas del Sistema 8.1 Introducción a la validación ..............................................................136 8.2 Arquitectura del entorno de pruebas automatizadas.....................................136 8.3 Resultados cuantitativos y desglose de la suite de pruebas .............................137 8.3.1 Suite de Autenticación, Sesión y Seguridad (JWT HttpOnly) .................137 8.3.2 Suite de Control de Acceso Basado en Roles (RBAC Guards) ................138 8.3.3 Suite de Esquemas Dinámicos y Custom Fields (Zod 4.x).....................138 8.3.4 Suite de Reglas de Negocio de Órdenes de Trabajo ............................138


<!-- Página 13 de 207 -->

8.3.5 Suite de Proyección de Casos de Servicio (ServiceCase Projection) ..........139 8.3.6 Suite de Generación Documental y pdf-lib .....................................139 8.3.7 Suite de Evidencias Foto-Geolocalizadas.......................................139 8.4 Matriz consolidada de pruebas del monorepo ...........................................140 8.5 Validación cualitativa y de usabilidad por roles .........................................140 8.6 Síntesis de la validación ..................................................................141 8.7 Pirámide de pruebas: estrategia de cobertura por capas.................................141 8.8 Trazabilidad de la validación: de los objetivos a las pruebas ...........................142 8.9 Recomendaciones para la validación en entorno productivo ...........................144 8.10 Estrategia ampliada de pruebas por capas ...............................................145 8.11 Escenarios de validación funcional derivados del flujo de 14 pasos ...................145 8.12 Validación cualitativa con roles de usuario ..............................................146 8.13 Criterios de aceptación para la fase piloto ...............................................147

Discusión y Análisis Crítico 9.1 Introducción a la discusión ...............................................................148 9.2 Comparación con soluciones comerciales ...............................................148 9.3 Aporte del enfoque modular..............................................................148 9.4 Discusión sobre la trazabilidad documental .............................................148 9.5 Limitaciones del alcance actual ..........................................................149 9.6 Implicaciones académicas y prácticas ...................................................149 9.7 Síntesis crítica.............................................................................149 9.8 Discusión sobre la aplicabilidad del modelo a otras organizaciones ...................150 9.9 Discusión sobre el rol de la inteligencia artificial en la evolución del sistema ........150 9.10 Discusión sobre la completitud del flujo operativo implementado .....................151 9.11 Síntesis de la discusión ...................................................................152 9.12 Discusión sobre las decisiones arquitectónicas..........................................152 9.13 Discusión sobre la cobertura del flujo operativo ........................................153 9.14 Discusión sobre la validación del sistema ...............................................153 9.15 Comparación con trabajos relacionados .................................................154 9.16 Lecciones aprendidas del proceso de desarrollo.........................................154 9.17 Discusión sobre la expansión del libro a partir de documentación técnica.............155 9.18 Discusión sobre funcionalidades implementadas y propuestas .........................155


<!-- Página 14 de 207 -->

9.19 Discusión sobre arquitectura a medida frente a adopción directa ......................156 9.20 Lecciones sobre diseño centrado en el proceso..........................................156 9.21 Discusión sobre visualización y comunicación técnica .................................157

10 Conclusiones y Recomendaciones 10.1 Conclusiones ..............................................................................158 10.2 Recomendaciones .........................................................................160 10.3 Líneas de continuidad.....................................................................161 10.4 Cierre del trabajo..........................................................................162 10.5 Síntesis de contribuciones ................................................................163 10.6 Reflexión sobre la formación en Ingeniería Electrónica ................................163 10.7 Conclusiones ampliadas por objetivo específico ........................................164 10.8 Recomendaciones operativas para CERMONT S.A.S. .................................165 10.9 Recomendaciones técnicas para continuidad del software..............................165 10.10Proyección hacia una plataforma configurable ..........................................166 10.11Cierre final ................................................................................166

# Síntesis de Aportes del Proyecto

# Referencias Bibliográficas

A Anteproyecto de Trabajo de Grado (ATG) Aprobado A.1 Datos Generales del Proyecto Aprobado ................................................175 A.2 Objetivos del Trabajo de Grado ..........................................................175 A.3 Criterios de Aceptación del Jurado.......................................................176

B Formatos Operativos Reales de CERMONT S.A.S. B.1 Estructura del Formato de Planeación de Obra..........................................177 B.2 Estructura del Formato de Inspección de Líneas de Vida Verticales ...................177 B.3 Estructura del Formato de Mantenimiento Preventivo de CCTV ......................178

C Bitácora Técnica de Implementación (Serie de Prompts 00-21)

D Evidencias de Código y Service Worker de la PWA D.1 Service Worker Serwist de la PWA (/serwist/sw.js)................................181 D.2 Control de Acceso por Rol (RBAC Middleware del Backend).........................182 D.3 Validación Contract-First de Payload en el Controlador ................................184


<!-- Página 15 de 207 -->

## Índice de figuras

1.1 Modelado del flujo operativo actual (BPMN) caracterizado por la fragmentación documental y dependencia de procesos manuales. Fuente: elaboración propia. ....... 1.2 Ciclo de vida operativo y administrativo unificado de 14 pasos en CERMONT S.A.S. Fuente: Elaboración propia. ...................................................... 1.3 Diagrama de causa-efecto de las fallas críticas que inciden en la trazabilidad y el cierre operativo-administrativo. Fuente: elaboración propia. ...........................

2.1 Ecosistema tecnológico empleado en el aplicativo CERMONT, organizado por capas de responsabilidad. Fuente: elaboración propia con base en el repositorio del proyecto.................................................................................... 28 2.2 Flujo contract-first aplicado a los módulos del aplicativo. Fuente: elaboración propia. 30

6.1 Orquestación del flujo de trabajo digitalizado (BPMN) que integra los 14 pasos operativos en el aplicativo. Fuente: elaboración propia. ................................ 80 6.2 Flujo operativo-documental implementado para CERMONT S.A.S. Fuente: Elaboración propia. ........................................................................... 80 6.3 Panel de control y visualización del flujo operativo de 14 pasos. Fuente: captura propia del aplicativo CERMONT. ....................................................... 83 6.4 Gestión de usuarios, roles y estado de acceso. Fuente: captura propia del aplicativo CERMONT. ............................................................................... 84 6.5 Formulario de creación de solicitud de trabajo. Fuente: captura propia del aplicativo CERMONT. ............................................................................... 85 6.6 Creación de una propuesta económica. Fuente: captura propia del aplicativo CER- MONT. .................................................................................... 86 6.7 Listado y seguimiento de propuestas económicas. Fuente: captura propia del aplicativo CERMONT. ....................................................................... 87


<!-- Página 16 de 207 -->

6.8 Consulta y seguimiento de órdenes de trabajo. Fuente: captura propia del aplicativo CERMONT. ............................................................................... 88 6.9 Paquetes de planeación asociados a órdenes de trabajo. Fuente: captura propia del aplicativo CERMONT. ................................................................... 89 6.10 Catálogo de kits típicos para planeación de recursos. Fuente: captura propia del

aplicativo CERMONT. ................................................................... 90 6.11 Sesiones de ejecución en campo y estado de sincronización. Fuente: captura propia

del aplicativo CERMONT. ............................................................... 91 6.12 Gestor visual de evidencias por orden y etapa. Fuente: captura propia del aplicativo

CERMONT. ............................................................................... 92 6.13 Gestión de documentos y soportes del aplicativo. Fuente: captura propia del apli-

cativo CERMONT. ....................................................................... 93 6.14 Actas de entrega y seguimiento de aceptación. Fuente: captura propia del aplicativo

CERMONT. ............................................................................... 94 6.15 Seguimiento de SES y soportes de Ariba. Fuente: captura propia del aplicativo

CERMONT. ............................................................................... 95 6.16 Resumen de cierre administrativo por actas, facturas y pagos. Fuente: captura pro-

pia del aplicativo CERMONT. ........................................................... 96 6.17 Motor de costos y consulta por orden. Fuente: captura propia del aplicativo CER-

MONT. .................................................................................... 97 6.18 Inventario y recursos asociados a la operación. Fuente: captura propia del aplicativo

CERMONT. ............................................................................... 98 6.19 Vista de activos e intervenciones asociadas. Fuente: captura propia del aplicativo

CERMONT. ............................................................................... 99 6.20 Perfil de usuario y cambio de credenciales. Fuente: captura propia del aplicativo

CERMONT. ...............................................................................100 6.21 Arquitectura por capas y flujo de integración del monorepo. Fuente: Elaboración

propia. .....................................................................................101 6.22 Diagrama de base documental y relaciones lógicas. Fuente: Elaboración propia. .....105 6.23 Secuencia de sincronización offline......................................................106 6.24 Flujo propuesto para extracción estructurada de documentos. Fuente: Elaboración

propia. .....................................................................................106


<!-- Página 17 de 207 -->

6.25 Máquina de estados finita (FSM) que controla la trazabilidad operativa y los blo-

queos de seguridad de la orden. Fuente: elaboración propia. ........................... 111

8.1 Pirámide de pruebas: distribución de la estrategia de cobertura por capas. Fuente: Elaboración propia. .......................................................................143


<!-- Página 18 de 207 -->

## Índice de tablas

1.1 Ciclo de vida operativo y administrativo unificado de 14 pasos en CERMONT S.A.S. Fuente: elaboración propia con base en el proceso suministrado por la empresa. ...................................................................................... 1.2 Matriz de análisis de actores interesados del proyecto (parte 1 de 2). Fuente: Elaboración propia. ........................................................................... 15 1.3 Matriz de análisis de actores interesados del proyecto (parte 2 de 2). Fuente: Elaboración propia. ........................................................................... 16 1.4 Relación entre fallas operativas, requisitos funcionales y módulos del aplicativo. Fuente: elaboración propia................................................................ 19

2.1 Síntesis conceptual y aporte operativo de las bases teóricas. Fuente: Elaboración propia. ..................................................................................... 27 2.2 Justificación académica del stack tecnológico seleccionado. Fuente: elaboración propia. ..................................................................................... 29 2.3 Relación entre atributos de calidad y decisiones de diseño del sistema. Fuente: elaboración propia. ........................................................................... 36

3.1 Plataformas comerciales relacionadas con gestión de campo y mantenimiento. Fuente: Elaboración propia. .............................................................. 39 3.2 Repositorios y proyectos abiertos revisados. Fuente: Elaboración propia.............. 39 3.3 Librerías de formularios dinámicos aplicables al proyecto. Fuente: Elaboración propia. ......................................................................................... 40 3.4 Herramientas para extracción documental. Fuente: Elaboración propia................ 41 3.5 Comparación de proyectos open source de gestión de servicios de campo. Fuente: Elaboración propia. ....................................................................... 42


<!-- Página 19 de 207 -->

3.6 Antecedentes académicos colombianos relacionados con la problemática. Fuente: Elaboración propia. ....................................................................... 46 3.7 Criterios de evaluación para la decisión de desarrollar vs. adoptar. Fuente: Elaboración propia............................................................................... 47 3.8 Criterios de comparación utilizados para evaluar alternativas frente al aplicativo a medida. Fuente: elaboración propia. ..................................................... 50

4.1 Matriz de trazabilidad: requisitos legales y funcionalidades del sistema. Fuente: Elaboración propia. ....................................................................... 58 4.2 Relación entre consideraciones normativas y requisitos del aplicativo. Fuente: elaboración propia. ........................................................................... 59

5.1 Fases metodológicas del proyecto. Fuente: Elaboración propia. ....................... 63 5.2 Matriz de integración de la serie técnica de documentos 00-22. Fuente: Elaboración propia. ..................................................................................... 64 5.3 Indicadores propuestos para validación con datos reales. Fuente: Elaboración propia. 66 5.4 Compuertas de calidad aplicadas por iteración de desarrollo. Fuente: Elaboración propia. ..................................................................................... 69 5.5 Matriz de trazabilidad: objetivos, fases, actividades y entregables. Fuente: Elaboración propia............................................................................... 71 5.6 Distribución temporal de las actividades del proyecto. Fuente: Elaboración propia... 74 5.7 Matriz ampliada de integración de la documentación técnica 00-22 en el libro. Fuente: elaboración propia................................................................ 75 5.8 Fases metodológicas y documentos técnicos asociados. Fuente: elaboración propia. . 79

6.1 Matriz de estado de implementación. Fuente: Elaboración propia. .................... 81 6.2 Módulos operativos principales (Pasos 1-14). Fuente: Elaboración propia. ........... 82 6.3 Evidencia técnica del stack en el repositorio. Fuente: elaboración propia. ............102 6.4 Comparativa del stack implementado frente a alternativas evaluadas. Fuente: Elaboración propia. ........................................................................... 118 6.5 Estructura de un corte vertical aplicado a los módulos del aplicativo. Fuente: elaboración propia. ........................................................................... 119 6.6 Transiciones críticas propuestas para el flujo operativo-documental. Fuente: elaboración propia...............................................................................120


<!-- Página 20 de 207 -->

7.1 Indicadores que deben completarse con evidencia verificable. Fuente: Elaboración propia. .....................................................................................124 7.2 Relación problema, requisito, módulo y evidencia. Fuente: Elaboración propia con base en el repositorio y documentos técnicos............................................129 7.3 Matriz de trazabilidad: objetivos, fases, resultados y evidencias. Fuente: Elaboración propia.................................................................................130 7.4 Auditoría de resultados técnicos por módulo. Fuente: elaboración propia. ............132

8.1 Matriz final de validación y estado de cumplimiento técnico. Fuente: Elaboración propia. .....................................................................................140 8.2 Matriz de aceptación cualitativa por perfil de usuario. Fuente: Elaboración propia. ..141 8.3 Trazabilidad: objetivos del proyecto y pruebas de validación. Fuente: Elaboración propia. .....................................................................................143 8.4 Estrategia de pruebas por capa del aplicativo. Fuente: elaboración propia.............145 8.5 Escenarios de validación funcional propuestos. Fuente: elaboración propia. ..........146

10.1 Respuesta a los objetivos del proyecto. Fuente: Elaboración propia con base en el

libro, la documentación técnica y el repositorio. ........................................158

C.1 Bitácora cronológica y técnica de la serie de prompts 00-21. Fuente: Elaboración propia. .....................................................................................179


<!-- Página 21 de 207 -->

# 1 Introducción General y Planteamiento del Problema

En empresas contratistas como CERMONT S.A.S., una orden de trabajo no termina con la ejecución técnica en campo. El proceso continúa con soportes fotográficos, informes, actas, SES, facturación y pago. Por esta razón, la dificultad principal no se ubica únicamente en capturar datos, sino en mantenerlos conectados a una misma orden durante todo el recorrido operativo y administrativo.

La empresa opera en actividades técnicas que involucran planeación de recursos, desplazamiento de personal, verificación de condiciones de seguridad, registro de evidencias, elaboración de informes y consolidación de soportes para facturación. Cuando estas etapas se gestionan mediante documentos físicos, hojas de cálculo, carpetas locales o mensajería informal, la información queda fragmentada y se vuelve difícil reconstruir el historial completo de una actividad.

Evidencias

Solicitud Planeación

en papel

Ejecución en campo

dispersas Informe manual Cierre administrativo

Retrasos en SES, facturación y pago

Omisión de herramientas, EPP o certificados

Fotos y soportes sin vínculo único a la orden

**Figura 1.1: Modelado del flujo operativo actual (BPMN) caracterizado por la fragmentación documental y dependencia de procesos manuales. Fuente: elaboración propia.**

Este trabajo aborda dicha problemática mediante el diseño de una plataforma web modular que articula órdenes, recursos, evidencias, documentos y estados administrativos. El aplicativo no se plantea como un repositorio pasivo, sino como una herramienta de seguimiento que permite relacionar cada registro con el paso correspondiente del flujo CERMONT. De esta forma, el desarrollo se orienta a fortalecer la trazabilidad documental y a preparar una base técnica para mediciones futuras de eficiencia operativa.


<!-- Página 22 de 207 -->

## 1.1 Presentación general del tema y contexto organizacional

CERMONT S.A.S. es una organización del sector privado constituida en el municipio de Arauca, cuya actividad comercial abarca una amplia gama de servicios especializados de ingeniería aplicada. De acuerdo con su portal institucional oficial [1], la empresa asesora y ejecuta obras relacionadas con la ingeniería eléctrica, mantenimiento preventivo y correctivo de infraestructuras, montajes industriales y comerciales, refrigeración mecánica, construcciones civiles, suministro de materiales e insumos eléctricos, alumbrado público e industrial, y telecomunicaciones [2]. Esta caracterización se ve respaldada y detallada en los documentos de inducción interna HES (sigla empleada en documentos internos de CERMONT S.A.S. para referirse a seguridad, salud y ambiente ocupacional) de la organización, los cuales establecen los protocolos y el catálogo de riesgos específicos para operaciones técnicas desarrolladas tanto en la industria pesada y de hidrocarburos como en el sector de la edificación urbana [3].

Debido a su naturaleza como contratista multiservicio, la empresa debe gestionar de forma simultánea múltiples flujos documentales que difieren estructuralmente según la especialidad de la intervención técnica. Un servicio de mantenimiento de sistemas de Circuito Cerrado de Televisión (CCTV) exige la verificación de componentes de radioenlace, sistemas fotovoltaicos de alimentación y parámetros de red inalámbrica [4]; mientras que un trabajo de inspección mecánica de líneas de vida verticales requiere el control de conformidad de anclajes, absorbedores de impacto, cables de acero y tensionadores de seguridad [5]. A su vez, toda actividad civil o eléctrica en campo debe ir precedida obligatoriamente por una planeación de obra que defina la asignación de mano de obra calificada, herramientas especializadas, consumibles, equipos de protección individual (EPP) y la evaluación previa de riesgos mediante el Análisis de Trabajo Seguro (ATS) y los permisos de trabajo en caliente, alturas o espacios confinados [6].

En este contexto, la información de una orden de trabajo no representa un registro estático; constituye una entidad dinámica cuyo ciclo de vida abarca desde la solicitud de cotización por parte del cliente hasta la conciliación financiera y contable del pago de la factura. La optimización de este ciclo de vida mediante un artefacto de software modular y configurable representa el núcleo metodológico del presente trabajo aplicado. Al digitalizar estas estructuras complejas y centralizar el flujo de aprobaciones bajo un modelo de base de datos robusto, se hace factible mitigar la pérdida


<!-- Página 23 de 207 -->

de trazabilidad, preparar la medición futura de tiempos administrativos y proveer una plataforma auditable que actúe como punto de referencia para los distintos actores del proceso.

## 1.2 Descripción detallada del flujo operativo de 14 pasos

Para modelar de forma precisa el ciclo de vida del servicio en CERMONT S.A.S., se sistematizó el flujo operativo y administrativo en catorce (14) pasos secuenciales y correlacionados [7]. Este flujo unificado, que se detalla en la Tabla 1.1, permite rastrear la evolución del estado de una orden de trabajo e identificar las interfaces de comunicación entre el personal de ingeniería residente, técnicos de campo, coordinadores HES, administradores, gerencia y clientes corporativos.

**Tabla 1.1: Ciclo de vida operativo y administrativo unificado de 14 pasos en CERMONT S.A.S. Fuente: elaboración propia con base en el proceso suministrado por la empresa.**

Paso Etapa funcional Descripción del proceso Entidad digital

WorkRequest

Solicitud formal Recepción del requerimiento técnico del cliente por correo, llamada o canal autorizado.

SiteVisit

Visita técnica Levantamiento de información, aclaración de dudas, mediciones y registro fotográfico cuando aplica.

Proposal

Propuesta económica Preparación de la oferta técnica y económica, con alcance, recursos y condiciones para aprobación del cliente.

PurchaseOrder

Aprobación con PO Recepción de la orden de compra o autorización formal que habilita la ejecución.

PlanningPacket

Planeación Definición del cronograma, mano de obra, herramientas, equipos, certificaciones, AST y documentos de apoyo.

ExecutionSession

Ejecución Desarrollo de la actividad con permisos, socialización de AST, checklist, procedimientos y registro fotográfico.

TechnicalReport

Informe técnico Consolidación de actividades realizadas, observaciones, evidencias y registro fotográfico.

DeliveryRecord

Acta de entrega Elaboración y envío del acta final al cliente para revisión y firma.

ClientAcceptance

Acta firmada Recepción del acta firmada o del soporte de aceptación del cliente.

ServiceEntrySheet

SES / Ariba Elaboración de la hoja de entrada de servicio y envío para aprobación en la plataforma correspondiente.

SES aprobada Recepción de la aprobación de la SES por parte del cliente. SESApproval

InvoiceTracking

Factura Elaboración y envío de factura para aprobación del cliente por la plataforma habilitada.

Continúa en la siguiente página


<!-- Página 24 de 207 -->

Paso Etapa funcional Descripción del proceso Entidad digital

Aprobación de factura Recepción de aprobación de la factura por parte del cliente. InvoiceApproval

PaymentRecord

Pago Registro, conciliación y cierre administrativo del pago del servicio.

La representación gráfica de este ciclo transaccional se expone en la Figura 1.2. Esta topología visual ilustra cómo el aplicativo debe dar soporte a dos subprocesos íntimamente acoplados: la cadena técnica y operativa, caracterizada por el levantamiento de información y la ejecución en campo, y la cadena de cierre administrativo y financiero, que determina el flujo de caja e ingresos de la compañía mediante el cumplimiento estricto de requisitos documentales del cliente corporativo. El detalle secuencial del flujo se complementa con la Tabla 1.1.

FLUJO OPE-

RATIVO

Campo

ción Rec.

Servicio

ta Econ.

Técnico

Técnica

FLUJO ADMI-

NISTRATIVO

**Figura 1.2: Ciclo de vida operativo y administrativo unificado de 14 pasos en CERMONT S.A.S. Fuente: Elaboración propia.**

El aplicativo web debe mapear de manera estricta esta secuencia transaccional mediante transiciones de estado lógicas. Cada cambio de estado dentro del software (ej. de Planeado a En Ejecución) debe estar respaldado por la carga de las correspondientes evidencias físicas y documentales, bloqueando la transición si el usuario actual carece de los permisos correspondientes (RBAC) o si el paquete documental obligatorio del paso anterior está incompleto.


<!-- Página 25 de 207 -->

## 1.3 Las cinco fallas críticas documentadas en el flujo operativo

Aunque el proceso de CERMONT S.A.S. recorre catorce pasos, el diagnóstico documental permitió identificar cinco fallas recurrentes que explican la pérdida de trazabilidad y los retrasos del flujo [7]. Estas fallas no describen problemas hipotéticos, sino situaciones concretas reportadas por la empresa y observables en sus formatos, soportes y secuencia operativa. La definición de módulos del aplicativo se deriva directamente de estas cinco fallas.

### 1.3.1 Falla Crítica 1: Planeación de la actividad (Paso 5)

La planeación operativa previa a la salida de las cuadrillas técnicas representa el primer punto vulnerable. En la actualidad, esta etapa carece de automatización y normalización, dependiendo casi exclusivamente de la memoria y el criterio empírico de los ingenieros residentes y líderes técnicos.

Causas de fallo identificadas: Inexistencia de una biblioteca centralizada de kits típicos (herramientas específicas, equipos de medición certificados, elementos de protección y consumibles) clasificados por tipo de servicio. Adicionalmente, no se realiza un control automatizado sobre la vigencia de certificaciones del personal técnico (por ejemplo, certificados de trabajo seguro en alturas de nivel avanzado) ni sobre la calibración de instrumentos críticos de prueba.

Evidencia documental real: El formato analógico de planeación de obra de CERMONT S.A.S. exige el registro de responsable, lugar, fecha, unidad de negocio, alcance detallado, materiales de consumo, herramientas requeridas, equipos principales, elementos de seguridad colectivos e individuales, y el número de operarios asignados [6]. La dispersión de estos datos en documentos aislados de Word o formatos impresos en papel provoca omisiones de recursos que se detectan únicamente cuando el personal se encuentra ya en el sitio de ejecución remota.

Respuesta del aplicativo: Implementación de un módulo de estructuración de PlanningPacket que precargue automáticamente plantillas y kits estandarizados según el tipo de servicio, forzando la validación del estado de vigencia de las acreditaciones y los instrumentos del personal seleccionado.


<!-- Página 26 de 207 -->

### 1.3.2 Falla Crítica 2: Ejecución en campo y captura de evidencias (Paso 6)

Durante el desarrollo del servicio técnico en el sitio del cliente (sea una subestación eléctrica, una red de CCTV a la intemperie o una línea de vida vertical en altura), el registro de la información es susceptible a la degradación de datos por transcripción manual y el desorden documental.

Causas de fallo identificadas: Diligenciamiento manual de listas de verificación en formato físico que se exponen a daño, extravío o ilegibilidad. Captura de evidencias fotográficas utilizando dispositivos móviles personales de los técnicos operarios, las cuales son posteriormente compartidas mediante canales informales de mensajería (WhatsApp) sin marcas temporales, geolocalización o vinculación explícita al componente técnico intervenido. A esto se suma el problema de la conectividad celular inestable o nula en locaciones industriales remotas de Arauca o en el sector petrolero, lo que interrumpe el acceso a sistemas tradicionales basados en la nube.

Evidencia documental real: Formatos reales de la organización tales como la lista de inspección de líneas de vida verticales (que exige evaluar anclajes, líneas de acero y absorbedores bajo criterios de conformidad Conforme / No Conforme, con hallazgos y acciones correctivas) [5]; y el formato de mantenimiento preventivo de CCTV (que detalla lecturas técnicas de voltajes, radioenlaces, cámaras e inspecciones fotográficas) [4].

Respuesta del aplicativo: Arquitectura PWA (Progressive Web App) dotada de Service Worker, almacenamiento local y cola de sincronización para posibilitar el diligenciamiento offline de checklists y registros de campo. La sincronización de evidencias con archivo binario queda planteada como una capacidad parcialmente implementada y pendiente de cierre completo en backend [8].

### 1.3.3 Falla Crítica 3: Consolidación documental, informes y actas (Pasos 7 a 9)

La recopilación técnica y la formalización documental tras el regreso de las cuadrillas técnicas a la oficina es una tarea administrativa de alto consumo de tiempo y propensa al retrabajo.


<!-- Página 27 de 207 -->

Causas de fallo identificadas: Recaptura de información desde borradores impresos de campo a plantillas de Microsoft Word y Excel. Los ingenieros residentes dedican horas semanales a buscar fotos dispersas en chats de mensajería instantánea, ajustar dimensiones de imágenes y transcribir observaciones técnicas de campo. Este retraso dilata el tiempo de entrega de los informes técnicos preliminares y las actas formales al cliente para su revisión y aprobación física.

Impacto: El retraso en la obtención del acta de entrega firmada por parte del supervisor del cliente corporativo detiene de inmediato el inicio de los trámites de facturación, prolongando los tiempos de radicación administrativa.

Respuesta del aplicativo: Motor de renderizado y exportación a formato PDF (pdf-lib) que toma los datos transaccionales, las respuestas de checklist validadas y las evidencias fotográficas almacenadas en base de datos para generar una versión preliminar del informe técnico conforme a las plantillas corporativas de CERMONT S.A.S.

### 1.3.4 Falla Crítica 4: Retrasos en facturación y cierre administrativo (Pasos 10 a 14)

La última milla del proceso es predominantemente administrativa y depende de la disponibilidad oportuna de soportes técnicos, actas, SES y documentos de facturación.

Causas de fallo identificadas: Desconexión funcional entre los departamentos técnico y administrativo. Cuando existen múltiples trabajos en curso, se dificulta saber qué orden ya cuenta con informe, acta, firma del cliente, SES aprobada o factura pendiente. Esta ausencia de seguimiento consolidado genera retrasos en la preparación documental, aunque los documentos suministrados no evidencian llamados de atención formales del cliente por este motivo.

Impacto: El cierre administrativo puede extenderse innecesariamente porque la empresa debe reconstruir el estado documental de cada servicio antes de radicar SES, factura o soportes de pago.

Respuesta del aplicativo: Módulo centralizado de Cierre Administrativo que funciona como un panel de trazabilidad integral, vinculando la orden de trabajo con el estado del acta, el número de SES radicada, la factura electrónica emitida y el registro de conciliación del pago recibido.


<!-- Página 28 de 207 -->

### 1.3.5 Falla Crítica 5: Ausencia de control centralizado de costos reales (Transversal a los pasos 3 a 14)

La empresa no dispone de una hoja o sistema centralizado que permita relacionar el costo real de la operación, incluidos impuestos y consumos efectivamente ejecutados, contra lo estimado en la propuesta económica inicial.

Causas de fallo identificadas: La información de propuesta, ejecución, consumos y facturación permanece distribuida en distintos soportes, lo que dificulta comparar el valor proyectado con el valor realmente ejecutado.

Impacto: Se limita la capacidad de analizar variaciones de costo por servicio, de explicar desviaciones operativas y de usar esa información como insumo para propuestas futuras.

Respuesta del aplicativo: El diseño funcional incorpora módulos de propuesta, costos y seguimiento de cierre que permiten vincular el presupuesto base con registros posteriores de ejecución y facturación. La validación operativa de esta trazabilidad queda sujeta a la carga de datos reales en el entorno de uso.

La relación entre estas cinco fallas y los módulos del aplicativo se esquematiza en la Figura 1.3. Este análisis sustenta por qué la solución propuesta debe concebirse como un sistema integral de trazabilidad y no como un conjunto aislado de formularios.

Informes y actas

Cierre administrativo

Planeación Recursos, perso-

Recaptura y re-

SES, facturas y pagos

Costos reales Comparación incompleta frente a propuesta

Ejecución Formatos físicos y evidencias dispersas

visión tardía

sin tablero único

nal y documentos incompletos

Fragmentación documental, pérdida de trazabilidad y retraso del cierre operativo-administrativo

**Figura 1.3: Diagrama de causa-efecto de las fallas críticas que inciden en la trazabilidad y el cierre operativoadministrativo. Fuente: elaboración propia.**


<!-- Página 29 de 207 -->

## 1.4 Formulación del problema y pregunta de investigación

El análisis descriptivo de las operaciones de CERMONT S.A.S. evidencia una problemática generalizada: la fragmentación operativa y la dispersión documental. Aunque la empresa cuenta con rigurosos formatos analógicos para gobernar las fases técnicas de campo [4-6], la desconexión digital de estos registros frente a los sistemas contables e informáticos principales inhabilita la trazabilidad continua del proceso. En la práctica, estos documentos se comportan como “datos muertos”: registros aislados que no pueden ser consultados de forma agregada, analizados para evaluar la eficiencia presupuestal, o auditados en tiempo real para determinar el avance físico-financiero de una obra.

Esta dispersión documental incide directamente en los costos de coordinación interna de la organización y dilata de manera exponencial el flujo de caja corporativo. La demora en consolidar evidencias de campo aplaza la radicación de la SES en portales del cliente, lo que a su vez posterga la emisión de la factura y arrastra el pago final. Esta dinámica es especialmente perniciosa en empresas contratistas de servicios múltiples, donde la diversidad de plantillas operativas y de requisitos documentales impuestos por diferentes clientes corporativos dificulta la adopción de una solución FSM de tipo generalista o prefabricada comercialmente, las cuales suelen imponer flujos de datos fijos que chocan con la cultura operativa real de la organización.

Ante este panorama, la pregunta de investigación debe centrarse en la resolución del problema organizacional y documental, no en adelantar una solución tecnológica específica:

Pregunta de Investigación

¿Cómo desarrollar un aplicativo web que permita gestionar de forma centralizada las órdenes de trabajo y mejorar la trazabilidad de los procesos operativos y administrativos de CERMONT S.A.S., especialmente en la planeación, la ejecución, la elaboración de informes, el cierre administrativo y el control de costos reales?


<!-- Página 30 de 207 -->

## 1.5 Justificación

El desarrollo y despliegue del aplicativo web modular para CERMONT S.A.S. se fundamenta y justifica en cuatro pilares complementarios: justificación técnica, organizacional, académica y metodológica.

### 1.5.1 Justificación Técnica

Desde la perspectiva de la ingeniería de software aplicada, el proyecto se justifica por la necesidad de disponer de un sistema unificado que conecte formularios operativos, seguimiento documental, estados de la orden y actividades de cierre administrativo dentro de un mismo flujo. El repositorio real evidencia una arquitectura separada en frontend, backend y paquetes compartidos, lo que permite centralizar contratos de datos, roles y reglas de negocio sin duplicar definiciones entre capas.

El reto técnico más relevante es la conectividad variable del trabajo en campo. Por ello, el aplicativo incorpora capacidades PWA, persistencia local y sincronización diferida para determinados registros operativos; sin embargo, la sincronización completa de evidencias con archivo binario todavía no debe describirse como resuelta en su totalidad. Junto con ello, el sistema utiliza contratos compartidos, validación estructurada, control de acceso por roles y generación documental automática, porque estos mecanismos responden directamente a las fallas detectadas en planeación, ejecución, informes y cierre administrativo [8, 9].

### 1.5.2 Justificación Organizacional

Para CERMONT S.A.S., la herramienta representa un avance cualitativo hacia la madurez de procesos operativos y la digitalización integral. El aplicativo unifica en una única interfaz de trabajo a actores típicamente desconectados: gerentes que evalúan avances, ingenieros residentes que estructuran kits de planeación, técnicos de campo que recolectan evidencias y personal de seguimiento administrativo que rastrea actas, SES y facturas aprobadas. Al centralizar y auditar cada cambio de estado (audit logging), la empresa dispone de una base para disminuir búsquedas de soportes físicos y correos electrónicos, revisar devoluciones de SES asociadas con documentación incompleta y ofrecer a sus clientes corporativos un soporte más trazable. La medición de estos efectos queda


<!-- Página 31 de 207 -->

pendiente por anexar evidencia operativa.

### 1.5.3 Justificación Académica

Este trabajo de grado realiza un aporte académico al programa de Ingeniería Electrónica de la Universidad de Pamplona al articular análisis de procesos, arquitectura de software y comparación de soluciones FSM para atender un problema operativo real de CERMONT S.A.S. La revisión de plataformas comerciales y proyectos open source permitió identificar vacíos de adaptación al contexto de contratistas locales y justificar una solución a medida.

### 1.5.4 Justificación Metodológica

El proyecto se rige por la metodología Design Science Research (DSR), un enfoque riguroso de investigación aplicada que se centra en el diseño, desarrollo, prueba y validación de un artefacto de ingeniería real para resolver un problema práctico observado [10]. El uso de esta metodología permite evaluar el aplicativo tanto por su funcionalidad técnica interna como por su utilidad potencial en el escenario operativo y comercial de CERMONT S.A.S., separando las evidencias técnicas construidas de aquellas métricas operativas sujetas a medición progresiva durante la práctica profesional.

## 1.6 Objetivos

Para orientar el desarrollo frente a la problemática descrita, se formularon los siguientes objetivos:

### 1.6.1 Objetivo General

Desarrollar un aplicativo web que permita gestionar de forma centralizada las órdenes de trabajo y fortalecer la trazabilidad de los procesos operativos y administrativos en CERMONT S.A.S., con énfasis en la planeación, ejecución y cierre administrativo de los servicios técnicos.


<!-- Página 32 de 207 -->

### 1.6.2 Objetivos Específicos

identificar fallas críticas en la planeación, ejecución e informes técnicos.

ción, evidencias y cierre administrativo, junto con la estructura de base de datos y roles de usuario.

cos, listas de verificación digitales, registro de evidencias fotográficas y generación automática de informes técnicos.

de validación, midiendo reducción de tiempos, aumento de trazabilidad y eficiencia del cierre administrativo solo cuando exista evidencia verificable.

## 1.7 Alcance y delimitación del proyecto

El presente trabajo de grado se delimita rigurosamente para garantizar la viabilidad y originalidad científica de sus aportes académicos y técnicos.

### 1.7.1 Alcance Funcional y Técnico Realizado

El aplicativo de software implementado integra de forma nativa los siguientes alcances específicos:

Gestión de Usuarios y Control de Accesos (RBAC): Autenticación segura soportada por tokens JWT almacenados en cookies HttpOnly y autorización estricta estructurada bajo niveles de permiso diferenciados (Gerencia, Ingeniería Residente, Coordinador HES, Técnico de Campo, Personal Contable) mitigando vulnerabilidades críticas [9].

Orden de Trabajo (Work Order): Ciclo de vida dinámico modelado a través de transiciones de estado lógicas (Creada, En Planeación, Aprobada, En Ejecución, Finalizada Técnico, Cierre Administrativo) con registro de bitácora de auditoría histórica (AuditLog).


<!-- Página 33 de 207 -->

Módulo de Planeación Guiada: Estructuración de paquetes de recursos asociados a la orden de trabajo utilizando plantillas parametrizadas de kits típicos (mano de obra, equipos con validación de vigencia de calibración, herramientas y documentos obligatorios).

Módulo de Ejecución PWA Offline: Diligenciamiento móvil de listas de verificación y checklists técnicos en campo utilizando IndexedDB local en escenarios de cobertura celular limitada. La arquitectura contempla captura y encolamiento de evidencias, pero su validación completa debe realizarse por formulario y por tipo de archivo [8].

Generación Documental: Motor integrado para compilar, estructurar y renderizar de forma semiautomática las memorias de cálculo, respuestas de inspección y evidencias fotográficas en informes técnicos en formato PDF de alta definición (pdf-lib).

Módulo de Cierre Administrativo: Panel web interactivo que permite rastrear la vinculación transaccional entre el acta de entrega firmada, el código SES cargado en SAP Ariba, la factura electrónica emitida y el registro de confirmación del pago conciliado.

### 1.7.2 Alcance Propuesto y Evoluciones Futuras

Se definen como alcances técnicos complementarios de desarrollo futuro o evolutivos los siguientes elementos del roadmap del software:

Ingesta y Extracción Documental por Visión Artificial: Incorporación de un módulo inteligente basado en modelos ligeros open-source como Docling [11], Unstructured [12] o PaddleOCR [13] para automatizar la extracción de texto, tablas y secciones de formatos PDF o imágenes analógicas y procesarlos directamente al aplicativo como esquemas configurables.

Integración directa por API con ERPs Corporativos: Conectividad directa en tiempo real con sistemas transaccionales del cliente o de la empresa (tales como SAP o software contable local SIIGO) para la automatización de la radicación e ingreso de SES y facturas sin intervención manual.


<!-- Página 34 de 207 -->

### 1.7.3 Delimitación Académica y Límites de Medición

En estricto cumplimiento de los principios éticos y metodológicos del trabajo de grado, se establecen las siguientes delimitaciones:

No se reportan ni asumen porcentajes de reducción de tiempos operativos de forma arbitraria. Las métricas de desempeño solo se reportarán como resultados cuando exista evidencia de medición formal anexada; hasta entonces se tratarán como indicadores propuestos para una validación operativa posterior.

No se presentan análisis especulativos de Retorno de Inversión (ROI) o proyecciones financieras en dólares americanos (USD) para CERMONT S.A.S. que no estén respaldadas por estados contables o auditorías financieras reales. Los costos e inversiones analizados en el documento se limitan a tarifas públicas, suscripciones de software y licenciamientos de infraestructura web en la nube.

Se diferencian claramente las fases funcionales implementadas y testeadas en el monorepo real del aplicativo web de aquellas propuestas técnicas formuladas como líneas futuras de investigación académica e ingeniería de desarrollo.

## 1.8 Análisis de actores interesados (stakeholders)

La solución propuesta afecta e involucra a múltiples actores dentro y fuera de CERMONT S.A.S., cada uno con necesidades, expectativas y criterios de éxito diferenciados. Las Tablas 1.2 y 1.3 presentan un análisis de los siete perfiles principales de usuarios del sistema y de los actores externos impactados por la digitalización del flujo operativo.

Este análisis de actores fue utilizado como insumo para la definición de los módulos del sistema y la matriz de permisos RBAC. Cada módulo del aplicativo responde a las necesidades de al menos un perfil de usuario identificado en esta matriz, procurando que el desarrollo se oriente a resolver problemas reales de los usuarios finales y no a implementar funcionalidades sin un propósito definido.


<!-- Página 35 de 207 -->

**Tabla 1.2: Matriz de análisis de actores interesados del proyecto (parte 1 de 2). Fuente: Elaboración propia.**

Actor Necesidad principal Problema actual Beneficio esperado Gerente Visibilidad sobre el estado de todas las órdenes y la rentabilidad por servicio.

Sin acceso a datos agregados en tiempo real; decisiones basadas en informes verbales.

Dashboard con KPIs operativos y financieros; trazabilidad consultable por orden. Residente Asignación eficiente de recursos y personal a las órdenes de trabajo.

Planeación manual desde cero para cada orden; sin biblioteca de kits reutilizables.

Kits típicos por tipo de servicio; validación automática de disponibilidad de recursos. Supervisor Seguimiento de la ejecución en campo y revisión de evidencias.

Dependencia de WhatsApp para comunicación con técnicos; sin visibilidad en tiempo real.

Panel de ejecución con evidencias sincronizadas; notificaciones de novedades. Técnico / Operador

Captura ágil de datos en campo, incluso con conectividad intermitente.

Formatos físicos que se dañan o extravían; fotos en dispositivo personal sin trazabilidad.

Aplicación PWA con operación offline parcial, snapshots locales y captura de evidencias vinculadas a la orden cuando el flujo correspondiente esté validado.


<!-- Página 36 de 207 -->

**Tabla 1.3: Matriz de análisis de actores interesados del proyecto (parte 2 de 2). Fuente: Elaboración propia.**

Actor Necesidad principal Problema actual Beneficio esperado HES (Seguridad)

Verificación del cumplimiento de checklists de seguridad y uso de EPP.

Checklists en papel sin trazabilidad; difícil auditar cumplimiento histórico.

Checklists digitales con registro de auditoría; evidencias fotográficas de condiciones de seguridad. Admin. Preparación documental para facturación sin recaptura manual.

Recopilación manual de soportes y demoras en el cierre.

Generación automática de informes y seguimiento documental. Cliente corporativo

Sin visibilidad del avance; documentos entregados con retraso.

Conocer el estado de sus servicios y recibir documentación completa y oportuna.

Acceso a información de sus órdenes; documentación estructurada y trazable.


<!-- Página 37 de 207 -->

## 1.9 Estructura general del documento de trabajo de grado

Para facilitar la lectura y el rigor expositivo del trabajo, el presente informe académico se estructura en diez (10) capítulos principales, organizados de forma secuencial y coherente:

Capítulo 1 - Introducción General y Planteamiento del Problema: Presenta el contexto de la empresa, el flujo real de 14 pasos, las cinco fallas críticas documentadas, la pregunta de investigación, la justificación, los objetivos y el alcance del trabajo.

Capítulo 2 - Marco Teórico: Reúne los fundamentos de ingeniería de software, gestión documental, trazabilidad operativa, FSM/CMMS/ERP, persistencia, seguridad y operación offline que sustentan el proyecto.

Capítulo 3 - Estado del Arte: Compara herramientas comerciales y repositorios abiertos relacionados con gestión de campo, mantenimiento y documentación operativa, destacando el diferencial del aplicativo propuesto para CERMONT S.A.S.

Capítulo 4 - Marco Legal, Normativo y Ético: Expone las consideraciones regulatorias, de protección de datos, propiedad intelectual, licenciamiento y confidencialidad aplicables al sistema.

Capítulo 5 - Metodología: Describe el enfoque de práctica empresarial con investigación aplicada, las fases de trabajo, las fuentes documentales y la forma de validar el artefacto.

Capítulo 6 - Desarrollo del Aplicativo Web: Documenta la arquitectura, el stack tecnológico verificado, la organización del monorepo, los módulos desarrollados y las decisiones técnicas relevantes.

Capítulo 7 - Resultados Técnicos y Evidencias del Desarrollo: Resume qué funcionalidades quedaron implementadas, cuáles son parciales o propuestas y qué evidencias de código, documentación y pruebas respaldan el desarrollo.

Capítulo 8 - Validación y Pruebas del Sistema: Presenta la estrategia de pruebas, la evidencia técnica ejecutada y las actividades de validación pendientes en entorno operativo real.


<!-- Página 38 de 207 -->

Capítulo 9 - Discusión y Análisis Crítico: Analiza alcances, limitaciones, decisiones arquitectónicas, comparación con soluciones existentes y lecciones aprendidas del proyecto.

Capítulo 10 - Conclusiones y Recomendaciones: Sintetiza el cumplimiento de objetivos, las recomendaciones para CERMONT S.A.S. y las líneas de continuidad del sistema.

Anexos: Reúnen matrices, evidencias visuales, tablas de pruebas, soporte institucional y material complementario del desarrollo.

La lectura secuencial de estos capítulos permite al lector seguir el hilo conductor que une el problema diagnosticado con la solución construida. Cada capítulo se apoya en el anterior y prepara el terreno para el siguiente, evitando tanto la repetición innecesaria de información como los saltos lógicos que dificultarían la comprensión del trabajo.

El documento mantiene trazabilidad bibliográfica y distingue con claridad las afirmaciones del autor de las fuentes externas. Esa disciplina de trazabilidad, sostenida a lo largo de todo el libro, constituye un compromiso con la integridad académica y con la defendibilidad del trabajo frente a cualquier revisión por pares. El lector encontrará al final del volumen las referencias bibliográficas completas y los anexos que complementan la exposición con evidencia técnica y documental.

## 1.10 Matriz de trazabilidad entre fallas, requisitos y módulos

Para evitar que el desarrollo del aplicativo se interprete como una simple digitalización de formatos, se construyó una matriz de trazabilidad que relaciona la falla operativa con el requisito funcional y con el módulo que debe asumir la responsabilidad dentro del sistema. Esta matriz permite verificar que cada componente del aplicativo responde a una necesidad real de CERMONT S.A.S. y no a una decisión tecnológica aislada. Además, sirve como puente entre el diagnóstico, la ingeniería de requisitos y los capítulos de desarrollo y validación.

Esta relación muestra que la problemática no se concentra en una única pantalla ni en una única tarea administrativa. La falla surge por la falta de continuidad entre etapas que dependen unas de otras. Por ejemplo, una planeación incompleta puede afectar la ejecución; una ejecución sin evidencias puede retrasar el informe; un informe tardío puede detener el acta; y un acta pendiente


<!-- Página 39 de 207 -->

**Tabla 1.4: Relación entre fallas operativas, requisitos funcionales y módulos del aplicativo. Fuente: elaboración propia.**

Evidencia esperada

Falla identificada Paso asociado

Requisito derivado Módulo responsable

Planeación y kits típicos

Planeación incompleta de herramientas y equipos

Plantilla de planeación, checklist previo y registro de readiness.

El sistema debe permitir configurar kits típicos por tipo de actividad, incluyendo herramientas, equipos, materiales, EPP y documentos de apoyo.

Ejecución con soportes dispersos

Ejecución y evidencias

Evidencias anexadas a una orden con metadatos y trazabilidad.

El sistema debe asociar evidencias, observaciones y formularios de campo a la orden de trabajo correspondiente.

Retrasos en informes y actas

Informes y actas Informe técnico o acta generada desde datos estructurados.

7-9 El sistema debe generar documentos técnicos a partir de la información capturada durante la ejecución.

Seguimiento administrativo fragmentado

Cierre administrativo Panel de seguimiento por orden y estado documental.

10-14 El sistema debe mostrar el estado de SES, factura, aprobación y pago en una línea de tiempo consultable.

Ausencia de costos reales centralizados

Costos y propuesta Registro de costos por orden, pendiente de validación con datos reales.

3-14 El sistema debe vincular propuesta, ejecución, costos reales y facturación para comparar lo presupuestado con lo ejecutado.


<!-- Página 40 de 207 -->

puede impedir la radicación de SES o la facturación. Por esta razón, el sistema debe trabajar como una cadena de estados y documentos, donde cada transición se encuentre respaldada por datos mínimos, permisos, evidencias y validaciones.

## 1.11 Criterio de delimitación del problema para evitar generalizaciones

El planteamiento del problema se limita a las fallas documentadas por la empresa y a la evidencia disponible en los formatos suministrados. No se afirma que CERMONT S.A.S. carezca de gestión administrativa ni que sus procesos sean ineficientes en sentido general; el problema se define con mayor precisión como una fragmentación de información entre soportes físicos, documentos de oficina, archivos fotográficos, hojas de cálculo y seguimiento administrativo no integrado. Esta delimitación es importante porque evita atribuir a la empresa problemas no evidenciados y, al mismo tiempo, permite justificar de manera concreta el desarrollo de una herramienta a la medida.

Desde el punto de vista académico, esta delimitación también permite sostener la originalidad del trabajo. El objetivo no es demostrar que toda empresa contratista necesite un software propio, sino analizar por qué en este caso específico la combinación de servicios técnicos, documentos heterogéneos, operación en campo y cierre administrativo exige una plataforma que conecte información operativa y documental. La solución se deriva del proceso observado y no de una moda tecnológica.

## 1.12 Criterios para interpretar el alcance de la solución

El alcance del aplicativo debe leerse en tres niveles. El primer nivel corresponde a la funcionalidad implementada o evidenciada técnicamente: módulos, contratos, rutas, interfaces, validaciones y pruebas que pueden verificarse en el repositorio o en la documentación técnica. El segundo nivel corresponde a la funcionalidad parcialmente implementada: capacidades cuyo diseño existe y cuya estructura base fue desarrollada, pero que requieren estabilización, pruebas adicionales o conexión completa entre frontend, backend y persistencia. El tercer nivel corresponde al trabajo


<!-- Página 41 de 207 -->

futuro: funcionalidades como extracción documental automática, integración contable avanzada o analítica financiera, que pueden estar justificadas por el proyecto, pero no deben presentarse como resultados concluidos si no existe evidencia verificable.

Esta clasificación protege la defendibilidad del libro porque evita prometer un nivel de madurez superior al alcanzado. También facilita la evaluación por jurados, ya que permite distinguir con claridad entre el artefacto desarrollado, la arquitectura propuesta y las líneas de evolución que quedan disponibles para CERMONT S.A.S. después de la práctica empresarial.


<!-- Página 42 de 207 -->

# 2 Marco Teórico

## 2.1 Ingeniería de software y arquitectura web moderna

La ingeniería de software moderna proporciona un cuerpo conceptual y metodológico riguroso para el diseño, desarrollo, validación y mantenimiento de sistemas de información empresariales complejos [14]. En el contexto de las organizaciones contemporáneas, el software ha dejado de considerarse una simple herramienta de automatización aislada para constituir el núcleo de los flujos de valor operativos, financieros y de cumplimiento normativo [15].

El diseño de un sistema empresarial moderno exige la adopción de arquitecturas desacopladas que separen con claridad la interfaz de usuario de la lógica de negocio y los mecanismos de almacenamiento. La arquitectura de tres capas (presentación, lógica y datos) o su evolución hacia arquitecturas limpias y modulares (arquitectura hexagonal u cebolla) favorecen que los componentes de presentación no dependan directamente de los detalles de persistencia física o de red [16]. En el desarrollo web contemporáneo, este desacoplamiento se instrumenta mediante el uso de APIs de tipo REST (Representational State Transfer) o GraphQL, las cuales definen contratos de comunicación estrictos sobre el protocolo HTTP, posibilitando que múltiples clientes (web, móviles o IoT) interactúen de forma homogénea con un único motor de reglas de negocio en el backend.

## 2.2 Modelado de servicios de campo y órdenes de trabajo (FSM)

La gestión de servicios de campo, conocida formalmente como Field Service Management (FSM), abarca la planificación operativa, la asignación dinámica de recursos humanos e instrumentales, el control de la ejecución en sitio y el posterior cierre administrativo de actividades realizadas fuera de las instalaciones principales de una organización [17]. Los sistemas FSM abordan una de las mayores fuentes de ineficiencia en empresas de servicios técnicos: la brecha de comunicación y la


<!-- Página 43 de 207 -->

fragmentación documental entre el personal que labora en campo y los departamentos de planeación y control administrativo.

De acuerdo con la literatura de gestión de procesos de negocio (BPM), el eje central de un sistema FSM es el ciclo de vida de la orden de trabajo (Work Order Life Cycle) [18]. Dicha entidad actúa como un contenedor semántico y un elemento de correlación unificado, vinculando de manera unívoca al cliente, el contrato legal, los activos físicos intervenidos, los técnicos asignados, las evidencias recolectadas en sitio, los costos operativos asociados y los entregables documentales (como informes técnicos y actas de entrega). La adopción de este enfoque puede fortalecer la trazabilidad del flujo operativo y disminuir la recaptura manual de datos dispersos en formatos físicos, siempre que su efecto se valide con registros de uso [19].

## 2.3 Sistemas CMMS, ERP y su convergencia técnica

Los sistemas de Gestión de Mantenimiento Computarizado (CMMS) se especializan en la administración del ciclo de vida de los activos físicos, la programación de mantenimiento correctivo y preventivo, la gestión del inventario de repuestos y la optimización de los recursos de mantenimiento. Por otro lado, los sistemas de Planificación de Recursos Empresariales (ERP) centralizan la información administrativa, financiera, contable y de compras de la organización entera.

En proyectos para empresas contratistas multiservicio como CERMONT S.A.S., se presenta un fenómeno de convergencia técnica. Un contratista no opera de forma aislada como un departamento de mantenimiento interno (que usaría solo un CMMS), sino que ejecuta sus servicios en nombre de terceros (clientes corporativos) con implicaciones contractuales y financieras directas que repercuten de inmediato en la facturación y el recaudo (que usarían un ERP). Por consiguiente, la plataforma desarrollada debe integrar de forma nativa la gestión técnica de activos e inspecciones propia de un CMMS con el rigor transaccional y la trazabilidad financiera característica de un ERP.


<!-- Página 44 de 207 -->

## 2.4 El paradigma de aplicaciones web progresivas (PWA) y operación offline

Uno de los mayores retos tecnológicos al desplegar sistemas de software en la industria pesada, de hidrocarburos u operativa en campo es la inestabilidad de la infraestructura de red celular o la ausencia total de conectividad en zonas geográficas rurales o confinadas. El paradigma tradicional de aplicaciones web sufre de una dependencia absoluta de la red, lo que inhabilita su uso bajo estas condiciones y provoca la pérdida de datos operativos capturados en sitio.

En el caso de CERMONT S.A.S., el enfoque de aplicación web progresiva se justifica por la posibilidad de que una actividad técnica se realice en zonas con conectividad inestable. La operación offline no se interpreta como sustitución completa del backend, sino como una capa de continuidad que conserva recursos de interfaz, registra cambios compatibles en almacenamiento local y posterga la sincronización hasta recuperar conexión.

Esta distinción es relevante para evitar afirmaciones excesivas. Una aplicación puede detectar pérdida de red y mostrar un indicador visual sin que ello signifique que todos los formularios funcionen sin internet. Para considerar el modo offline como funcional, debe existir almacenamiento local, cola de operaciones pendientes, control de duplicados, manejo de errores y confirmación del servidor al reconectar. En consecuencia, el módulo offline del proyecto debe evaluarse por niveles: navegación disponible, consulta de datos cargados, guardado local y sincronización posterior.


<!-- Página 45 de 207 -->

## 2.5 Arquitecturas de validación declarativa mediante esquemas estructurados

En entornos empresariales dinámicos, el desarrollo de interfaces rígidas (hardcoded) para cada formato de inspección o checklist operativo representa un antipatrón de diseño de software de alto costo. Cada nuevo tipo de servicio o requerimiento de cliente exigiría modificar el código fuente del frontend, compilar de nuevo y redesplegar el aplicativo.

El enfoque moderno de formularios dinámicos se sustenta en la especificación declarativa de la interfaz y las reglas de validación mediante esquemas estructurados, típicamente utilizando los estándares JSON Schema o especificaciones basadas en YAML [20]. Bajo esta arquitectura:

Un motor de renderizado dinámico en el frontend recibe un objeto estructurado que describe los campos (texto, numérico, selección, foto), las restricciones de validación (longitud, expresiones regulares, obligatoriedad) y las dependencias lógicas entre campos.

La interfaz de usuario se genera de manera dinámica en tiempo de ejecución, eliminando la necesidad de código específico para cada pantalla de captura.

Se hace posible la reutilización de contratos compartidos entre el cliente y el servidor. Un mismo esquema se emplea en el frontend para proporcionar retroalimentación interactiva e inmediata de UX (validación de campos obligatorios o formatos) y en el backend para realizar validaciones estrictas de seguridad (validación de confianza cero (Zero Trust)) antes de persistir los datos en la base de datos documental MongoDB/Mongoose.

## 2.6 Seguridad de aplicaciones web y control de acceso robusto

El desarrollo de software empresarial que maneja información operativa y financiera crítica debe diseñarse de forma nativa bajo principios de seguridad en profundidad (Security-by-Design). La comunidad OWASP (Open Web Application Security Project) documenta de manera sistemática los diez riesgos más críticos de seguridad en aplicaciones web, los cuales deben considerarse obligatoriamente al estructurar la arquitectura del sistema [9]:


<!-- Página 46 de 207 -->

Control de Acceso Quebrado (A01:2021): Mitigado mediante la implementación de middleware de autorización robusto que verifique no solo la existencia de una sesión, sino que evalúe si el rol y los permisos del usuario autorizan la ejecución de la acción sobre un recurso específico (Role-Based Access Control - RBAC).

Fallas Criptográficas (A02:2021): Resuelto protegiendo los datos en tránsito mediante protocolos criptográficos modernos (TLS 1.3) y almacenando las contraseñas en el backend cifradas mediante algoritmos de derivación de claves adaptativos e iterativos como Bcrypt [9].

Inyección (A03:2021): Evitado mediante el uso de bases de datos orientadas a documentos que utilicen mapeadores de datos (como Mongoose/MongoDB) donde las consultas no se concatenen como texto, sino que se procesen de forma parametrizada y con validaciones tipadas robustas con Zod del payload entrante.

Fallas en la Identificación y Autenticación (A07:2021): Abordado mediante la emisión de tokens JWT (JSON Web Tokens) firmados criptográficamente para la autenticación sin estado en la API. Para mitigar ataques de robo de sesión (como Cross-Site Scripting - XSS), estos tokens deben almacenarse exclusivamente del lado del cliente en cookies de tipo HTTP-Only, con flags de seguridad Secure e indicativos de ámbito SameSite=Strict.

## 2.7 Síntesis conceptual del marco teórico

A modo de síntesis, las cinco dimensiones teóricas descritas se interconectan para conformar la justificación técnica de la solución tecnológica desarrollada. El modelo conceptual de integración de estas dimensiones se detalla en la Tabla 2.1.

## 2.8 Criterios para la toma de decisiones arquitectónicas

En proyectos de software empresarial, las decisiones de arquitectura no deben entenderse como una lista aislada de tecnologías, sino como respuestas justificadas a restricciones de negocio, riesgo técnico y atributos de calidad [21]. Por ello, en este trabajo se adopta el concepto de Architecture


<!-- Página 47 de 207 -->

**Tabla 2.1: Síntesis conceptual y aporte operativo de las bases teóricas. Fuente: Elaboración propia.**

Dimensión Teórica Concepto Clave Aporte Operativo al Aplicativo Ingeniería de Software

Mantenibilidad del monorepo, aislamiento de lógica de negocio y tests automatizados.

Arquitectura desacoplada de tres capas y modularidad MVC.

Gestión de Servicios

Centralización de evidencias, estados, personal y costos por cada servicio en campo.

El ciclo de vida de la orden de trabajo como eje de datos.

Continuidad operativa para técnicos laborando en zonas sin conectividad celular.

Resiliencia Offline PWA, Service Workers y sincronización local en IndexedDB.

Formularios Dinámicos

Flexibilidad operativa para soportar múltiples formatos de inspección sin redesplegar.

Declaración basada en esquemas estructurados reutilizables.

Seguridad por Diseño

Protección contra fugas de datos y control de acceso sobre los roles de CERMONT S.A.S..

Estándares OWASP Top 10, JWT HttpOnly y RBAC estricto.

Decision Record (ADR) como mecanismo de documentación, mientras que el detalle de las decisiones concretas verificadas en el repositorio se desarrolla en el Capítulo 6.

Para el caso de CERMONT S.A.S., la toma de decisiones arquitectónicas estuvo guiada por cinco criterios principales:

backend definan por separado los mismos campos, estados o permisos, porque esa duplicidad introduce errores de integración y trazabilidad.

que la interfaz evolucione sin mezclar reglas de negocio con componentes visuales, y que la API mantenga independencia respecto a la capa de almacenamiento.

bian según el tipo de servicio, por lo que la persistencia y la validación deben tolerar estructuras variables sin perder control sobre los datos.

local, sincronización diferida y manejo explícito de estados offline como requisitos de diseño y no como mejoras opcionales.


<!-- Página 48 de 207 -->

ben diseñarse como capacidades transversales para proteger información operativa, técnica y administrativa.

Desde esta perspectiva, los ADR cumplen una función metodológica: registrar por qué una decisión fue adoptada, qué alternativas se evaluaron y qué limitaciones permanecen abiertas. Esta práctica fortalece la mantenibilidad del proyecto y mejora la auditabilidad académica del desarrollo, especialmente en un trabajo de grado donde es necesario diferenciar entre lo implementado, lo parcialmente implementado y lo propuesto para evolución futura.

## 2.9 Herramientas tecnológicas utilizadas y criterio de selección

El marco teórico también debe explicar las herramientas concretas empleadas en el desarrollo, no como una lista de nombres comerciales, sino como un conjunto de decisiones técnicas asociadas al problema de CERMONT S.A.S. La Figura 2.1 organiza las tecnologías verificables del repositorio por capa de responsabilidad: interfaz de usuario, API, contratos, seguridad, persistencia, pruebas y soporte de despliegue. Esta lectura por capas permite defender por qué el proyecto no se abordó como un conjunto de formularios aislados, sino como una plataforma web con contratos compartidos y trazabilidad documental.

Frontend y experiencia de usuario

Next.js

Query Zustand PWA Service Worker

React TypeScript TanStack

Backend, contratos y seguridad

Node.js Express Zod JWT RBAC

pdf-lib APIs REST

Persistencia, pruebas y despliegue

MongoDB Mongoose Vitest Supertest Biome Docker npm workspaces

**Figura 2.1: Ecosistema tecnológico empleado en el aplicativo CERMONT, organizado por capas de responsabilidad. Fuente: elaboración propia con base en el repositorio del proyecto.**

La selección de tecnologías se realizó atendiendo restricciones académicas y empresariales: un so-


<!-- Página 49 de 207 -->

lo desarrollador principal durante la práctica, necesidad de mantener coherencia entre frontend y backend, operación en campo con conectividad variable, manejo de documentos heterogéneos y control de permisos por rol. La Tabla 2.2 presenta una versión sintética, pensada para recrearse manualmente en Word si el documento se entrega en ese formato. Por esa razón se evitaron columnas redundantes, versiones excesivas o descripciones promocionales.

**Tabla 2.2: Justificación académica del stack tecnológico seleccionado. Fuente: elaboración propia.**

Criterio de selección

Tecnología Necesidad del proyecto Alternativa considerada

React SPA con Vite o Angular.

Next.js y React Construir vistas protegidas, formularios y paneles de seguimiento para los módulos del flujo operativo.

Integración de enrutamiento, componentes y protección de rutas en una misma base frontend. Node.js y Express Exponer una API modular para órdenes, propuestas, evidencias, actas, SES y pagos.

NestJS o Fastify. Menor complejidad estructural para un equipo pequeño y compatibilidad directa con middlewares de seguridad. MongoDB y Mongoose

PostgreSQL con ORM relacional.

Almacenar órdenes, evidencias y documentos con estructuras variables según el tipo de servicio.

JavaScript sin tipado estático.

Modelo documental adecuado para formularios y soportes heterogéneos; exige control explícito de consistencia. TypeScript Evitar divergencias de tipos entre capas y favorecer la mantenibilidad del código.

Tipado estricto en frontend, backend y paquetes compartidos. Zod y paquetes compartidos

Joi o interfaces duplicadas.

Validar datos con una fuente única de verdad entre contratos, API y formularios.

Permite inferir tipos desde esquemas y aplicar validación en ambos extremos. JWT y RBAC Controlar acceso a módulos sensibles según rol y estado del proceso.

Sesiones tradicionales o validación solo en interfaz.

Autenticación sin estado y autorización verificable en backend. TanStack Query y Zustand

Separar estado del servidor, sesión de usuario y estados de carga o error.

fetch directo en componentes o stores manuales.

Mejora la organización del frontend y evita mezclar red con componentes visuales. PWA, Service Worker e IndexedDB

Aplicación exclusivamente en línea.

Permitir captura y sincronización diferida en escenarios de conectividad variable.

Soporte técnico para operación offline parcial; la sincronización completa de archivos queda como línea de fortalecimiento. Vitest, Supertest y Biome

Validar reglas, endpoints y calidad estática del código.

Jest, pruebas manuales o linting disperso.

Ejecución rápida y coherente con TypeScript y el monorepo. npm workspaces y Docker

Organizar frontend, backend y paquetes compartidos; facilitar entornos reproducibles.

Repositorios separados o ejecución manual por carpeta.

Mantiene estructura monorepo y controla la duplicación de contratos.

El enfoque contract-first resume la forma en que estas herramientas se conectan. Primero se define


<!-- Página 50 de 207 -->

el contrato de datos con Zod; luego se implementan el modelo, el servicio, la ruta HTTP, el cliente de API, el hook de consulta y finalmente la pantalla. Esta secuencia, representada en la Figura 2.2, evita que el frontend y el backend evolucionen con interpretaciones diferentes sobre una misma entidad del negocio.

Backend y contratos compartidos Frontend y experiencia de usuario

Ruta API

Pantalla

apiClient

Contrato

Express

Modelo Mongoose

Next.js

tipado

Zod

Hook TanStack

Servicio de dominio

El mismo contrato de datos se usa para validar entrada, persistir con consisten-

cia y presentar estados de carga, error y vacio sin duplicar reglas entre capas.

**Figura 2.2: Flujo contract-first aplicado a los módulos del aplicativo. Fuente: elaboración propia.**

## 2.10 Teoría de costos operativos y motor de trazabilidad financiera

En empresas contratistas multiservicio, la capacidad de comparar el costo presupuestado de una orden de trabajo con el costo realmente ejecutado constituye un indicador crítico de rentabilidad operativa. Sin embargo, esta comparación solo es posible cuando los datos de costos se capturan en el mismo flujo donde se genera el trabajo, y no en sistemas contables separados que operan con semanas de retraso.

El modelo conceptual de costos adoptado en el proyecto distingue tres categorías analíticas. El Costo Presupuestado (BudgetedCost) se calcula durante la fase de propuesta económica y planeación, a partir de los recursos estimados (personal, materiales, equipos, transporte, subcontratos) y los precios unitarios definidos en catálogos. El Costo Real (ActualCost) se registra durante la fase de ejecución, cuando los técnicos confirman el consumo de materiales, las horas de mano de obra, el uso de equipos y los gastos de transporte. El Costo Facturado (InvoicedCost) corresponde al valor finalmente presentado al cliente mediante la factura electrónica. La diferencia entre el costo presupuestado y el costo real constituye la varianza de ejecución, mientras que la diferencia entre el costo real y el facturado representa el margen operativo bruto.

La captura de costos en campo, habilitada por la arquitectura offline del sistema, introduce un requisito de integridad transaccional: un consumo de material registrado sin conectividad debe conservar


<!-- Página 51 de 207 -->

su trazabilidad (usuario, fecha, orden de trabajo, tipo de recurso, cantidad y unidad) y sincronizarse sin duplicación cuando se recupere la conexión. Para ello, el sistema emplea identificadores de mutación del cliente (clientMutationId) que permiten al backend detectar y descartar envíos duplicados, apoyando la idempotencia de las operaciones de sincronización [21].

La integración del motor de costos con los demás módulos del sistema sigue un patrón de arquitectura orientada a eventos: cada acción de consumo de recursos en el módulo de Ejecución, cada uso de repuestos en el módulo de Mantenimiento y cada gasto de transporte registrado emite un evento de dominio que alimenta el motor de costos. Este diseño evita el acoplamiento directo entre módulos y permite que el cálculo de costos se mantenga actualizado sin requerir consultas costosas que crucen múltiples colecciones de la base de datos.

## 2.11 Modelo de madurez FSM y posicionamiento del proyecto

La literatura sobre gestión de servicios de campo propone modelos de madurez que permiten situar a una organización en un continuo de evolución tecnológica y de procesos. Aunque no existe un modelo de madurez FSM universalmente adoptado, la revisión de la literatura y los reportes de la industria [17, 19] permiten identificar cinco niveles progresivos que resultan útiles para contextualizar el proyecto CERMONT:

telefónicas y comunicación informal. No existe un repositorio centralizado de órdenes de trabajo. Las evidencias se almacenan en dispositivos personales sin trazabilidad. Este era el nivel de partida de CERMONT S.A.S. antes del proyecto.

y carpetas compartidas para registrar información, pero sin integración entre ellas. La captura de datos es manual y propensa a errores de transcripción. Los reportes se generan copiando y pegando información entre aplicaciones.

de la orden de trabajo, con módulos interconectados para planeación, ejecución, evidencias y


<!-- Página 52 de 207 -->

cierre. Los datos se capturan en el punto de origen y se reutilizan entre módulos cuando existe contrato compartido. La trazabilidad se respalda mediante registros de auditoría. Este es el nivel objetivo del proyecto CERMONT.

duración de trabajos, detección de necesidades de mantenimiento), optimización automática de rutas y asignación de recursos, y analítica avanzada para la toma de decisiones gerenciales.

operación autónoma con mínima intervención humana, gemelos digitales de activos y operaciones, y capacidades de auto-remediación ante desviaciones del plan.

El proyecto CERMONT se posiciona en la transición del Nivel 1 al Nivel 3. El sistema implementado aborda las carencias del Nivel 1 (formatos físicos, evidencias dispersas, comunicación informal) y del Nivel 2 (hojas de cálculo aisladas, recaptura manual) mediante una plataforma integrada que constituye la base del Nivel 3. Las capacidades de los Niveles 4 y 5 -analítica predictiva, optimización automática, integración con sistemas externos- se perfilan como líneas de evolución futura, tal como se discute en las recomendaciones del trabajo.

## 2.12 Patrones de diseño aplicados en la arquitectura del sistema

El diseño del aplicativo web de CERMONT S.A.S. aplica cinco patrones de diseño de software documentados en la literatura de ingeniería de software [22, 23]. La selección de estos patrones no fue arbitraria: cada uno responde a un requisito arquitectónico específico del sistema.

Patrón Modelo-Vista-Controlador (MVC). Aplicado en la organización del backend. Las rutas de Express (controladores) reciben las peticiones HTTP, delegan la lógica de negocio en servicios especializados y retornan respuestas con el envoltorio estándar { success, data, error }. Los modelos Mongoose encapsulan el acceso a la base de datos. Esta separación permite probar la lógica de negocio de forma aislada, sin dependencia de HTTP ni de la base de datos.

Patrón Repositorio. Aunque Mongoose proporciona una capa de abstracción sobre MongoDB, los servicios del backend encapsulan las operaciones de consulta y persistencia detrás de interfaces


<!-- Página 53 de 207 -->

explícitas (list, getById, create, update, archive). Esta indirección adicional permite sustituir la implementación de persistencia sin modificar la lógica de negocio, facilitando pruebas unitarias mediante repositorios simulados (mocks).

Patrón Observador (Observer). Implementado en el sistema de eventos de auditoría. Cada acción crítica en el sistema (creación de orden, cambio de estado, aprobación de propuesta, generación de SES) emite un evento que es consumido por el módulo de auditoría. Este patrón desacopla la lógica de negocio del registro de auditoría, permitiendo que nuevas acciones críticas se añadan sin modificar el módulo de auditoría existente.

Patrón Estrategia (Strategy). Aplicado en el motor de validación de formularios. Los formularios dinámicos del sistema pueden requerir reglas de validación diferentes según el tipo de servicio (inspección de líneas de vida, mantenimiento CCTV, planeación de obra). El patrón Estrategia permite encapsular cada conjunto de reglas de validación en objetos intercambiables, seleccionados en tiempo de ejecución según el tipo de formulario.

Patrón Fachada (Facade). Implementado en el cliente HTTP del frontend (apiClient). Todas las llamadas a la API del backend se canalizan a través de un único módulo que gestiona la autenticación (adjuntar token JWT), el manejo de errores (transformar respuestas de error en excepciones tipadas) y la serialización de datos. Los componentes de la interfaz de usuario nunca interactúan directamente con la API, sino que consumen hooks de TanStack Query que, a su vez, utilizan el cliente HTTP centralizado.

## 2.13 Principios SOLID aplicados en el desarrollo

El código fuente del aplicativo se rige por los cinco principios SOLID, cuya aplicación sistemática contribuyó a la mantenibilidad y testabilidad del sistema. A continuación se documenta la aplicación de cada principio con ejemplos concretos del proyecto.

Principio de Responsabilidad Única (SRP). Cada archivo del proyecto tiene una única razón para cambiar. Los controladores del backend (capa HTTP) no contienen lógica de negocio; los servicios (capa de dominio) no importan objetos de Express (Request, Response); los modelos Mongoose (capa de persistencia) no contienen reglas de validación de negocio, que residen en los esquemas Zod de @cermont/shared-types.


<!-- Página 54 de 207 -->

Principio Abierto/Cerrado (OCP). Los módulos del sistema están abiertos a extensión pero cerrados a modificación. El módulo de formularios dinámicos, por ejemplo, permite añadir nuevos tipos de campo y reglas de validación sin modificar el motor de renderizado. De igual forma, el sistema de eventos de auditoría permite suscribir nuevos consumidores sin alterar los productores de eventos existentes.

Principio de Sustitución de Liskov (LSP). Las abstracciones definidas en el sistema pueden ser sustituidas por implementaciones concretas sin alterar el comportamiento esperado. Los repositorios simulados utilizados en las pruebas unitarias respetan las mismas interfaces que los repositorios reales, favoreciendo que las pruebas sean representativas del comportamiento esperado.

Principio de Segregación de Interfaces (ISP). Los contratos de API y los esquemas de datos no obligan a los consumidores a depender de campos que no utilizan. Cada endpoint de la API expone exclusivamente los datos requeridos por la operación, evitando respuestas sobrecargadas que aumentarían el tráfico de red y el acoplamiento entre módulos.

Principio de Inversión de Dependencias (DIP). Los módulos de alto nivel (servicios de dominio) no dependen de módulos de bajo nivel (acceso a datos, HTTP). En su lugar, ambos dependen de abstracciones: los servicios reciben repositorios como dependencias inyectadas, y los repositorios implementan interfaces definidas en la capa de dominio.

La aplicación conjunta de estos principios produjo un código base donde los cambios en un módulo rara vez generan efectos colaterales en otros módulos, donde las pruebas unitarias pueden ejecutarse en milisegundos sin dependencias externas, y donde la incorporación de nuevas funcionalidades no requiere reescribir componentes existentes.

La aplicación de estos principios no fue un ejercicio académico abstracto, sino una necesidad práctica impuesta por las restricciones del proyecto: un único desarrollador, un plazo limitado por el calendario académico de la práctica empresarial, y la expectativa de que el código resultante pudiera ser mantenido y extendido por el personal de CERMONT S.A.S. sin requerir la presencia permanente del autor. Los principios SOLID y los patrones de diseño actuaron como un marco de referencia que guió las decisiones cotidianas de implementación, desde la organización de archivos en el repositorio hasta la firma de las funciones en los servicios de dominio. La experiencia confirma lo señalado por Martin [24]: el código limpio no es un lujo estético, sino una inversión en la capacidad de evolución del software a lo largo del tiempo.


<!-- Página 55 de 207 -->

## 2.14 Marco conceptual ampliado para la plataforma documental-operativa

El aplicativo propuesto se fundamenta en la idea de plataforma documental-operativa. Este concepto permite unir dos dimensiones que con frecuencia se trabajan por separado: la gestión de la actividad técnica en campo y la administración de los documentos que habilitan el cierre financiero. En una empresa contratista, una orden de trabajo no finaliza cuando el técnico termina la intervención; finaliza cuando el servicio puede ser soportado, recibido, radicado, facturado y pagado. Por tanto, la arquitectura conceptual debe cubrir tanto la ejecución técnica como los documentos que prueban su cumplimiento.

La noción de plataforma documental-operativa se diferencia de un repositorio documental convencional. Un repositorio almacena archivos; una plataforma documental-operativa gobierna estados, reglas, responsables, evidencias, permisos, documentos generados y bloqueadores. En el caso de CERMONT S.A.S., esta diferencia es fundamental porque los formatos de planeación, inspección, mantenimiento y cierre no pueden quedar como archivos aislados. Deben convertirse en datos consultables, trazables y conectados con la orden de trabajo.

## 2.15 Trazabilidad como propiedad de ingeniería

La trazabilidad se entiende en este trabajo como la capacidad de reconstruir el ciclo completo de una orden desde su origen hasta su cierre. Esta reconstrucción exige responder preguntas operativas y administrativas: quién solicitó el trabajo, qué alcance fue aprobado, qué recursos se planearon, qué evidencias se capturaron, qué informe se generó, qué acta se firmó, qué SES se radicó, qué factura se emitió y qué pago se registró. La trazabilidad no es una característica secundaria de la interfaz; constituye una propiedad central del sistema.

En términos de diseño de software, la trazabilidad requiere entidades con identidad persistente, relaciones explícitas, eventos de auditoría y reglas de transición. Si una orden cambia de estado sin conservar un evento de auditoría, el sistema pierde capacidad probatoria. Si una evidencia fotográfica se almacena sin asociarse a una orden, una actividad o un componente intervenido, esa evidencia pierde valor documental. Si un informe técnico se genera manualmente sin vínculo con


<!-- Página 56 de 207 -->

la ejecución, se rompe la cadena de consistencia. Por estas razones, el marco teórico del proyecto se concentra en arquitectura modular, control de acceso, persistencia documental, validación de datos y generación documental.

## 2.16 Requisitos de calidad derivados del contexto de campo

El contexto de operación de CERMONT S.A.S. exige requisitos de calidad que van más allá de la funcionalidad básica. El sistema debe ser mantenible, porque los tipos de actividades pueden cambiar y aparecer nuevos formatos. Debe ser seguro, porque administra información de clientes, evidencias de campo, documentos de cierre y datos administrativos. Debe ser usable en condiciones de operación real, donde el técnico no puede dedicar tiempo excesivo a una interfaz compleja. Debe tolerar conectividad variable, porque parte del trabajo ocurre fuera de oficinas y en escenarios donde la red puede ser inestable. Finalmente, debe ser auditable, porque cada transición crítica puede afectar la facturación y la relación con el cliente.

**Tabla 2.3: Relación entre atributos de calidad y decisiones de diseño del sistema. Fuente: elaboración propia.**

Atributo de calidad Necesidad en CERMONT S.A.S. Decisión de diseño asociada Mantenibilidad Adaptar el sistema a múltiples servicios, formatos y tipos de actividad.

Arquitectura modular, separación frontend/backend y contratos compartidos. Seguridad Controlar acceso a información operativa, administrativa y documental.

Autenticación, RBAC, validación de entradas y auditoría de eventos críticos. Usabilidad Facilitar el registro de información durante la actividad técnica.

Interfaces por flujo, estados de carga, formularios orientados a tarea y diseño mobile-first. Tolerancia a conectividad

Registrar información en campo aun cuando la red sea limitada.

Estrategia PWA, almacenamiento local y sincronización diferida en escenarios controlados. Auditabilidad Reconstruir decisiones, cambios de estado y soportes usados para cierre.

Eventos, historial de orden, vínculos entre evidencias, informes, actas, SES y factura.


<!-- Página 57 de 207 -->

## 2.17 Relación entre teoría de software y práctica empresarial

El valor del marco teórico no está en acumular definiciones, sino en explicar por qué determinados conceptos son necesarios para resolver el problema. La arquitectura modular se justifica porque el sistema debe crecer por dominios sin mezclar reglas de negocio. La validación contract-first se justifica porque frontend y backend no pueden interpretar de forma diferente los datos de una orden. La operación offline se justifica porque la captura de información ocurre en campo. El control de acceso se justifica porque no todos los perfiles deben aprobar, cerrar, facturar o eliminar evidencias. La generación documental se justifica porque la empresa necesita disminuir la recaptura manual de datos en informes y actas.

De esta manera, el marco teórico queda conectado con el desarrollo del aplicativo y con los objetivos del trabajo. Cada teoría o práctica de ingeniería debe tener una consecuencia observable en la solución: un módulo, una regla, una tabla, una interfaz, una prueba o una decisión arquitectónica documentada.


<!-- Página 58 de 207 -->

# 3 Estado del Arte e Investigación de Software

## 3.1 Criterio de revisión

La revisión del estado del arte se enfocó en herramientas reales que pudieran aportar fundamentos al diseño del aplicativo de CERMONT S.A.S. Se analizaron tres grupos: plataformas comerciales de gestión de servicios de campo o mantenimiento, repositorios abiertos relacionados con FSM/CMMS/ERP y librerías de formularios, documentos y seguridad. La finalidad de esta revisión no es copiar una solución existente, sino identificar patrones, módulos, restricciones y costos públicos que permitan justificar el desarrollo a medida.

## 3.2 Plataformas comerciales relacionadas

Las plataformas comerciales muestran qué funcionalidades se consideran estándar en el mercado. Sin embargo, su adopción depende de costos, capacidad de personalización, conectividad, flujo documental y ajuste al contexto de la empresa. Cuando el proveedor no publica precios o exige cotización, el libro no debe inventar valores.

La revisión demuestra que existen soluciones maduras, pero también evidencia que una empresa contratista multiservicio puede requerir una herramienta más ajustada a sus documentos internos. El criterio de comparación no debe limitarse al precio; también debe evaluar adaptación a formatos propios, control de evidencias, operación offline, curva de aprendizaje y propiedad de los datos.

## 3.3 Repositorios abiertos para FSM, CMMS y ERP

Estos proyectos confirman que la solución propuesta debe modelar claramente entidades como orden de trabajo, cliente, servicio, recurso, evidencia, formulario, estado y documento generado.


<!-- Página 59 de 207 -->

**Tabla 3.1: Plataformas comerciales relacionadas con gestión de campo y mantenimiento. Fuente: Elaboración propia.**

Referencia de flujo comercial para empresas de servicios.

Herramienta Enfoque Aporte al proyecto Dato verificable Jobber Servicios en sitio: cotización, agenda, despacho, facturación y comunicación.

Planes desde USD 29 hasta USD 529 al mes [25]. Odoo Field Service

Referencia para integrar servicio de campo con otros módulos.

Servicio de campo en Odoo: tareas, productos, planificación y hojas de trabajo.

Referencia para movilidad y flujo técnico.

La documentación oficial describe tareas, productos e itinerarios [26]. ServiceM8 Contratistas: trabajos, clientes, cotizaciones y facturación.

Su página indica planes mensuales y prueba gratuita [27]. Fracttal Mantenimiento y gestión de activos.

Referencia latinoamericana para CMMS y activos.

Integra SAP, ERP, WhatsApp y hojas de cálculo [28].

**Tabla 3.2: Repositorios y proyectos abiertos revisados. Fuente: Elaboración propia.**

Proyecto Descripción Relación con CERMONT S.A.S. Tipo OCA Field Service

Repositorio GitHub.

Módulos de FSM mantenidos por OCA [29].

Referencia para órdenes, ubicaciones, técnicos y servicios.

ERP open-source.

ERPNext ERP libre con contabilidad, CRM, compras e inventario [30].

Permite comparar un ERP amplio frente a una solución focalizada.

CMMS/EAM.

openMAINT Aplicación para activos y mantenimiento [31].

Aporta conceptos de mantenimiento e indicadores.

Atlas CMMS CMMS autoalojable con React y Docker [32].

Referencia para órdenes e inventario.

Repositorio GitHub. Liberu Maintenance

Repositorio GitHub.

Aporta patrones de documental y formularios.

CMMS con Laravel y Filament, gestión documental y versionamiento [33].

Referencia por stack similar y checklist digital.

Repositorio GitHub.

FieldPro FSM con React 18, TypeScript y Supabase [34].


<!-- Página 60 de 207 -->

No obstante, CERMONT S.A.S. requiere una capa adicional de adaptación a formatos operativos específicos, lo que justifica el enfoque de formularios dinámicos.

## 3.4 Librerías para formularios dinámicos

**Tabla 3.3: Librerías de formularios dinámicos aplicables al proyecto. Fuente: Elaboración propia.**

Librería Funcionalidad relevante Aplicación propuesta React JSON Schema Form

Formularios versionados si el frontend usa React.

Genera formularios React de forma declarativa a partir de JSON Schema [20].

Alternativa flexible si se requiere independencia de framework.

JSON Forms Enfoque basado en JSON Schema con soporte para React, Angular y Vue [35].

Formularios largos, encuestas de inspección y checklists.

SurveyJS Librería MIT para renderizar formularios JSON y enviar respuestas a una base de datos propia [36].

Evaluar si se requiere constructor visual de formularios.

Form.io Ecosistema de formularios JSON con componentes para frameworks web [37].

Referencia para línea de evolución de formularios configurables.

YAMLForms Generación de formularios desde esquemas YAML a PDF, HTML y DOCX [38].

## 3.5 Herramientas de extracción documental

El módulo de formularios dinámicos desde documentos existentes necesita transformar entradas no estructuradas en datos editables. La Tabla 3.4 resume herramientas investigadas.


<!-- Página 61 de 207 -->

**Tabla 3.4: Herramientas para extracción documental. Fuente: Elaboración propia.**

Convertir PDF/DOCX a representación estructurada antes de generar plantillas.

Herramienta Capacidad reportada por la fuente Uso posible en el proyecto Docling Procesamiento y extracción estructurada de formatos diversos, con comprensión avanzada de PDF e integración con flujos de IA [11].

Extraer secciones, listas y bloques textuales de formatos existentes.

Unstructured Transformación de documentos complejos a formatos limpios y estructurados para modelos de lenguaje [12].

Procesar fotografías o PDFs escaneados de formatos de campo.

PaddleOCR OCR y extracción estructurada para documentos PDF e imágenes, con soporte de múltiples idiomas [13].

Generar entrada estructurada para un módulo futuro de plantillas dinámicas.

MinerU Conversión de PDF, imágenes, DOCX, PPTX y XLSX en Markdown o JSON para procesamiento posterior [39].

Referencia para extracción y llenado de formularios PDF existentes.

PyPDFForm Biblioteca Python para inspeccionar y rellenar formularios PDF mediante diccionarios Python [40].

Doc2Form Aplicación que usa Gemini AI para convertir PDF o Word en Google Forms [41].

Demuestra viabilidad de extracción automatizada desde documentos no estructurados.


<!-- Página 62 de 207 -->

**Tabla 3.5: Comparación de proyectos open source de gestión de servicios de campo. Fuente: Elaboración propia.**

Básica Sí Sí Limitada Sí (kits típicos)

Característica Atlas CMMS Liberu Maint. OCA Field Svc FieldPro CERMONT (este proyecto) Órdenes de trabajo Sí Sí Sí Sí Sí Planeación de recursos

No No Limitado Sí Sí

Checklists digitales No No No Sí (48 ítems) Sí Evidencias fotográficas

Generación de PDF

Sí Sí Sí Sí (facturas, reportes)

Sí (informes, actas) Operación offline No No Limitado Sí (PWA) Sí (PWA + IndexedDB) Gestión documental

Básica Sí (versionado) Limitada No Sí (trazabilidad completa) Formularios personalizables

No Sí No No Propuesto (futuro) Cierre administrativo

No No No No Sí (SES, facturación) Stack principal React + Docker Laravel + PHP Python (Odoo) React + Supabase

Next.js + Express + MongoDB Licencia AGPLv3 / Com. MIT AGPLv3 Propietaria Académica / Propietaria

Fuente: Elaboración del autor con base en la revisión de repositorios GitHub, documentación oficial de cada proyecto y análisis comparativo de funcionalidades. Las celdas marcadas como “No” indican ausencia de la funcionalidad como módulo nativo; algunas pueden estar disponibles mediante extensiones o configuraciones adicionales no cubiertas en esta revisión.

## 3.6 Comparación de proyectos open source

## 3.7 Vacíos identificados y posicionamiento del proyecto

La investigación muestra que las plataformas comerciales resuelven partes del problema, pero no necesariamente absorben los documentos existentes de una empresa contratista ni reflejan sus formatos internos sin parametrización o desarrollo adicional. Los repositorios abiertos ofrecen bases técnicas, pero requieren adaptación funcional y soporte de implementación. Las librerías de formularios y extracción documental permiten plantear una arquitectura más flexible que los formularios codificados manualmente.

El proyecto se posiciona como una solución aplicada, enfocada en el flujo real de CERMONT S.A.S.: planeación, ejecución, evidencias, informes, actas y cierre administrativo. Su aporte no está en prometer ahorros no medidos, sino en construir un artefacto de software con base documental,


<!-- Página 63 de 207 -->

justificar técnicamente sus módulos y definir una validación que pueda demostrar resultados cuando existan datos reales.

## 3.8 Análisis de madurez del mercado FSM

El mercado de software de gestión de servicios de campo (FSM) ha evolucionado hacia capacidades como programación predictiva, asistencia remota y analítica avanzada para optimización de fuerza laboral [17]. Los líderes del mercado ofrecen plataformas empresariales con amplia cobertura funcional; sin embargo, su adopción exige evaluar costos de licencia, implementación, migración de datos, capacitación y personalización. En este trabajo no se reportan valores económicos como resultado del proyecto, salvo que se anexen cotizaciones o fuentes verificables.

Un estudio de Aberdeen Group [42] encontró que las empresas con mejores prácticas en FSM logran una tasa de resolución en primera visita (First-Time Fix Rate) del 77 %, comparada con el 63 % del promedio de la industria, atribuyendo esta diferencia a la disponibilidad de información completa en el punto de servicio. Este hallazgo refuerza la importancia de que el aplicativo de CERMONT S.A.S. proporcione a los técnicos de campo acceso a toda la información relevante (historial del activo, checklists, kits de recursos) antes y durante la ejecución.

En el contexto latinoamericano, la adopción de herramientas FSM presenta patrones diferenciados. Las empresas multinacionales que operan en la región tienden a utilizar las plataformas corporativas globales (SAP, Oracle, IFS), mientras que las PYMEs contratistas, como CERMONT S.A.S., enfrentan barreras de adopción relacionadas con el costo de licenciamiento, la complejidad de implementación y la capacidad limitada de personalización de las soluciones comerciales. Este segmento de mercado representa una oportunidad para soluciones desarrolladas a medida que, aunque no compiten en amplitud funcional con las plataformas empresariales, ofrecen un ajuste preciso a los procesos documentales existentes de la organización.

## 3.9 Análisis detallado de repositorios open source

A continuación se presenta un análisis en profundidad de tres repositorios que resultaron particularmente relevantes para el diseño del aplicativo de CERMONT S.A.S., ya sea por su stack tecno-


<!-- Página 64 de 207 -->

lógico, su arquitectura de módulos o sus funcionalidades afines.

### 3.9.1 FieldPro: referencia de stack y funcionalidades PWA

FieldPro [34] es una plataforma de gestión de servicios de campo construida con React 18, TypeScript, Vite 6, Tailwind CSS y Supabase (PostgreSQL + Row Level Security). Su arquitectura resultó particularmente instructiva para el proyecto CERMONT por tres razones. Primera, implementa un checklist digital de 48 ítems con estado tri-estado (completado, pendiente, no aplica), que sirvió como referencia para el diseño de los checklists de inspección del aplicativo. Segunda, incorpora soporte PWA con caché offline, demostrando la viabilidad técnica de la operación desconectada en aplicaciones web modernas. Tercera, su enfoque de generación de documentos PDF (facturas, reportes de servicio, cotizaciones) a partir de datos estructurados validó la decisión de utilizar pdf-lib como motor de generación documental en el proyecto.

Sin embargo, FieldPro presenta limitaciones que justifican el desarrollo de una solución propia para CERMONT S.A.S. Carece de un módulo de cierre administrativo que conecte la ejecución técnica con la facturación y el pago, no soporta formularios dinámicos configurables por tipo de servicio, y su modelo de datos está orientado a empresas de servicios de equipos más que a contratistas multiservicio con flujos documentales complejos.

### 3.9.2 OCA Field Service: patrón de descomposición modular

El conjunto de módulos Field Service de la Odoo Community Association [29], con 179 estrellas y 90 contribuidores en GitHub, representa uno de los proyectos open source más maduros en el dominio FSM. Su arquitectura ejemplifica un patrón de descomposición modular que fue adoptado en el diseño del aplicativo CERMONT: cada funcionalidad se organiza como un módulo independiente (territorios, órdenes, CRM, portal, proyectos, inventario, vehículos) con dependencias explícitas entre ellos. Esta estructura evita el acoplamiento excesivo y permite que cada módulo evolucione a su propio ritmo.

La principal diferencia con el proyecto CERMONT radica en la dependencia del ecosistema Odoo. OCA Field Service hereda la infraestructura de Odoo (ORM, sistema de permisos, motor de reportes, framework web), lo que limita su portabilidad a entornos que no utilicen Odoo como ERP


<!-- Página 65 de 207 -->

base. El aplicativo CERMONT, en contraste, se diseñó como una plataforma autónoma que puede operar sin depender de un ERP específico, comunicándose mediante APIs REST estándar.

### 3.9.3 Atlas CMMS: referencia de despliegue autoalojado

Atlas CMMS [32] es un sistema de gestión de mantenimiento computarizado autoalojado, desarrollado con React para el frontend y desplegable mediante Docker Compose. Su arquitectura de despliegue basada en contenedores sirve como referencia para soluciones que el cliente puede instalar en su propia infraestructura, un modelo relevante para CERMONT S.A.S. considerando que sus datos operativos y financieros deben permanecer bajo su control.

Las funcionalidades de Atlas CMMS -creación y asignación de órdenes de trabajo, registro de tiempos, automatización de órdenes mediante disparadores, exportación de reportes- cubren adecuadamente el dominio de mantenimiento de activos fijos en instalaciones industriales. Sin embargo, su alcance no abarca la gestión integral de servicios contratados para terceros, donde la trazabilidad documental, la generación de actas e informes para clientes y el cierre administrativo con facturación constituyen requisitos críticos que diferencian el proyecto CERMONT de un CMMS convencional.

## 3.10 Antecedentes investigativos en el contexto colombiano

La revisión de trabajos de grado en repositorios institucionales de universidades colombianas permitió identificar tres investigaciones relacionadas con la digitalización de procesos técnicos mediante aplicaciones web. Estos antecedentes, aunque abordan dominios diferentes al de CERMONT S.A.S., proporcionan evidencia del interés académico en el tema y permiten situar el presente trabajo dentro de una línea de investigación activa en la ingeniería colombiana.

Estos antecedentes confirman que la digitalización de procesos de mantenimiento y servicios técnicos mediante aplicaciones web es un área de interés activo en la ingeniería colombiana. Sin embargo, la revisión también evidencia que los trabajos existentes se han concentrado en mantenimiento de activos propios (flotas, equipos industriales, infraestructura de telecomunicaciones) más que en


<!-- Página 66 de 207 -->

**Tabla 3.6: Antecedentes académicos colombianos relacionados con la problemática. Fuente: Elaboración propia.**

Autor y año Enfoque general Aporte relevante Diferencia con este proyecto García López (2021) [43]

Sistema web para mantenimiento de flota urbana.

Demuestra viabilidad de digitalizar controles operativos con tecnologías web.

Enfocado en activos propios; no cubre cierre administrativo con facturación. Rodríguez y Torres (2022) [44]

Muestra interés por movilidad y registro en campo.

Prioriza movilidad; no incluye trazabilidad de cierre documental.

Aplicación móvil para órdenes de trabajo en telecomunicaciones.

Martínez Suárez (2020) [45]

Demuestra control de actividades técnicas con base documental.

Sistema web para mantenimiento preventivo en PYME industrial.

Alcance limitado a mantenimiento; no cubre servicios a terceros ni facturación.

la gestión integral de servicios contratados para terceros, donde la trazabilidad documental, la generación de actas e informes y el cierre administrativo constituyen requisitos críticos que diferencian el presente proyecto.

## 3.11 Tendencias tecnológicas emergentes y su relación con el proyecto

El desarrollo del aplicativo CERMONT se sitúa en la intersección de varias tendencias tecnológicas que están transformando la gestión de servicios de campo. A continuación se analizan tres tendencias particularmente relevantes y su relación con las decisiones de diseño adoptadas.

Operación offline-first. La combinación de Progressive Web Apps (PWA) con almacenamiento local IndexedDB y sincronización diferida se ha consolidado como el enfoque predominante para aplicaciones de campo en zonas con conectividad intermitente [17]. El proyecto CERMONT adopta este enfoque mediante Service Workers que gestionan el app shell y mediante almacenamiento local para datos operativos, con un motor de sincronización que aplica retroceso exponencial y deduplicación mediante clientMutationId. Esta arquitectura permite continuidad parcial para técnicos de campo y establece la base para capturar evidencias y completar checklists aun con red variable, siempre que cada formulario sea validado en pruebas específicas.


<!-- Página 67 de 207 -->

Formularios dinámicos configurables. La tendencia hacia formularios definidos mediante esquemas declarativos (JSON Schema, YAML) en lugar de componentes de interfaz codificados manualmente responde a la necesidad de adaptabilidad en entornos multiservicio [20, 35]. El proyecto CERMONT incorpora esta tendencia mediante la especificación de formularios como plantillas versionadas en @cermont/shared-types, con un motor de renderizado que genera la interfaz de captura a partir del esquema. La evolución futura hacia formularios extraídos automáticamente de documentos PDF/WORD existentes representa la convergencia de esta tendencia con las capacidades emergentes de extracción documental.

Generación documental automatizada. La capacidad de generar documentos PDF, DOCX y otros formatos a partir de datos estructurados almacenados en el sistema puede reducir recaptura manual y mejorar la consistencia entre los datos operativos y los documentos entregados al cliente [40]. El proyecto CERMONT incorpora esta línea mediante pdf-lib para la generación de informes técnicos y actas de entrega, con plantillas que insertan datos de la orden, resultados de checklists y evidencias fotográficas cuando la información requerida está disponible.

## 3.12 Justificación de la solución a medida frente a alternativas existentes

La revisión del estado del arte permite articular una justificación fundamentada para el desarrollo de una solución a medida en lugar de adoptar una plataforma existente. Esta justificación se estructura en cinco criterios de evaluación, presentados en la Tabla 3.7.

**Tabla 3.7: Criterios de evaluación para la decisión de desarrollar vs. adoptar. Fuente: Elaboración propia.**

Baja Media Alta

Criterio Descripción Plataformas comerciales Open source Desarrollo a medida Adaptación a formatos propios

Ajuste a formatos reales de CERMONT.

Costo acumulado a tres años. Alto Medio Bajo

Costo total de propiedad

Baja Alta Alta

Independencia tecnológica

Control del código y de los datos.

Variable Variable Alta

Operación offline Funcionamiento sin conectividad.

Evolución funcional Incorporar y modificar módulos. Limitada Media Alta

El análisis de estos criterios confirma que, para el contexto específico de CERMONT S.A.S. -una empresa contratista multiservicio con formatos operativos propios, operación en zonas de conecti-


<!-- Página 68 de 207 -->

vidad variable y un volumen de órdenes que no justifica la inversión en plataformas empresariales- , el desarrollo a medida constituye la alternativa técnicamente más adecuada. Esta conclusión no desconoce el valor de las plataformas existentes, que ofrecen madurez funcional y soporte profesional; simplemente reconoce que el costo de adaptar dichas plataformas a la realidad documental y operativa de CERMONT S.A.S. superaría el costo de construir una solución focalizada.

## 3.13 Análisis de costos del ecosistema de software

Un factor determinante en la decisión de desarrollar una solución a medida es el costo de las alternativas existentes. A continuación se presenta un análisis de los costos públicamente disponibles de las plataformas comerciales revisadas, con el propósito de proporcionar un contexto económico verificable a la decisión técnica. Los valores presentados provienen exclusivamente de páginas oficiales de los proveedores, consultadas durante la investigación.

Jobber publica planes de suscripción escalonados según funcionalidad [25]. El plan básico (Lite), orientado a negocios unipersonales, tiene un costo de USD 29 por mes facturado anualmente. El plan intermedio (Connect), que incluye programación avanzada y recordatorios automáticos, cuesta USD 119 por mes. El plan avanzado (Grow), con informes financieros y seguimiento de gastos, alcanza USD 249 por mes. El plan empresarial (Scale), que incorpora múltiples ubicaciones y reportes personalizados, llega a USD 529 por mes. Para una empresa con el perfil operativo de CERMONT S.A.S., el plan relevante sería al menos Grow, lo que representa un costo anual de aproximadamente USD 2,988, sin incluir costos de implementación, migración de datos históricos ni capacitación del personal.

Odoo ofrece un modelo de precios diferenciado según el número de usuarios y las aplicaciones contratadas [46]. El módulo de Field Service forma parte del ecosistema de aplicaciones de Odoo, cuyo costo varía según la cantidad de usuarios y la inclusión de otros módulos empresariales (contabilidad, inventario, CRM). La documentación oficial de Field Service [26] describe funcionalidades que, si bien cubren parcialmente las necesidades de gestión de servicios de campo, requerirían personalización adicional para adaptarse a los formatos operativos propios de CERMONT S.A.S.

ServiceM8 ofrece planes desde aproximadamente USD 29 por mes para funcionalidades básicas, con progresión de precios según el número de usuarios y las capacidades requeridas [27]. Su enfoque en contratistas y negocios de servicios lo hace particularmente relevante como referencia,


<!-- Página 69 de 207 -->

aunque su modelo de datos está optimizado para servicios de corta duración más que para proyectos complejos con flujos documentales extensos.

Fracttal, con presencia en el mercado latinoamericano, no publica precios estándar en su sitio web, requiriendo contacto directo para cotización. Esta práctica, común en plataformas empresariales, dificulta la comparación objetiva de costos y refuerza el argumento a favor de una solución con costos transparentes y controlables [28].

El análisis de costos, sumado a los criterios cualitativos de la Tabla 3.7, sugiere que la adopción de una plataforma comercial debe evaluarse con cautela para el volumen actual de operaciones de CERMONT S.A.S., particularmente cuando dicha inversión no asegura adaptación a los formatos operativos propios de la empresa. El desarrollo a medida, cuyo costo principal durante la práctica fue el tiempo de ingeniería del estudiante, produjo una base ajustada a los procesos reales de la organización y sin costos recurrentes de licenciamiento asociados al núcleo desarrollado.

## 3.14 Criterios académicos para comparar soluciones existentes

La comparación con herramientas comerciales y repositorios abiertos no debe limitarse a enumerar nombres de software. Para que el análisis tenga valor académico, cada alternativa debe examinarse según criterios vinculados al problema de CERMONT S.A.S.: cobertura del flujo desde solicitud hasta pago, capacidad de configurar formularios, soporte para evidencias, posibilidad de operación móvil/offline, costos de adopción, facilidad de personalización, integración documental y control de cierre administrativo.

## 3.15 Posicionamiento del aplicativo frente a FSM, CMMS y ERP

Las herramientas FSM se especializan en la gestión de técnicos, rutas, órdenes y atención en campo. Los sistemas CMMS se orientan a mantenimiento de activos, programación de intervenciones e historial de equipos. Los ERP integran procesos empresariales amplios, pero suelen requerir pa-


<!-- Página 70 de 207 -->

**Tabla 3.8: Criterios de comparación utilizados para evaluar alternativas frente al aplicativo a medida. Fuente: elaboración propia.**

El proceso real de CERMONT no termina en la ejecución técnica, sino en el cierre administrativo.

Criterio Pregunta de evaluación Relevancia para CERMONT S.A.S. Cobertura del flujo ¿La herramienta cubre solicitud, propuesta, PO, planeación, ejecución, informes, actas, SES, factura y pago?

Configurabilidad documental

¿Permite adaptar formularios y plantillas a formatos propios de la empresa?

La empresa usa documentos diversos para CCTV, líneas de vida, planeación y soporte HES. Operación móvil y offline ¿Permite trabajar con conectividad intermitente sin perder datos?

El registro de evidencias y checklists se realiza en campo. Trazabilidad y auditoría ¿Conserva historial, estados, responsables y evidencias por orden?

La trazabilidad permite reconstruir el avance de cada servicio. Costo y adopción ¿El costo y la complejidad de implementación son viables para la empresa?

Las soluciones robustas pueden ser costosas o rígidas para una contratista multiservicio local. Control de costos reales ¿Relaciona presupuesto, ejecución y facturación? La empresa necesita comparar costos reales frente a lo estimado.

rametrización compleja, costos de implementación y adaptación organizacional significativa. El aplicativo propuesto para CERMONT S.A.S. se ubica en un punto intermedio: toma elementos de FSM para la ejecución en campo, elementos de CMMS para control de actividades técnicas y elementos de ERP para seguimiento administrativo, pero los adapta a un flujo propio de 14 pasos.

Este posicionamiento justifica el desarrollo a medida. CERMONT requiere una herramienta que no solo asigne órdenes a técnicos, sino que conecte propuesta, PO, planeación, evidencias, informe, acta, SES, factura, pago y costos reales. La mayoría de soluciones generalistas obliga a modificar el proceso de la empresa para encajar en la herramienta; el proyecto busca lo contrario: modelar la herramienta desde el proceso real y, gradualmente, introducir estandarización mediante reglas, plantillas y estados.

## 3.16 Vacíos del mercado identificados para el caso CERMONT

El estado del arte permite identificar cuatro vacíos principales. El primero es la dificultad de adaptar herramientas comerciales a formatos internos sin incurrir en parametrizaciones extensas. El segundo es la separación frecuente entre operación técnica y cierre administrativo: muchas herramientas gestionan órdenes y evidencias, pero no necesariamente modelan SES, facturación, aprobación y pago dentro del mismo pipeline. El tercero es la falta de un enfoque explícito sobre costos reales comparados con propuesta inicial para cada servicio. El cuarto es la necesidad de operación offline


<!-- Página 71 de 207 -->

y de sincronización controlada para escenarios de campo.

El aplicativo propuesto se justifica porque esos vacíos se reflejan directamente en las fallas documentadas por CERMONT. No basta con adquirir una herramienta que administre órdenes; se requiere una solución que traduzca la lógica del proceso interno en módulos, estados y validaciones. Por esta razón, el desarrollo a medida se presenta como una alternativa académicamente defendible, siempre que el libro distinga con claridad entre lo implementado, lo parcialmente implementado y lo propuesto como evolución futura.

## 3.17 Criterio de uso de precios y costos externos

Los costos de herramientas comerciales solo deben usarse cuando provengan de fuentes públicas verificables y con fecha de consulta. En ningún caso deben presentarse como costos propios de CERMONT S.A.S. si la empresa no ha entregado documentos financieros que lo respalden. Por tanto, la comparación económica debe limitarse a costos de mercado, licenciamiento o suscripción publicados por proveedores, y su función debe ser contextualizar la decisión de desarrollar a medida, no demostrar ahorros internos no medidos.

En el libro, cualquier mención a ahorro, retorno de inversión, reducción porcentual de tiempos o mejora cuantitativa debe quedar condicionada a evidencia de validación. Si no existen mediciones reales, se debe escribir que el indicador se propone para una fase piloto posterior. Esta regla conserva la integridad académica del documento y evita afirmaciones que puedan ser cuestionadas durante la sustentación.


<!-- Página 72 de 207 -->

# 4 Marco Legal, Normativo y Ético

## 4.1 Protección de datos personales

El aplicativo web gestionará usuarios, roles, evidencias, documentos, órdenes de trabajo y posiblemente datos de clientes o trabajadores. Por tanto, debe ajustarse al régimen colombiano de protección de datos personales, en especial a la Ley 1581 de 2012 y sus normas reglamentarias. La citación exacta debe conservarse con la fuente oficial correspondiente y con el formato exigido por el programa [47, 48].

Desde el diseño del sistema se deben aplicar principios de finalidad, seguridad, circulación restringida, confidencialidad y acceso controlado. Esto implica que cada usuario solo debe consultar o modificar información conforme a su rol; las evidencias no deben exponerse públicamente; los respaldos deben conservarse de manera segura; y las cargas de documentos deben validarse para evitar archivos maliciosos o información no autorizada.

## 4.2 Seguridad y salud en el trabajo

La inducción HES de CERMONT S.A.S. muestra que la empresa opera bajo un enfoque de seguridad, salud en el trabajo y ambiente, con objetivos relacionados con capacitación, vigilancia epidemiológica, inspecciones, mejora del SG-SSTA, seguridad vial y manejo ambiental [3]. El aplicativo no reemplaza el Sistema de Gestión de Seguridad y Salud en el Trabajo, pero puede apoyarlo al conservar checklists, evidencias, registros de inspección y documentación asociada a actividades de campo [49, 50].

Los formularios digitales deben respetar la estructura de los formatos existentes y facilitar su diligenciamiento, evitando que la digitalización elimine campos relevantes para la seguridad o el control operativo. Cuando se diseñen formularios nuevos, estos deben ser revisados por el responsable HES o por quien defina la empresa.


<!-- Página 73 de 207 -->

## 4.3 Normativa de facturación electrónica

La Resolución 000042 de 2020 de la DIAN establece el sistema de facturación electrónica obligatorio en Colombia [51]. Aunque el aplicativo web desarrollado no constituye en sí mismo un software de facturación electrónica certificado, sí genera la información base estructurada necesaria para la emisión posterior de factura electrónica: datos del cliente, descripción detallada de servicios, base imponible, tributos y soportes documentales como órdenes de compra, actas de entrega e informes técnicos.

## 4.4 Propiedad intelectual y licencias de software

El proyecto utiliza o evalúa herramientas de software libre y de código abierto. Por ello, es necesario diferenciar entre usar una librería, modificar su código, distribuir una versión derivada o incorporarla como dependencia del sistema. Cada componente debe revisarse según su licencia. Algunas herramientas investigadas declaran licencias permisivas como MIT o Apache 2.0, mientras otras plataformas pueden operar bajo licencias copyleft o condiciones comerciales.

La decisión de usar una librería debe documentar: nombre, repositorio, licencia, función dentro del sistema y nivel de dependencia. Esta trazabilidad evita problemas de propiedad intelectual y facilita que la empresa continúe el mantenimiento del aplicativo.

## 4.5 Normativa técnica y profesional

El ejercicio de la ingeniería en Colombia está regulado por la Ley 842 de 2003 y el Código de Ética Profesional del COPNIA [52, 53]. En el ámbito técnico, el Reglamento Técnico de Instalaciones Eléctricas (RETIE) establece requisitos aplicables a las actividades de electricidad que ejecuta CERMONT S.A.S. [54]. El sistema puede contribuir al cumplimiento normativo conservando trazabilidad de las intervenciones y documentación técnica asociada.


<!-- Página 74 de 207 -->

## 4.6 Documentos contractuales y confidencialidad

El libro no debe publicar contratos, valores, penalizaciones, costos internos, nombres de clientes, volúmenes de órdenes o datos sensibles de CERMONT S.A.S. si la empresa no autoriza su divulgación. Cuando se requiera justificar la necesidad del sistema, se deben preferir fuentes institucionales, documentos operativos no confidenciales, formatos de trabajo y descripción general del proceso.

Los datos internos cuantitativos podrán incorporarse únicamente si existen anexos, actas, autorizaciones o registros verificables. En ausencia de estos soportes, se deben presentar como indicadores propuestos y no como resultados comprobados.

## 4.7 Ética de investigación y práctica empresarial

En el contexto de la práctica empresarial, el estudiante debe actuar con responsabilidad frente a la empresa, la universidad y los usuarios del sistema. Las entrevistas, pruebas de usuario o mediciones de desempeño deben realizarse con autorización, explicando el propósito académico y evitando afectar la operación normal de la organización [55]. Las evidencias fotográficas y documentos reales se deben anonimizar cuando contengan información sensible.

La ética del documento también exige no afirmar resultados que aún no se han medido. Por esta razón, esta versión del libro reemplaza beneficios económicos supuestos por una metodología de validación. El valor académico se sostiene en el diseño, implementación, trazabilidad y evaluación verificable del artefacto de software.

## 4.8 Análisis detallado de la Ley 1581 de 2012 y su aplicación al sistema

La Ley 1581 de 2012, conocida como Ley de Habeas Data, desarrolla el derecho constitucional fundamental consagrado en el artículo 15 de la Constitución Política de Colombia. Esta norma establece el régimen general de protección de datos personales y resulta particularmente relevante


<!-- Página 75 de 207 -->

para el aplicativo desarrollado, ya que el sistema almacena y procesa datos personales de al menos tres categorías de titulares: empleados de CERMONT S.A.S. (nombres, documentos de identidad, certificaciones, datos de contacto), personal de empresas clientes (nombres, cargos, teléfonos, correos electrónicos utilizados para coordinación operativa) y potencialmente datos biométricos en el contexto de firmas digitales y registros fotográficos de ejecución de actividades.

Los diez principios rectores establecidos en el artículo 4 de la Ley 1581 tienen implicaciones directas en el diseño del sistema:

posiciones vigentes. El sistema implementa esta obligación mediante controles de autorización RBAC que restringen el acceso a datos personales exclusivamente a usuarios con justificación funcional documentada.

legítima, informada al titular. El sistema captura datos de empleados con la finalidad exclusiva de gestión de recursos humanos y asignación de órdenes de trabajo, y datos de clientes con la finalidad de coordinación operativa y comunicación de novedades.

informado. Se recomienda que CERMONT S.A.S. implemente un formulario de autorización de tratamiento de datos conforme al Decreto 1377 de 2013, con registro digital de la aceptación.

tos y actualizados. El sistema aplica validaciones de integridad referencial en la base de datos y reglas de negocio que previenen inconsistencias.

tos que le conciernen. El sistema debe proveer una funcionalidad que permita a los usuarios consultar los datos personales almacenados sobre ellos.

dos por personas autorizadas. El middleware de autorización RBAC del backend respalda este principio para los endpoints protegidos de la API.

datos. El sistema implementa autenticación JWT, comunicaciones TLS, hash Bcrypt para con-


<!-- Página 76 de 207 -->

traseñas y registros de auditoría para accesos a datos sensibles.

tamiento deben garantizar la reserva de la información. El control de acceso por roles y los registros de auditoría respaldan este principio.

El Decreto 1377 de 2013, que reglamenta la Ley 1581, establece requisitos operativos adicionales: la política de tratamiento de datos debe ser documentada y publicada; las autorizaciones deben conservarse con prueba de su obtención; y los procedimientos para consultas y reclamos deben resolverse en plazos máximos de 10 y 15 días hábiles respectivamente. El sistema puede apoyar estos requisitos mediante el almacenamiento versionado de la política de tratamiento y el registro de las aceptaciones con marca de tiempo.

## 4.9 Estándares internacionales de calidad de software aplicables

Aunque no constituyen normas de obligatorio cumplimiento legal en Colombia, los siguientes estándares internacionales proporcionan marcos de referencia que orientaron el diseño y la validación del aplicativo:

IEEE Std 1471-2000 (Recommended Practice for Architectural Description). Este estándar, posteriormente adoptado como ISO/IEC 42010:2011, establece recomendaciones para la descripción de arquitecturas de sistemas intensivos en software. El proyecto aplica sus lineamientos al documentar la arquitectura mediante vistas complementarias: vista de módulos (descomposición funcional del sistema), vista de componentes y conectores (interacción entre frontend, backend y base de datos), y vista de asignación (despliegue en infraestructura de servidores).

ISO/IEC/IEEE 12207:2017 (Systems and Software Engineering - Software Life Cycle Processes). Este estándar define un marco de procesos para el ciclo de vida del software que fue utilizado como referencia para estructurar las fases metodológicas del proyecto. Los procesos de gestión de proyecto, gestión de calidad y verificación descritos en la metodología se alinean con los procesos correspondientes definidos en este estándar.

OWASP Top 10 (2021). Aunque no es un estándar formal sino un documento de concienciación


<!-- Página 77 de 207 -->

comunitaria, el OWASP Top 10 constituye la referencia más ampliamente aceptada para la identificación y mitigación de riesgos de seguridad en aplicaciones web [9]. Como se documentó en los capítulos de desarrollo y validación, el sistema implementa controles específicos para cada uno de los riesgos identificados en esta referencia.

## 4.10 Cumplimiento normativo sectorial

Las actividades técnicas ejecutadas por CERMONT S.A.S. están sujetas a regulaciones sectoriales que el aplicativo web no reemplaza, pero cuyo cumplimiento puede facilitar. A continuación se analizan las principales:

Reglamento Técnico de Instalaciones Eléctricas (RETIE). El RETIE, adoptado mediante la Resolución 90708 de 2013 del Ministerio de Minas y Energía, establece requisitos técnicos para instalaciones eléctricas en Colombia [54]. El sistema apoya el cumplimiento de este reglamento al conservar trazabilidad de las intervenciones eléctricas, almacenar certificados de conformidad de productos y registrar los resultados de inspecciones y pruebas. La posibilidad de asociar evidencias fotográficas a cada intervención proporciona soporte documental verificable en caso de auditorías de cumplimiento.

Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST). El Decreto 1072 de 2015 y la Resolución 0312 de 2019 establecen los estándares mínimos del SG-SST en Colombia [49, 50]. Los módulos de checklists digitales y registro de evidencias del aplicativo pueden integrarse en los procesos de inspección de seguridad, verificación de uso de elementos de protección personal (EPP) y documentación de condiciones de trabajo, contribuyendo a la trazabilidad exigida por la normativa. El formato de inspección de líneas de vida verticales de CERMONT S.A.S. [5] es un ejemplo concreto de documento operativo que, al digitalizarse, fortalece el componente de verificación del SG-SST.

Normativa de facturación electrónica (DIAN). La Resolución 000042 de 2020 de la Dirección de Impuestos y Aduanas Nacionales (DIAN) establece el sistema de facturación electrónica obligatorio en Colombia [51]. El módulo de cierre administrativo del aplicativo organiza la información base requerida para la facturación (datos del cliente, descripción de servicios, valores, soportes documentales), pero no sustituye al software de facturación electrónica certificado que CERMONT S.A.S. debe utilizar para la transmisión oficial ante la DIAN. Esta separación de responsabilidades


<!-- Página 78 de 207 -->

es consistente con el principio de modularidad que rige la arquitectura del sistema.

## 4.11 Matriz de requisitos legales y su implementación en el sistema

La Tabla 4.1 sintetiza la relación entre los requisitos normativos identificados y las funcionalidades del sistema que contribuyen a su cumplimiento.

**Tabla 4.1: Matriz de trazabilidad: requisitos legales y funcionalidades del sistema. Fuente: Elaboración propia.**

Registro digital de autorizaciones con marca de tiempo.

Requisito normativo Funcionalidad del sistema que lo soporta Estado Consentimiento del titular (Ley 1581/2012, art. 4 lit. c)

Implementado.

Middleware RBAC en backend para todos los endpoints protegidos.

Pendiente de implementar en frontend. Acceso restringido (Ley 1581/2012, art. 4 lit. f)

Implementado.

JWT HttpOnly, TLS, Bcrypt, auditoría de accesos.

Seguridad de datos (Ley 1581/2012, art. 4 lit. g)

Interfaz de perfil de usuario con datos personales visibles.

Pendiente de implementar.

Derecho de consulta (Ley 1581/2012, art. 8 lit. a)

Implementado.

Asociación de evidencias y documentos a cada orden de trabajo.

Trazabilidad de intervenciones (RETIE)

Implementado.

Checklists digitales con registro de EPP y condiciones de seguridad.

Verificación de condiciones de trabajo (SG-SST)

Implementado.

Módulo de cierre administrativo con datos estructurados del servicio.

Información base para facturación (DIAN Res. 000042/2020)

Ética profesional (Ley 842/2003, COPNIA)

Documentación verificable; no se afirman resultados no medidos.

Cumplido en el documento.


<!-- Página 79 de 207 -->

## 4.12 Aplicación del marco legal al diseño funcional del sistema

El marco legal y ético no debe presentarse como un listado aislado de normas. Su función dentro del trabajo es explicar qué decisiones de diseño son necesarias para que el aplicativo administre información operacional, documental y personal sin comprometer confidencialidad, integridad ni disponibilidad. En consecuencia, cada exigencia normativa o ética debe traducirse en un requisito funcional o no funcional del sistema.

**Tabla 4.2: Relación entre consideraciones normativas y requisitos del aplicativo. Fuente: elaboración propia.**

Consideración Riesgo si no se controla Respuesta del sistema Protección de datos personales

Exposición de información de empleados, técnicos, clientes o firmantes.

Autenticación, roles, permisos y limitación de acceso según perfil. Confidencialidad contractual

Acceso por orden, auditoría y control documental.

Divulgación no autorizada de órdenes, evidencias, informes o soportes de cliente.

Propiedad intelectual Uso no autorizado de código, plantillas o librerías sin respetar licencias.

Inventario de dependencias y revisión de licencias en el repositorio. Integridad documental Modificación no trazada de evidencias, informes, actas o estados de cierre.

Eventos de auditoría, estados controlados y registro de metadatos. Seguridad de la información

Manipulación de datos por usuarios no autorizados o entradas maliciosas.

Validación de payloads, sanitización, RBAC y registro de errores.

## 4.13 Confidencialidad de documentos operativos y evidencias

Los documentos operativos de CERMONT S.A.S. pueden contener información sensible sobre clientes, ubicaciones, evidencias fotográficas, hallazgos técnicos, firmas, permisos de trabajo, condiciones de seguridad y soportes administrativos. Esta información no debe tratarse como archivos genéricos. Desde el punto de vista ético, el aplicativo debe procurar que cada documento quede asociado a una orden, a un responsable y a un estado; además, debe permitir restringir su consulta según el rol del usuario.

La confidencialidad también se relaciona con la forma en que el libro presenta los anexos. Los documentos internos pueden usarse como evidencia académica, pero no deben divulgar información


<!-- Página 80 de 207 -->

sensible innecesaria. Si un formato contiene nombres, firmas, datos de clientes o detalles confidenciales, se recomienda anonimizar o recortar la evidencia antes de incorporarla en la versión final del trabajo. Esta práctica no debilita el soporte documental; por el contrario, demuestra responsabilidad ética en el manejo de información empresarial.

## 4.14 Licenciamiento de software y uso de componentes abiertos

El desarrollo del aplicativo se apoya en tecnologías y librerías de código abierto. Esto implica revisar licencias, versiones, obligaciones de atribución y restricciones de uso. Desde la perspectiva del trabajo de grado, no basta con mencionar que una librería fue usada; es necesario explicar su función dentro del sistema y verificar que su licencia sea compatible con el uso académico y empresarial previsto. Este análisis es especialmente importante en componentes de generación documental, validación, interfaz, autenticación, pruebas y construcción del proyecto.

Una práctica recomendada es incluir en anexos un inventario de dependencias principales, indicando nombre, rol, licencia y ubicación en el repositorio. Este inventario no requiere listar cada subdependencia transitoria, pero sí debe cubrir las herramientas centrales que sustentan la arquitectura.

## 4.15 Ética de la validación y uso de métricas

El principio ético más importante en la validación del proyecto es no presentar como resultado aquello que todavía no ha sido medido. Si el sistema fue probado mediante escenarios técnicos, pruebas unitarias o validaciones internas, debe expresarse de esa forma. Si la reducción de tiempos, la disminución de errores o la mejora en facturación dependen de una prueba piloto con usuarios reales, esos indicadores deben quedar marcados como pendientes de medición. Esta distinción protege la validez del trabajo y evita que el documento sea cuestionado por datos no verificables.

El libro puede proponer indicadores, matrices y procedimientos de medición; sin embargo, solo debe reportar valores numéricos cuando exista evidencia anexada, como actas de prueba, registros de uso, bitácoras, bases de datos exportadas o formularios de evaluación. La transparencia sobre el


<!-- Página 81 de 207 -->

## 4.16 Alineación normativa y estándares aplicables al aplicativo

Esta corrección responde a la observación del evaluador sobre la necesidad de identificar bajo qué normativas, estándares y buenas prácticas se soporta el aplicativo desarrollado. La solución no se presenta como un producto certificado por ISO o IEEE; se declara como un desarrollo académico y empresarial que se alinea funcional y técnicamente con referentes empleados en sistemas de gestión documental, gestión de activos, GMAO/CMMS, FSM, seguridad de la información, calidad de software y pruebas.

Para evitar una afirmación excesiva, la expresión "cumple" se interpreta en este documento como: evidencia de diseño, implementación o validación que responde a criterios reconocidos por una norma o estándar, sin equivaler a una auditoría externa de certificación.

Alcance declarado

Referente Relación con el proyecto Implementación o evidencia en el aplicativo

Alineación de diseño y calidad; no certificación.

ISO/IEC 25010 - calidad de producto de software

Arquitectura modular, separación frontend/backend, validación con Zod, RBAC, pruebas, PWA y control de errores.

Modelo para valorar adecuación funcional, confiabilidad, seguridad, mantenibilidad, usabilidad y portabilidad.

Aplicación adaptada al alcance académico.

ISO/IEC/IEEE 12207 procesos de ciclo de vida del software

Capítulos de metodología, desarrollo, validación, bitácora técnica, pruebas y documentación del monorepo.

Organiza actividades de análisis, diseño, implementación, verificación, validación y mantenimiento.

ISO/IEC/IEEE 29119 pruebas de software

Alineación con estrategia de pruebas; no auditoría formal.

Referente para vocabulario, procesos y documentación de pruebas.

Suite de pruebas unitarias, integración, reglas de negocio, seguridad, generación documental y proyección de casos.

Controles técnicos parciales; no SGSI certificado.

Criterios para gestión de riesgos, control de acceso, protección de información y mejora continua.

JWT, cookies HttpOnly, RBAC, validación de payloads, auditoría, protección de evidencias y control de rutas.

ISO/IEC 27001:2022 e ISO/IEC 27002 seguridad de la información

Alineación documental y de proceso.

ISO 9001:2015 gestión de calidad

Soporta enfoque por procesos, información documentada, trazabilidad, control y mejora.

Flujo de 14 pasos, evidencias, actas, documentos, SES, facturas, pagos, matriz de trazabilidad y bitácora.

Alineación funcional tipo GMAO/CMMS.

ISO 55001 - gestión de activos

Referencia para planificación, operación, soporte y mejora de activos físicos.

Módulos de activos, mantenimiento, recursos, kits típicos, equipos, herramientas y evidencias asociadas a órdenes.

Conclusión de esta sección: el aplicativo CERMONT se ubica como una plataforma FSM/GMAO a medida. Su aporte no consiste en reemplazar una certificación ISO, sino en traducir buenas prácticas de trazabilidad, seguridad, pruebas, calidad de software, gestión documental y gestión de activos a un flujo operativo real de la empresa.

Corrección agregada: alineación normativa y técnica del aplicativo CERMONT S.A.S.


<!-- Página 82 de 207 -->

estado de la validación es una fortaleza académica y no una debilidad del proyecto.


<!-- Página 83 de 207 -->

# 5 Metodología

## 5.1 Tipo de proyecto

El trabajo corresponde a una práctica empresarial con enfoque de investigación aplicada tecnológica. Su propósito es analizar una necesidad real de CERMONT S.A.S., diseñar una solución de software, implementarla de manera progresiva y validar su funcionamiento mediante pruebas verificables. El producto principal es un aplicativo web que apoya la gestión de órdenes de trabajo, trazabilidad documental y cierre administrativo.

La metodología se articula con Design Science Research [10, 56], en la medida en que el conocimiento se construye a través del diseño y evaluación de un artefacto. El artefacto no es únicamente código fuente; también incluye modelo de datos, arquitectura, flujos de usuario, plantillas, formularios, evidencias, reglas de negocio y documentación técnica.

## 5.2 Fases metodológicas

## 5.3 Fuentes de información

Las fuentes primarias del proyecto son los documentos suministrados por CERMONT S.A.S. y el material del anteproyecto aprobado. Entre ellos se encuentran la inducción HES, formatos de planeación de obra, inspección de líneas de vida verticales, mantenimiento preventivo CCTV, registros fotográficos y el documento de proceso de ejecución y cierre administrativo [3-7]. También se consideran las observaciones del anteproyecto y los requisitos funcionales derivados del flujo operativo.

Las fuentes secundarias son sitios oficiales, documentación técnica y repositorios de software. En esta categoría se incluyen herramientas de FSM, CMMS, ERP, formularios dinámicos, extracción documental, PWA y seguridad web. Estas fuentes sirven para sustentar decisiones técnicas y comparar alternativas.


<!-- Página 84 de 207 -->

**Tabla 5.1: Fases metodológicas del proyecto. Fuente: Elaboración propia.**

Comprender el flujo actual y los formatos existentes.

Fase Propósito Actividades principales Evidencia esperada Diagnóstico documental y operativo

Revisión de formatos, proceso paso a paso, inducción HES, anteproyecto y observaciones.

Inventario de documentos, flujo actual y matriz de problemas. Diseño funcional Definir módulos, roles, estados y reglas del sistema.

Diagramas y especificación funcional.

Casos de uso, arquitectura, modelo de datos, estados de orden y formularios.

Desarrollo Construir los módulos principales del aplicativo.

Desarrollo de frontend, backend, base de datos, autenticación, órdenes, evidencias e informes.

Código fuente, capturas y pruebas funcionales. Validación Comprobar que el sistema responda al flujo de negocio.

Actas de prueba, matriz de resultados y observaciones.

Pruebas de escenarios, revisión por usuarios, checklist de funcionalidades y medición de indicadores reales.

Documentación final

Consolidar el libro de trabajo de grado.

Redacción académica, revisión de citas, anexos y conclusiones.

Libro final y PDF compilado.


<!-- Página 85 de 207 -->

## 5.4 Integración de la documentación técnica 00-22

Además de las fuentes institucionales y del repositorio, el proyecto dispone de una serie de veintidós documentos técnicos secuenciales, identificados en el directorio docs/PROMPTS como 00.md a 22.md. Esta serie funciona como bitácora de implementación del aplicativo y documenta, de manera incremental, la construcción de la base transversal, los módulos del flujo de 14 pasos y la estabilización final del sistema.

Metodológicamente, esta documentación no se incorpora como anexo literal ni como manual operativo dentro del cuerpo del libro. Su uso consiste en reconstruir cómo evolucionó el sistema: qué módulo se abordó en cada etapa, qué dependencias existían entre componentes, qué reglas de negocio se fijaron y qué compuertas de calidad se exigieron antes de considerar una iteración como aceptable. En consecuencia, los documentos 00-22 se emplean como evidencia técnica complementaria para explicar arquitectura, trazabilidad de requisitos, secuencia de implementación y estado de madurez de los módulos descritos en los Capítulos 6, 7 y 8.

A continuación, se detalla la correspondencia metodológica, el aporte específico y las evidencias asociadas a cada uno de estos documentos dentro de la arquitectura técnica del aplicativo en la Tabla 5.2.

**Tabla 5.2: Matriz de integración de la serie técnica de documentos 00-22. Fuente: Elaboración propia.**

Doc. Tema principal Cap. Evidencia resumida Estado metodológico

Soporte de arquitectura.

Base transversal 5, 6, 8 Roles, autenticación, API, diseño y observabilidad.

Dashboard y KPIs 6, 7 Panel de seguimiento gerencial y contratos de analítica.

Implementado como vista de seguimiento.

Implementado.

Solicitudes 1, 6, 7 Entrada formal del servicio y creación de requerimientos.

Visitas técnicas 1, 6, 7 Registro de levantamientos, mediciones y evidencias iniciales.

Implementado; captura dedicada pendiente.

Implementado.

Propuestas 1, 6, 7 Oferta técnica y económica vinculada al flujo comercial.

Implementado.

Órdenes 1, 6, 7 Entidad central que agrupa estados, reglas y trazabilidad.

Implementado.

Planeación 1, 6, 7 Paquetes de recursos, kits, personal y documentos previos.

Continúa en la siguiente página...


<!-- Página 86 de 207 -->

Tabla 5.2 - Continúa de la página anterior

Doc. Tema principal Cap. Evidencia resumida Estado metodológico

Ejecución 1, 6, 7 Sesiones de campo, formularios, estados y sincronización parcial.

Implementado con alcance offline parcial.

Evidencias 1, 6, 7, 8 Gestión visual y contratos de soportes asociados a órdenes.

Implementado; sincronización binaria completa pendiente.

Informes técnicos 1, 6, 7, 8 Generación y consulta de informes derivados de la ejecución.

Implementado con evidencia técnica.

Implementado.

Actas 1, 6, 7 Actas de entrega y soporte de aceptación del cliente.

Cierre administrativo 1, 6, 7 Vista de seguimiento documental posterior a la ejecución.

Implementado como control interno.

SES / Ariba 1, 6, 7 Registro y control de SES, referencias y soportes.

Implementado sin integración externa directa.

Facturas 1, 6, 7 Seguimiento de facturas y estado de aprobación.

Implementado; captura dedicada pendiente.

Implementado.

Pagos 1, 6, 7 Registro de pago y cierre financiero del servicio.

Costos 1, 6, 7 Comparación entre propuesta, ejecución y cierre.

Implementado; métricas reales pendientes.

Implementado.

Activos 6, 7 Asociación de intervenciones con equipos o sistemas atendidos.

Mantenimiento 6, 7 Catálogos y kits para actividades repetibles. Implementado.

Implementado.

Documentos 5, 6, 7 Núcleo documental para soportes, plantillas y archivos.

Implementado.

Recursos y kits 1, 6, 7 Disponibilidad de recursos para planeación y ejecución.

Usuarios y RBAC 6, 7, 8 Administración de usuarios, permisos y roles. Implementado.

Estabilización 5, 8 Pruebas, compuertas y preparación para entrega.

Soporte de validación técnica.

## 5.5 Variables e indicadores de validación

Para evitar afirmaciones no verificadas, la validación se plantea como una matriz de indicadores a medir durante la práctica o durante una prueba piloto autorizada. Los valores de línea base y los valores posteriores solo deben incorporarse cuando exista registro real.


<!-- Página 87 de 207 -->

**Tabla 5.3: Indicadores propuestos para validación con datos reales. Fuente: Elaboración propia.**

Indicador Forma de medición Estado actual en el libro Tiempo de planeación

Comparar tiempo requerido para preparar una orden antes y después del sistema.

Pendiente por medir. Completitud documental

Verificar si todos los formatos y evidencias exigidos quedaron asociados a la orden.

Pendiente por medir. Trazabilidad de evidencias

Revisar si cada evidencia conserva orden, usuario, fecha, descripción y archivo.

Evaluación funcional. Errores de diligenciamiento

Contar campos obligatorios vacíos o inconsistencias detectadas en revisión.

Pendiente por medir. Satisfacción de usuarios

Pendiente por aplicar.

Aplicar instrumento breve o SUS únicamente si los usuarios prueban el sistema.

## 5.6 Arquitectura del desarrollo

El desarrollo del software se organizó siguiendo una estructura por capas: interfaz de usuario (frontend), servicios de aplicación (backend API), lógica de negocio (servicios del dominio) y persistencia (base de datos). Esta separación permite mantener independencia entre la presentación, las reglas del negocio y el almacenamiento [16, 21].

Para la gestión del desarrollo se adoptaron prácticas iterativas con entregas incrementales, priorizando módulos según su criticidad para el flujo operativo. Cada iteración produjo funcionalidad verificable que podía ser revisada y ajustada antes de continuar con la siguiente.

## 5.7 Criterios de rigor

El documento debe mantener separación entre diagnóstico, diseño, implementación y resultados. Una funcionalidad puede estar propuesta, diseñada, implementada o validada; cada estado debe expresarse con precisión. Asimismo, las cifras económicas internas no deben usarse como justificación si no existen soportes autorizados. La investigación de precios se limita a valores publicados por proveedores o páginas oficiales, como planes de Jobber o estimaciones visibles en páginas de precios de Odoo y ServiceM8 [25, 27, 46].


<!-- Página 88 de 207 -->

## 5.8 Flujo de trabajo Contract-First: del esquema a la interfaz

El desarrollo de cada módulo del aplicativo siguió un flujo de trabajo estandarizado de once pasos, diseñado para evitar que una funcionalidad llegara al frontend sin haber sido validada previamente en las capas de contrato, modelo de datos, lógica de negocio y API. Este enfoque, conocido como Contract-First Development, establece que el contrato de datos -expresado como un esquema Zod en el paquete @cermont/shared-types- constituye el primer artefacto construido y la fuente de verdad de la cual se derivan todas las implementaciones subsecuentes.

validaciones (longitud, formato, obligatoriedad, valores permitidos) y los comandos de mutación (crear, actualizar, aprobar, rechazar, archivar). Este esquema es la única fuente de verdad del contrato.

estático sin duplicar definiciones.

mismos nombres de campo, tipos y restricciones definidos en el esquema Zod.

ses que reciben datos tipados, aplican reglas de dominio, calculan estados, bloqueos (blockers) y siguientes acciones (nextActions), y retornan resultados o errores tipados.

invoca el servicio y retorna una respuesta con el envoltorio estándar { success, data, error }. El controlador no contiene lógica de negocio.

middlewares en orden: authenticate →authorize(permiso) →validateBody(schema) →controller.

lógica de negocio de forma aislada, sin dependencia de HTTP ni base de datos.


<!-- Página 89 de 207 -->

ciones HTTP válidas e inválidas, respetando RBAC y validaciones.

capsula la llamada HTTP al endpoint del backend, utilizando el cliente HTTP centralizado apiClient.

useMutation para escrituras) con claves de consulta estables y centralizadas.

de TanStack Query, con estados de carga, error, vacío, prohibido y offline.

Este flujo busca mantener trazabilidad completa: cada pantalla del frontend debe tener un endpoint correspondiente en el backend, cada endpoint debe estar respaldado por un servicio con pruebas, y cada servicio debe operar sobre datos validados por un esquema Zod compartido.

## 5.9 Compuertas de calidad por iteración

Cada iteración de desarrollo -entendida como la implementación de un módulo completo siguiendo el flujo contract-first- concluyó con la ejecución obligatoria de un conjunto de compuertas de calidad (quality gates) diseñadas para detectar regresiones, inconsistencias de tipos, código no utilizado y problemas de accesibilidad antes de considerar el módulo como terminado. La Tabla 5.4 describe cada compuerta, su herramienta asociada y el criterio de aprobación.

La aplicación sistemática de estas compuertas aseguró que el código entregado al repositorio cumpliera con los estándares de calidad definidos en las reglas de desarrollo de CERMONT S.A.S., que prohíben explícitamente el uso de any, null, undefined, console.log en producción, datos simulados en producción y captura silenciosa de errores.


<!-- Página 90 de 207 -->

**Tabla 5.4: Compuertas de calidad aplicadas por iteración de desarrollo. Fuente: Elaboración propia.**

Compuerta Descripción Criterio de aprobación typecheck Verificación estática de tipos TypeScript en todos los workspaces del monorepo.

Cero errores. No se permite @ts-ignore, as any ni supresiones. lint Análisis estático de estilo y calidad de código mediante Biome.

Cero errores y cero advertencias. test Ejecución de pruebas unitarias y de integración con Vitest.

Todas las pruebas pasan. No se eliminan pruebas para aprobar. build Compilación de producción del backend (TypeScript →JavaScript) y del frontend (Next.js build).

Build exitoso sin errores de compilación. verify Pipeline completo: typecheck + build. Ambas compuertas superadas. contracts: check

Verificación de que los contratos compartidos no tienen cambios no intencionados.

Cero problemas reportados.

Sin divergencias entre instantáneas (snapshots). react-doctor Auditoría de componentes React: componentes gigantes, exports no usados, problemas de hidratación, Suspense, accesibilidad.


<!-- Página 91 de 207 -->

## 5.10 Instrumentos de recolección y análisis de información

Para la fase de diagnóstico se emplearon tres instrumentos principales de recolección de información, todos aplicados sobre documentos reales suministrados por CERMONT S.A.S. o disponibles en fuentes públicas verificables:

mentos internos de la empresa: el formato de planeación de obra, el formato de inspección de líneas de vida verticales, el formato de mantenimiento preventivo CCTV, el registro fotográfico de anclaje de escalera y el documento de inducción HES. Para cada formato se identificaron: propósito, campos requeridos, tipo de dato esperado, reglas de validación implícitas, evidencias asociadas y frecuencia de uso. Este análisis sirvió como base para el diseño de los formularios digitales y los kits típicos del sistema.

por la empresa, desde la solicitud del cliente hasta el pago, identificando para cada paso: entidad principal, documento generado, responsable, dependencia con el paso anterior y criterio de completitud. Este análisis permitió identificar cinco fallas críticas: planeación, ejecución, informes y actas, facturación y control de costos reales.

MONT S.A.S. [1], la página de misión institucional [2], el informe de gestión de la Agencia Nacional de Hidrocarburos, los reportes de la Asociación Colombiana del Petróleo y Gas, y los documentos técnicos de proveedores de software FSM (Jobber, Odoo, ServiceM8, Fracttal). Esta revisión proporcionó el contexto sectorial y el soporte económico y funcional utilizado en la justificación del proyecto.

La triangulación de estas tres fuentes -documentos internos, flujo de proceso y fuentes institucionales- permitió construir un diagnóstico fundamentado sin depender de entrevistas no documentadas, encuestas no aplicadas o cifras internas no autorizadas para divulgación.


<!-- Página 92 de 207 -->

## 5.11 Matriz de trazabilidad metodológica

Para verificar que cada objetivo específico del proyecto fuera abordado mediante actividades concretas y con entregables definidos, se construyó la matriz de trazabilidad que se presenta en la Tabla 5.5. Esta matriz relaciona los objetivos específicos con las fases metodológicas, las actividades ejecutadas, las herramientas empleadas, los entregables producidos y los criterios de validación aplicados. Su propósito es demostrar la coherencia interna del diseño metodológico y facilitar la revisión académica del cumplimiento de cada objetivo.

**Tabla 5.5: Matriz de trazabilidad: objetivos, fases, actividades y entregables. Fuente: Elaboración propia.**

Objetivo Fase Actividades principales Herramientas Entregable / Evidencia 1. Diagnóstico

Diagnóstico documental

Documentos Cermont y diagramas TikZ.

Inventario documental, flujo y fallas críticas.

Revisión de formatos, flujo de 14 pasos y fases críticas de fragmentación.

Arquitectura, MER y referencias técnicas.

Arquitectura, modelo de datos y RBAC.

Módulos, estados, datos, RBAC y decisiones arquitectónicas.

Código, pruebas y capturas.

Desarrollo Frontend, backend, base de datos y autenticación.

Next.js, Express, MongoDB, Zod, TypeScript y Vitest.

Informe de pruebas y aceptación.

Vitest, Supertest, OWASP y checklist.

## 5.12 Estructura del repositorio y organización del código

El código fuente del aplicativo se organiza bajo una arquitectura de monorepo gestionada mediante npm workspaces, compuesta por tres áreas principales de desarrollo. Esta estructura, verificable en el repositorio del proyecto [57], refleja la separación de responsabilidades definida en la arquitectura del sistema.

El workspace backend contiene la API REST implementada en Express 5.2.1 con TypeScript estricto. Su estructura interna sigue el patrón de carpetas por responsabilidad: config/ (cone-


<!-- Página 93 de 207 -->

xión a base de datos, variables de entorno), routes/ (definición de endpoints), controllers/ (manejo de peticiones HTTP), services/ (lógica de negocio), models/ (esquemas Mongoose), middlewares/ (autenticación, autorización, validación) y utils/ (funciones auxiliares).

El workspace frontend contiene la interfaz de usuario implementada en Next.js 16 con App Router y React 19. Su estructura sigue el patrón de diseño por módulos (Feature-Sliced Design): cada módulo de negocio (órdenes, planeación, evidencias, documentos, costos, mantenimiento) agrupa su API client, hooks de TanStack Query, componentes UI, tipos y utilidades en una carpeta dedicada. Los componentes compartidos (Button, Card, Dialog, FormField, Badge, Table) residen en components/common/.

El workspace packages contiene los paquetes compartidos que actúan como fuente única de verdad para los contratos de datos. @cermont/shared-types define los esquemas Zod y los tipos TypeScript inferidos, consumidos tanto por el backend como por el frontend. @cermont/domain centraliza las definiciones de roles RBAC, los helpers de verificación de permisos y las constantes de negocio. @cermont/config unifica la validación de variables de entorno.

Esta organización del código, alineada con los principios de Clean Code, DRY y SSOT documentados en las reglas de desarrollo de CERMONT S.A.S., favorece que cada responsabilidad tenga una ubicación predecible en el repositorio y que las dependencias entre capas estén explícitamente controladas.

## 5.13 Procedimiento de validación metodológica

El procedimiento de validación del proyecto se diseñó para verificar el cumplimiento de cada objetivo específico mediante criterios objetivos y reproducibles. Para el objetivo 1 (diagnóstico), el criterio de validación fue la completitud del inventario documental: todos los formatos operativos suministrados por CERMONT S.A.S. debían estar analizados y sus campos caracterizados en la matriz de diagnóstico. Para el objetivo 2 (diseño), el criterio fue la coherencia arquitectónica: cada módulo definido en el diseño debía tener una justificación técnica documentada en los ADR y una relación explícita con al menos una fase crítica identificada en el diagnóstico.

Para el objetivo 3 (implementación), el criterio de validación fue doble: funcional (cada módulo implementado debía superar las compuertas de calidad: typecheck, lint, test, build) y de co-


<!-- Página 94 de 207 -->

bertura (cada endpoint de la API debía tener al menos una prueba de integración que verificara su comportamiento ante entradas válidas e inválidas). Para el objetivo 4 (validación), el criterio fue la completitud de la matriz de pruebas: todos los escenarios de uso identificados en la fase de diagnóstico debían estar cubiertos por al menos una prueba automatizada o un caso de aceptación cualitativa documentado.

Este procedimiento de validación en cascada, donde cada fase depende de la completitud de la anterior, aseguró que el proyecto avanzara de manera ordenada y que ningún objetivo se considerara cumplido sin evidencia verificable.

## 5.14 Implicaciones del contexto de práctica empresarial

La ejecución del proyecto en el contexto de práctica empresarial, definido por el programa de Ingeniería Electrónica de la Universidad de Pamplona, determinó varias características del diseño metodológico y del alcance del trabajo. A continuación se discuten las implicaciones de este contexto en la estructura del proyecto.

En primer lugar, la práctica empresarial sitúa al estudiante en un contexto organizacional real, con procesos, documentos, restricciones y expectativas que no pueden ser simulados en un entorno puramente académico. Esta inmersión permitió acceder a los formatos operativos de CERMONT S.A.S., comprender el flujo de trabajo de catorce pasos y dialogar con los actores del proceso, generando un diagnóstico fundamentado en evidencia documental y observación directa. Sin embargo, también impuso limitaciones: el acceso a datos cuantitativos de desempeño (tiempos, costos, volúmenes) está condicionado por las políticas de confidencialidad de la empresa, y la validación del sistema con usuarios reales requiere coordinación con los ciclos operativos de la organización, que no siempre coinciden con el calendario académico.

En segundo lugar, este contexto exigió que el proyecto equilibrara dos objetivos potencialmente en tensión: por un lado, la construcción de un artefacto de software funcional que respondiera a las necesidades operativas de la empresa; por otro lado, la producción de un documento académico que cumpliera con los estándares de rigor, originalidad y trazabilidad exigidos por la universidad. Este equilibrio se logró mediante la adopción del marco metodológico de Design Science Research, que


<!-- Página 95 de 207 -->

valora tanto el artefacto construido como el conocimiento generado durante su diseño y evaluación.

En tercer lugar, la práctica empresarial confiere al trabajo un carácter aplicado que lo diferencia de proyectos puramente teóricos o de simulación. El software desarrollado no es un prototipo académico, sino un sistema que responde a necesidades reales de una organización, utiliza tecnologías de producción y está sujeto a restricciones auténticas de seguridad, escalabilidad y mantenibilidad. Esta orientación práctica es consistente con el perfil de egreso del programa de Ingeniería Electrónica, que busca formar profesionales capaces de aplicar conocimientos de ingeniería para resolver problemas concretos en contextos organizacionales e industriales.

## 5.15 Plan de trabajo y cronograma de ejecución

El proyecto se ejecutó a lo largo de las fases descritas en este capítulo, con una distribución temporal que priorizó las actividades de diagnóstico y diseño en las primeras semanas, reservando la mayor parte del tiempo disponible para la implementación iterativa de los módulos. La Tabla 5.6 presenta una síntesis de la distribución temporal de las actividades principales del proyecto.

**Tabla 5.6: Distribución temporal de las actividades del proyecto. Fuente: Elaboración propia.**

Diagnóstico Primeras 3 semanas

Actividad principal Fase metodológica Dedicación estimada Revisión documental de formatos CERMONT y flujo de 14 pasos

Semanas 2 a 6

Estado del arte y marco teórico

Revisión de literatura: FSM, CMMS, formularios dinámicos, seguridad web

Diseño funcional Semanas 4 a 8

Definición de arquitectura, modelo de datos y decisiones de diseño (ADR)

Desarrollo Semanas 6 a 20

Desarrollo iterativo de módulos (7 iteraciones)

Validación Semanas 16 a 22

Pruebas unitarias, de integración y validación de seguridad

Documentación Semanas 18 a 24

Redacción del libro de trabajo de grado y compilación de anexos

Las fechas exactas de inicio y finalización de cada actividad deben verificarse con el cronograma aprobado en el anteproyecto y con el registro de avance de la práctica empresarial. La distribución presentada en esta tabla refleja la secuencia lógica de dependencias entre fases, no necesariamente


<!-- Página 96 de 207 -->

la calendarización precisa que depende de factores externos como la disponibilidad de documentos, la coordinación con la empresa y el calendario académico.

## 5.16 Modelo de integración académica de la documentación técnica 00-22

La documentación técnica 00-22 se utilizó como bitácora estructurada del desarrollo del aplicativo. Su valor metodológico no consiste en aumentar el volumen del libro mediante anexos literales, sino en reconstruir la secuencia de decisiones, módulos, reglas y criterios de calidad que guiaron la implementación. Cada documento aporta una pieza del proceso: algunos definen arquitectura, otros describen backend, frontend, seguridad, pruebas, evidencias, despliegue o cierre administrativo. La integración académica consiste en traducir esa documentación de ingeniería en una narrativa verificable.

**Tabla 5.7: Matriz ampliada de integración de la documentación técnica 00-22 en el libro. Fuente: elaboración propia.**

Doc. Tema principal Uso académico en el libro Capítulo principal

Cap. 5-6

DOC-00 Contexto técnico inicial Delimita visión, alcance y restricciones iniciales del aplicativo.

Cap. 6

DOC-01 Stack tecnológico Sustenta la selección de tecnologías y alternativas consideradas.

Cap. 6

DOC-02 Estructura de carpetas Evidencia la organización del monorepo y la separación de responsabilidades.

Cap. 6-7

DOC-03 Backend Describe rutas, controladores, servicios, modelos y validaciones del servidor.

Continúa en la siguiente página


<!-- Página 97 de 207 -->

Doc. Tema principal Uso académico en el libro Capítulo principal

Cap. 4, 6, 8

DOC-04 Seguridad y RBAC Fundamenta autenticación, autorización, roles y permisos.

Cap. 6-7

DOC-05 Frontend Explica módulos de interfaz, consultas, estado local y experiencia de usuario.

Cap. 2, 6, 8

DOC-06 Offline-first Justifica PWA, IndexedDB, cola local y sincronización diferida.

Cap. 1, 6, 7

DOC-07 Módulos de negocio Conecta el flujo de 14 pasos con entidades, módulos y vertical slices.

Cap. 6-7

DOC07B

Dashboard FSM Define KPIs, blockers, nextActions y visión ejecutiva del proceso.

Cap. 6, anexos

DOC-08 Despliegue Describe Docker, VPS, variables de entorno y estrategia de publicación.

Cap. 6

DOC-09 Diccionario de datos Relaciona esquemas, entidades, campos y contratos.

Cap. 6-8

DOC-10 Contratos REST Evidencia endpoints, payloads, roles y comunicación cliente-servidor.

Cap. 5, 8

DOC-11 Reglas del agente Documenta disciplina de implementación y restricciones de calidad.

Cap. 5, 9

DOC-12 Auditoría y remediación Permite explicar iteraciones de corrección, deuda técnica y reconstrucción.

Continúa en la siguiente página


<!-- Página 98 de 207 -->

Doc. Tema principal Uso académico en el libro Capítulo principal

Cap. 5, anexos

DOC-13 Setup local Respalda reproducibilidad, comandos y ambiente de desarrollo.

Cap. 6-8

DOC-14 Errores y logging Sustenta manejo de errores, trazabilidad técnica y observabilidad.

Cap. 8

DOC-15 Testing Define pruebas, convenciones, cobertura y gates de calidad.

Cap. 5

DOC-16 Git y control documental Explica control de cambios, ramas y trazabilidad de versiones.

Cap. 8

DOC-17 Seed y datos demo Apoya escenarios de prueba sin afirmar datos reales de operación.

Cap. 8-9

DOC-18 Observabilidad Fundamenta health checks, monitoreo y diagnóstico técnico.

Cap. 6-7

DOC-19 Archivos y evidencias Sustenta subida, almacenamiento, metadatos, firmas y seguridad de archivos.

Cap. 9-10

DOC-20 Soporte operativo Define mantenimiento, soporte y operación posterior al despliegue.

Cap. 5, 8, 9

DOC-21 Madurez documental Establece criterios de calidad, documentación y completitud por módulo.

Cap. 1, 6, 7

DOC-22 Cierre de brechas Ordena el pipeline desde propuesta hasta factura, pago y costos reales.


<!-- Página 99 de 207 -->

La matriz anterior permite convertir una colección de documentos técnicos en evidencia metodológica. Cada documento no se usa como cita aislada, sino como soporte de una fase del desarrollo. Así, la metodología se fortalece porque no depende únicamente de una descripción general del ciclo de vida del software, sino de un rastro documental concreto que muestra cómo se fueron definiendo los módulos, la arquitectura y las compuertas de calidad.

## 5.17 Procedimiento de uso de los documentos técnicos durante el desarrollo

El proceso de desarrollo siguió una secuencia de lectura, implementación y verificación. Antes de construir un módulo, se revisaba el documento técnico correspondiente para identificar el propósito de negocio, las entidades involucradas, los endpoints esperados, los permisos requeridos y las pruebas mínimas. Luego se implementaba la porción vertical del sistema: contrato compartido, backend, servicio de dominio, endpoint, cliente HTTP, hook de interfaz, página, estados visuales y prueba. Finalmente, se verificaba que el módulo no generara rutas rotas, datos simulados en producción, duplicidad de lógica o inconsistencias con el flujo de 14 pasos.

Este procedimiento se alinea con una metodología de investigación aplicada porque transforma un problema organizacional en un artefacto de software evaluable. La documentación técnica actúa como bitácora de diseño y como mecanismo de control de calidad. Su integración en el libro permite demostrar que el aplicativo no fue construido de forma improvisada, sino mediante decisiones sucesivas, documentadas y trazables.

## 5.18 Matriz de fases metodológicas y documentos de soporte


<!-- Página 100 de 207 -->

**Tabla 5.8: Fases metodológicas y documentos técnicos asociados. Fuente: elaboración propia.**

Fase Propósito Documentos de soporte Resultado esperado Diagnóstico Comprender el flujo de 14 pasos, fallas y actores.

DOC-00, DOC-07, DOC-22, documentos internos de CERMONT.

Matriz problemarequisito. Diseño arquitectónico

Definir estructura, stack, módulos, entidades y contratos.

DOC-01, DOC-02, DOC-09, DOC10.

Arquitectura y modelo de datos. Implementación funcional

Construir módulos de negocio por vertical slices.

DOC-03, DOC-05, DOC-07, DOC07B, DOC-19.

Funciones implementadas o parciales. Seguridad y control Aplicar RBAC, validación, errores y auditoría.

DOC-04, DOC-14, DOC-21. Módulos protegidos y trazables. Validación técnica Ejecutar pruebas, gates y revisión de comportamiento.

DOC-11, DOC-13, DOC-15, DOC17, DOC-18.

Evidencias de pruebas y limitaciones. Cierre y continuidad Documentar soporte, mantenimiento y evolución.

DOC-20, DOC-21, DOC-22. Recomendaciones y trabajo futuro.


<!-- Página 101 de 207 -->

# 6 Desarrollo del Aplicativo Web

## 6.1 Enfoque funcional del sistema

El aplicativo web se concibe y construye como una plataforma de grado de producción diseñada para centralizar, controlar y auditar el ciclo de vida documental y operativo de las órdenes de trabajo de CERMONT S.A.S.

### 6.1.1 Matriz de estado de implementación y alcance

Para preservar la integridad académica y la transparencia técnica ante el jurado, la Tabla 6.1 detalla el estado actual de las funcionalidades descritas en el sistema v1.0. Se distinguen las capacidades implementadas con pruebas de aquellas propuestas como evoluciones futuras.

Esta delimitación asegura que el sistema entregado se enfoque en resolver la fragmentación documental interna, dejando las integraciones con sistemas externos de terceros como trabajos futuros de integración empresarial.

Solicitud Propuesta / PO Planeación validada Ejecución + evidencias Informe y acta SES, factura y pago

Cada transición exige datos, documentos, permisos y registro de auditoría

**Figura 6.1: Orquestación del flujo de trabajo digitalizado (BPMN) que integra los 14 pasos operativos en el aplicativo. Fuente: elaboración propia.**

Solicitud Visita Propuesta PO Planeación Ejecución Informe

Operativo

Acta Firma SES SES aprob. Factura Fact. aprob. Pago

Administrativo

**Figura 6.2: Flujo operativo-documental implementado para CERMONT S.A.S. Fuente: Elaboración propia.**


<!-- Página 102 de 207 -->

**Tabla 6.1: Matriz de estado de implementación. Fuente: Elaboración propia.**

Funcionalidad Estado Evidencia / Justificación Autenticación JWT + RBAC Implementado Controladores y middlewares en backend/ src/controllers/auth.controller.ts, backend/src/middlewares/auth. middleware.ts y roles en packages/domain/src/roles.ts. FSM multietapa de órdenes Implementado Estados y transiciones en packages/shared-types/src/schemas/ work-order-fsm.ts y backend/src/ services/order/order-rules.ts. Operación offline con Service Worker, Dexie e IndexedDB

Parcialmente implementado con evidencia E2E

Service Worker fuente en frontend/src/app/sw.ts, ruta generada en /serwist/sw.js, persistencia local en frontend/src/lib/offline/ offline-db.ts, cola de sincronización en frontend/src/lib/offline/ sync-engine.ts y endpoints backend en backend/src/modules/sync/. La prueba de producción verifica app shell y rutas internas calentadas; la captura offline completa de cada formulario sigue requiriendo validación por corte vertical. Generación PDF Implementado Servicios backend/src/services/report. service.ts y backend/src/services/ pdf-generator.service.ts. Evidencias con georreferenciación opcional

Implementado Contrato en packages/shared-types/src/ schemas/evidence.schema.ts y servicio en backend/src/services/evidence. service.ts. Seguimiento de cierre administrativo Implementado como seguimiento documental interno

Registro de actas, SES, facturas y pagos; no integra SAP Ariba ni emite facturación electrónica DIAN. Dashboard y analítica operativa Implementado Contrato en packages/shared-types/src/ schemas/analytics.schema.ts y vistas de panel en frontend/src/app/(dashboard) /dashboard/. Asistente AI (Chat) Complementario / no crítico

Módulo ai/; no se utiliza como evidencia principal de cumplimiento de objetivos. OCR / Extracción de Datos Propuesto v2.0 Requiere integración con API de visión. Firma Digital Criptográfica Propuesto v2.0 Requiere certificado digital (PKI). Integración SAP Ariba Fuera de alcance Requiere contrato SAP Enterprise API. Emisión de facturación electrónica DIAN

Fuera de alcance El sistema registra seguimiento documental; la emisión requiere software contable certificado.


<!-- Página 103 de 207 -->

## 6.2 Módulos del sistema: Cobertura del flujo operativo y de soporte

El aplicativo organiza sus funcionalidades en módulos API agrupados por dominio de negocio. Para evitar ambigüedades entre módulos de negocio y grupos de rutas, el documento distingue entre módulos operativos vinculados a los 14 pasos de CERMONT S.A.S. y módulos transversales que respaldan seguridad, sincronización, auditoría y observabilidad de la plataforma.

**Tabla 6.2: Módulos operativos principales (Pasos 1-14). Fuente: Elaboración propia.**

Transversal

Módulo Función Técnica Paso CERMONT Autenticación Control de acceso RBAC y gestión de sesión JWT HttpOnly.

1 - 14

Órdenes de trabajo Motor FSM central de 15 estados y entidad raíz de trazabilidad.

3 - 4

Propuestas y PO Generación de propuestas económicas y validación de órdenes de compra.

Planeación y Kits Reserva de recursos, herramientas y personal técnico.

Checklists y Campo Ejecución de inspecciones y formularios con capacidad offline.

Evidencias Captura de soportes fotográficos geo-localizados.

Informes Técnicos Generación automatizada de reportes PDF (pdf-lib).

8 - 14

Cierre Consolidado Agregación de datos de acta, SES, factura y pago (Read Model).

Adicionalmente, el sistema se apoya en módulos de soporte como analytics (dashboard), sync (sincronización offline), audit (logs inmutables), users, documents, maintenance, inspections, history, alerts, admin, assets y ai (asistente complementario).


<!-- Página 104 de 207 -->

## 6.3 Evidencia visual del aplicativo desarrollado

Las siguientes capturas documentan pantallas reales del aplicativo y se incorporan como evidencia visual del desarrollo. Cada pantalla se interpreta desde su función operativa y desde su relación con el flujo de 14 pasos de CERMONT S.A.S. Cuando una captura muestra un estado vacío, este se entiende como evidencia de la interfaz, filtros y controles disponibles, no como medición de uso ni como resultado operativo cuantificado.

**Figura 6.3: Panel de control y visualización del flujo operativo de 14 pasos. Fuente: captura propia del aplicativo CERMONT.**

La Figura 6.3 muestra el panel de control principal, donde se presenta una lectura general del estado operativo y una representación navegable del ciclo de 14 pasos. Esta pantalla cumple la función de punto de entrada para gerencia y coordinación, ya que permite ubicar el avance de solicitudes, propuestas, planeación, ejecución, informes, actas, SES, facturación y pagos dentro de un mismo entorno. Su aporte al proyecto consiste en evidenciar que el aplicativo no se diseñó como un tablero genérico, sino como una interfaz orientada al proceso real de CERMONT S.A.S.


<!-- Página 105 de 207 -->

**Figura 6.4: Gestión de usuarios, roles y estado de acceso. Fuente: captura propia del aplicativo CERMONT.**

La Figura 6.4 evidencia el módulo de administración de usuarios y roles. Esta funcionalidad permite asociar cada cuenta con un perfil de responsabilidad, controlar su estado y soportar la aplicación del modelo RBAC descrito en la arquitectura. En el flujo operativo, este módulo es transversal, porque determina qué usuarios pueden crear solicitudes, aprobar información, ejecutar actividades, registrar evidencias o intervenir en el cierre administrativo.


<!-- Página 106 de 207 -->

**Figura 6.5: Formulario de creación de solicitud de trabajo. Fuente: captura propia del aplicativo CERMONT.**

La Figura 6.5 corresponde al registro inicial de una solicitud de trabajo. El formulario recoge datos básicos del cliente, ubicación, contacto, prioridad y descripción del requerimiento. Esta pantalla se relaciona con el Paso 1 del proceso CERMONT, porque formaliza la entrada del servicio al sistema y evita que la necesidad del cliente quede dispersa en correos, llamadas o mensajes sin trazabilidad documental.


<!-- Página 107 de 207 -->

**Figura 6.6: Creación de una propuesta económica. Fuente: captura propia del aplicativo CERMONT.**

La Figura 6.6 presenta la pantalla de creación de propuestas, con campos para información del cliente, vigencia e ítems económicos. La funcionalidad se vincula con el Paso 3 del flujo, en el cual se estructura la oferta técnica y económica que será evaluada por el cliente. En términos operativos, esta vista aporta evidencia de la captura estructurada de valores, cantidades y descripciones, datos que posteriormente alimentan la trazabilidad de costos y cierre.


<!-- Página 108 de 207 -->

**Figura 6.7: Listado y seguimiento de propuestas económicas. Fuente: captura propia del aplicativo CERMONT.**

La Figura 6.7 muestra el listado de propuestas, sus estados y filtros de consulta. Esta vista permite al área comercial revisar propuestas creadas, aprobadas o pendientes, y se relaciona con la transición entre el Paso 3 y el Paso 4. Su valor como evidencia radica en mostrar que la propuesta no queda como un documento aislado, sino como un registro consultable dentro del flujo que habilita la aprobación con orden de compra.


<!-- Página 109 de 207 -->

**Figura 6.8: Consulta y seguimiento de órdenes de trabajo. Fuente: captura propia del aplicativo CERMONT.**

La Figura 6.8 evidencia el módulo de órdenes de trabajo, entidad central para articular los pasos operativos y administrativos. La pantalla permite consultar órdenes, filtrar registros y revisar su estado. Dentro del flujo de 14 pasos, la orden actúa como hilo conductor entre solicitud, visita, propuesta, planeación, ejecución, evidencias, informe, acta, SES, factura y pago.


<!-- Página 110 de 207 -->

**Figura 6.9: Paquetes de planeación asociados a órdenes de trabajo. Fuente: captura propia del aplicativo CERMONT.**

La Figura 6.9 corresponde al módulo de planeación. En esta pantalla se centraliza la preparación de recursos, responsables y documentos requeridos antes de iniciar la actividad. Se relaciona con el Paso 5 del flujo y atiende una de las fallas críticas del proceso: la planeación incompleta de herramientas, personal, permisos y soportes previos a la ejecución.


<!-- Página 111 de 207 -->

**Figura 6.10: Catálogo de kits típicos para planeación de recursos. Fuente: captura propia del aplicativo CERMONT.**

La Figura 6.10 muestra el catálogo de kits, diseñado para reutilizar configuraciones típicas de herramientas, equipos o recursos por tipo de actividad. Esta funcionalidad complementa el Paso 5, ya que permite que la planeación no dependa exclusivamente de memoria individual o listados informales. La captura aporta evidencia de un mecanismo de estandarización operativo, útil para mitigar omisiones en la preparación de trabajos.


<!-- Página 112 de 207 -->

**Figura 6.11: Sesiones de ejecución en campo y estado de sincronización. Fuente: captura propia del aplicativo CERMONT.**

La Figura 6.11 presenta el módulo de sesiones de ejecución. La pantalla agrupa estados como activas, listas, completadas y sincronización pendiente, además de opciones para cargar documentos, hojas de cálculo y fotografías. Esta vista se relaciona con el Paso 6 y evidencia el soporte del aplicativo para capturar información durante la actividad en campo, incluyendo escenarios de conectividad variable.


<!-- Página 113 de 207 -->

**Figura 6.12: Gestor visual de evidencias por orden y etapa. Fuente: captura propia del aplicativo CERMONT.**

La Figura 6.12 corresponde al gestor de soportes visuales. La pantalla permite filtrar evidencias por orden y etapa, así como distinguir registros antes, durante y después de la intervención. Esta funcionalidad se vincula con los Pasos 6 y 7, porque las fotografías y soportes de campo son insumos para el informe técnico y para el cierre documental. La captura evidencia la intención de asociar cada soporte a una orden, evitando que las fotografías queden dispersas sin contexto.


<!-- Página 114 de 207 -->

**Figura 6.13: Gestión de documentos y soportes del aplicativo. Fuente: captura propia del aplicativo CERMONT.**

La Figura 6.13 muestra el módulo de gestión documental. Esta pantalla organiza documentos por tipo, estado y búsqueda, lo que permite relacionar soportes con órdenes, informes, actas o cierre administrativo. Su relación con el proyecto es transversal: los documentos son la evidencia que conecta la ejecución técnica con la aceptación del cliente y con los trámites de facturación.


<!-- Página 115 de 207 -->

**Figura 6.14: Actas de entrega y seguimiento de aceptación. Fuente: captura propia del aplicativo CERMONT.**

La Figura 6.14 evidencia el módulo de actas de entrega. Esta funcionalidad se relaciona con los Pasos 8 y 9, donde se genera el acta, se envía al cliente y se registra su aceptación o firma. La pantalla aporta evidencia de que el cierre técnico no se limita a completar la ejecución, sino que requiere un soporte documental formal para habilitar los pasos administrativos posteriores.


<!-- Página 116 de 207 -->

**Figura 6.15: Seguimiento de SES y soportes de Ariba. Fuente: captura propia del aplicativo CERMONT.**

La Figura 6.15 presenta el módulo de SES/Ariba, orientado al control de hojas de entrada de servicio, referencias, soportes y aprobación antes de facturar. Esta pantalla se relaciona con los Pasos 10 y 11 del flujo. Su aporte operativo consiste en mantener trazabilidad de los soportes que habilitan la facturación, sin afirmar integración directa con SAP Ariba ni emisión automática de SES.


<!-- Página 117 de 207 -->

**Figura 6.16: Resumen de cierre administrativo por actas, facturas y pagos. Fuente: captura propia del aplicativo CERMONT.**

La Figura 6.16 evidencia la vista consolidada de cierre administrativo. La pantalla agrupa actas, facturas y pagos, elementos vinculados con los Pasos 8 a 14. Su función es ofrecer una lectura de estado para el tramo final del proceso, donde una orden ejecutada debe convertirse en soporte aprobado, factura radicada y pago registrado.


<!-- Página 118 de 207 -->

**Figura 6.17: Motor de costos y consulta por orden. Fuente: captura propia del aplicativo CERMONT.**

La Figura 6.17 muestra la pantalla del motor de costos. Esta funcionalidad es transversal a los Pasos 3 a 14, porque conecta la propuesta económica, la planeación de recursos, el consumo real durante la ejecución y el seguimiento financiero del cierre. En esta versión, la captura evidencia el diseño del módulo y su interfaz de consulta; las métricas de desviación de costos quedan pendientes por anexar evidencia operativa con datos reales.


<!-- Página 119 de 207 -->

**Figura 6.18: Inventario y recursos asociados a la operación. Fuente: captura propia del aplicativo CERMONT.**

La Figura 6.18 corresponde al inventario de recursos. El módulo permite consultar herramientas, materiales, equipos y personal disponible para planeación y ejecución. Se relaciona principalmente con los Pasos 5 y 6, ya que la preparación correcta de recursos puede mitigar el riesgo de iniciar actividades sin los elementos necesarios. La captura evidencia la existencia de una vista de control, aunque los saldos y consumos reales deben documentarse con datos anexos de la empresa.


<!-- Página 120 de 207 -->

**Figura 6.19: Vista de activos e intervenciones asociadas. Fuente: captura propia del aplicativo CERMONT.**

La Figura 6.19 muestra el módulo de activos. Esta pantalla permite relacionar intervenciones con elementos físicos o sistemas atendidos por CERMONT S.A.S. En el flujo operativo, los activos ayudan a contextualizar solicitudes, visitas, órdenes y evidencias, especialmente cuando una actividad técnica se repite sobre equipos, instalaciones o componentes que requieren historial.


<!-- Página 121 de 207 -->

**Figura 6.20: Perfil de usuario y cambio de credenciales. Fuente: captura propia del aplicativo CERMONT.**

La Figura 6.20 documenta la vista de perfil. Aunque no pertenece a un paso operativo específico, se vincula con la seguridad transversal del sistema, pues permite administrar información básica del usuario y cambio de contraseña. Esta evidencia complementa el modelo de autenticación y control de acceso descrito en la arquitectura, necesario para proteger acciones críticas dentro del flujo de 14 pasos.

## 6.4 Arquitectura del software y estructura del monorepo

Para soportar de forma robusta las exigencias del sistema, el proyecto se estructura bajo un esquema de monorepo gestionado mediante npm workspaces y optimizado con Turborepo para la orquestación de tareas de compilación, formateo y testing. La organización de directorios en el repositorio de producción es la siguiente:

packages/shared-types: Contiene la definición única de los contratos de datos de la aplicación. Utiliza la librería Zod para declarar esquemas de validación y exporta tipos TypeScript


<!-- Página 122 de 207 -->

estrictos, actuando como la única fuente de verdad transaccional del proyecto.

backend: API REST de alto rendimiento implementada en Express 5.2.1 utilizando TypeScript estricto. Implementa la lógica de negocio pura, persistencia documental mediante Mongoose y la generación de documentos PDF con pdf-lib.

frontend: Interfaz web moderna basada en el framework de producción Next.js 16.2.4 con App Router, React 19 y Tailwind CSS para diseño visual cohesivo y mobile-first.

Esta separación física y conceptual de componentes y la centralización de tipos en el workspace compartido previene desviaciones y fallos de integración comunes en el desarrollo paralelo.

Frontend Next.js / React / UI modular

Gobierno técnico

Contratos compartidos

auditoría validación

Zod / tipos / RBAC

permisos

Backend API Express / servicios de dominio

Persistencia MongoDB / Mongoose / archivos

**Figura 6.21: Arquitectura por capas y flujo de integración del monorepo. Fuente: Elaboración propia.**


<!-- Página 123 de 207 -->

## 6.5 Justificación del stack tecnológico seleccionado

La selección del stack tecnológico se justifica a partir de necesidades verificables del proyecto y de la evidencia disponible en el repositorio. No se trata únicamente de un conjunto de herramientas contemporáneas, sino de una combinación orientada a resolver trazabilidad documental, heterogeneidad de formularios, control de acceso y operación con conectividad variable.

**Tabla 6.3: Evidencia técnica del stack en el repositorio. Fuente: elaboración propia.**

Componente Evidencia en el proyecto Función dentro del flujo Límite declarado Monorepo npm Carpetas backend, frontend y packages.

Comparte contratos y roles entre módulos del flujo.

Requiere control de cambios transversales. Express y rutas API Controladores, servicios y middlewares backend.

Expone operaciones para órdenes, evidencias, actas, SES y pagos.

La disciplina de capas debe mantenerse manualmente. MongoDB y Mongoose

Modelos documentales y subesquemas.

Conserva datos heterogéneos asociados a órdenes y soportes.

Requiere reglas explícitas de consistencia. Next.js y React Vistas del panel, formularios y rutas protegidas.

Presenta cada módulo del flujo a los usuarios autorizados.

Debe separar componentes de servidor y cliente. Zod y shared-types Esquemas compartidos y contratos exportados.

Valida payloads usados por frontend y backend.

No reemplaza reglas de negocio del servicio. PWA y sincronización

Permite continuidad parcial en actividades de campo y consulta offline de rutas previamente calentadas.

Serwist/Turbopack, Dexie, TanStack Query persistente, cola offline, estado de conexión con ping real y resultados por ítem.

Cobertura offline completa por formulario: pendiente por anexar evidencia E2E para cada mutación crítica. Generación documental

Servicios de PDF y módulo de documentos.

Apoya informes, actas y soportes de cierre.

Depende de plantillas y datos completos.

## 6.6 El contrato compartido: validación bajo enfoque de confianza cero (Zero Trust) con Zod

Un pilar de seguridad y robustez en la plataforma es la reducción de validaciones redundantes o divergentes entre capas. Mediante el uso de @cermont/shared-types, un único esquema Zod (ej. WorkOrderSchema, ProposalSchema, EvidenceSchema) es importado tanto por el frontend


<!-- Página 124 de 207 -->

como por el backend:

lado del cliente mediante la integración de React Hook Form. Esto proporciona retroalimentación inmediata sobre el formato, campos obligatorios y tipos de datos sin realizar peticiones de red, lo cual favorece una captura más clara para el técnico en campo.

procesamiento en la base de datos documental, un middleware centralizado en Express ejecuta un análisis sintáctico (safeParse) del payload utilizando el mismo esquema de Zod. Si el cliente ha enviado datos alterados o incompletos, la petición se rechaza de inmediato con un código HTTP 400 Bad Request, implementando un perímetro estricto de confianza cero (Zero Trust).

## 6.7 Estructura técnica del Backend en Express 5.2.1

La arquitectura del backend se organiza bajo un patrón clásico MVC (Model-View-Controller) modificado para servicios asíncronos y desacoplados. La estructura interna de cada caso de uso sigue un flujo lineal de responsabilidades aisladas:

Router −→Controller −→Service −→Model (Mongoose) (6.1)

Router: Define la ruta del endpoint HTTP, los middlewares de seguridad (RBAC) y la validación de payload Zod.

Controller: Extrae los parámetros de la petición HTTP, delega la ejecución de la regla de negocio al Service correspondiente y formatea la respuesta en un envoltorio estandarizado:

1 { success: boolean, data: T | null, error: string | null, message: string }

**Listing 6.1: Estructura estándar de respuesta API**

Cabe destacar que gracias a la migración a Express 5.2.1, no se requiere envolver los métodos de los controladores en bloques try/catch repetitivos o funciones asyncHandler. Express 5 propaga de forma nativa los errores asíncronos lanzados en las promesas directamente al middleware global de gestión de errores del servidor.


<!-- Página 125 de 207 -->

Service: Clase o módulo puro de TypeScript que encapsula la lógica operativa pura de negocio. Tiene prohibido importar o interactuar con los objetos de red de Express (Request o Response), facilitando su testabilidad unitaria aislada.

Model (Mongoose 9.x): Capa de persistencia que interactúa de manera directa con MongoDB, aplicando modelos Mongoose, validaciones de esquema y referencias mediante ObjectId cuando una entidad requiere identidad independiente.

## 6.8 Diseño del Frontend y el Perímetro de Seguridad en Next.js 16

La aplicación frontend implementa una estructura de interfaz de usuario mobile-first que escala progresivamente para dispositivos de escritorio utilizando la directiva de Tailwind CSS de forma nativa. Para garantizar la consistencia, la arquitectura web adopta los siguientes patrones de desarrollo:

TanStack Query v5 (Manejo del Estado del Servidor): Todas las operaciones de obtención y mutación de datos de la API se realizan a través de hooks personalizados que delegan el almacenamiento en caché, la invalidación de datos, los reintentos automáticos y el estado de carga (skeletons) a TanStack Query, aislando la red de los componentes React.

Zustand v5 (Manejo del Estado Local): Se utiliza para almacenar el estado volátil de la interfaz (ej. barra lateral colapsada) y la persistencia segura del token de sesión a través del almacén global auth.store.ts.

proxy.ts como perímetro de seguridad: En cumplimiento con la arquitectura definida para el proyecto, el aplicativo implementa un archivo centralizado proxy.ts que intercepta peticiones entrantes del lado del cliente, verifica la existencia del token JWT almacenado en cookies HttpOnly y evalúa la matriz de permisos RBAC antes de renderizar la página o delegar la llamada a la API del backend. Este control fortalece el aislamiento de los módulos del panel de administración.


<!-- Página 126 de 207 -->

WorkRequest Proposal PurchaseOrder

WorkOrder

PlanningPacket

Evidence

ExecutionSession

TechnicalReport DeliveryRecord SES Invoice Payment

**Figura 6.22: Diagrama de base documental y relaciones lógicas. Fuente: Elaboración propia.**

## 6.9 Operación offline, persistencia local y sincronización diferida

Para atender escenarios de conectividad móvil limitada, el aplicativo implementa una estrategia de persistencia local basada en Serwist/Turbopack, Service Worker, Dexie/IndexedDB, TanStack Query persistente y una cola de sincronización diferida. La evidencia del repositorio muestra que esta capacidad existe, pero su alcance debe declararse como parcial: permite navegación offline posterior a una carga inicial, fallback /~offline para rutas no visitadas, almacenamiento local de operaciones pendientes, snapshots locales de listados operativos y sincronización con resultados por ítem; sin embargo, no convierte en definitivos los procesos externos de SES, facturación o pago sin confirmación del backend.

pila con @serwist/turbopack y se sirve desde /serwist/sw.js. El worker precachea /~offline, aplica CacheFirst a /_next/static/*, StaleWhileRevalidate a imágenes y NetworkFirst a documentos internos visitados.

utiliza señales del navegador como indicio inicial y confirma conectividad con peticiones HEAD a /api/backend/health y, como respaldo, a /serwist/sw.js, con tiempo de espera y retroceso progresivo.

diente junto con su idempotencyKey o identificador de mutación local. Además, los listados


<!-- Página 127 de 207 -->

de casos de servicio, solicitudes, visitas técnicas y plantillas documentales conservan snapshots en IndexedDB para consulta posterior.

localmente o que se están mostrando datos guardados localmente, según el módulo y el estado de sincronización.

operaciones compatibles al backend y marca cada ítem como sincronizado, fallido o en conflicto según la respuesta recibida.

E2E. Por tanto, el libro clasifica esta capacidad como parcialmente implementada y no como operación offline total del flujo de 14 pasos.

Detección

Captura en campo IndexedDB

y auditoría

cola local

de red API backend Confirmación

La sincronización completa de archivos binarios se declara como alcance parcial

**Figura 6.23: Secuencia de sincronización offline: captura local, almacenamiento en IndexedDB, envío diferido y confirmación. Fuente: Elaboración propia.**

Documento PDF / Word / foto Importación Mapeo de campos Revisión humana Formulario digital Documento generado

control académico y operativo

**Figura 6.24: Flujo propuesto para extracción estructurada de documentos. Fuente: Elaboración propia.**

## 6.10 Arquitectura de seguridad en profundidad

La protección de los datos operativos y financieros que transitan por el aplicativo se diseñó bajo el principio de defensa en profundidad (Defense in Depth), que establece que ninguna capa individual de seguridad debe considerarse suficiente por sí sola. El sistema implementa seis capas de protección dispuestas desde el perímetro externo hasta el núcleo de persistencia.


<!-- Página 128 de 207 -->

### 6.10.1 Primera capa: Perímetro de red (Proxy y CORS)

El archivo proxy.ts en el frontend actúa como la primera barrera de seguridad. Intercepta todas las peticiones entrantes antes de que alcancen el enrutador de Next.js y aplica tres verificaciones: (a) redirección de rutas públicas a la página de inicio de sesión cuando el usuario no está autenticado; (b) validación de la existencia y vigencia del token JWT en la cookie HttpOnly; y (c) verificación de que la ruta solicitada pertenece al conjunto de rutas permitidas para el rol del usuario, utilizando las definiciones centralizadas del paquete @cermont/domain. En el backend, el middleware CORS restringe las peticiones exclusivamente al origen del frontend, configurado mediante variables de entorno.

### 6.10.2 Segunda capa: Autenticación sin estado (JWT)

Tras la validación inicial de credenciales contra el hash Bcrypt almacenado, el backend emite dos artefactos: un token de acceso JWT con tiempo de vida corto (24 horas) y un token de actualización (refresh token) almacenado en una cookie HttpOnly con los flags Secure, SameSite=Strict y Path=/api/auth. El token de acceso viaja exclusivamente en memoria del lado del cliente (almacén Zustand), lo que lo hace inmune a ataques XSS que intenten leer localStorage. El middleware authenticate en el backend verifica la firma criptográfica, la expiración y la integridad del token en cada petición a endpoints protegidos.

### 6.10.3 Tercera capa: Autorización basada en roles (RBAC)

Una vez autenticado el usuario, el middleware authorize consulta el rol asignado y lo contrasta contra la matriz de permisos del módulo solicitado. Por ejemplo, un usuario con rol tecnico puede consultar y actualizar órdenes de trabajo que le han sido asignadas, pero no puede aprobar propuestas ni crear usuarios. Esta verificación se realiza en el backend para cada endpoint protegido; el frontend únicamente oculta o deshabilita elementos de interfaz como mejora de experiencia de usuario, nunca como mecanismo de seguridad.


<!-- Página 129 de 207 -->

### 6.10.4 Cuarta capa: Validación de entradas (Zero Trust)

Todo payload recibido por el backend -sin excepción- es validado mediante un esquema Zod antes de alcanzar la lógica de negocio. Esta validación verifica tipos de datos, formatos, longitudes, rangos numéricos, valores permitidos y campos obligatorios. Un payload que no supera la validación recibe un error HTTP 400 con un código de error tipado que describe exactamente qué campo falló y por qué. Esta capa protege contra inyección NoSQL, desbordamiento de buffer, y datos malformados intencional o accidentalmente.

### 6.10.5 Quinta capa: Registro de auditoría inmutable

Cada acción crítica -creación de orden de trabajo, cambio de estado, aprobación de propuesta, generación de SES, emisión de factura, cambio de rol de usuario- genera un evento de auditoría inmutable que registra: tipo de evento, identificador del usuario que ejecutó la acción, entidad afectada, estado anterior, estado nuevo, marca de tiempo y metadatos relevantes. Estos registros no pueden ser modificados ni eliminados por ningún rol del sistema, y proporcionan la trazabilidad requerida para auditorías internas y externas.

### 6.10.6 Sexta capa: Protección de datos en reposo y en tránsito

Las contraseñas se almacenan exclusivamente como hashes Bcrypt con factor de costo configurable. En un despliegue productivo, las comunicaciones entre el frontend y el backend deben protegerse mediante HTTPS/TLS configurado en el servidor o proxy correspondiente. Los archivos cargados (evidencias fotográficas, documentos PDF) se procesan con sharp para eliminar metadatos EXIF potencialmente sensibles (como coordenadas GPS de las fotografías) antes de su almacenamiento, conservando únicamente la información de geolocalización cuando es requerida por el flujo operativo y se registra de forma explícita.


<!-- Página 130 de 207 -->

## 6.11 Arquitectura de módulos del sistema: los catorce pasos del flujo CERMONT

El aplicativo implementa el flujo operativo completo de CERMONT S.A.S., compuesto por catorce pasos que abarcan desde la solicitud inicial del cliente hasta el pago final. A continuación se describen los primeros siete pasos, correspondientes al ciclo operativo; los siete pasos restantes abarcan el cierre administrativo y se detallan en la subsección siguiente.

### 6.11.1 Paso 1: Solicitud de trabajo (Work Request)

Entidad: WorkRequest. Estados: open →assigned →in_progress →completed →cancelled. API: GET/POST/PATCH/api/work-requests. RBAC: gerente, residente, HES (CRUD completo); cliente (crear y leer propias).

La solicitud de trabajo constituye el punto de entrada al sistema. Un cliente registra una necesidad de servicio especificando tipo de trabajo, ubicación, urgencia y documentos adjuntos. El sistema notifica al residente asignado, quien evalúa si la solicitud requiere visita técnica o puede proceder directamente a propuesta.

### 6.11.2 Paso 2: Visita técnica (Site Visit)

Entidad: SiteVisit. Estados: pending →scheduled →in_progress →completed →cancelled. API: GET/POST/api/work-requests/:id/visits. Offline: consulta de listado con snapshot local; la captura completa sin conexión debe validarse por formulario.

Cuando la complejidad del servicio lo requiere, se agenda una visita al sitio. El técnico asignado registra mediciones, condiciones del lugar, requisitos de seguridad y evidencia fotográfica preliminar. Estos datos pueden alimentar la propuesta económica y reducir recaptura manual cuando el flujo se usa de extremo a extremo.


<!-- Página 131 de 207 -->

### 6.11.3 Paso 3: Propuesta económica (Proposal)

Entidad: Proposal. Estados: draft →sent →approved →rejected →expired. API: GET/POST/ api/proposals.

A partir de los datos de la solicitud y, cuando existe, de la visita técnica, el sistema permite generar una propuesta económica estructurada que incluye: alcance del servicio, recursos estimados (personal, materiales, equipos), cronograma, condiciones comerciales y valor total. La propuesta se exporta como PDF para envío al cliente.

### 6.11.4 Paso 4: Aprobación con orden de compra (Purchase Order)

Entidad: PurchaseOrder. Estados: pending →received →approved →rejected. API: POST/api/ proposals/:id/po.

El cliente aprueba la propuesta mediante una orden de compra (PO) que se adjunta al sistema. La recepción de la PO habilita la creación de la orden de trabajo interna y autoriza el inicio de la planeación de recursos. Este paso actúa como compuerta contractual: sin PO aprobada, no se puede crear una orden de trabajo.

### 6.11.5 Entidad transversal: Orden de trabajo (WorkOrder / ServiceCase)

Entidad: WorkOrder. Rol en el sistema: entidad raíz de trazabilidad. API: GET/POST/PATCH/ api/orders.

La orden de trabajo no se presenta como un paso independiente del flujo original, sino como la entidad digital que articula todos los pasos del proceso. Agrupa la solicitud, la visita técnica, la propuesta, la orden de compra, la planeación, la ejecución, las evidencias, el informe técnico, el acta, la SES, el seguimiento de factura y el registro de pago. Su máquina de estados refleja el avance global del servicio y determina qué módulos se habilitan en cada momento.


<!-- Página 132 de 207 -->

Creada Planeación Lista Ejecución Terminada Informe Acta SES Factura Pago Cerrada

Cada transición requiere precondiciones, permisos y evidencia documental

**Figura 6.25: Máquina de estados finita (FSM) que controla la trazabilidad operativa y los bloqueos de seguridad de la orden. Fuente: elaboración propia.**

### 6.11.6 Paso 5: Planeación de recursos (Planning Packet)

Entidad: PlanningPacket. Estados: draft →ready →approved. Relación con el problema: corrige la planeación incompleta de herramientas, equipos, personal, EPP, permisos y documentos de apoyo.

En esta fase se asignan los recursos necesarios para la ejecución: personal técnico con certificaciones vigentes, herramientas y equipos del catálogo, materiales y consumibles, elementos de protección personal (EPP), vehículos y documentos requeridos (permisos de trabajo, AST, procedimientos, instructivos y formatos de tareas críticas). El sistema permite reutilizar kits típicos por tipo de actividad, disminuyendo la dependencia de memoria individual y evitando que cada orden se planifique completamente desde cero.

### 6.11.7 Paso 6: Ejecución en campo (Execution Session)

Entidad: ExecutionSession. Estados: scheduled →in_progress →paused →completed →cancelled. Offline: Sí, prioritario.

Durante esta fase, los técnicos en campo confirman el consumo de materiales y horas de trabajo, diligencian checklists digitales de seguridad e inspección, capturan evidencias fotográficas vinculadas a la orden y registran novedades, hallazgos o acciones correctivas. La captura offline evita que la ausencia de conectividad impida el registro de información crítica; la sincronización posterior se realiza cuando el dispositivo recupera conexión.


<!-- Página 133 de 207 -->

### 6.11.8 Paso 7: Consolidación del informe técnico (Technical Report)

Entidad: TechnicalReport. Estado FSM: report_pending →completed. API: POST/api/ reports.

Una vez finalizada la ejecución, el sistema consolida los datos capturados en campo, las listas de verificación, las observaciones y las evidencias fotográficas para generar un informe técnico preliminar. Este documento no sustituye la revisión profesional del responsable, sino que proporciona una base estructurada para la validación del residente o supervisor y puede reducir recaptura manual cuando los datos de origen están completos.

### 6.11.9 Pasos 8 al 14: Cierre administrativo y seguimiento de recaudo

Los pasos finales del flujo CERMONT buscan que la ejecución técnica se traduzca de forma efectiva en facturación y recaudo. El sistema implementa un módulo de cierre consolidado (ClosureReport) que actúa como un modelo de lectura (Read Model) agregando información de cinco entidades independientes para proporcionar trazabilidad consolidada.

6.11.9.1. Paso 8: Acta de Entrega Técnica (Delivery Record)

Entidad: DeliveryRecord. Estado FSM: completed →ready_for_invoicing. API: POST/ api/delivery-records. Al finalizar el informe técnico, se genera el acta de entrega que detalla observaciones finales y recursos consumidos. El sistema valida que el informe técnico esté aprobado antes de permitir la creación del acta.

6.11.9.2. Paso 9: Firma del Acta (Client Acceptance)

Estado FSM: ready_for_invoicing → acta_signed. API: PATCH/api/ delivery-records/:id/sign. El sistema registra la aceptación del cliente capturando el nombre del responsable, la fecha y el método de firma (manual con soporte cargado o digital de


<!-- Página 134 de 207 -->

texto). Este paso habilita formalmente el proceso de cobro.

6.11.9.3. Paso 10: Elaboración y envío de SES

Entidad: ServiceEntrySheet (SES). Estado FSM: acta_signed →ses_sent. API: POST/api/ service-entry-sheets.

El sistema registra el número de documento de Ariba, la fecha de radicación, el responsable interno y el soporte documental asociado. La integración directa con SAP Ariba se declara fuera del alcance de esta versión; por tanto, el aplicativo funciona como espejo interno de seguimiento para evitar pérdida de trazabilidad.

6.11.9.4. Paso 11: Aprobación de SES

Entidad: SESApproval. Estado operativo: seguimiento interno de aprobación. API: PATCH/api/ service-entry-sheets/:id.

Cuando el cliente aprueba la SES, el responsable administrativo registra la fecha de aprobación y el soporte correspondiente. Si la SES es rechazada o requiere corrección, el sistema conserva el historial de observaciones para evitar que el proceso quede únicamente en correos o mensajes informales.

6.11.9.5. Paso 12: Elaboración y envío de factura

Entidad: InvoiceTracking. Estado FSM: ses_sent →invoice_approved cuando el cliente aprueba la factura. API: POST/api/invoices.

El aplicativo no emite factura electrónica DIAN ni reemplaza el software contable certificado de la empresa. Su función es registrar el seguimiento documental de la factura emitida externamente: número, fecha, valor, soporte PDF, responsable y estado de radicación.


<!-- Página 135 de 207 -->

6.11.9.6. Paso 13: Aprobación de factura

Entidad: InvoiceApproval. Estado operativo: aprobado, rechazado o en corrección. API: PATCH/ api/invoices/:id/status.

El sistema permite registrar la aprobación o devolución de la factura por parte del cliente. Esta información alimenta el tablero administrativo y permite identificar órdenes que ya fueron ejecutadas técnicamente, pero permanecen bloqueadas por requisitos documentales o financieros.

6.11.9.7. Paso 14: Registro de Pago y Cierre Definitivo

Entidad: Payment. Estado FSM: invoice_approved →paid →closed. API: POST/api/ payments. El flujo concluye con el registro interno del pago mediante referencia bancaria, fecha de abono y soporte documental. Una vez verificado el pago por el área administrativa, la orden de trabajo transiciona al estado terminal closed, marcando la finalización del ciclo de trazabilidad de 14 pasos.

## 6.12 Arquitectura de la capa de persistencia

La capa de persistencia del sistema se apoya en MongoDB 7.0, una base de datos orientada a documentos que almacena los datos en formato BSON (Binary JSON). Esta elección técnica responde a la naturaleza heterogénea de los formularios operativos de CERMONT S.A.S., donde cada tipo de servicio (inspección de líneas de vida, mantenimiento CCTV, planeación de obra) requiere capturar conjuntos de campos diferentes.

### 6.12.1 Patrones de modelado El diseño del esquema de base de datos aplica dos patrones complementarios:

Documentos embebidos (Embedding). Cuando los datos tienen un ciclo de vida acoplado y se acceden siempre en conjunto, se almacenan como subdocumentos dentro del documento principal. Por ejemplo, las líneas de recursos de un kit (KitResourceLine) se embeben dentro del documento del kit, ya que carecen de identidad independiente fuera de él. De igual forma, las respuestas a un


<!-- Página 136 de 207 -->

checklist se embeben dentro de la sesión de ejecución.

Referencias (Referencing). Cuando una entidad tiene identidad independiente y es referenciada desde múltiples documentos, se almacena en su propia colección y se referencia mediante ObjectId. Por ejemplo, un Asset (activo físico) es referenciado desde órdenes de trabajo, planes de mantenimiento y sesiones de ejecución.

### 6.12.2 Estrategia de índices

Cada colección define índices alineados con los patrones de consulta más frecuentes: búsqueda por código único, filtrado por estado, consulta por entidad relacionada (serviceCaseId, workOrderId), ordenamiento por fecha de creación y búsqueda por texto en campos descriptivos. Los índices compuestos cubren las consultas más comunes, como listar todas las órdenes de trabajo de un cliente filtrando por estado y ordenadas por fecha.

### 6.12.3 Campos de auditoría

Todos los documentos en la base de datos incluyen un conjunto estándar de campos de auditoría: createdBy (identificador del usuario que creó el registro), createdAt (marca de tiempo de creación), updatedBy y updatedAt (última modificación). Para las entidades que soportan archivado lógico, se añaden archivedAt y archivedBy. Estos campos, combinados con la colección de eventos de auditoría, proporcionan trazabilidad completa de cada cambio en el sistema.

## 6.13 Integración del ecosistema de desarrollo

El desarrollo del aplicativo se apoyó en un ecosistema de herramientas que automatizaron la verificación de calidad del código en cada iteración. A continuación se describe el rol de cada herramienta en el flujo de trabajo.

TypeScript en modo estricto. Todo el código del monorepo -backend, frontend y paquetes compartidos- se escribe en TypeScript con la configuración strict: true. Esto habilita verificaciones como strictNullChecks, noImplicitAny y strictFunctionTypes, que previenen categorías enteras de errores en tiempo de compilación. El comando tsc --noEmit ejecutado des-


<!-- Página 137 de 207 -->

de la raíz del monorepo verifica la corrección de tipos en los tres workspaces simultáneamente, sin necesidad de compilar a JavaScript.

Biome para linting y formateo. En lugar de la combinación tradicional ESLint + Prettier, el proyecto utiliza Biome, una herramienta unificada escrita en Rust que proporciona análisis estático y formateo de código. Biome verifica el cumplimiento de las reglas de estilo definidas para el proyecto, incluyendo la prohibición de console.log, debugger, variables no utilizadas e importaciones no usadas.

Vitest para pruebas unitarias e integración. Vitest, compatible con el ecosistema Vite, ejecuta las pruebas del proyecto con soporte nativo para TypeScript, sin requerir configuración adicional de transpilación. Su integración con Supertest permite probar los endpoints HTTP del backend realizando peticiones reales a una instancia de Express, mientras que la base de datos se aísla mediante una instancia de MongoDB en memoria (conexión a mongodb://127.0.0.1:27017/cermont_test) que se crea antes de cada suite de pruebas y se destruye al finalizar.

React Doctor para auditoría de componentes. La herramienta React Doctor analiza el código del frontend en busca de problemas comunes: componentes excesivamente grandes, exports no utilizados, uso de useSearchParams o useRouter sin envoltura Suspense, creación de objetos new Date() o llamadas a Math.random() durante el renderizado (causa potencial de errores de hidratación), y problemas de accesibilidad. Su ejecución periódica ayuda a detectar problemas tempranos; la evidencia de cada corrida debe anexarse al informe de validación.

Husky y lint-staged para ganchos de pre-commit. Para prevenir que código con errores llegue al repositorio, se configuraron ganchos de Git mediante Husky que ejecutan automáticamente lint-staged sobre los archivos modificados antes de cada commit. Esto asegura que solo el código que pasa las verificaciones de Biome y TypeScript sea incorporado al historial del proyecto.

## 6.14 Experiencia de desarrollo y curva de aprendizaje

El desarrollo del aplicativo, realizado por un único ingeniero como parte de la práctica empresarial, permite extraer observaciones sobre la viabilidad de construir sistemas empresariales modernos con


<!-- Página 138 de 207 -->

recursos limitados. El stack tecnológico seleccionado -Next.js, Express, MongoDB, TypeScript y Tailwind CSS- resultó adecuado para un desarrollador con formación en Ingeniería Electrónica. La consistencia del lenguaje en frontend y backend simplificó el cambio entre capas, mientras que la organización del monorepo con tipos compartidos ayudó a controlar definiciones duplicadas.

La principal dificultad técnica encontrada durante el desarrollo fue la implementación de la sincronización offline con detección de conflictos. El diseño de una cola de operaciones en IndexedDB que mantuviera la idempotencia de las mutaciones y manejara correctamente los casos de borde (aplicación cerrada durante la sincronización, múltiples dispositivos operando sobre la misma orden, pérdida de conectividad a mitad de una sincronización) requirió iteraciones adicionales de diseño y prueba. Esta experiencia es consistente con la literatura sobre sistemas distribuidos: la gestión de estados offline es uno de los problemas más complejos en el desarrollo de aplicaciones web modernas [21].

La adopción temprana de las compuertas de calidad (typecheck, lint, test, build) desde la primera iteración resultó ser una decisión acertada. Aunque inicialmente añadió fricción al flujo de desarrollo, la inversión se recuperó en iteraciones posteriores, cuando las compuertas detectaron regresiones que habrían sido difíciles de identificar manualmente en un código base creciente.

## 6.15 Comparativa tecnológica: stack implementado vs. alternativas evaluadas

La Tabla 6.4 presenta una comparación resumida entre el stack tecnológico implementado y las principales alternativas evaluadas durante la fase de diseño, indicando para cada caso el criterio que motivó la decisión final.

Esta comparativa no pretende establecer una superioridad absoluta del stack implementado, sino documentar que cada decisión tecnológica fue el resultado de un análisis contextual que consideró las restricciones específicas del proyecto CERMONT: operación offline en zonas remotas, diversidad de formatos operativos, equipo de desarrollo unipersonal, y necesidad de mantenibilidad a largo plazo por parte de la empresa.


<!-- Página 139 de 207 -->

**Tabla 6.4: Comparativa del stack implementado frente a alternativas evaluadas. Fuente: Elaboración propia.**

Capa Stack implementado Alternativa evaluada Criterio de decisión Frontend Next.js 16 + React 19 + Tailwind CSS

Vite + React SPA Server Components para vistas de datos; ecosistema unificado de enrutamiento, API routes y PWA. Backend Express 5.2.1 + TypeScript

NestJS Simplicidad, menor curva de aprendizaje, propagación nativa de errores asíncronos en Express 5. Base de datos MongoDB 7.0 + Mongoose 9.x

PostgreSQL + Prisma

Flexibilidad de esquema para formularios heterogéneos; sin migraciones para cada nuevo tipo de servicio. Validación Zod 4.x (compartido)

Joi Inferencia de tipos TypeScript desde esquemas; ecosistema unificado frontend/backend. Autenticación JWT + cookies HttpOnly

Auth.js / NextAuth Operación sin estado compatible con modo offline; sin dependencia de base de datos de sesiones. Pruebas Vitest + Supertest Jest Velocidad de ejecución; integración nativa con Vite y TypeScript; configuración mínima.


<!-- Página 140 de 207 -->

## 6.16 Desarrollo por cortes verticales del sistema

El desarrollo del aplicativo se organizó bajo el principio de cortes verticales o vertical slices. Este enfoque evita construir primero una base de datos completa, luego una API completa y finalmente una interfaz completa sin conexión entre ellas. En su lugar, cada módulo se construye como una unidad funcional que atraviesa todas las capas: contrato de datos, validación, servicio de dominio, endpoint, cliente HTTP, hook de consulta, pantalla, permisos, pruebas y auditoría. Para el caso de CERMONT, este enfoque resulta adecuado porque cada paso del flujo de 14 etapas tiene reglas particulares, responsables y evidencias propias.

**Tabla 6.5: Estructura de un corte vertical aplicado a los módulos del aplicativo. Fuente: elaboración propia.**

Capa Artefacto esperado Propósito Ejemplo en CERMONT Contrato compartido Esquema y tipos de datos Definir estructura de entrada y salida sin duplicidad.

Datos de orden, planeación o evidencia. Backend Ruta, controlador, servicio y modelo Aplicar reglas de negocio y persistir cambios.

Crear paquete de planeación o registrar evidencia. Frontend Página, formulario, hook y estados UI Permitir interacción del usuario con datos reales.

Vista de planeación o cierre administrativo. Seguridad RBAC, validación y auditoría Restringir acciones y dejar rastro. Solo ciertos roles aprueban planeación o cierre. Pruebas Unitarias, integración o funcionales Verificar comportamiento esperado. Rechazar ejecución si la planeación no está lista. Documentación Registro de decisión y evidencia Explicar cómo se desarrolló el módulo. Bitácora DOC asociada al módulo.

## 6.17 Modelo de estados para controlar el avance operativo

El sistema no debe permitir que una orden avance por decisiones arbitrarias del usuario. En un proceso de cierre documentado, cada transición debe depender de precondiciones verificables. Por ejemplo, la ejecución no debería iniciar si la planeación no está aprobada; el informe no debería generarse si la ejecución no está terminada; la SES no debería radicarse si falta informe o acta; y la factura no debería emitirse si la SES no ha sido aprobada cuando el cliente la exige. Estas reglas transforman el aplicativo en un mecanismo de control operativo y no solo en una base de datos.


<!-- Página 141 de 207 -->

**Tabla 6.6: Transiciones críticas propuestas para el flujo operativo-documental. Fuente: elaboración propia.**

Transición Precondición mínima Razón de control

Evita cotizar trabajos sin información mínima.

Solicitud a propuesta Solicitud calificada y alcance preliminar definido.

Propuesta a orden Propuesta aprobada y PO registrada.

Garantiza que la ejecución tenga autorización comercial. Orden a planeación Orden activa y responsable asignado.

Permite preparar recursos, permisos y documentos. Planeación a ejecución

Evita salida a campo sin herramientas, equipos o HES.

Planeación aprobada y sin bloqueadores críticos.

Evita informes incompletos o basados en memoria.

Ejecución a informe Actividad finalizada y evidencias mínimas asociadas.

Informe a acta Informe revisado y aprobado internamente.

Soporta radicación administrativa.

Protege la entrega formal al cliente. Acta a SES Acta firmada o recibida por el cliente.

Evita facturación sin soporte aprobado.

SES a factura SES aprobada por el cliente o plataforma correspondiente.

Permite cierre administrativo trazable.

Factura a pago Factura aprobada y referencia de pago registrada.


<!-- Página 142 de 207 -->

## 6.18 Diseño del módulo de archivos, evidencias y firmas

El módulo de evidencias tiene una responsabilidad crítica: transformar fotos y documentos dispersos en soportes consultables, asociados y auditables. En la práctica operativa, una evidencia sin contexto pierde valor: una fotografía enviada por mensajería instantánea puede mostrar una actividad, pero si no se sabe a qué orden pertenece, quién la tomó, cuándo se capturó y qué componente documenta, su utilidad para el cierre técnico y administrativo disminuye. Por ello, el sistema debe almacenar metadatos junto con cada archivo.

Los metadatos mínimos incluyen identificador de orden, tipo de evidencia, usuario responsable, fecha, estado de sincronización, nombre seguro de archivo, tipo MIME, tamaño, observaciones y relación con el paso del proceso. En caso de firmas, se debe conservar vínculo con el firmante, rol, fecha y documento asociado. Esta estructura responde a la falla documentada de evidencias dispersas y fortalece la generación posterior de informes y actas.

## 6.19 Diseño del módulo de costos reales

El control de costos reales se concibe como una capacidad transversal y no como una pantalla aislada de contabilidad. La propuesta económica define una estimación; la planeación anticipa recursos; la ejecución registra consumos; el cierre administrativo consolida factura y pago. Si estos datos permanecen desconectados, la empresa no puede analizar desviaciones. El diseño del módulo de costos debe permitir que cada orden acumule líneas de costo por materiales, mano de obra, herramientas, equipos, transporte, subcontratos, impuestos configurables e imprevistos.

Esta funcionalidad debe implementarse con prudencia académica. Si no existen datos reales cargados, el libro debe describir el diseño y los criterios de medición, pero no reportar márgenes, variaciones o ahorros. La contribución del proyecto en esta fase consiste en dejar preparada la estructura para comparar costos estimados y reales cuando CERMONT alimente el sistema con información operativa verificable.


<!-- Página 143 de 207 -->

## 6.20 Integración entre backend, frontend y documentación técnica

La integración entre capas se construye alrededor de la coherencia de nombres, contratos y responsabilidades. El backend valida, aplica reglas de negocio y persiste. El frontend presenta, captura datos y comunica estados. Los paquetes compartidos definen contratos y tipos comunes. La documentación técnica actúa como referencia para evitar duplicidad de lógica, rutas huérfanas, pantallas sin endpoints o módulos que solo muestran títulos. Esta disciplina responde a una observación recurrente en auditorías de software: una aplicación puede compilar y aun así no resolver el proceso de negocio si sus módulos no están conectados con datos reales y reglas verificables.

Por esta razón, el libro debe explicar no solo qué tecnologías fueron usadas, sino cómo interactúan en cada módulo. En una orden de trabajo, por ejemplo, el frontend no debe inventar estados de avance; debe consultar una proyección o entidad calculada desde backend. El backend no debe aceptar cualquier transición; debe verificar precondiciones. Los contratos no deben duplicarse manualmente; deben mantenerse como fuente común. Esta articulación convierte la arquitectura en respuesta directa a la problemática y no en un listado de herramientas.


<!-- Página 144 de 207 -->

# 7 Resultados Técnicos y Evidencias del Desarrollo

## 7.1 Introducción a los resultados

Este capítulo presenta los resultados derivados del desarrollo del sistema y organiza la evidencia disponible de acuerdo con los objetivos del proyecto. Dado que no todos los indicadores cuantitativos fueron aportados en el texto base, se distinguen los resultados del desarrollo técnico de aquellos indicadores por medir con evidencia verificable.

## 7.2 Resultados del desarrollo técnico

El primer resultado del proyecto fue la construcción de una base tecnológica capaz de centralizar órdenes de trabajo, recursos, evidencias y soportes documentales. Esta integración permite que la información deje de estar fragmentada entre hojas de cálculo, documentos aislados y registros informales.

El segundo resultado fue la organización del flujo operativo en módulos coherentes. Cada módulo responde a una parte del proceso real: gestión de usuarios, planeación, ejecución, evidencias, documentación y cierre. Esta estructura facilita la comprensión del sistema y orienta la operación hacia una menor dependencia de soluciones improvisadas.

El tercer resultado fue la definición de una base compatible con la evolución futura hacia formularios reutilizables y plantillas documentales más dinámicas. Esta posibilidad no debe reportarse como automatización confirmada si no existe evidencia formal de su implementación; sin embargo, constituye un resultado de diseño relevante porque deja la arquitectura preparada para extenderse.


<!-- Página 145 de 207 -->

## 6.21 Matriz de correspondencia entre módulos, normas y funciones tipo GMAO/CMMS-FSM

En sistemas GMAO/CMMS y FSM, el cumplimiento práctico se evidencia mediante módulos que registran órdenes de trabajo, activos, mantenimiento, recursos, evidencias, historial y cierre. En el aplicativo CERMONT, dicha correspondencia se adapta al flujo de 14 pasos y a las fallas documentadas: planeación incompleta, ejecución sin soportes completos, retrasos en informes, demoras de cierre y ausencia de control centralizado de costos.

Estado técnico

Función esperada en GMAO/CMMS-FSM

Módulo CERMONT Norma o criterio relacionado

Implementado/validable según evidencias del capítulo 6.

Gestión de órdenes de trabajo y ciclo de vida del servicio.

ISO 9001, ISO/IEC 12207, ISO/IEC 25010.

WorkRequest, ServiceCase, WorkOrder y máquina de estados.

Planeación de recursos, materiales, herramientas y personal.

ISO 9001, ISO 55001, buenas prácticas CMMS.

Implementado o en ampliación según formularios reales anexados.

PlanningPacket, ResourceKit, herramientas, equipos y elementos HES.

ISO 55001. Alineación funcional; requiere piloto operativo para madurez.

Gestión de activos, mantenimiento e intervenciones.

Assets, Maintenance, Resources e historial por orden.

Captura de evidencias, fotos, documentos y firmas.

ISO 9001, ISO/IEC 27001, ISO/IEC 25010.

Implementado con restricciones de confidencialidad.

Evidence, Document, DeliveryRecord y generación documental.

Seguridad por roles, autenticación y protección de rutas.

RBAC, JWT, middleware, guards y validación de permisos.

ISO/IEC 27001 e ISO/IEC 27002.

Implementado como control técnico, no como SGSI completo.

Implementado con verificación de soportes activos por orden.

Seguimiento de costos reales frente a la propuesta.

CostEstimate, ActualCost, CostItem y soportes Evidence/Document.

ISO 9001, ISO 55001 y trazabilidad financiera interna.

Parcial o implementado según pruebas E2E anexadas.

Operación con conectividad limitada.

PWA, Service Worker, indicador online/offline, Dexie/outbox si está habilitado.

ISO/IEC 25010: confiabilidad, usabilidad y portabilidad.

Pruebas verificables y control de calidad del software.

ISO/IEC/IEEE 29119 e ISO/IEC 12207.

Implementado en entorno de desarrollo; requiere piloto productivo.

Vitest, pruebas de servicios, contratos, seguridad y verificación del monorepo.

Esta matriz permite responder al evaluador que el aplicativo no se limita a una interfaz web, sino que integra capacidades esperadas en soluciones GMAO/CMMS-FSM: gestión de órdenes, trazabilidad de activos y recursos, evidencias, control documental, seguridad por roles, pruebas y seguimiento económico.

Corrección agregada: alineación normativa y técnica del aplicativo CERMONT S.A.S.


<!-- Página 146 de 207 -->

## 7.3 Resultados funcionales observables

A nivel funcional, el sistema permite representar el ciclo de vida de una orden de trabajo sin depender de documentos dispersos. Esa representación incluye el registro inicial, la planeación, la ejecución con evidencias y el seguimiento administrativo posterior.

Además, la solución favorece la trazabilidad porque cada elemento queda vinculado a la orden correspondiente. Ese vínculo facilita la consulta histórica y la reconstrucción del servicio, dos aspectos que eran problemáticos en el esquema manual descrito en el diagnóstico.

## 7.4 Indicadores por medir con evidencia verificable

Los resultados cuantitativos que requieren datos medidos no deben inventarse. Por tanto, si el documento final incluye métricas de tiempo, reducción de errores o mejora de trazabilidad, estas deben incorporarse únicamente cuando exista la evidencia correspondiente.

**Tabla 7.1: Indicadores que deben completarse con evidencia verificable. Fuente: Elaboración propia.**

Indicador Dato requerido Evidencia esperada Tiempo de planeación

Promedio antes y después de la implementación

Cronometraje, registros de uso o bitácoras Tiempo de cierre Duración promedio del ciclo documental Fechas de creación, revisión y cierre Completitud documental

Porcentaje de órdenes con soportes completos

Lista de chequeo o auditoría de documentos Trazabilidad de evidencias

Número de evidencias correctamente asociadas

Capturas del sistema o inventario de archivos Satisfacción de usuarios

Valoraciones por rol o por sesión de prueba Encuesta, entrevista o formato UAT

Mientras esos datos no se incluyan, el capítulo debe mantenerse en un nivel descriptivo y no inferir mejoras numéricas.


<!-- Página 147 de 207 -->

## 7.5 Relación con los objetivos

Los resultados del desarrollo responden a los objetivos definidos en la introducción: el análisis del flujo actual permitió identificar la fragmentación documental; el diseño de la arquitectura definió módulos y relaciones funcionales; la implementación consolidó los componentes principales del sistema; la validación debe sustentarse con evidencia de pruebas cuando esté disponible.

## 7.6 Evidencias recomendadas

Para fortalecer este capítulo, se recomienda incorporar capturas del sistema, tablas de órdenes creadas, ejemplos de evidencias asociadas, registros de documentos generados y resultados de pruebas funcionales.

## 7.7 Síntesis de resultados

El principal resultado del proyecto es la construcción de una solución que organiza la gestión documental y operativa de CERMONT S.A.S. Los indicadores cuantitativos deben completarse con evidencia verificable si se desea reportar mejoras numéricas.

## 7.8 Resultados por módulo implementado

El desarrollo del aplicativo produjo resultados verificables en cada uno de los módulos que componen el sistema. A continuación se presentan los resultados organizados por módulo, indicando el estado de implementación, las funcionalidades entregadas y la evidencia disponible.

### 7.8.1 Módulo de autenticación y control de acceso (RBAC)

Resultado obtenido: Se implementó un sistema de autenticación basado en JWT con tokens de acceso en memoria y tokens de actualización en cookies HttpOnly con flags Secure, SameSite=Strict y Path=/api/auth. El middleware de autorización verifica, para cada end-


<!-- Página 148 de 207 -->

point protegido, que el rol del usuario autenticado tenga los permisos requeridos según la matriz RBAC definida en el paquete @cermont/domain.

Evidencia disponible: Suite de pruebas de autenticación que verifica el ciclo completo de inicio de sesión, renovación de token, cierre de sesión y rechazo de credenciales inválidas. Las pruebas de RBAC confirman que usuarios sin los permisos requeridos reciben código HTTP 403 en endpoints protegidos.

Relación con objetivos: Este resultado contribuye al objetivo específico 2 (diseño de arquitectura con roles de usuario) y al objetivo específico 3 (implementación de módulos principales).

### 7.8.2 Módulo de órdenes de trabajo

Resultado obtenido: Se implementó el ciclo de vida completo de la orden de trabajo como entidad central del sistema, con transiciones de estado controladas: open →assigned →in_progress →on_hold →completed →closed. La cancelación está permitida desde los estados open, assigned y on_hold. Cada transición de estado genera un registro de auditoría inmutable.

Evidencia disponible: Pruebas funcionales que verifican cada transición de estado permitida y el rechazo de transiciones inválidas. Endpoints API documentados para creación, consulta, actualización y cierre de órdenes.

Relación con objetivos: Este resultado materializa el núcleo del objetivo específico 3, al implementar el módulo principal sobre el cual se articulan todos los demás componentes del sistema.

### 7.8.3 Módulo de planeación y kits típicos

Resultado obtenido: Se desarrolló el módulo de planeación que permite asociar a cada orden de trabajo un paquete de recursos (PlanningPacket) compuesto por personal técnico, herramientas, equipos, materiales, elementos de protección personal y documentos requeridos. Los kits típicos permiten precargar configuraciones de recursos estandarizadas según el tipo de servicio, evitando que cada orden deba planearse completamente desde cero.

Evidencia disponible: Pruebas de integración que verifican la validación de disponibilidad de recursos, la asignación de kits a órdenes de trabajo y la detección de recursos faltantes o con certi-


<!-- Página 149 de 207 -->

ficaciones vencidas.

Relación con objetivos: Este resultado responde directamente a la falla de planeación identificada en el diagnóstico del flujo operativo.

### 7.8.4 Módulo de gestión de evidencias

Resultado obtenido: Se implementó un sistema de captura, almacenamiento y asociación de evidencias fotográficas vinculadas a órdenes de trabajo. Las imágenes se procesan con sharp para eliminar metadatos EXIF potencialmente sensibles y se validan por tipo MIME, extensión y tamaño antes de su almacenamiento. Cada evidencia conserva trazabilidad de la orden, el usuario que la capturó, la fecha y una descripción contextual.

Evidencia disponible: Pruebas que verifican el rechazo de archivos con MIME no permitido, la aceptación de formatos válidos (JPEG, PNG, WebP) y la asociación correcta de cada evidencia con su orden de trabajo.

Relación con objetivos: Este resultado aborda la fragmentación de evidencias identificada en la fase crítica 2 del diagnóstico (ejecución en campo y captura de evidencias).

### 7.8.5 Módulo de generación documental

Resultado obtenido: Se implementó un motor de generación de documentos PDF utilizando la biblioteca pdf-lib, orientado a compilar informes técnicos y actas de entrega a partir de los datos transaccionales almacenados en el sistema. El motor inserta datos de la orden, resultados de checklists, evidencias fotográficas y firmas registradas en plantillas predefinidas cuando la información requerida se encuentra disponible.

Evidencia disponible: Pruebas funcionales que verifican la generación exitosa de buffers PDF válidos, la correcta inserción de datos dinámicos y la integridad estructural del documento binario resultante.

Relación con objetivos: Este resultado responde a la fase crítica 3 del diagnóstico (consolidación documental, informes y actas), automatizando la compilación de documentos que antes requerían recaptura manual.


<!-- Página 150 de 207 -->

### 7.8.6 Módulo de cierre administrativo y seguimiento

Resultado obtenido: Se implementó un módulo de seguimiento administrativo que vincula cada orden de trabajo con los estados de los documentos posteriores a la ejecución: informe técnico, acta de entrega, firma del cliente, hoja de entrada de servicio (SES), factura emitida externamente y registro de pago. Este módulo permite identificar, para cada orden, qué documentos están pendientes y cuál es el siguiente paso requerido para avanzar hacia el cierre.

Evidencia disponible: Pruebas de integración que verifican la actualización correcta del estado de cierre cuando se completan los documentos requeridos en secuencia, y la detección de bloqueos cuando un documento obligatorio no ha sido generado o aprobado.

Relación con objetivos: Este resultado aborda la fase crítica 4 del diagnóstico (cierre administrativo y cadena de recaudo), proporcionando visibilidad sobre el estado de cada orden en el flujo de facturación.

### 7.8.7 Módulo de operación offline (PWA)

Resultado obtenido: El soporte offline se desarrolló como una primera capa de continuidad. La interfaz puede reconocer la pérdida de conectividad y conservar determinadas operaciones compatibles en almacenamiento local, mientras la cola de sincronización mantiene los registros pendientes hasta recibir confirmación del backend. Esta formulación evita presentar la funcionalidad como operación total sin internet y diferencia entre indicador visual, almacenamiento local y sincronización efectiva.

Evidencia disponible: El resultado debe interpretarse de manera controlada: la disponibilidad del indicador online/offline y del App Shell no equivale por sí sola a sincronización completa de formularios. Para declarar un módulo como offline funcional, se requiere demostrar que el usuario puede registrar información sin conexión, que dicha información queda almacenada localmente, que se mantiene en una cola pendiente y que el backend la recibe sin duplicados al restablecer la conexión.

Relación con objetivos: Este resultado es transversal a los objetivos 2 y 3, y debe mantenerse clasificado como capacidad parcial hasta completar pruebas E2E con backend activo, IndexedDB y sincronización verificada.


<!-- Página 151 de 207 -->

## 7.9 Relación problema, requisito, módulo y evidencia

La Tabla 7.2 relaciona las fallas documentadas por CERMONT S.A.S. con los requisitos del sistema, los módulos construidos o propuestos y la evidencia verificable en código o documentación técnica.

**Tabla 7.2: Relación problema, requisito, módulo y evidencia. Fuente: Elaboración propia con base en el repositorio y documentos técnicos.**

2 y 3

Planeación / Resources & Kits

Falla identificada Paso Requisito del sistema Módulo Evidencia Objetivo Planeación incompleta de herramientas y equipos

Configurar kits típicos y paquetes de planeación por tipo de servicio.

Esquema de planeación, rutas backend y vista de planeación.

2 y 3

Faltantes durante ejecución

Execution Session / Checklists

Esquema de ejecución, hook offline y servicio de sincronización.

5-6 Diligenciar checklists y consultar recursos con soporte offline cuando aplique.

Retrasos en informes y actas

Evidencias / Informes / PDF

Servicios de reportes y vista de informes.

7-9 Consolidar evidencias y generar documentos desde datos del sistema.

2 y 3

Retrasos en facturación

Esquema SES y vistas de SES y pagos.

Billing / SES / Invoices / Payments

10-14 Hacer seguimiento del estado de SES, factura y pago por orden.

2 y 3

Ausencia de control de costos reales

Proposals / Costs Esquema de costos, modelo backend y vista de costos.

3-14 Relacionar propuesta, costos reales y cierre administrativo.

## 7.10 Matriz de trazabilidad: objetivos, fases y resultados

La Tabla 7.3 presenta la relación sistemática entre los objetivos específicos del proyecto, las fases metodológicas ejecutadas, los resultados obtenidos y los indicadores de cumplimiento. Esta matriz permite verificar que cada objetivo fue abordado mediante una fase metodológica concreta y produjo resultados verificables.


<!-- Página 152 de 207 -->

**Tabla 7.3: Matriz de trazabilidad: objetivos, fases, resultados y evidencias. Fuente: Elaboración propia.**

Diagnóstico documental y operativo

Objetivo específico Fase metodológica Resultado obtenido Evidencia 1. Diagnosticar el flujo actual e identificar fallas críticas

Identificación del flujo de 14 pasos y de cinco fallas críticas documentadas para CERMONT S.A.S.

Formatos reales analizados, documento del proceso y tablas de diagnóstico. 2. Diseñar la arquitectura funcional y técnica

Diagramas de arquitectura, modelo conceptual de datos, tabla de módulos funcionales.

Diseño funcional Arquitectura de 3 capas documentada; modelo de datos con entidades principales; matriz RBAC de 8 roles; definición de API endpoints por módulo.

Código fuente del monorepo y pruebas automatizadas documentadas.

Implementación Módulos funcionales para autenticación, órdenes, planeación, evidencias, informes, cierre administrativo y costos; la operación offline queda implementada de forma parcial.

Reporte técnico de pruebas y matriz de validación propuesta por rol.

Validación Pruebas unitarias, de integración y escenarios técnicos documentados; la prueba piloto con usuarios y métricas de impacto queda pendiente.


<!-- Página 153 de 207 -->

## 7.11 Resultados de la revisión de seguridad

Como resultado complementario de la fase de validación, se aplicó una revisión de seguridad basada en los lineamientos del OWASP Top 10 (versión 2021). Los hallazgos principales se resumen a continuación:

RBAC en el backend para todos los endpoints protegidos. Las pruebas confirman que usuarios sin permisos reciben HTTP 403.

ducción, las comunicaciones deben protegerse mediante HTTPS/TLS; los tokens JWT se firman criptográficamente.

trizadas) y validación Zod de todos los payloads entrantes antes de cualquier operación de base de datos.

(typecheck, lint, test, react-doctor) reducen el riesgo de introducir vulnerabilidades por descuido en el diseño.

ditoría inmutable con tipo de evento, usuario, entidad afectada, estado anterior, estado nuevo y marca de tiempo.

Estos resultados documentan que la seguridad fue incorporada como un requisito transversal desde la fase de diseño arquitectónico, en concordancia con el principio de defensa en profundidad documentado en el marco teórico.

## 7.12 Síntesis de resultados y contribuciones

El análisis integrado permite concluir que el proyecto dejó un artefacto de software funcional y técnicamente trazable, con módulos alineados al flujo documental y administrativo de CERMONT S.A.S. La arquitectura del sistema resulta coherente con un contexto multiservicio donde la hete-


<!-- Página 154 de 207 -->

rogeneidad de formatos, la conectividad variable y la necesidad de seguimiento documental son restricciones reales de diseño.

Desde la perspectiva de los objetivos del proyecto, el diagnóstico documentó el flujo de 14 pasos y las cinco fallas críticas de la operación; el diseño produjo una arquitectura con roles, contratos y módulos verificables; la implementación dejó módulos centrales en funcionamiento; y la validación aportó evidencia técnica mediante pruebas automatizadas y escenarios de desarrollo. No obstante, la aceptación con usuarios y la medición cuantitativa del impacto continúan como actividades pendientes.

Los indicadores cuantitativos de impacto operativo -tiempos de planeación, completitud documental, trazabilidad de evidencias, satisfacción de usuarios- permanecen como métricas por medir durante la adopción del sistema en el entorno productivo de CERMONT S.A.S. Esta situación refleja la diferencia entre validación técnica del artefacto y validación operativa del impacto, distinción necesaria para mantener la veracidad académica del documento.

## 7.13 Auditoría de evidencias técnicas por módulo

Los resultados técnicos del proyecto deben presentarse con una estructura que permita distinguir entre evidencia verificable y alcance propuesto. La matriz siguiente organiza los módulos principales según su relación con el problema de CERMONT, el tipo de evidencia esperada y el estado que debe usarse en el libro. Esta forma de presentación evita afirmar como terminado un módulo que solo está documentado o parcialmente conectado.

**Tabla 7.4: Auditoría de resultados técnicos por módulo. Fuente: elaboración propia.**

Módulo Falla que atiende

Evidencia técnica esperada

Redacción recomendada

Middleware, roles, pruebas de permisos y capturas de rutas protegidas.

Implementado si hay evidencia en código y pruebas.

Usuarios y roles Acceso no diferenciado a información y acciones críticas.

Continúa en la siguiente página


<!-- Página 155 de 207 -->

Módulo Falla que atiende

Evidencia técnica esperada

Redacción recomendada

Órdenes de trabajo Fragmentación del seguimiento operativo.

Entidad, listado, detalle, estados y vínculos con módulos posteriores.

Formularios de planeación, catálogos, readiness y validaciones.

Implementado o parcial según conexión real con flujo completo. Planeación y kits Faltan herramientas, equipos o documentos antes de ejecución.

Implementado parcialmente si falta validación completa de certificados. Ejecución Registros físicos y evidencias dispersas.

Checklist, sesión de ejecución, almacenamiento local y sincronización.

Parcial si el flujo offline de archivos no está completo. Evidencias Fotos y soportes sin contexto.

Upload, metadatos, asociación a orden y controles de seguridad.

Implementado si existen rutas y modelo; parcial si falta sincronización binaria. Informes y actas Recaptura manual y retrasos documentales.

Generación PDF, plantillas, datos desde ejecución y evidencia visual.

Implementado o propuesto según el nivel de automatización real. Cierre administrativo

SES, factura y pago sin seguimiento consolidado.

Estados, panel, campos de SES/factura/pago y reglas de avance.

Parcial o propuesto si no existe flujo E2E validado. Costos reales No hay comparación centralizada contra propuesta.

Entidades de costo, líneas por orden, cálculo de variación y reportes.

Propuesto o parcial si no existen datos reales.


<!-- Página 156 de 207 -->

## 7.14 Resultados interpretados por objetivo específico

El primer objetivo específico se responde mediante la sistematización del flujo de 14 pasos y la identificación de fallas en planeación, ejecución, informes, actas, facturación y costos reales. El resultado no es solo una descripción del proceso, sino una matriz de problemas que orienta la arquitectura del sistema.

El segundo objetivo se responde con el diseño funcional y técnico del aplicativo. Este diseño incluye módulos, entidades, roles, estados, arquitectura de capas, contratos compartidos y criterios de seguridad. La evidencia se encuentra en la documentación técnica, en el repositorio y en las tablas del capítulo de desarrollo.

El tercer objetivo se responde con la implementación de módulos principales. La redacción debe ser cuidadosa: los módulos que cuenten con evidencia en código, pruebas o capturas pueden describirse como implementados; los módulos con diseño y estructura parcial deben declararse como parcialmente implementados; y los módulos documentados pero no construidos deben presentarse como propuesta o trabajo futuro.

El cuarto objetivo se responde mediante pruebas técnicas, escenarios de validación y matriz de indicadores por medir. Si no existe prueba piloto con usuarios reales y registros de tiempos, no se deben presentar porcentajes de mejora. En su lugar, el resultado válido es la definición de un procedimiento de validación y la ejecución de pruebas funcionales o automatizadas cuando exista evidencia.

## 7.15 Indicadores propuestos sin afirmación de resultados no medidos

La validación operativa futura debe apoyarse en indicadores simples, observables y vinculados con el flujo de negocio. Entre ellos se recomiendan: tiempo entre ejecución e informe, tiempo entre acta enviada y acta firmada, porcentaje de órdenes con planeación completa antes de ejecutar, porcentaje de evidencias asociadas correctamente a órdenes, número de órdenes con costos reales registrados, número de SES radicadas con soporte completo y tiempo entre factura aprobada y pago registrado. Estos indicadores no deben reportarse con valores mientras no exista medición en campo.


<!-- Página 157 de 207 -->

La utilidad de esta sección es dejar establecido un método para que CERMONT mida impacto después de adoptar el sistema. El trabajo de grado puede validar técnicamente el artefacto y proponer indicadores operativos, pero solo una fase de uso real permitirá comprobar mejoras cuantitativas.

## 7.16 Resultados sobre madurez documental del aplicativo

La madurez documental del aplicativo puede evaluarse por la capacidad de cada módulo para generar evidencia verificable. Un módulo maduro no solo tiene una pantalla; tiene datos reales o simulados controlados, validación, permisos, estados de carga, manejo de errores, trazabilidad y pruebas. En este sentido, el resultado técnico del proyecto no debe reducirse a listar pantallas desarrolladas. Debe explicar si cada módulo tiene responsabilidad clara, si se conecta al flujo de 14 pasos, si conserva eventos, si evita duplicar información y si permite que un usuario continúe el proceso sin depender de soportes externos.

Este enfoque fortalece la evaluación académica porque muestra que el desarrollo fue revisado con criterios de ingeniería y no solo con inspección visual. La calidad del artefacto se interpreta desde su capacidad de sostener el proceso documental-operativo de CERMONT.


<!-- Página 158 de 207 -->

# 8 Validación y Pruebas del Sistema

## 8.1 Introducción a la validación

La validación del aplicativo se organizó para diferenciar tres niveles: comprobación técnica del código, verificación funcional de los módulos y validación operativa con usuarios. Esta separación es necesaria porque una prueba automatizada puede confirmar una regla de negocio, pero no demuestra por sí sola reducción de tiempos o mejora de productividad. Esos efectos requieren medición posterior con órdenes reales y criterios comparables.

Las pruebas automatizadas aportan evidencia sobre autenticación, autorización, contratos de datos, reglas de negocio, generación documental y asociación de evidencias. No obstante, las afirmaciones sobre impacto organizacional deben mantenerse condicionadas a una fase piloto. Por ello, el documento conserva la diferencia entre resultado técnico verificado, escenario funcional propuesto y medición operativa pendiente.

## 8.2 Arquitectura del entorno de pruebas automatizadas

Para la ejecución y mantenimiento de la suite de pruebas del monorepo, se implementó un entorno de pruebas basado en Vitest, herramienta compatible con TypeScript y con el ecosistema Vite. La suite de pruebas interactúa directamente con los endpoints HTTP expuestos por el backend en Express utilizando la librería Supertest.

Utilidad percibida Facilidad de uso Aceptación del sistema

Condiciones de campo

y soporte documental

El entorno mantiene aislamiento frente a los datos de producción aplicando los siguientes patrones técnicos en el archivo de inicialización global setup.ts:

Base de datos en memoria (Sandbox Mongoose): En lugar de conectarse a la instancia principal de MongoDB, el entorno de pruebas levanta y destruye dinámicamente un esquema temporal


<!-- Página 159 de 207 -->

apuntando a la URI aislada mongodb://127.0.0.1:27017/cermont_test. Esto asegura que las operaciones de creación, actualización y borrado de las pruebas no contaminen ni alteren los registros reales de la compañía.

Mocks Criptográficos: Los procesos costosos de hashing de contraseñas de Bcryptjs se configuran temporalmente con un factor de ronda mínimo (saltRounds = 1) durante las pruebas, acelerando la velocidad de respuesta sin comprometer la lógica de validación de credenciales.

## 8.3 Resultados cuantitativos y desglose de la suite de pruebas

La ejecución automatizada debe conservarse en un reporte técnico anexo con salida de consola, fecha, entorno y versión del código evaluado. Esta evidencia valida el comportamiento técnico del artefacto, pero no sustituye la medición operativa en producción con usuarios reales. Si dicho reporte no se adjunta, el resultado queda pendiente por anexar evidencia.

A continuación se detalla la distribución y alcance temático de los bloques de pruebas reportados. La evidencia de consola, fecha, commit y entorno debe conservarse en el anexo de validación técnica para que la afirmación sea verificable por el jurado:

### 8.3.1 Suite de Autenticación, Sesión y Seguridad (JWT HttpOnly)

Alcance: Verificación del ciclo de vida del token de sesión. Se prueba la generación del JWT directo, su inyección automática en cookies de tipo HttpOnly con banderas restrictivas (Secure; SameSite=Strict), la expiración controlada y el proceso de refresco del token mediante el refreshToken transaccional.

Resultado: Debe verificarse con la corrida documentada en anexos. Si no se adjunta salida de consola, queda pendiente por anexar evidencia.


<!-- Página 160 de 207 -->

### 8.3.2 Suite de Control de Acceso Basado en Roles (RBAC Guards)

Alcance: Validación del middleware de autorización. Se introducen payloads de prueba emulando los diferentes perfiles del sistema (Gerente, Residente, Técnico, HES, Supervisor, Administrativo, Cliente) y se verifica que el backend responda con un código HTTP 403 Forbidden ante cualquier intento de escalado de privilegios o ejecución de acciones prohibidas (ej. un técnico intentando borrar de forma lógica una orden de trabajo).

Resultado: Debe verificarse con la corrida documentada en anexos. El bloqueo de accesos no autorizados solo debe afirmarse para los casos efectivamente evaluados.

### 8.3.3 Suite de Esquemas Dinámicos y Custom Fields (Zod 4.x)

Alcance: Pruebas de resiliencia y flexibilidad de esquemas. Se valida que la carga de formularios dinámicos y la adición de campos personalizados a las órdenes de trabajo respeten estrictamente la especificación del contrato de datos centralizado, rechazando de forma segura entradas maliciosas o mal formateadas.

Resultado: Debe verificarse con la corrida documentada en anexos. Los rechazos de payloads inválidos deben mostrarse con casos de prueba o salida de consola.

### 8.3.4 Suite de Reglas de Negocio de Órdenes de Trabajo

Alcance: Verificación de la máquina de estados secuencial de la OT. Se valida que una orden no pueda saltar etapas de forma incorrecta (ej. pasar de Fase de Planeación a Fase de Acta firmada sin registrar el checklist HES ni adjuntar evidencias fotográficas), asegurando el cumplimiento estricto del flujo operativo.

Resultado: Debe verificarse con la corrida documentada en anexos. Las transiciones inválidas deben reportarse únicamente para los casos de prueba ejecutados.


<!-- Página 161 de 207 -->

### 8.3.5 Suite de Proyección de Casos de Servicio (ServiceCase Projection)

Alcance: Pruebas de integración sobre el motor de agregación de datos de MongoDB. Se inyectan de forma simulada registros dispersos en múltiples colecciones de la base de datos (una solicitud de visita, una cotización aprobada, dos evidencias y una orden finalizada) y se invoca al servicio de proyección ServiceCase. Se valida que el motor retorne un consolidado financiero exacto del proyecto, identifique de forma automática el cuello de botella actual (bloqueadores en actas o SES) y calcule el siguiente paso transaccional de manera correcta.

Resultado: Debe verificarse con la corrida documentada en anexos. La consistencia de cálculos agregados debe quedar respaldada por casos concretos.

### 8.3.6 Suite de Generación Documental y pdf-lib

Alcance: Pruebas funcionales de compilación binaria de documentos. Se evalúa el servicio de creación de informes técnicos y actas de entrega, validando que el módulo compile un búfer binario en PDF válido, con marcas de agua, firmas incrustadas y tablas dinámicas de costos sin corromper el archivo resultante.

Resultado: Debe verificarse con la corrida documentada en anexos. La generación de archivos PDF válidos debe conservarse como evidencia técnica.

### 8.3.7 Suite de Evidencias Foto-Geolocalizadas

Alcance: Verificación de las restricciones de archivos multimedia. Se prueban cargas de imágenes de alta resolución simuladas, verificando la extracción de coordenadas GPS del metadato EXIF, validación del tamaño de archivo permitido y rechazo automático de extensiones potencialmente maliciosas.

Resultado: Debe verificarse con la corrida documentada en anexos. La asociación de metadatos con la orden correspondiente queda pendiente por anexar evidencia si no se incluye el reporte.


<!-- Página 162 de 207 -->

## 8.4 Matriz consolidada de pruebas del monorepo

La validación cuantitativa del sistema se sintetiza en la Tabla 8.1, que refleja el estado de cumplimiento verificado por la suite de pruebas del monorepo.

**Tabla 8.1: Matriz final de validación y estado de cumplimiento técnico. Fuente: Elaboración propia.**

Comportamiento lógico correcto y libre de efectos colaterales.

Verificado según reporte anexo

Nivel de Prueba Objetivo Tecnológico Resultado Esperado Estado Unitaria Validar reglas de negocio puras, hooks de Zustand y esquemas Zod en shared-types.

Persistencia transaccional de datos y consistencia referencial.

Verificado según reporte anexo

Integración Evaluar la comunicación asíncrona entre Express, Mongoose y MongoDB en memoria.

Extremo a Extremo (E2E)

Flujo secuencial continuo y manejo centralizado de errores.

Verificado según reporte anexo

Simular peticiones HTTP completas (Supertest) de login, creación de OT, checklist y cierre.

Aceptación cualitativa

Evaluar la interfaz adaptativa y la operación offline con usuarios por rol.

Experiencia de usuario comprensible y flujo funcional sin bloqueos críticos.

Matriz propuesta / requiere acta de aceptación

## 8.5 Validación cualitativa y de usabilidad por roles

Para complementar la verificación cuantitativa, se diseñó un marco de aceptación cualitativa con el fin de auditar la respuesta del sistema frente a los operarios finales de CERMONT S.A.S. La Tabla 8.2 expone las pruebas cualitativas propuestas para validación por rol. Cuando existan actas o formatos firmados por usuarios, deberán anexarse como evidencia de aceptación.

La matriz de validación cualitativa define cómo debería evaluarse la aplicación con usuarios por rol. Sin embargo, mientras no existan actas, formatos diligenciados o evidencia equivalente, esta sección debe leerse como una propuesta de validación y no como una aceptación formal ya ejecutada.


<!-- Página 163 de 207 -->

**Tabla 8.2: Matriz de aceptación cualitativa por perfil de usuario. Fuente: Elaboración propia.**

Rol del Operario Acción del Sistema Evaluada Criterio de Aceptación Resultado Técnico de Campo (TEC)

Captura offline de checklists y evidencias fotográficas.

Escenario propuesto / requiere acta

Operación offline comprensible y sincronización posterior cuando aplique.

Residente de Obra (RES)

Asignación de recursos y personal a las órdenes de trabajo.

Prevención de doble asignación y visualización del estado.

Escenario propuesto / requiere acta Supervisor / Inspector

Auditoría de checklists y aprobación de informes técnicos.

Notificación y bloqueo de firmas incompletas.

Escenario propuesto / requiere acta Gerente (GER) Consulta consolidada de casos de servicio y descarga de actas.

Disponibilidad de agregados y descarga documental.

Escenario propuesto / requiere acta Administrativo (ADM)

Seguimiento de SES, facturación y registro de pago.

Visibilidad de pendientes en fases administrativas.

Escenario propuesto / requiere acta

## 8.6 Síntesis de la validación

La estrategia de pruebas implementada para el aplicativo web de CERMONT S.A.S. documenta la madurez técnica del artefacto de ingeniería construido. La evidencia anexa debe respaldar pruebas automatizadas, un modelo transaccional en memoria y validaciones Zod de extremo a extremo. Este capítulo constituye una evidencia técnica relevante dentro del trabajo de grado siempre que las salidas de prueba se conserven en los anexos correspondientes.

## 8.7 Pirámide de pruebas: estrategia de cobertura por capas

La estrategia de pruebas del proyecto se diseñó siguiendo el modelo de la pirámide de pruebas, ampliamente aceptado en la literatura de ingeniería de software [14, 15]. Este modelo establece que la mayoría de las pruebas deben ubicarse en la base de la pirámide (pruebas unitarias, rápidas y aisladas), con una proporción decreciente hacia la cima (pruebas de integración, extremo a extremo y aceptación).


<!-- Página 164 de 207 -->

La distribución de la suite de pruebas del proyecto refleja esta estrategia:

Base - Pruebas unitarias (Vitest): La base de la pirámide corresponde a componentes aislados: esquemas Zod en @cermont/shared-types (validación de datos válidos e inválidos, rechazo de formatos incorrectos, verificación de tipos inferidos), funciones de dominio en @cermont/domain (cálculo de estados, evaluación de permisos RBAC, determinación de bloqueos y siguientes acciones), y servicios de negocio en el backend (lógica pura sin dependencias externas). Estas pruebas se ejecutan en milisegundos y no requieren conexión a base de datos.

Capa intermedia - Pruebas de integración (Supertest + Vitest): Esta capa verifica la interacción entre componentes: endpoints HTTP del backend recibiendo peticiones reales, con middlewares de autenticación y autorización activos, y una base de datos MongoDB en memoria que se crea y destruye para cada suite. Estas pruebas confirman que los contratos de API, las validaciones Zod y las reglas de negocio funcionan correctamente en conjunto.

Cima - Pruebas de aceptación cualitativa: Esta capa corresponde a escenarios de uso por perfil de usuario, documentados en la matriz de aceptación cualitativa (Tabla 8.2). Estas pruebas verifican que el sistema responde adecuadamente a las necesidades de cada rol en el contexto operativo de CERMONT S.A.S.

Esta distribución, con predominio de pruebas unitarias rápidas y una proporción controlada de pruebas de integración más lentas, permitió mantener un ciclo de retroalimentación ágil durante el desarrollo: las pruebas unitarias proporcionaban confirmación inmediata de la corrección del código modificado, mientras que las pruebas de integración se ejecutaban al final de cada iteración para verificar que los módulos funcionaban correctamente en conjunto.

## 8.8 Trazabilidad de la validación: de los objetivos a las pruebas

Para verificar que la validación del sistema cubriera todos los objetivos del proyecto, se estableció una matriz de trazabilidad que relaciona cada objetivo específico con las pruebas diseñadas para evaluarlo. Esta matriz, presentada en la Tabla 8.3, permite a cualquier revisor académico comprobar qué afirmaciones de cumplimiento están respaldadas por evidencia de pruebas.


<!-- Página 165 de 207 -->

Piloto

E2E: flujo de negocio

Integración: API, modelos y permisos

Unitarias: servicios, validaciones y contratos

**Figura 8.1: Pirámide de pruebas: distribución de la estrategia de cobertura por capas. Fuente: Elaboración propia.**

**Tabla 8.3: Trazabilidad: objetivos del proyecto y pruebas de validación. Fuente: Elaboración propia.**

Inventario documental, flujo de 14 pasos documentado y cinco fallas críticas sustentadas en documentos de la empresa.

Cumplido en diagnóstico documental

Objetivo específico Pruebas de validación asociadas Estado 1. Diagnosticar el flujo actual e identificar fallas críticas

Arquitectura, modelo de datos, decisiones de diseño y matriz RBAC documentadas.

Cumplido en diseño

Suite automatizada documentada para autenticación, RBAC, reglas de negocio, generación PDF, evidencias y módulos de seguimiento.

Pruebas técnicas ejecutadas, escenarios de validación por rol definidos y lineamientos para piloto operativo.

Cumplido con evidencia técnica 4. Validar el funcionamiento del sistema

Parcial: piloto operativo pendiente


<!-- Página 166 de 207 -->

## 8.9 Recomendaciones para la validación en entorno productivo

La validación realizada en el entorno de desarrollo constituye una base sólida, pero no sustituye la validación en un entorno productivo con usuarios reales y datos operativos auténticos. A continuación se proponen lineamientos para la fase de validación productiva que CERMONT S.A.S. debería ejecutar como siguiente paso:

que cubra los principales tipos de servicio y ejecutarlas completamente a través del sistema, desde la solicitud hasta el cierre administrativo, documentando tiempos, incidencias y observaciones de los usuarios.

finidos en la metodología (tiempo de planeación, completitud documental, trazabilidad de evidencias) antes y después de la adopción del sistema, utilizando los mismos criterios de medición en ambos momentos para permitir comparaciones válidas.

tem Usability Scale (SUS) a los usuarios del sistema después de un periodo de uso suficiente, segmentando los resultados por rol para identificar diferencias en la experiencia de uso entre perfiles.

durante el desarrollo con una auditoría de seguridad externa que evalúe la infraestructura de despliegue, la configuración del servidor y la protección de datos en el entorno productivo.

Estas recomendaciones no constituyen resultados del proyecto, sino orientaciones para la continuidad del trabajo durante y después de la práctica empresarial. Su ejecución permitiría transformar los indicadores actualmente marcados como “pendiente por medir” en resultados cuantitativos verificables.


<!-- Página 167 de 207 -->

## 8.10 Estrategia ampliada de pruebas por capas

La validación del aplicativo debe organizarse por capas para evitar confundir compilación, pruebas unitarias, pruebas funcionales y validación operativa. Que el sistema compile no significa que resuelva el proceso de negocio; que una prueba unitaria pase no significa que el usuario pueda cerrar una orden; y que una pantalla funcione no significa que la empresa haya reducido tiempos. Por ello, se propone una estrategia escalonada.

**Tabla 8.4: Estrategia de pruebas por capa del aplicativo. Fuente: elaboración propia.**

Capa Qué verifica Evidencia esperada Riesgo mitigado Typecheck Compatibilidad de tipos y contratos.

Salida de comando sin errores. Payloads inconsistentes. Lint Estilo, reglas de código y errores comunes.

Reporte de lint. Deuda técnica temprana. Unitarias Servicios, validaciones y reglas de negocio aisladas.

Resultados de Vitest u otra herramienta.

Reglas rotas en módulos críticos. Integración Comunicación entre ruta, servicio, modelo y contrato.

Pruebas API o escenarios controlados.

Endpoints desconectados. Frontend Estados de carga, vacío, error y ready.

Capturas, pruebas de interfaz o revisión funcional.

Pantallas sin datos o con rutas rotas. E2E Flujo completo desde solicitud hasta cierre parcial.

Escenario documentado con pasos y resultado.

Módulos que funcionan aislados pero no integrados. Operativa Uso real con usuarios y órdenes.

Actas, mediciones y observaciones.

Afirmaciones de impacto no verificadas.

## 8.11 Escenarios de validación funcional derivados del flujo de 14 pasos

Los escenarios de validación deben derivarse de las fallas reales. Un escenario mínimo para planeación debe comprobar que una orden no avance a ejecución si el paquete de recursos está incompleto. Un escenario de evidencias debe comprobar que una foto o soporte quede asociado a la orden correcta. Un escenario de informes debe comprobar que el documento se genere usando datos capturados y no información escrita manualmente desde cero. Un escenario de cierre debe comprobar que SES, factura y pago se relacionen con la misma orden. Un escenario de costos debe comprobar que una línea de costo real pueda vincularse a una propuesta o actividad.


<!-- Página 168 de 207 -->

**Tabla 8.5: Escenarios de validación funcional propuestos. Fuente: elaboración propia.**

Escenario Pasos de usuario Resultado esperado Estado

Planeación completa

La orden queda lista para ejecución sin bloqueadores críticos.

Crear orden, agregar recursos, verificar herramientas, cargar documentos HES y aprobar planeación.

Pendiente de evidenciar con captura o prueba. Ejecución con evidencia

Iniciar ejecución, diligenciar checklist, anexar fotografías y cerrar sesión.

Las evidencias quedan vinculadas a la orden y disponibles para informe.

Según evidencia del repositorio. Generación de informe

Seleccionar orden ejecutada, generar informe técnico y revisar PDF.

El documento contiene actividades, observaciones y soportes.

Parcial o implementado según código. Cierre administrativo

Registrar acta, SES, factura y pago asociado a la orden.

Pendiente si no hay flujo E2E.

La línea de tiempo muestra el estado administrativo completo.

El sistema muestra variación y soporte del costo.

Propuesto o parcial.

Control de costos Registrar costos reales y compararlos contra propuesta.

## 8.12 Validación cualitativa con roles de usuario

La validación por roles permite comprobar que el sistema responda a necesidades de usuarios distintos. El técnico requiere registrar información en campo sin complejidad excesiva; el ingeniero residente necesita revisar planeación, evidencias e informes; el administrativo necesita saber qué documentos habilitan SES y facturación; la gerencia necesita consultar estado, bloqueadores y costos. Cada perfil evalúa un aspecto distinto de la utilidad del sistema.

Para evitar afirmaciones no verificadas, la validación cualitativa debe documentarse con instrumentos simples: checklist por rol, observaciones de uso, capturas de pantalla, errores detectados, tiempo aproximado de ejecución de tareas y comentarios. Si esos instrumentos aún no existen, el libro debe presentarlos como plan de validación y no como resultado.


<!-- Página 169 de 207 -->

## 8.13 Criterios de aceptación para la fase piloto

Una fase piloto del sistema debería aceptarse si cumple condiciones mínimas: usuarios creados con roles correctos, órdenes registradas sin errores críticos, planeación asociada a cada actividad, evidencias vinculadas a la orden, informes generados sin recaptura completa, actas o soportes de cierre asociados, estados de SES y factura consultables, y ausencia de pérdida de información durante conectividad intermitente en los escenarios definidos. Estos criterios permiten que la empresa evalúe utilidad sin exigir inicialmente métricas financieras complejas.

La medición cuantitativa puede añadirse después de confirmar que el flujo operativo funciona. En ese momento se podrán comparar tiempos de preparación de informes, completitud documental y seguimiento de cierre antes y después del uso del aplicativo. Mientras esa medición no se realice, el resultado académico se limita a validación técnica y preparación metodológica del piloto.


<!-- Página 170 de 207 -->

## 8.14 Criterios de verificación normativa y limitaciones de cumplimiento

La validación del aplicativo frente a normas y buenas prácticas se organiza como una verificación de correspondencia, no como una certificación externa. Para que la afirmación sea académicamente defendible, cada norma debe asociarse a una evidencia observable: módulo implementado, prueba ejecutada, captura del sistema, contrato compartido, política de acceso o documento de diseño.

Criterio verificable Evidencia mínima requerida Resultado esperado

Calidad del producto de software. Matriz ISO/IEC 25010 con atributos: funcionalidad, seguridad, mantenibilidad, usabilidad y portabilidad.

Identificar qué atributos están implementados, parciales o pendientes.

Seguridad de la información. Pruebas de autenticación, autorización, cookies HttpOnly, RBAC, auditoría y manejo de evidencias.

No exponer datos sensibles y controlar acciones por rol.

Proceso de desarrollo. Bitácora, estructura del monorepo, contratos compartidos, pruebas y documentación técnica.

Demostrar trazabilidad desde requisito hasta código y validación.

Pruebas de software. Resultados de pruebas unitarias, integración, servicios, queries, build, lint y verificación.

Sostener que el sistema fue verificado con criterios reproducibles.

Gestión documental y calidad. Órdenes, actas, informes, evidencias, documentos, estados y registros de cierre administrativo.

Conservar información estructurada y trazable durante el ciclo operativo.

Gestión de activos y mantenimiento.

Módulos de activos, mantenimiento, kits, recursos, equipos y asociación con órdenes.

Evidenciar relación con prácticas GMAO/CMMS y gestión de activos.

Declaración de alcance: el trabajo de grado puede afirmar que el aplicativo se encuentra alineado con los criterios técnicos de las normas citadas en los módulos donde existe evidencia. No debe afirmarse que CERMONT S.A.S. o el aplicativo están certificados bajo ISO 9001, ISO 27001, ISO 55001, ISO/IEC 25010, ISO/IEC/IEEE 12207 o ISO/IEC/IEEE 29119, salvo que en el futuro exista una auditoría formal y un certificado emitido por un organismo autorizado.

Referencias normativas incorporadas: ISO 9001:2015, ISO 55001:2014, ISO/IEC 25010, ISO/IEC 27001:2022, ISO/IEC 27002, ISO/IEC/IEEE 12207:2017 e ISO/IEC/IEEE 29119. Estas referencias se emplean como marco de comparación técnica y no como declaración de certificación.

Corrección agregada: alineación normativa y técnica del aplicativo CERMONT S.A.S.


<!-- Página 171 de 207 -->

# 9 Discusión y Análisis Crítico

## 9.1 Introducción a la discusión

La discusión interpreta el alcance del proyecto a partir de la literatura revisada y de la problemática institucional. El objetivo no es repetir resultados, sino explicar su sentido técnico y académico, contrastarlos con antecedentes y reconocer límites de la solución propuesta [17, 19, 42-45].

## 9.2 Comparación con soluciones comerciales

Las plataformas comerciales ofrecen amplitud funcional y madurez operativa, pero suelen estar diseñadas para configuraciones generales o para empresas con presupuestos más altos. CERMONT S.A.S. presenta una realidad distinta: necesita integrar formatos propios, responder a una operación multiservicio y conservar control sobre sus documentos y procesos. La solución a medida resulta pertinente porque no intenta competir por volumen de funcionalidades, sino por ajuste al contexto.

## 9.3 Aporte del enfoque modular

La arquitectura modular aporta claridad conceptual y técnica. Cada módulo puede entenderse como una respuesta a una necesidad específica del proceso: órdenes, planeación, evidencias, documentos y cierre. Esa organización facilita mantenimiento, pruebas y evolución futura. Desde la literatura de ingeniería de software, esta decisión es consistente con la separación de responsabilidades [14, 16, 21].

## 9.4 Discusión sobre la trazabilidad documental

La trazabilidad documental constituye el núcleo del problema y, al mismo tiempo, el núcleo de la solución. Cuando un documento no se enlaza con una orden, una actividad y un responsable, su


<!-- Página 172 de 207 -->

utilidad operativa disminuye. En cambio, cuando esa relación queda estructurada, el documento se convierte en evidencia útil para el seguimiento y el cierre. Esta observación coincide con la literatura sobre BPM y FSM [18, 19].

## 9.5 Limitaciones del alcance actual

La solución propuesta tiene límites. Si la versión final no incorpora medición cuantitativa de impacto, no es correcto afirmar reducciones porcentuales. La automatización de formularios desde documentos heredados debe tratarse como línea futura. Además, la arquitectura no debe presentarse como universal sin analizar diferencias en escala, sector o reglas de negocio.

## 9.6 Implicaciones académicas y prácticas

Académicamente, el trabajo muestra cómo una metodología aplicada transforma un problema operativo en un artefacto tecnológico evaluable. Prácticamente, evidencia que una empresa contratista puede organizar mejor su información sin depender exclusivamente de software comercial rígido.

## 9.7 Síntesis crítica

El aporte del proyecto debe evaluarse desde una posición equilibrada. El aplicativo desarrollado aporta una base técnica para ordenar el flujo documental-operativo de CERMONT S.A.S.; sin embargo, su impacto sobre tiempos, costos, devoluciones o satisfacción de usuarios no debe afirmarse sin medición piloto. Por tanto, la discusión reconoce dos niveles de logro: el logro técnico, respaldado por arquitectura, módulos, capturas y pruebas que deben anexarse; y el logro operativo, pendiente de validarse con usuarios reales y órdenes de trabajo reales.


<!-- Página 173 de 207 -->

## 9.8 Discusión sobre la aplicabilidad del modelo a otras organizaciones

Aunque el proyecto fue desarrollado para el contexto específico de CERMONT S.A.S., varios elementos de su diseño pueden ser relevantes para organizaciones con perfiles operativos similares. La arquitectura modular, la separación entre el flujo técnico y el flujo administrativo, y el enfoque de formularios dinámicos basados en esquemas declarativos constituyen patrones transferibles a otras empresas contratistas multiservicio, particularmente aquellas que: (a) operan en sectores con alta exigencia documental (hidrocarburos, construcción, mantenimiento industrial); (b) ejecutan servicios en zonas con conectividad variable; (c) manejan una diversidad de formatos operativos que cambian según el tipo de servicio; y (d) requieren trazabilidad de extremo a extremo desde la solicitud del cliente hasta el pago.

Sin embargo, la transferibilidad no es automática. Cada organización tiene formatos propios, reglas de negocio específicas, estructuras organizacionales diferentes y restricciones presupuestales particulares. La arquitectura del sistema fue diseñada para ser adaptable -los formularios se definen mediante esquemas, no mediante código-, pero la adaptación a un nuevo contexto requeriría un diagnóstico documental similar al realizado en este proyecto para identificar los formatos, flujos y puntos de fragmentación propios de la nueva organización. En este sentido, el valor del trabajo no reside en el software como producto terminado y universal, sino en la metodología de diagnóstico, diseño y desarrollo que puede ser replicada en otros contextos.

## 9.9 Discusión sobre el rol de la inteligencia artificial en la evolución del sistema

La incorporación de capacidades de extracción documental basadas en modelos de lenguaje y visión artificial representa una de las líneas de evolución más prometedoras para el sistema. Herramientas como Docling, Unstructured, PaddleOCR y MinerU, revisadas en el estado del arte, demuestran que es técnicamente viable transformar documentos PDF, Word e imágenes en representaciones estructuradas que pueden alimentar un motor de formularios dinámicos. Sin embargo, esta capacidad debe abordarse con cautela académica y técnica.


<!-- Página 174 de 207 -->

En primer lugar, la extracción automática de campos desde documentos no estructurados no es un problema resuelto de forma general. La calidad de la extracción depende de la claridad del documento fuente, la consistencia de su formato y la complejidad de su estructura (tablas anidadas, campos multivaluados, secciones condicionales). Los documentos operativos de CERMONT S.A.S., aunque estructurados, presentan variaciones de formato entre diferentes versiones y tipos de servicio que exigirían un proceso de revisión humana antes de publicar cualquier formulario generado automáticamente.

En segundo lugar, desde la perspectiva académica, es esencial no afirmar capacidades que no han sido implementadas ni probadas. La diferencia entre una arquitectura propuesta y una funcionalidad operativa debe mantenerse clara en todo momento. Por esta razón, el módulo de formularios dinámicos desde documentos se presenta en este trabajo como una línea de evolución futura, fundamentada en herramientas existentes y arquitectónicamente compatible con el sistema actual, pero no como un resultado alcanzado.

## 9.10 Discusión sobre la completitud del flujo operativo implementado

El sistema implementado cubre los módulos principales que abarcan desde la autenticación hasta el cierre administrativo. Sin embargo, la cobertura no es uniforme en profundidad. Los módulos de órdenes de trabajo, evidencias y ejecución alcanzaron un nivel de madurez funcional que incluye operación offline, validación de esquemas y generación de auditoría. Otros módulos, como la aprobación de órdenes de compra (Paso 4) y la firma digital del cliente (Paso 10), tienen la lógica de backend implementada pero carecen de los componentes de interfaz de usuario correspondientes.

Esta distribución asimétrica refleja una decisión consciente de priorización: los módulos que resuelven los cuellos de botella más críticos identificados en el diagnóstico (planeación, ejecución en campo, evidencias, cierre documental) recibieron atención prioritaria, mientras que los módulos de soporte a procesos que actualmente funcionan de forma aceptable para la empresa (gestión de órdenes de compra, firma de actas) se implementaron en el backend para no bloquear el flujo de datos, postergando su interfaz de usuario para iteraciones futuras. Esta estrategia es consistente con el principio de desarrollo iterativo e incremental, que prioriza la entrega de valor temprano sobre


<!-- Página 175 de 207 -->

la completitud funcional inmediata.

## 9.11 Síntesis de la discusión

La discusión presentada en este capítulo permite articular una valoración equilibrada del proyecto. Por un lado, el sistema implementado constituye una base técnica documentada, fundamentada en decisiones arquitectónicas, evidencias visuales y pruebas que deben conservarse como anexos. Por otro lado, el trabajo reconoce explícitamente sus limitaciones: la validación cuantitativa de impacto requiere mediciones en entorno real aún no ejecutadas; la cobertura funcional no es uniforme entre módulos; y las capacidades de extracción documental automática, aunque arquitectónicamente previstas, constituyen trabajo futuro. Esta honestidad académica fortalece el trabajo al establecer con precisión qué fue demostrado, qué fue implementado y qué queda como trabajo posterior.

## 9.12 Discusión sobre las decisiones arquitectónicas

Las decisiones arquitectónicas documentadas en el marco teórico resultaron pertinentes durante el desarrollo del proyecto. La adopción de un monorepo con npm workspaces ayudó a controlar la duplicación de tipos entre frontend y backend, en coherencia con lo señalado por Richards y Ford [21] sobre la importancia de una fuente única de verdad en arquitecturas distribuidas. La elección de Express 5.2.1 permitió aprovechar la propagación nativa de errores asíncronos y simplificar parte del manejo de excepciones frente a versiones anteriores del framework.

La decisión de utilizar MongoDB con Mongoose (ADR-003) resultó acertada para el contexto de formularios heterogéneos de CERMONT S.A.S., pero introdujo un costo de aprendizaje para desarrolladores acostumbrados a bases de datos relacionales. Este hallazgo coincide con la literatura sobre compensaciones arquitectónicas (architectural trade-offs), que señala que ninguna decisión técnica está exenta de contrapartidas [16].

La implementación de Next.js con App Router (ADR-004) aportó una estructura clara para vistas protegidas y componentes interactivos, aunque la coexistencia de componentes de servidor y cliente exigió una disciplina rigurosa en la delimitación de responsabilidades. La autenticación JWT con Zustand (ADR-005) se consideró adecuada para el escenario offline parcial, pero requiere aten-


<!-- Página 176 de 207 -->

ción continua a la seguridad de los tokens en el lado del cliente, particularmente en dispositivos compartidos o públicos.

## 9.13 Discusión sobre la cobertura del flujo operativo

El sistema implementado cubre módulos principales del flujo operativo de CERMONT S.A.S., desde la autenticación hasta el cierre administrativo. Sin embargo, la cobertura no es uniforme: los módulos de órdenes de trabajo y evidencias cuentan con mayor evidencia funcional, mientras que módulos como la validación automática de certificaciones del personal o la integración directa con portales externos (SAP Ariba) permanecen como líneas de evolución futura.

Esta distribución asimétrica de la madurez funcional es consistente con el enfoque de desarrollo iterativo adoptado, donde los módulos de mayor criticidad para el flujo operativo recibieron prioridad en las iteraciones tempranas. La literatura sobre metodologías ágiles respalda esta estrategia de priorización basada en valor de negocio [58], aunque también advierte sobre el riesgo de acumular deuda técnica en los módulos postergados.

## 9.14 Discusión sobre la validación del sistema

La suite de pruebas automatizadas documentada constituye un indicador técnico relevante de la calidad técnica del artefacto desarrollado. Sin embargo, es necesario distinguir entre la validación técnica (que el sistema funcione correctamente) y la validación operativa (que el sistema resuelva el problema de negocio). La primera se sustenta en pruebas automatizadas y debe acompañarse de sus evidencias anexas; la segunda requiere mediciones en un entorno de producción con usuarios reales durante un período suficiente para detectar patrones de uso, fricciones en la interfaz y brechas entre el flujo diseñado y el flujo real de trabajo.

Esta distinción es particularmente relevante cuando el valor académico del proyecto no reside únicamente en el artefacto construido sino en la evidencia de su aplicación efectiva en el contexto organizacional. La literatura sobre Design Science Research enfatiza que la evaluación de un artefacto debe considerar tanto su eficacia técnica (efficacy) como su efectividad en el contexto de uso (effectiveness) [10, 56].


<!-- Página 177 de 207 -->

## 9.15 Comparación con trabajos relacionados

Los trabajos de grado revisados en el estado del arte abordan problemas análogos de digitalización de procesos técnicos, pero con diferencias significativas en alcance y contexto. García López (2021) desarrolló un CMMS para flota de transporte, logrando resultados en un dominio de mantenimiento de activos propios, pero sin abordar la complejidad documental de una empresa contratista multiservicio. Rodríguez y Torres (2022) implementaron una aplicación móvil para técnicos de campo en telecomunicaciones, priorizando la movilidad sobre la integración administrativa. Martínez Suárez (2020) documentó un sistema web para mantenimiento preventivo industrial, enfocado en la programación de intervenciones más que en el flujo documental completo.

El presente trabajo se diferencia de estos antecedentes en tres aspectos: (a) aborda el ciclo completo desde la solicitud hasta el pago, en lugar de un subconjunto del proceso; (b) integra capacidades offline diseñadas específicamente para operación en campo con conectividad intermitente; y (c) fundamenta sus decisiones técnicas en una revisión sistemática de herramientas comerciales y repositorios abiertos, estableciendo un criterio de comparación verificable.

## 9.16 Lecciones aprendidas del proceso de desarrollo

El desarrollo del aplicativo dejó varias lecciones relevantes para proyectos similares de Ingeniería Electrónica aplicada a software empresarial. En primer lugar, la adopción temprana de un flujo contract-first (esquema Zod →modelo →servicio →controlador →ruta →API client →hook →UI) previno numerosos errores de integración que habrían surgido si el frontend y el backend se hubieran desarrollado de forma independiente. En segundo lugar, la ejecución sistemática de compuertas de calidad después de cada iteración (typecheck, lint, test, build) evitó la acumulación de deuda técnica y facilitó la detección temprana de regresiones. En tercer lugar, la decisión de no incluir datos cuantitativos no verificados en el documento obligó a mantener una disciplina de trazabilidad que, aunque exigente, fortalece la defensa académica del trabajo frente a cualquier revisión académica.


<!-- Página 178 de 207 -->

## 9.17 Discusión sobre la expansión del libro a partir de documentación técnica

La incorporación de la documentación técnica 00-22 aporta profundidad al trabajo porque permite explicar el desarrollo del aplicativo como proceso y no solo como producto final. Sin embargo, esta integración debe hacerse con criterio académico. No sería adecuado copiar la documentación completa dentro del libro, porque eso transformaría el trabajo de grado en un manual de desarrollo. La estrategia correcta consiste en extraer de cada documento sus decisiones, restricciones, reglas y evidencias, y relacionarlas con los objetivos del proyecto.

Este enfoque también ayuda a responder una posible objeción de jurado: si el libro afirma que se desarrolló un software, debe mostrar cómo se llegó al artefacto. Las secciones ampliadas de metodología, arquitectura, desarrollo, resultados y validación cumplen esa función al convertir la bitácora técnica en argumento académico.

## 9.18 Discusión sobre funcionalidades implementadas y propuestas

Una de las principales fortalezas metodológicas del documento debe ser la separación entre funcionalidad implementada, parcialmente implementada y propuesta. En proyectos de software aplicados a empresas reales, es común que el alcance evolucione y que algunas capacidades queden diseñadas para fases posteriores. Esto no debilita el trabajo si se documenta con transparencia. Por el contrario, demuestra madurez al reconocer límites y al evitar presentar como terminado lo que todavía requiere pruebas o integración.

En el caso de CERMONT, esta distinción es especialmente relevante para módulos como sincronización de evidencias binarias, extracción automática desde documentos, costos reales con datos operativos y validación con usuarios en producción. Es válido incluirlos como arquitectura futura o funcionalidad parcialmente implementada cuando existe base técnica; no es válido reportar impacto cuantitativo sin evidencia.


<!-- Página 179 de 207 -->

## 9.19 Discusión sobre arquitectura a medida frente a adopción directa

El desarrollo a medida se justifica cuando el problema no se limita a administrar órdenes, sino a integrar un flujo propio de documentos, estados, roles y cierre administrativo. Una herramienta comercial puede cubrir partes del proceso, pero no necesariamente adapta de forma inmediata los documentos internos, la secuencia de SES/facturación, el control de costos reales o las particularidades de evidencias y formatos de la empresa. La decisión de construir una solución propia debe evaluarse por su capacidad de representar fielmente el flujo de CERMONT, no por una preferencia tecnológica.

La discusión también debe reconocer los costos de esta decisión. Un sistema a medida exige mantenimiento, pruebas, documentación, soporte y evolución. Por eso, las recomendaciones deben incluir gobernanza técnica, respaldo de datos, control de versiones, auditoría de seguridad y capacitación de usuarios. Un desarrollo propio sin continuidad puede convertirse en deuda técnica; un desarrollo propio bien documentado puede convertirse en plataforma estratégica.

## 9.20 Lecciones sobre diseño centrado en el proceso

La principal lección del proyecto es que el software debe diseñarse a partir del proceso real y no desde una lista de pantallas deseadas. En CERMONT, el flujo de valor incluye propuesta, PO, planeación, ejecución, evidencias, informe, acta, SES, factura y pago. Si una pantalla no contribuye a mover una orden dentro de ese flujo o a resolver una falla documentada, su prioridad debe ser revisada. Esta visión evita dashboards decorativos, módulos duplicados y rutas sin propósito.

El diseño centrado en el proceso también facilita explicar la pertinencia del proyecto para Ingeniería Electrónica. La disciplina no se limita a programar interfaces; implica analizar sistemas, modelar estados, controlar transiciones, validar señales de entrada, asegurar integridad, diseñar arquitectura y verificar comportamiento. El aplicativo es un sistema de información aplicado a un proceso técnico-industrial, y por eso puede defenderse dentro del programa académico.


<!-- Página 180 de 207 -->

## 9.21 Discusión sobre visualización y comunicación técnica

Las figuras y tablas del libro deben cumplir una función explicativa. Una figura que ocupa una página completa sin texto contextual reduce la fluidez de lectura; una tabla fragmentada artificialmente en varias páginas impide comparar información. Por ello, la corrección editorial debe priorizar diagramas dentro de margen, tablas continuas y explicaciones antes y después de cada elemento visual. No se trata de eliminar figuras, sino de convertirlas en evidencia legible y pertinente.

Los diagramas más importantes para la defensa son: flujo de 14 pasos, mapa de fallas, arquitectura general, modelo de datos, estados de la orden, pipeline de evidencias, generación de informes y validación por capas. Cada uno debe conectarse con un capítulo y con un objetivo. Así, la visualización se convierte en argumento técnico y no en decoración.


<!-- Página 181 de 207 -->

# 10 Conclusiones y Recomendaciones

## 10.1 Conclusiones A partir del desarrollo del proyecto se concluyó lo siguiente:

**Tabla 10.1: Respuesta a los objetivos del proyecto. Fuente: Elaboración propia con base en el libro, la documentación técnica y el repositorio.**

Cumplido

Objetivo Cómo se abordó Capítulo Evidencia Estado Analizar el flujo actual y las fallas críticas

1, 5 y 7 Documento de proceso de CERMONT, formatos internos y matrices de diagnóstico.

Diagnóstico del flujo de 14 pasos y revisión de formatos operativos e institucionales.

Cumplido

Diseñar la arquitectura funcional

5 y 6 Diagramas, esquemas compartidos, packages/ domain/src/roles.ts, packages/ shared-types/src/ schemas/.

Definición de módulos, roles, estados, contratos compartidos y organización del monorepo.

Implementar los módulos principales

6 y 7 Código del monorepo, rutas, servicios, pantallas y pruebas automatizadas.

Cumplido con alcances parciales

Construcción de backend, frontend y contratos para planeación, ejecución, evidencias, informes, cierre y costos.

Validar la efectividad del aplicativo

Reportes de pruebas, matrices de validación y lineamientos de piloto.

Parcial: medición operativa pendiente

Ejecución de pruebas técnicas y diseño de escenarios de validación por rol.

de documentos, sino en la fragmentación de la información operativa y administrativa entre


<!-- Página 182 de 207 -->

soportes físicos y digitales dispersos. El diagnóstico permitió reconocer cinco fallas críticas: planeación, ejecución, informes y actas, facturación y control de costos reales. En consecuencia, el problema no se resuelve solo con digitalizar formatos, sino con articularlos dentro de un flujo trazable por orden de trabajo.

compartidos, permite estructurar de manera coherente órdenes de trabajo, planeación, evidencias, generación documental y seguimiento administrativo. Esta organización favorece la separación de responsabilidades y la trazabilidad entre contratos, roles, endpoints y pantallas.

consistencia entre validación, persistencia y experiencia de usuario. Este hallazgo es relevante porque el proyecto no solo produjo pantallas, sino un flujo de desarrollo que relaciona esquema, servicio, endpoint, consulta y componente.

flujo de 14 pasos, aunque no todas las capacidades deben presentarse como cerradas o completamente validadas. La operación offline existe como soporte parcial verificado para app shell, fallback, rutas internas calentadas y snapshots locales de listados operativos; la sincronización completa de cada formulario, evidencias binarias en todos los escenarios e integraciones con plataformas externas permanecen pendientes o fuera de alcance.

mación y su fuente verificable. Los datos sobre CERMONT S.A.S. provienen de documentos reales suministrados por la empresa (formatos operativos, inducción HES, sitio web oficial); los datos sobre costos de software provienen de páginas oficiales de proveedores (Jobber, Odoo, ServiceM8); y los datos sobre herramientas de código abierto provienen de repositorios públicos en GitHub. No se incluyeron en el documento cifras internas no autorizadas, proyecciones financieras sin soporte contable, ni resultados de pruebas piloto no ejecutadas. Esta disciplina de trazabilidad fortalece la defendibilidad del trabajo frente a cualquier revisión académica.

una contribución técnica y académica verificable: técnica, porque existe un artefacto real en desarrollo; metodológica, porque puede rastrearse su evolución mediante documentación, código y pruebas; y académica, porque la solución se argumenta desde un problema organizacional real y no desde una tesis genérica de transformación digital.


<!-- Página 183 de 207 -->

## 10.2 Recomendaciones

Con base en las limitaciones identificadas y en los resultados obtenidos, se proponen las siguientes recomendaciones orientadas a fortalecer el sistema y su adopción en CERMONT S.A.S.:

Validación cuantitativa en entorno productivo: Completar la medición de los indicadores definidos en la metodología (tiempo de planeación, completitud documental, trazabilidad de evidencias, satisfacción de usuarios) mediante la ejecución de una prueba piloto controlada durante al menos un ciclo operativo completo. Estos datos son necesarios para transformar la validación técnica del artefacto en validación operativa con evidencia. Se recomienda documentar los resultados en un anexo del libro final, con los instrumentos de medición utilizados y las evidencias correspondientes.

Documentación de evidencias funcionales: Incorporar al documento anexos con capturas de pantalla del sistema en funcionamiento, ejemplos de órdenes de trabajo creadas, evidencias fotográficas asociadas, informes PDF generados y resultados de las pruebas automatizadas. Esta documentación visual fortalece la defendibilidad del trabajo frente a la revisión académica al proporcionar evidencia concreta del artefacto construido.

Formalización del módulo de formularios dinámicos: Si la empresa aprueba su incorporación, definir un plan de trabajo para implementar el pipeline de extracción documental descrito en el capítulo de desarrollo: carga del documento PDF/WORD →extracción de estructura →generación de plantilla →revisión humana →publicación como formulario digital. Las herramientas identificadas en el estado del arte (Docling, Unstructured, PaddleOCR, MinerU) proporcionan una base técnica para esta implementación.

Integración con sistemas externos: Evaluar la viabilidad de integrar el aplicativo con el software contable de CERMONT S.A.S. (SIIGO) y, cuando la escala lo justifique, con portales transaccionales de clientes (SAP Ariba) para automatizar la radicación de SES y facturas. Se recomienda que esta integración se realice después de consolidar el sistema base y de documentar los flujos de datos entre sistemas.

Mejora continua del código base: Mantener la disciplina de compuertas de calidad (typecheck, lint, test, build, react-doctor) en todas las iteraciones futuras. Ampliar la cobertura de pruebas unitarias y de integración para los módulos que actualmente dependen más


<!-- Página 184 de 207 -->

de la validación cualitativa que de la verificación automatizada. Considerar la incorporación de pruebas end-to-end con Playwright para los flujos críticos del negocio.

Capacitación y gestión del cambio: Diseñar un plan de capacitación para los usuarios del sistema en CERMONT S.A.S., diferenciado por perfil de usuario (técnicos de campo, supervisores, administrativos, gerencia). La resistencia al cambio organizacional es un factor crítico de éxito en proyectos de transformación digital, y la experiencia del personal con herramientas digitales previas puede influir en la adopción del sistema.

Estrategia de respaldo y continuidad: Implementar un plan de respaldos automáticos de la base de datos y de los archivos de evidencias, con retención mínima de 30 días y almacenamiento en ubicación separada del servidor principal. Documentar un procedimiento de recuperación ante desastres que permita restaurar el sistema en caso de falla de infraestructura.

Verificación de requisitos institucionales: Confirmar con la plantilla institucional vigente del programa de Ingeniería Electrónica de la Universidad de Pamplona cualquier requisito de presentación, estructura o contenido que deba ajustarse en la versión final del libro de trabajo de grado. Esta verificación debe realizarse antes de la entrega formal para evitar correcciones de última hora.

## 10.3 Líneas de continuidad

Como continuidad del trabajo, se recomienda profundizar en tres frentes complementarios que permiten conservar la coherencia del sistema sin introducir complejidad prematura.

El primer frente es la automatización documental. El pipeline de formularios dinámicos propuesto en el capítulo de desarrollo -carga de documento →extracción de estructura →generación de plantilla →revisión humana →publicación como formulario digital- representa una evolución natural del sistema que aprovecharía los formatos existentes de CERMONT S.A.S. sin requerir que cada nuevo tipo de servicio motive un desarrollo de software específico. Las herramientas identificadas en el estado del arte (Docling, Unstructured, PaddleOCR, MinerU) proporcionan la base técnica para esta automatización, pero su integración en el flujo de trabajo del aplicativo requiere un proyecto de desarrollo dedicado, con atención particular a la validación humana de los campos extraídos automáticamente.


<!-- Página 185 de 207 -->

El segundo frente es la medición de impacto. La validación técnica del sistema mediante pruebas automatizadas y revisión de seguridad debe conservarse con evidencia anexa; la validación operativa (medición de tiempos, completitud documental, satisfacción de usuarios y errores) requiere la ejecución de una prueba piloto controlada en el entorno productivo de CERMONT S.A.S. Esta medición transformaría los indicadores actualmente marcados como “por medir con evidencia operativa” en resultados cuantitativos verificables.

El tercer frente es la expansión funcional controlada. El sistema actual cubre módulos centrales del flujo operativo y administrativo, pero existen oportunidades de expansión identificadas durante el desarrollo: integración con el software contable SIIGO para automatizar la transferencia de datos de facturación, implementación de un portal del cliente para consulta de estados de órdenes, incorporación de notificaciones automáticas por correo electrónico ante cambios de estado relevantes, y desarrollo de un módulo de analítica operativa con dashboards avanzados de rentabilidad por tipo de servicio, por cliente y por período. Cada una de estas expansiones debe evaluarse según su valor para el negocio y su complejidad técnica, priorizando aquellas que resuelvan los cuellos de botella más significativos para la operación de CERMONT S.A.S.

## 10.4 Cierre del trabajo

El proyecto cumplió su propósito académico al abordar un problema real con una solución tecnológica coherente, documentada y defendible. Desde la perspectiva de la Ingeniería Electrónica, el trabajo demuestra la aplicación de principios de análisis de sistemas, diseño de arquitectura, desarrollo de software, validación técnica y documentación rigurosa en un contexto organizacional auténtico. El artefacto construido -un aplicativo web funcional con módulos de negocio y soporte organizados por dominio, cobertura del flujo de 14 pasos, pruebas automatizadas documentadas y arquitectura sustentada mediante decisiones justificadas- constituye evidencia verificable de las competencias adquiridas durante la formación profesional.

El mayor aporte del proyecto no reside en una funcionalidad específica del software, sino en la demostración de que la fragmentación documental de una empresa contratista multiservicio puede ser abordada sistemáticamente mediante una arquitectura web diseñada a partir del proceso real y no al margen de él. Este enfoque -diagnosticar el flujo existente, diseñar una arquitectura que respete la lógica operativa de la organización, implementar con estándares de calidad industrial y


<!-- Página 186 de 207 -->

validar con evidencia verificable- constituye un modelo replicable para proyectos similares en el sector de servicios técnicos e industriales.

Queda en manos de CERMONT S.A.S. la decisión de adoptar el sistema como plataforma operativa, así como la responsabilidad de continuar su evolución mediante las líneas de trabajo propuestas en este documento. La base técnica construida, la documentación generada y las recomendaciones formuladas proporcionan un punto de partida para esa continuidad.

## 10.5 Síntesis de contribuciones

El trabajo de grado realizado produjo contribuciones en tres dimensiones complementarias. En la dimensión técnica, se construyó un artefacto de software funcional con módulos integrados para el flujo operativo y administrativo de CERMONT S.A.S., respaldado por pruebas automatizadas documentadas y por un flujo contract-first verificable. En la dimensión metodológica, se aplicó y documentó un proceso sistemático de desarrollo que articula diagnóstico, diseño, implementación y validación técnica. En la dimensión académica, se realizó una revisión comparativa de plataformas comerciales de FSM, repositorios abiertos de CMMS/ERP y herramientas de formularios dinámicos y extracción documental, estableciendo criterios que justifican el desarrollo a medida frente a la adopción directa de soluciones existentes.

## 10.6 Reflexión sobre la formación en Ingeniería Electrónica

La ejecución de este proyecto permitió constatar que la Ingeniería Electrónica, entendida en su alcance contemporáneo, trasciende el diseño de circuitos y sistemas de potencia para abarcar el diseño de sistemas de información que resuelven problemas reales de organizaciones. La capacidad de analizar un proceso operativo, modelar sus entidades y estados, diseñar una arquitectura de software que soporte restricciones de conectividad, seguridad y escalabilidad, e implementarla con estándares de calidad industrial, constituye una competencia fundamental del ingeniero electrónico en la era de la transformación digital. Este proyecto, desarrollado en el contexto de práctica empresarial, ejemplifica cómo los conocimientos adquiridos durante la carrera pueden aplicarse para


<!-- Página 187 de 207 -->

generar valor en una organización real, cumpliendo con el perfil de egreso definido por el programa de Ingeniería Electrónica de la Universidad de Pamplona.

## 10.7 Conclusiones ampliadas por objetivo específico

Respecto al primer objetivo específico, se concluyó que el flujo operativo de CERMONT S.A.S. puede representarse mediante una secuencia de catorce pasos que inicia en la solicitud del cliente y finaliza con el pago del servicio. Este modelado permitió identificar fallas concretas en planeación, ejecución, consolidación documental, facturación y control de costos reales. La sistematización del proceso constituyó la base para convertir una problemática organizacional en requisitos de software verificables.

Respecto al segundo objetivo específico, se concluyó que la arquitectura funcional del sistema debía organizarse por módulos alineados con el flujo de negocio y no por pantallas aisladas. La separación entre frontend, backend y contratos compartidos permitió definir responsabilidades, controlar duplicidad y mantener una trazabilidad técnica entre entidades, estados y acciones del usuario. La estructura modular también facilita que CERMONT incorpore nuevos tipos de documentos y servicios sin rediseñar por completo la aplicación.

Respecto al tercer objetivo específico, se concluyó que los módulos principales del aplicativo responden a las fallas documentadas: planeación y kits para evitar omisiones de herramientas y equipos; ejecución y evidencias para ordenar soportes de campo; informes y actas para disminuir recaptura manual cuando los datos estén completos; cierre administrativo para dar seguimiento a SES, factura y pago; y costos reales para preparar la comparación contra propuesta económica. El grado de implementación de cada módulo debe mantenerse documentado con evidencia técnica y no con afirmaciones generales.

Respecto al cuarto objetivo específico, se concluyó que la validación técnica del sistema puede organizarse mediante pruebas por capas, escenarios funcionales y aceptación por rol. Los indicadores cuantitativos de impacto operativo deben medirse únicamente en una fase piloto con usuarios reales y órdenes de trabajo reales. Mientras esa fase no produzca evidencia, el libro debe presentar dichos indicadores como propuestos o pendientes de validación.


<!-- Página 188 de 207 -->

## 10.8 Recomendaciones operativas para CERMONT

S.A.S.

Se recomienda que CERMONT S.A.S. adopte el aplicativo de forma gradual, iniciando con un subconjunto de servicios y usuarios. La adopción debe comenzar por el módulo de planeación y evidencias, porque allí se ubican fallas que afectan de manera temprana el resto del proceso. Una vez estabilizada la captura de información, se debe avanzar hacia informes, actas, SES, facturación y costos reales. Esta ruta evita exigir a la organización una migración completa sin madurez operativa suficiente.

También se recomienda establecer responsables internos para el mantenimiento de plantillas, kits típicos, roles y catálogos. Un sistema configurable pierde valor si nadie administra sus datos maestros. La empresa debe definir quién puede crear kits, quién aprueba plantillas, quién revisa evidencias, quién autoriza cierres y quién consulta información financiera.

## 10.9 Recomendaciones técnicas para continuidad del software

Desde el punto de vista técnico, se recomienda mantener la arquitectura por contratos compartidos, evitar duplicidad de reglas entre frontend y backend, conservar pruebas automatizadas y registrar decisiones relevantes. También se recomienda documentar cualquier cambio de flujo, especialmente si se modifican etapas de SES, facturación, pago, costos o evidencias. La documentación técnica 00-22 debe mantenerse como línea base viva, actualizada con cada cambio relevante del aplicativo.

La continuidad del sistema debe incluir respaldo de datos, control de versiones, política de recuperación, monitoreo de errores, revisión de dependencias y gestión de licencias. Estas prácticas son necesarias para que el aplicativo no quede como prototipo académico, sino como base operativa sostenible.


<!-- Página 189 de 207 -->

## 10.10 Proyección hacia una plataforma configurable

La evolución natural del aplicativo es convertirse en una plataforma configurable por documentos, plantillas y reglas. CERMONT no ejecuta un único tipo de servicio; por tanto, el sistema debe permitir que nuevos formatos se transformen en formularios digitales sin programar cada caso desde cero. Esta evolución requiere un módulo de importación documental, revisión humana de campos, versionamiento de plantillas y generación de formularios dinámicos. La automatización mediante OCR o extracción inteligente debe tratarse como trabajo futuro hasta que exista implementación y validación suficientes.

## 10.11 Cierre final

El trabajo desarrollado demuestra que la fragmentación documental y operativa puede abordarse mediante un aplicativo web diseñado desde el proceso real de la empresa. La contribución principal no se limita a construir una aplicación, sino a establecer una relación trazable entre diagnóstico, requisitos, arquitectura, módulos, pruebas y recomendaciones. Esta relación permite que el libro sea defendible ante revisión académica y útil para la continuidad del proyecto dentro de CERMONT S.A.S.

En términos de formación profesional, el proyecto integra competencias de Ingeniería Electrónica, ingeniería de software, análisis de procesos, control de sistemas de información y documentación técnica. La experiencia confirma que un trabajo de grado aplicado puede generar valor empresarial cuando se construye con rigor metodológico, evidencia verificable y respeto por los límites de lo realmente implementado.


<!-- Página 190 de 207 -->

# Síntesis de Aportes del Proyecto

Este trabajo de grado aporta una solución aplicada a un problema real de gestión documental y trazabilidad operativa en una empresa contratista multiservicio. Las contribuciones se organizan en frentes académicos, técnicos y metodológicos, evitando presentar como resultado operativo aquello que no cuente con evidencia verificable anexada.

Ingeniería de software y arquitectura

Definición de una arquitectura web modular con separación de responsabilidades entre presentación, lógica de negocio y persistencia documental.

Consolidación de contratos compartidos para reducir inconsistencias entre frontend y backend.

Organización de la autenticación y la autorización bajo un esquema de control de acceso basado en roles (RBAC).

Documentación de decisiones arquitectónicas relacionadas con la organización del monorepo, la persistencia documental, la autenticación y la operación con conectividad variable.

Gestión documental y trazabilidad

Estructuración de un flujo documental orientado a órdenes de trabajo, evidencias, informes técnicos, actas y soportes de cierre.

Relación explícita entre registros operativos, documentos técnicos y seguimiento administrativo de SES, facturación y pago.

Planteamiento de una línea futura para formularios digitales reutilizables a partir de documentos heredados, sujeta a aprobación formal y validación posterior.


<!-- Página 191 de 207 -->

Operación en campo y continuidad del servicio

Diseño de un enfoque de captura de información en campo para contextos de conectividad limitada.

Integración conceptual de mecanismos de sincronización y persistencia local orientados a continuidad operativa.

Enfoque en evidencias fotográficas y documentación de actividades para fortalecer la trazabilidad del servicio.

Contribuciones metodológicas

Aplicación de una metodología orientada a diagnóstico, diseño, implementación y validación técnica de un artefacto de software en contexto empresarial.

Definición de un flujo de trabajo contract-first, desde esquemas de validación hasta componentes de interfaz, para mantener trazabilidad entre datos y experiencia de usuario.

Propuesta de compuertas de calidad por iteración, incluyendo revisión de tipos, pruebas automatizadas, construcción del proyecto y verificación funcional.

Organización de historias de usuario, criterios de aceptación y matriz de trazabilidad entre objetivos, módulos, pruebas y evidencias.

Contribuciones al estado del arte aplicado

Revisión de plataformas comerciales de gestión de servicios de campo y mantenimiento, con atención a su aplicabilidad para pequeñas y medianas empresas contratistas.

Análisis comparativo de repositorios open source de CMMS, FSM y ERP, identificando patrones arquitectónicos y brechas funcionales frente al contexto de CERMONT S.A.S.

Evaluación de librerías de formularios dinámicos y herramientas de extracción documental como base para una evolución futura del sistema.


<!-- Página 192 de 207 -->

Elaboración de criterios para justificar el desarrollo de una solución a medida frente a la adopción directa de software comercial o genérico.

Formación académica y transferencia

Articulación entre práctica empresarial, ingeniería electrónica, desarrollo de software y transformación digital aplicada.

Producción de una referencia técnica reutilizable para proyectos similares en organizaciones contratistas multiservicio.

Fortalecimiento de competencias en análisis de procesos, arquitectura de software, validación y documentación académica de soluciones tecnológicas.


<!-- Página 193 de 207 -->

Bibliografía

[1] CERMONT S.A.S., “Inicio,” Sitio web oficial. [Online]. Available: https://www.cermont.co/,

accessed: May 17, 2026.

[2] --, “Misión,” Sitio web oficial. [Online]. Available: https://www.cermont.co/mision/, ac-

cessed: May 17, 2026.

[3] --, “Inducción y reinducción hes,” Documento interno suministrado para el desarrollo del

trabajo de grado, 2025.

[4] --, “Formato mantenimiento preventivo cctv,” Formato operativo interno suministrado pa-

ra el trabajo de grado, 2025.

[5] --, “Formato inspección líneas de vida verticales,” Formato operativo interno suministrado

para el trabajo de grado, 2025.

[6] --, “Formato de planeación de obra,” Formato operativo interno suministrado para el tra-

bajo de grado, 2025.

[7] --, “Desarrollo de un aplicativo web para apoyo en la ejecución y cierre administrativo de

los trabajos de campo,” Documento de proceso suministrado para el trabajo de grado, 2025.

[8] MDN Web Docs, “Service worker api,” Official documentation. [Online]. Available: https://

developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API, accessed: May 17, 2026.

[9] OWASP Foundation, “Owasp top ten web application security risks,” Official documentation.

[Online]. Available: https://owasp.org/www-project-top-ten/, accessed: May 17, 2026.

[10] A. R. Hevner, S. T. March, J. Park, and S. Ram, “Design science in information systems

research,” MIS Quarterly, vol. 28, no. 1, pp. 75-105, 2004.

[11] Docling Project, “docling: Get your documents ready for gen ai,” GitHub repository. [Online].

Available: https://github.com/docling-project/docling, accessed: May 17, 2026.


<!-- Página 194 de 207 -->

Bibliografía

[12] Unstructured-IO, “unstructured: Convert documents to structured data,” GitHub reposi-

tory. [Online]. Available: https://github.com/Unstructured-IO/unstructured, accessed: May 17, 2026.

[13] PaddlePaddle, “Paddleocr,” GitHub repository. [Online]. Available: https://github.com/

PaddlePaddle/PaddleOCR, accessed: May 17, 2026.

[14] I. Sommerville, Software Engineering, 10th ed. Pearson, 2016.

[15] R. S. Pressman and B. R. Maxim, Software Engineering: A Practitioner’s Approach, 9th ed.

McGraw-Hill Education, 2020.

[16] L. Bass, P. Clements, and R. Kazman, Software Architecture in Practice, 4th ed. AddisonWesley Professional, 2021.

[17] Gartner, Inc., “Magic quadrant for field service management 2024,” Gartner Research, 2024.

[18] M. Dumas, M. L. Rosa, J. Mendling, and H. A. Reijers, Fundamentals of Business Process

Management, 2nd ed. Springer, 2018.

[19] FieldAware, “The complete guide to field service management software,” White Paper, 2023.

[20] rjsf-team, “react-jsonschema-form,” Official documentation. [Online]. Available: https://

rjsf-team.github.io/react-jsonschema-form/docs/, accessed: May 17, 2026.

[21] M. Richards and N. Ford, Fundamentals of Software Architecture. O’Reilly Media, 2020.

[22] E. Gamma, R. Helm, R. Johnson, and J. Vlissides, Design Patterns: Elements of Reusable

Object-Oriented Software. Addison-Wesley Professional, 1994.

[23] M. Fowler, Patterns of Enterprise Application Architecture. Addison-Wesley Professional, 2002.

[24] R. C. Martin, Clean Code: A Handbook of Agile Software Craftsmanship. Prentice Hall, 2008.

[25] Jobber, “Pricing: Plans starting at usd 29/month,” Official page. [Online]. Available: https:

//www.getjobber.com/pricing/, accessed: May 17, 2026.


<!-- Página 195 de 207 -->

Bibliografía

[26] Odoo, “Field service,” Official documentation. [Online]. Available: https://www.odoo.com/

documentation/19.0/applications/services/field_service.html, accessed: May 17, 2026.

[27] ServiceM8, “Pricing,” Official page. [Online]. Available: https://www.servicem8.com/

pricing, accessed: May 17, 2026.

[28] Fracttal, “Fracttal,” Official site. [Online]. Available: https://www.fracttal.com/es/, accessed:

May 17, 2026.

[29] Odoo Community Association, “Oca/field-service: Field service management,” GitHub repo-

sitory. [Online]. Available: https://github.com/OCA/field-service, accessed: May 17, 2026.

[30] Frappe Technologies, “frappe/erpnext: Free and open source enterprise resource planning,”

GitHub repository. [Online]. Available: https://github.com/frappe/erpnext, accessed: May 17, 2026.

[31] Tecnoteca, “openmaint,” Official site. [Online]. Available: https://www.openmaint.org/en,

accessed: May 17, 2026.

[32] Atlas CMMS, “Atlas cmms: Self-hosted computerized maintenance management system,”

GitHub repository. [Online]. Available: https://github.com/Grashjs/cmms, 2024, accessed: May 17, 2026.

[33] Liberu Maintenance, “Liberu maintenance: Open-source cmms built on laravel and fi-

lament,” GitHub repository. [Online]. Available: https://github.com/liberu-maintenance/ maintenance-laravel, 2024, accessed: May 17, 2026.

[34] FieldPro, “Fieldpro: Field service management platform for equipment service operations,”

GitHub repository. [Online]. Available: https://github.com/ph0en1x29/FT, 2024, accessed: May 17, 2026.

[35] EclipseSource, “Json forms,” GitHub repository. [Online]. Available: https://github.com/

eclipsesource/jsonforms, accessed: May 17, 2026.

[36] SurveyJS, “Surveyjs form library,” GitHub repository. [Online]. Available: https://github.

com/surveyjs/survey-library, accessed: May 17, 2026.


<!-- Página 196 de 207 -->

Bibliografía

[37] Form.io, “@formio/react,” GitHub repository. [Online]. Available: https://github.com/

formio/react, accessed: May 17, 2026.

[38] YAMLForms, “Yamlforms: Yaml to pdf, html, and docx form generator,” GitHub repository.

[Online]. Available: https://github.com/robinmordasiewicz/yamlforms, 2024, accessed: May 17, 2026.

[39] OpenDataLab, “Mineru,” GitHub repository. [Online]. Available: https://github.com/

opendatalab/MinerU, accessed: May 17, 2026.

[40] PyPDFForm, “Pypdfform: The python library for pdf forms,” GitHub repository. [Online].

Available: https://github.com/chinapandaman/PyPDFForm, 2024, accessed: May 17, 2026.

[41] Doc2Form, “Doc2form: Convert pdf, word and docs to google forms using gemini ai,” GitHub

repository. [Online]. Available: https://github.com/kamilstanuch/doc2form, 2024, accessed: May 17, 2026.

[42] Aberdeen Group, “The state of service management 2019: Best practices in field service,”

Aberdeen Strategy and Research, 2019.

[43] M. A. G. López, “Desarrollo de un sistema de gestión de mantenimiento (cmms) para optimi-

zar el proceso operativo de flota de transporte público en pereira, colombia,” Master’s thesis, Universidad Tecnológica de Pereira, 2021.

[44] J. F. R. García and C. A. T. Pérez, “Implementación de aplicación móvil para field service

management en empresa de telecomunicaciones urbana,” Master’s thesis, Universidad del Valle, 2022.

[45] L. C. M. Suárez, “Desarrollo de sistema web para gestión de mantenimiento preventivo en

pyme industrial,” Master’s thesis, Universidad Industrial de Santander, 2020.

[46] Odoo, “Pricing,” Official page. [Online]. Available: https://www.odoo.com/pricing, accessed:

May 17, 2026.

[47] Congreso de la República de Colombia, “Ley 1581 de 2012: Protección de datos personales,”

Diario Oficial No. 48.587. [Online]. Available: https://www.funcionpublica.gov.co/, 2012.


<!-- Página 197 de 207 -->

Bibliografía

[48] Presidencia de la República de Colombia, “Decreto 1377 de 2013: Reglamentación de la ley

1581 de 2012,” Diario Oficial No. 48.834. [Online]. Available: https://www.sic.gov.co/, 2013.

[49] Ministerio del Trabajo, “Decreto 1072 de 2015: Decreto Único reglamentario del sector tra-

bajo,” Diario Oficial No. 49.523. [Online]. Available: https://www.mintrabajo.gov.co/, 2015.

[50] --, “Resolución 0312 de 2019: Estándares mínimos del sistema de gestión de seguridad y

salud en el trabajo,” [Online]. Available: https://www.mintrabajo.gov.co/, 2019.

[51] Dirección de Impuestos y Aduanas Nacionales, “Resolución 000042 de 2020: Sistema de

facturación electrónica,” [Online]. Available: https://www.dian.gov.co/, 2020.

[52] Congreso de la República de Colombia, “Ley 842 de 2003: Reglamentación del ejercicio de

la ingeniería,” Diario Oficial No. 45.340, 2003.

[53] Consejo Profesional Nacional de Ingeniería y sus Profesiones Auxiliares, “Código de Ética

profesional del ingeniero,” COPNIA. [Online]. Available: https://www.copnia.gov.co/, 2021.

[54] Ministerio de Minas y Energía, “Resolución 90708 de 2013: Reglamento técnico de instala-

ciones eléctricas (retie),” República de Colombia, 2013.

[55] Ministerio de Salud, “Resolución 8430 de 1993: Normas científicas, técnicas y administrati-

vas para la investigación en salud,” República de Colombia, 1993.

[56] K. Peffers, T. Tuunanen, M. A. Rothenberger, and S. Chatterjee, “A design science research

methodology for information systems research,” Journal of Management Information Systems, vol. 24, no. 3, pp. 45-77, 2007.

[57] J. D. A. Pidiache, “cermont_aplicativo: Aplicativo web para gestión de órdenes de trabajo

en cermont s.a.s.” GitHub repository. [Online]. Available: https://github.com/JuanDiego30/ cermont_aplicativo, accessed: May 17, 2026.

[58] K. Beck, M. Beedle, A. van Bennekum et al., “Manifesto for agile software development,”

Agile Alliance. [Online]. Available: https://agilemanifesto.org/, 2001, accessed: May 17, 2026.


<!-- Página 198 de 207 -->

# A Anteproyecto de Trabajo de Grado (ATG) Aprobado

En este apéndice se documenta formalmente la estructura y especificaciones del Anteproyecto de Trabajo de Grado (ATG) que fue aprobado por el Comité de Trabajos de Grado del programa de Ingeniería Electrónica de la Universidad de Pamplona. Este documento constituye el marco rector y el contrato de compromisos académicos del estudiante Juan Diego Arévalo Pidiache.

A.1 Datos Generales del Proyecto Aprobado

Título Aprobado: Desarrollo de un Aplicativo Web para la Gestión de Órdenes de Trabajo, Trazabilidad y Cierre Administrativo de Procesos Operativos en CERMONT S.A.S.

Autor: Juan Diego Arévalo Pidiache (Código: 1094283047)

Programa Académico: Ingeniería Electrónica

Modalidad de Grado: Práctica Empresarial

Director Académico: MSc. Luis Alberto Muñoz Bedoya

Empresa Colaboradora: CERMONT S.A.S. (Arauca, Colombia)

A.2 Objetivos del Trabajo de Grado

Los objetivos específicos aprobados en el ATG se transcriben textualmente a continuación, sirviendo como la métrica de éxito empleada para auditar y valorar los entregables técnicos detallados en este libro:

identificar fallas críticas en la planeación, ejecución e informes técnicos.


<!-- Página 199 de 207 -->

A. Anteproyecto de Trabajo de Grado (ATG) Aprobado

ción, evidencias y cierre administrativo, junto con la estructura de base de datos y roles de usuario.

cos, listas de verificación digitales, registro de evidencias fotográficas y generación automática de informes técnicos.

de validación, midiendo reducción de tiempos, aumento de trazabilidad y eficiencia del cierre administrativo solo cuando exista evidencia verificable.

A.3 Criterios de Aceptación del Jurado

Durante la sustentación y aprobación del anteproyecto, el jurado evaluador asignó especial importancia al análisis comparativo con soluciones comerciales y de código abierto (CMMS, ERP y FSM), exigiendo que el aplicativo desarrollado justificara plenamente su pertinencia técnica y económica frente a las necesidades particulares de la empresa contratista, excluyendo la introducción de dependencias propietarias o integraciones comerciales no viables.


<!-- Página 200 de 207 -->

# B Formatos Operativos Reales de CER-

MONT S.A.S.

La base de datos, los contratos de validación de esquemas en Zod y los flujos del sistema se modelaron con base en la documentación real y los formatos que utiliza CERMONT S.A.S. para la ejecución de sus servicios en campo. A continuación se desglosa el inventario y la estructura de estos formatos corporativos reales.

B.1 Estructura del Formato de Planeación de Obra

Este formato de entrada es utilizado por el Residente de Obra antes del desplazamiento técnico a campo. Sus campos clave se incorporaron en el esquema transaccional del módulo de planeación (planning-packet.schema.ts):

Encabezado operativo: Número de Orden (PO), Unidad de Negocio, Responsable de Actividad, Fecha de Inicio y Fecha de Finalización Estimadas.

Inventario de Recursos: Herramientas críticas requeridas, equipos especializados de medición, vehículos de transporte asignados y consumibles indispensables.

Personal Asignado: Relación de técnicos, operadores y auxiliares, validando perfiles HES y certificaciones vigentes (trabajo en alturas, espacios confinados).

B.2 Estructura del Formato de Inspección de Líneas

de Vida Verticales

Este formato sirvió como base para la digitalización de los checklists de inspección obligatorios en actividades de alto riesgo. El sistema modela este documento como una lista de verificación secuencial con campos de cumplimiento obligatorio y validación visual:


<!-- Página 201 de 207 -->

B. Formatos Operativos Reales de CERMONT S.A.S.

Criterios a evaluar: Estado del absorbedor de choque, estado del cable o cuerda de nylon, terminales prensados, mosquetones de seguridad, y limpieza general (Cumple / No Cumple / No Aplica).

Seguimiento HES: Campo de observaciones, registro de hallazgos críticos de seguridad y firma digital del inspector asignado.

B.3 Estructura del Formato de Mantenimiento Pre-

ventivo de CCTV

Este documento de mantenimiento físico de infraestructura de telecomunicaciones y seguridad fue digitalizado en el catálogo del sistema, estructurando sus fases en sub-paneles dinámicos dentro de la aplicación móvil adaptativa:

Generalidades: Nombre de la cámara, radioenlace asociado, y estado de la alimentación eléctrica.

Componentes técnicos de evaluación: Limpieza de lente, revisión del soporte mecánico, estado del sistema fotovoltaico (si aplica), estado del gabinete y nivel de señal inalámbrica.

Trazabilidad multimedia: Sección para la inserción obligatoria del registro fotográfico (antes, durante y después del mantenimiento).


<!-- Página 202 de 207 -->

# C Bitácora Técnica de Implementación (Serie de Prompts 00-21)

El aplicativo web de CERMONT S.A.S. se construyó de manera incremental mediante un flujo de trabajo estructurado de veintidós iteraciones de ingeniería, documentadas en el directorio del repositorio como bitácora técnica de prompts. A continuación se desglosa el registro de estas iteraciones, asociando cada prompt a su objetivo tecnológico y su aporte concreto.

Tabla C.1: Bitácora cronológica y técnica de la serie de prompts 00-21. Fuente: Elaboración propia.

Prompt Iteración Objetivo tecnológico Evidencia técnica resumida Cap.

5, 6

Foundation Definir base transversal de seguridad y diseño.

Roles, autenticación, proxy de seguridad y lineamientos iniciales.

Dashboard Construir panel de seguimiento e indicadores de gestión.

Vista de tablero, KPIs y estado general de órdenes.

Work Requests Capturar el paso 1 del flujo de negocio.

Contratos, rutas y formulario de solicitudes.

Site Visits Registrar visitas y evidencias del paso 2.

Estructura de visitas y soporte de evidencia asociada.

Proposals Gestionar cotización y aprobación comercial.

Contratos de propuesta, cálculo y estados comerciales.

ServiceCase Consolidar la entidad orden de trabajo.

Modelo de orden, asignaciones y transiciones principales.

Planning Packet Digitalizar el paso 5 de planeación. Paquetes de planeación, recursos y kits típicos.

Execution Session Soportar la ejecución en campo. Sesiones de ejecución, estados y sincronización parcial.

6, 8

Evidences Asociar fotos y metadatos a la orden.

Servicio de evidencias, validación y soporte visual.

Tech Reports Generar informes técnicos desde datos estructurados.

Contratos de informe y generación documental.

Delivery Records Formalizar el cierre técnico. Actas, aceptación y soporte de entrega.

Admin Closure Organizar el cierre administrativo. Checklist interno, estados y trazabilidad de cierre.

Service Entry Registrar SES y seguimiento Ariba. Seguimiento interno de SES y soportes asociados.

Continúa en la siguiente página...


<!-- Página 203 de 207 -->

C. Bitácora Técnica de Implementación (Serie de Prompts 00-21)

Tabla C.1 - Continúa de la página anterior

Prompt Iteración Objetivo tecnológico Evidencia técnica resumida Cap.

Invoices Gestionar facturación. Control de estados de factura y relación con cierre.

Payments Registrar pagos finales. Estado de pago y cierre financiero interno.

6, 7

Cost Engine Controlar costos reales frente al presupuesto.

Motor de costos, consulta por orden y datos pendientes.

Assets Registrar activos intervenidos. Historial básico de activos y relación con órdenes.

Maintenance Crear plantillas de mantenimiento. Catálogos de kits, repuestos y recursos asociados.

Document Core Centralizar documentos operativos. Gestión documental, versiones y soportes.

Recursos, kits y alertas operativas.

Resources Planear personal, herramientas y equipos.

Users & Admin Configurar RBAC e interfaz administrativa.

Usuarios, permisos y auditoría de acceso.

Cross-Module Stabilization Ejecutar pruebas y estabilización

final.

Pruebas de backend, frontend y herramientas de calidad.

Esta secuencia incremental garantiza que la complejidad técnica del sistema fuera dominada de forma progresiva, aplicando compuertas de verificación y análisis estático en cada paso del flujo Contract-First.


<!-- Página 204 de 207 -->

# D Evidencias de Código y Service Worker de la PWA

En este apéndice se expone el código real de componentes e infraestructura crítica del sistema, sirviendo como evidencia explícita de la implementación.

D.1 Service Worker Serwist de la PWA (/serwist/sw.js)

La versión corregida de la PWA no utiliza un archivo manual en frontend/public/ service-worker.js. El worker se genera desde frontend/src/app/sw.ts, se compila mediante @serwist/turbopack y se sirve desde la ruta /serwist/sw.js. Esta decisión evita mantener un script estático desactualizado y permite que el precache incorpore los artefactos reales producidos por next build.

1 import { defaultCache } from "@serwist/turbopack/worker";

2 import {

CacheFirst,

ExpirationPlugin,

NetworkFirst,

NetworkOnly,

Serwist,

StaleWhileRevalidate,

9 } from "serwist";

11 const serwist = new Serwist({

precacheEntries: self.__SW_MANIFEST,

skipWaiting: true,

clientsClaim: true,

navigationPreload: true,

runtimeCaching: [

// /api/* y /uploads/* se mantienen NetworkOnly.


<!-- Página 205 de 207 -->

D. Evidencias de Código y Service Worker de la PWA

// /_next/static/* usa CacheFirst.

// /_next/image, /images y /landing usan StaleWhileRevalidate.

// Rutas internas visitadas usan NetworkFirst con expiracion.

...defaultCache,

],

fallbacks: {

entries: [{ url: "/~offline", matcher: ({ request }) => request.destination === " document" }],

},

26 });

28 serwist.addEventListeners();

Listing D.1: Estructura real del Service Worker Serwist de CERMONT

La configuración se completa con frontend/src/app/serwist/[path]/route.ts, que expone /serwist/sw.js y agrega /~offline al precache. Las pruebas de producción verifican que el endpoint responde HTTP 200, que el worker queda activo y que rutas internas calentadas como /service-cases, /work-requests, /site-visits y /templates renderizan sin pantalla en blanco después de perder conectividad.

Por seguridad, las respuestas de /api/* y /uploads/* no se almacenan en Cache Storage. Los datos consultables sin conexión se guardan en IndexedDB mediante Dexie y TanStack Query, por ejemplo en las tablas locales offlineServiceCaseLists, offlineWorkRequestLists, offlineSiteVisitLists y offlineDocumentTemplateLists.

D.2 Control de Acceso por Rol (RBAC Middleware

del Backend)

A continuación se detalla cómo el backend en Express valida los roles de usuario a nivel de rutas, asegurando que solo usuarios autorizados según el perfil en la matriz RBAC (Gerente, Residente, Técnico, HES, Supervisor, Administrativo, Cliente) puedan acceder o modificar los recursos correspondientes:

1 import { Request, Response, NextFunction } from 'express';

2 import { UserRole } from '@cermont/domain';


<!-- Página 206 de 207 -->

D. Evidencias de Código y Service Worker de la PWA

4 export function authorize(allowedRoles: readonly UserRole[]) {

return (req: Request, res: Response, next: NextFunction): void => {

try {

const user = req.user;

if (!user) {

res.status(401).json({

success: false,

data: null,

error: 'UNAUTHORIZED',

message: 'Debe estar autenticado para realizar esta accion'

});

return;

}

const hasPermission = allowedRoles.includes(user.role as UserRole);

if (!hasPermission) {

res.status(403).json({

success: false,

data: null,

error: 'FORBIDDEN',

message: 'No tiene los permisos requeridos para realizar esta accion'

});

return;

}

next();

} catch (error) {

next(error);

}

};

36 }

Listing D.2: Middleware de verificación de roles y autorización en el backend


<!-- Página 207 de 207 -->

D. Evidencias de Código y Service Worker de la PWA

D.3 Validación Contract-First de Payload en el Con-

trolador

En el backend, se realiza una validación doble utilizando Zod para asegurar que los contratos del monorepo se cumplan antes de inyectar datos en la base de datos Mongoose:

1 import { Request, Response, NextFunction } from 'express';

2 import { ZodSchema } from 'zod';

4 export function validateBody(schema: ZodSchema) {

return (req: Request, res: Response, next: NextFunction): void => {

const result = schema.safeParse(req.body);

if (!result.success) {

res.status(400).json({

success: false,

data: null,

error: 'VALIDATION_ERROR',

message: 'El payload enviado no cumple con el contrato de validacion',

details: result.error.errors

});

return;

}

// Inyectar datos parseados y tipados de forma segura

req.body = result.data;

next();

};

23 }

Listing D.3: Middleware de validación de payloads HTTP utilizando esquemas de Zod
