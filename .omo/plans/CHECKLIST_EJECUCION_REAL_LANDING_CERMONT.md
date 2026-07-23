# CHECKLIST DE EJECUCIÓN REAL — REFACTOR DE LANDING CERMONT

## Instrucción de activación

Continúa directamente con la implementación de la landing pública de CERMONT.

No generes otro plan.
No vuelvas a resumir la documentación.
No preguntes si debes reforzar la landing o pasar al monorepo.
La decisión ya está tomada:

> Termina, prueba y verifica la landing antes de pasar al siguiente módulo.

El reporte anterior de “cuatro archivos modificados” se considera **no verificado** hasta demostrar cada cambio mediante lectura del archivo, checksum, diff del sistema de archivos, prueba y evidencia visual.

No marques una tarea como completada porque:
- leíste el archivo;
- describiste lo que debería cambiar;
- escribiste un comentario `ponytail:`;
- cambiaste documentación;
- mostraste una tabla;
- afirmaste que el cambio existe;
- el archivo ya contenía una implementación parecida.

Una tarea solo puede quedar en `verified` cuando hay:
1. modificación real o verificación concluyente de que el código ya cumplía;
2. evidencia de archivos;
3. prueba específica;
4. validación visual cuando corresponde;
5. gate del workspace;
6. registro honesto del resultado.

---

# 1. Alcance obligatorio

Trabaja únicamente sobre la landing pública y sus dependencias directas:

```text
/
#inicio
#servicios
#metodo
#recursos
#nosotros
#contacto
```

Incluye:

- metadata;
- layout público;
- header;
- navegación;
- menú móvil;
- selector de tema existente;
- hero;
- señales de confianza;
- servicios;
- método;
- evidencia operativa;
- diferenciales;
- conexión con portal/plataforma;
- recursos;
- misión;
- visión;
- contacto;
- CTA final;
- footer;
- responsive;
- accesibilidad;
- SEO;
- imágenes;
- pruebas.

No pases todavía a:

- login;
- dashboard;
- cockpit;
- módulos privados;
- corrección general del backend;
- flujo completo del monorepo.

Excepción:

El backend y `packages/shared-types` pueden tocarse únicamente si se implementa un formulario de contacto real como corte vertical.

---

# 2. Reglas de seguridad

## 2.1 Cero Git

No ejecutes ningún comando que comience por `git`.

No ejecutar:

```text
git status
git diff
git log
git checkout
git restore
git reset
git clean
git stash
git switch
git merge
git rebase
git cherry-pick
git commit
git push
```

## 2.2 Bash obligatorio

Usa Bash.

No uses PowerShell.

```bash
set -euo pipefail

if [ -d "/c/Users/camil/Downloads/cermont_aplicativo/cermont_aplicativo" ]; then
  REPO_ROOT="/c/Users/camil/Downloads/cermont_aplicativo/cermont_aplicativo"
elif [ -d "/mnt/c/Users/camil/Downloads/cermont_aplicativo/cermont_aplicativo" ]; then
  REPO_ROOT="/mnt/c/Users/camil/Downloads/cermont_aplicativo/cermont_aplicativo"
else
  REPO_ROOT="$(pwd)"
fi

cd "$REPO_ROOT"
printf 'Repository root: %s\n' "$REPO_ROOT"
```

## 2.3 No borrar

No ejecutar:

```text
rm
rm -r
rm -rf
rmdir
unlink
truncate
shred
find . -delete
xargs rm
```

No borrar:

- documentos;
- pruebas;
- componentes;
- estilos;
- assets;
- archivos parcialmente implementados;
- comentarios de deuda sin resolver;
- secciones existentes antes de migrarlas.

## 2.4 Respaldo por archivo

```bash
SESSION_STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_ROOT=".sisyphus/safe-backups/landing-execution-$SESSION_STAMP"
PROGRESS_FILE=".sisyphus/progress/landing-execution-$SESSION_STAMP.md"
mkdir -p "$BACKUP_ROOT"
mkdir -p "$(dirname "$PROGRESS_FILE")"

backup_file() {
  local file="$1"
  if [ -f "$file" ]; then
    local target="$BACKUP_ROOT/$file"
    mkdir -p "$(dirname "$target")"
    cp -p "$file" "$target"
    sha256sum "$file" >> "$BACKUP_ROOT/original-sha256.txt"
  fi
}
```

Antes de editar:

```bash
backup_file "ruta/del/archivo"
```

Después de editar:

```bash
sha256sum "ruta/del/archivo" >> "$BACKUP_ROOT/modified-sha256.txt"
```

Diff sin Git:

```bash
diff -u "$BACKUP_ROOT/ruta/del/archivo" \
  "ruta/del/archivo" \
  > "$BACKUP_ROOT/archivo.diff" || true
```

---

# 3. Regla contra reportes falsos o incompletos

No vuelvas a responder:

> “Se modificaron cuatro archivos”.

Debes demostrarlo.

Por cada archivo reportado incluye:

```text
Archivo:
Existía antes:
Checksum anterior:
Checksum posterior:
Líneas relevantes antes:
Líneas relevantes después:
Cambio funcional:
Prueba asociada:
Resultado:
Captura o viewport:
Estado:
```

Estados permitidos:

```text
pending
investigating
implemented
verified
blocked_external
```

No uses `completed`.
No uses `done`.
No uses `verified` si no se ejecutó una prueba o una validación visual.

---

# 4. Fase cero — verificar los cuatro cambios reportados

## LAND-VERIFY-001 — `frontend/src/app/page.tsx`

- [ ] Confirmar que el archivo existe.
- [ ] Mostrar `stat` del archivo.
- [ ] Mostrar checksum actual.
- [ ] Buscar metadata real:

```bash
rg -n "metadata|title|description|openGraph|siteName|locale|canonical" \
  "frontend/src/app/page.tsx"
```

- [ ] Confirmar que el texto describe servicios reales.
- [ ] Confirmar que no presenta CERMONT como SaaS genérico.
- [ ] Confirmar que existe un solo origen de metadata.
- [ ] Confirmar que App Router usa Metadata API.
- [ ] Confirmar que `siteName` y `locale` tienen valores correctos.
- [ ] Confirmar que no se inventaron cobertura, clientes o certificaciones.
- [ ] Añadir o actualizar prueba de metadata cuando exista infraestructura.
- [ ] Marcar `verified` solo después del build frontend.

## LAND-VERIFY-002 — `PublicLandingContent.tsx`

- [ ] Confirmar ruta real del archivo.
- [ ] Mostrar checksum.
- [ ] Mostrar imports.
- [ ] Mostrar orden de render actual.
- [ ] Confirmar que la secuencia implementada es realmente:

```text
Hero
Trust
Evidence, cuando exista
Services
Method
Features o Differentiators
Platform/Resources
About
Mission/Vision
CTA final
Contact
Footer
```

- [ ] Verificar que `CTA` no aparece antes de explicar servicios y método.
- [ ] Verificar que Contact no queda visualmente desconectado.
- [ ] Verificar que cada ancla corresponde con una sección real.
- [ ] Añadir prueba de orden de secciones mediante headings o landmarks.
- [ ] Verificar visualmente scroll completo.

## LAND-VERIFY-003 — `HeroSection.tsx`

- [ ] Mostrar checksum.
- [ ] Buscar h1 actual.
- [ ] Confirmar que existe un único `h1`.
- [ ] Confirmar que la lista redundante de valores fue retirada del hero.
- [ ] Confirmar que TrustSection conserva la información institucional válida.
- [ ] Confirmar que los badges eliminados no dejaron espacios, imports o arrays muertos.
- [ ] Confirmar que el h1 no promete “trazabilidad total” si esa afirmación no es demostrable públicamente.
- [ ] Revisar copy con información verificable.
- [ ] Confirmar CTA principal.
- [ ] Confirmar CTA secundario.
- [ ] Confirmar imagen, alt, sizes y aspect ratio.
- [ ] Probar a 320, 375, 390, 1280 y 1440 px.
- [ ] Confirmar ausencia de overflow.
- [ ] Confirmar contraste.
- [ ] Confirmar reduced motion.

## LAND-VERIFY-004 — `landing-data.ts`

- [ ] Mostrar checksum.
- [ ] Mostrar contenido de `LANDING_STATS`.
- [ ] Para cada estadística crear una tabla:

```text
Stat:
Valor:
Fuente documental:
Archivo fuente:
Línea o sección:
Fecha de vigencia:
¿Publicable?:
```

- [ ] No publicar cifras sin fuente.
- [ ] No derivar métricas empresariales por intuición.
- [ ] No presentar como actual un dato histórico sin fecha.
- [ ] Mantener `LANDING_TESTIMONIALS` vacío si no hay testimonios autorizados.
- [ ] Confirmar que TestimonialsSection no renderiza un contenedor vacío.
- [ ] No inventar nombres, empresas, cargos o testimonios.

## LAND-VERIFY-005 — conclusión de verificación

- [ ] Si los cuatro cambios existen, marcarlos como `implemented`.
- [ ] Si además tienen pruebas y navegador, marcarlos como `verified`.
- [ ] Si no existen, corregir el reporte y ejecutarlos.
- [ ] No continuar fingiendo que ya fueron realizados.

---

# 5. Checklist de implementación pendiente

## Fase 1 — arquitectura y auditoría real

- [ ] Localizar la ruta pública exacta.
- [ ] Localizar todos los componentes renderizados.
- [ ] Localizar estilos globales y tokens.
- [ ] Localizar navegación y anclas.
- [ ] Localizar assets actuales.
- [ ] Localizar tests existentes.
- [ ] Crear matriz de secciones:

```text
Sección
Componente
Propósito actual
Problema
Cambio requerido
Archivo
Prueba
Estado
```

- [ ] Identificar código muerto.
- [ ] No borrar código muerto durante esta ejecución.
- [ ] Identificar componentes sin render.
- [ ] Identificar secciones repetidas.
- [ ] Identificar textos sin fuente.
- [ ] Identificar enlaces rotos.
- [ ] Identificar imágenes sin alt.
- [ ] Identificar imágenes no optimizadas.

## Fase 2 — header desktop

- [ ] Revisar logo.
- [ ] Revisar links.
- [ ] Revisar orden de navegación.
- [ ] Revisar CTA “Acceso privado”.
- [ ] Confirmar destino `/login`.
- [ ] Revisar tema.
- [ ] Corregir sticky header.
- [ ] Corregir offset de anclas.
- [ ] Añadir focus-visible.
- [ ] Verificar contraste.
- [ ] Verificar teclado.
- [ ] Crear prueba de navegación.

## Fase 3 — menú móvil

- [ ] Botón con nombre accesible.
- [ ] `aria-expanded`.
- [ ] `aria-controls`.
- [ ] Cierre con Escape.
- [ ] Cierre después de navegar.
- [ ] Gestión de foco.
- [ ] Sin scroll horizontal.
- [ ] Sin competencia visual entre menú, tema y acceso.
- [ ] Touch targets de 44 px.
- [ ] Prueba en 320 px.
- [ ] Prueba en 375 px.
- [ ] Prueba en 390 px.

## Fase 4 — hero

- [ ] Un solo h1.
- [ ] Propuesta de valor verificable.
- [ ] Subtítulo breve.
- [ ] Un CTA principal.
- [ ] Un CTA secundario.
- [ ] Imagen real autorizada o fallback honesto.
- [ ] Trust strip compacto.
- [ ] Sin lista repetida de valores.
- [ ] Sin badges genéricos.
- [ ] Sin claims no medidos.
- [ ] `next/image`.
- [ ] `sizes`.
- [ ] Dimensiones estables.
- [ ] Sin CLS.
- [ ] Sin Client Component innecesario.
- [ ] Prueba del CTA.
- [ ] Captura móvil.
- [ ] Captura desktop.

## Fase 5 — señales de confianza y estadísticas

- [ ] Verificar cada stat.
- [ ] Eliminar del render cualquier stat no verificable sin borrar el código fuente.
- [ ] No mostrar un bloque vacío.
- [ ] Usar datos corporativos autorizados.
- [ ] Contextualizar fechas.
- [ ] No presentar NIT como KPI.
- [ ] No presentar SG-SSTA como certificación si solo es un sistema o política.
- [ ] Evitar repetir cobertura en múltiples secciones.
- [ ] Probar contraste y lectura móvil.

## Fase 6 — galería de evidencia operativa

La falta de fotografías no justifica abandonar la fase.

### 6.1 Inventario

- [ ] Buscar assets existentes.
- [ ] Registrar ruta.
- [ ] Registrar dimensiones.
- [ ] Registrar peso.
- [ ] Registrar formato.
- [ ] Registrar posible contenido sensible.
- [ ] Registrar autorización conocida.

### 6.2 Implementación

- [ ] Crear la sección o mejorar la existente.
- [ ] Usar solo fotos aprobadas.
- [ ] No generar imágenes AI presentadas como evidencia real.
- [ ] Crear composición responsive.
- [ ] Usar `figure`.
- [ ] Usar `figcaption`.
- [ ] Escribir alt específico.
- [ ] Evitar carrusel automático agresivo.
- [ ] Respetar reduced motion.
- [ ] No bloquear la landing si faltan fotos.

### 6.3 Bloqueo legítimo

Cuando no existan fotos aprobadas:

- [ ] Implementar arquitectura de sección.
- [ ] Implementar tipos y data model.
- [ ] Implementar layout con fallback no engañoso.
- [ ] Crear manifiesto de assets faltantes.
- [ ] Marcar únicamente las fotografías como `blocked_external`.
- [ ] No marcar toda la sección como terminada.
- [ ] No sustituir fotos reales por stock engañoso.

## Fase 7 — servicios

- [ ] Revisar nombres oficiales.
- [ ] Reescribir construcción.
- [ ] Reescribir electricidad.
- [ ] Reescribir refrigeración.
- [ ] Reescribir telecomunicaciones.
- [ ] Reescribir montajes.
- [ ] Reescribir mantenimiento.
- [ ] Reescribir suministro cuando corresponda.
- [ ] Aplicar estructura necesidad → capacidad → resultado esperado.
- [ ] Evitar párrafos extensos.
- [ ] Evitar cards idénticas sin jerarquía.
- [ ] Añadir iconografía coherente.
- [ ] Añadir imagen solo si aporta.
- [ ] No inventar resultados.
- [ ] Verificar mobile.
- [ ] Añadir prueba de render de servicios.

## Fase 8 — método de trabajo

- [ ] Representar diagnóstico o solicitud.
- [ ] Representar planeación.
- [ ] Representar ejecución segura.
- [ ] Representar documentación.
- [ ] Representar entrega y cierre.
- [ ] Alinear con el proceso real.
- [ ] No exponer lógica interna sensible.
- [ ] Timeline horizontal en desktop.
- [ ] Timeline vertical en móvil.
- [ ] Sin dependencia de animación.
- [ ] Heading y orden semántico.
- [ ] Prueba de secuencia.

## Fase 9 — features y diferenciales

- [ ] Separar capacidades empresariales de capacidades de la plataforma.
- [ ] No presentar todas las features internas como producto público.
- [ ] Explicar trazabilidad sin lenguaje SaaS genérico.
- [ ] Explicar documentación.
- [ ] Explicar seguridad.
- [ ] Explicar continuidad operativa.
- [ ] Evitar duplicación con Trust.
- [ ] Evitar duplicación con Method.
- [ ] Evitar duplicación con Portal.
- [ ] Probar escaneabilidad.

## Fase 10 — portal y acceso privado

- [ ] Explicar utilidad del portal.
- [ ] No revelar información privada.
- [ ] No prometer módulos no funcionales.
- [ ] CTA hacia `/login`.
- [ ] Confirmar navegación.
- [ ] Usar captura real solo si está autorizada.
- [ ] No convertir la landing en publicidad de SaaS genérico.
- [ ] Conectar operación física y trazabilidad digital.

## Fase 11 — recursos

- [ ] Auditar cada recurso.
- [ ] Verificar destino.
- [ ] Eliminar del render links sin destino, sin borrar código.
- [ ] Diferenciar contacto, portal y documentos.
- [ ] Reescribir microcopy.
- [ ] Añadir estados hover y focus.
- [ ] Evitar cards ambiguas.
- [ ] Probar enlaces.

## Fase 12 — nosotros, misión, visión y valores

- [ ] Verificar fecha de la visión.
- [ ] Actualizar o contextualizar referencias antiguas.
- [ ] No inventar una nueva visión empresarial.
- [ ] Compactar misión.
- [ ] Compactar visión.
- [ ] Mostrar valores una sola vez.
- [ ] Eliminar repetición de respeto, responsabilidad, transparencia y lealtad.
- [ ] Mantener contenido corporativo verificable.
- [ ] Usar patrón visual distinto a Servicios.
- [ ] Probar lectura móvil.

## Fase 13 — CTA final

- [ ] No repetir literalmente el hero.
- [ ] Definir acción principal.
- [ ] Usar alto contraste.
- [ ] Incluir microcopy.
- [ ] Conectar con contacto.
- [ ] Verificar foco.
- [ ] Verificar móvil.
- [ ] Verificar que no tape contenido.

## Fase 14 — contacto

### 14.1 UI

- [ ] Título claro.
- [ ] Datos corporativos verificados.
- [ ] Labels.
- [ ] Errores asociados.
- [ ] Loading.
- [ ] Error.
- [ ] Success.
- [ ] Prevención de doble envío.
- [ ] Privacidad.
- [ ] Canales alternativos.

### 14.2 Funcionalidad real

- [ ] Verificar endpoint existente.
- [ ] Verificar schema existente.
- [ ] Verificar proveedor.
- [ ] No simular envío.

Cuando no haya proveedor:

- [ ] No responder success falso.
- [ ] Implementar persistencia segura solo si está autorizada.
- [ ] Implementar adapter.
- [ ] Implementar estado degradado.
- [ ] Mantener email/teléfono verificado.
- [ ] Marcar integración externa como `blocked_external`.
- [ ] No marcar formulario como `verified`.

### 14.3 Corte vertical cuando aplique

```text
Zod schema
→ shared type
→ public backend route
→ rate limit
→ spam mitigation
→ service
→ adapter
→ frontend mutation
→ feedback
→ tests
```

## Fase 15 — footer

- [ ] Logo.
- [ ] Tagline.
- [ ] Navegación.
- [ ] Contacto.
- [ ] Legal.
- [ ] Copyright dinámico o vigente.
- [ ] `address` semántico.
- [ ] Links válidos.
- [ ] Contraste.
- [ ] Mobile.

## Fase 16 — SEO

- [ ] Title.
- [ ] Description.
- [ ] MetadataBase.
- [ ] Canonical.
- [ ] Open Graph.
- [ ] Twitter metadata.
- [ ] Locale.
- [ ] Site name.
- [ ] Favicon.
- [ ] Manifest.
- [ ] Robots.
- [ ] Sitemap.
- [ ] OG image.
- [ ] Un solo h1.
- [ ] Headings en orden.
- [ ] JSON-LD solo con datos verificados.
- [ ] No usar `next/head` en App Router.

## Fase 17 — accesibilidad

- [ ] Skip link.
- [ ] Landmarks.
- [ ] Header.
- [ ] Nav.
- [ ] Main.
- [ ] Sections.
- [ ] Footer.
- [ ] Un h1.
- [ ] Jerarquía de headings.
- [ ] Focus-visible.
- [ ] Menú con teclado.
- [ ] Escape.
- [ ] Alt text.
- [ ] Imágenes decorativas con alt vacío.
- [ ] Contraste AA.
- [ ] Reduced motion.
- [ ] Touch targets.
- [ ] Form labels.
- [ ] Errores accesibles.
- [ ] No dependencia exclusiva del color.

## Fase 18 — responsive

### 320 px

- [ ] Sin overflow.
- [ ] Header usable.
- [ ] Hero legible.
- [ ] CTA usable.
- [ ] Servicios legibles.
- [ ] Timeline usable.
- [ ] Contacto usable.
- [ ] Footer usable.

### 375 px

- [ ] Captura completa.
- [ ] Sin superposición.
- [ ] Sin textos cortados.
- [ ] Sin imágenes deformadas.

### 390 px

- [ ] Menú.
- [ ] Tema.
- [ ] CTA.
- [ ] Galería.

### 768 px

- [ ] Layout de transición.
- [ ] No parecer desktop comprimido.
- [ ] Grids coherentes.

### 1280 px

- [ ] Hero balanceado.
- [ ] Ancho de lectura.
- [ ] Whitespace.
- [ ] Ritmo editorial.

### 1440 px

- [ ] Contenido no excesivamente estirado.
- [ ] Imágenes nítidas.
- [ ] Footer equilibrado.

## Fase 19 — rendimiento

- [ ] Inventariar peso de imágenes.
- [ ] Usar `next/image`.
- [ ] Definir `sizes`.
- [ ] Definir dimensiones.
- [ ] Evitar CLS.
- [ ] No precargar todo.
- [ ] Reducir Client Components.
- [ ] No añadir librerías innecesarias.
- [ ] Verificar errores de consola.
- [ ] Verificar requests fallidos.
- [ ] Registrar LCP observado.
- [ ] Registrar CLS observado.
- [ ] Registrar entorno de medición.

## Fase 20 — pruebas

- [ ] Render de landing.
- [ ] Orden de secciones.
- [ ] Anchors.
- [ ] CTA a login.
- [ ] Menú móvil.
- [ ] Tema.
- [ ] Hero.
- [ ] Servicios.
- [ ] Método.
- [ ] Recursos.
- [ ] Misión y visión.
- [ ] Contacto.
- [ ] Footer.
- [ ] Alt text.
- [ ] Headings.
- [ ] Reduced motion.
- [ ] Sin overflow.
- [ ] Mobile Playwright.
- [ ] Desktop Playwright.
- [ ] Dark mode cuando exista.
- [ ] No snapshots gigantes.
- [ ] No tests skip.

---

# 6. Fork exhaustion — protocolo correcto

No uses “fork exhaustion” como excusa permanente.

## Diagnóstico

```bash
printf 'Shell: %s\n' "$SHELL"
printf 'PID: %s\n' "$$"
ulimit -a
ps -e | wc -l
ps -ef | head -n 30
jobs -p || true
node --version
npm --version
```

- [ ] Registrar salida.
- [ ] Confirmar si Bash puede lanzar `printf`.
- [ ] Confirmar si Bash puede lanzar `node --version`.
- [ ] Confirmar si Bash puede lanzar `npm --version`.
- [ ] Intentar gate específico en una terminal Bash nueva.
- [ ] Intentar en WSL cuando Git Bash siga agotado.
- [ ] No matar procesos indiscriminadamente.
- [ ] No borrar cachés.
- [ ] No afirmar que el código pasa sin ejecutar.

Cuando los gates no puedan ejecutarse:

```text
Estado: blocked_external
Código implementado: sí/no
Prueba ejecutada: no
Motivo real:
Comando fallido:
Salida:
Acción requerida:
```

No usar `verified`.

---

# 7. Quality gates obligatorios

Primero frontend:

```bash
npm run typecheck -w @cermont/frontend
npm run lint -w @cermont/frontend
npm run test -w @cermont/frontend
npm run build -w @cermont/frontend
```

Después global:

```bash
npm run typecheck
npm run lint
npm run build
npm run verify
```

Adicionales cuando existan:

```bash
npm run quality:strict
npm run verify:strict
npm run test:e2e
```

- [ ] No cambiar scripts para reducir alcance.
- [ ] No introducir warnings.
- [ ] No usar `any`.
- [ ] No usar casts inseguros.
- [ ] No usar ignores.
- [ ] No borrar pruebas.
- [ ] No aumentar timeouts para ocultar fallos.
- [ ] No declarar build exitoso sin salida real.

---

# 8. Evidencia visual obligatoria

Capturar:

```text
375x812 light
375x812 dark
390x844 light
768x1024 light
1280x800 light
1280x800 dark
1440x900 light
```

Para cada viewport:

- [ ] Hero.
- [ ] Header.
- [ ] Menú cuando aplique.
- [ ] Servicios.
- [ ] Método.
- [ ] Evidencia.
- [ ] Portal.
- [ ] Contacto.
- [ ] Footer.
- [ ] Scroll completo.
- [ ] Consola sin errores.

No basta una captura del hero.

---

# 9. Definition of Done de la landing

La landing queda terminada únicamente cuando:

- [ ] Los cuatro cambios reportados fueron demostrados.
- [ ] Header desktop fue verificado.
- [ ] Menú móvil fue verificado.
- [ ] Hero fue refactorizado.
- [ ] Stats fueron validadas documentalmente.
- [ ] No hay testimonios inventados.
- [ ] Evidencia operativa está implementada o el asset externo está documentado.
- [ ] Servicios fueron reescritos.
- [ ] Método fue refactorizado.
- [ ] Features y diferenciales no son redundantes.
- [ ] Portal se integra con la narrativa.
- [ ] Recursos tienen destino real.
- [ ] Misión y visión están vigentes o contextualizadas.
- [ ] CTA final está implementado.
- [ ] Contacto no simula éxito.
- [ ] Footer está completo.
- [ ] SEO está completo.
- [ ] Accesibilidad está verificada.
- [ ] Responsive está verificado.
- [ ] Performance fue medida.
- [ ] Tests frontend pasan.
- [ ] Build frontend pasa.
- [ ] Typecheck global pasa.
- [ ] Lint global pasa.
- [ ] Build global pasa.
- [ ] Verify pasa.
- [ ] No se ejecutó Git.
- [ ] No se borraron documentos.
- [ ] No se borraron assets.
- [ ] No se borraron tests.
- [ ] No se debilitó ningún gate.

---

# 10. Formato único de reporte

No preguntes qué sigue.

Reporta:

```text
LANDING EXECUTION REPORT

Tareas verificadas:
Tareas implementadas sin gate:
Tareas bloqueadas externamente:
Tareas pendientes:

Archivos realmente modificados:
- ruta
- checksum anterior
- checksum posterior
- prueba

Capturas:
- viewport
- ruta de captura
- hallazgos

Gates:
- comando
- resultado real

Fork exhaustion:
- diagnóstico
- terminal usada
- estado

No Git:
Git commands executed: 0

No deletion:
Documents deleted: 0
Assets deleted: 0
Tests deleted: 0

Siguiente tarea automática:
```

Después del reporte, continúa con la siguiente tarea pendiente de la landing.

No pases al plan del monorepo hasta cumplir la Definition of Done.
