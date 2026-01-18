#!/usr/bin/env node

/**
 * 🔌 Script de Coherencia API Backend <-> Frontend
 * Detecta si el Frontend llama a rutas HTTP que no existen en el Backend.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('\n🔍 Iniciando Auditoría de Coherencia API Backend <-> Frontend...\n');

const startTime = Date.now();
const backendRoutes = new Map();
const issues = [];

// ============================================================================
// 1. EXTRAER RUTAS DEL BACKEND
// ============================================================================

console.log('📊 [1/3] Escaneando Controllers del Backend...');
try {
  const controllerFiles = glob.sync('backend/src/**/*.controller.ts');

  controllerFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = file.replace(/\\/g, '/');

    const controllerMatch = content.match(/@Controller\(\s*['"]*([^'"]*)['"]?\s*\)/);
    if (!controllerMatch) return;

    const basePath = controllerMatch[1] || '';
    const methodPattern = /@(Get|Post|Put|Delete|Patch|Head|Options)\(\s*['"]*([^'"]*)['"]?\s*\)/g;
    let match;

    while ((match = methodPattern.exec(content)) !== null) {
      const httpMethod = match[1];
      const subPath = match[2] || '';
      const fullPath = `/api/${basePath}${subPath}`.replace(/\/+/g, '/');

      if (!backendRoutes.has(fullPath)) {
        backendRoutes.set(fullPath, { methods: [], file: relativePath });
      }
      backendRoutes.get(fullPath).methods.push(httpMethod);
    }
  });

  console.log(`✅ Encontradas ${backendRoutes.size} rutas en Backend\n`);
} catch (err) {
  console.error(`❌ Error al escanear Backend: ${err.message}`);
  process.exit(1);
}

// ============================================================================
// 2. EXTRAER LLAMADAS DEL FRONTEND
// ============================================================================

console.log('📊 [2/3] Escaneando API calls del Frontend...');
const frontendCalls = new Map();

try {
  const tsFiles = glob.sync('frontend/src/**/*.ts');
  
  // Patrones mejorados que detectan llamadas HTTP reales
  const apiPatterns = [
    // HttpClient calls: this.http.get('/api/...') o this.http.get<Type>('/api/...')
    /this\.http\.(get|post|put|delete|patch)\s*(?:<[^>]*>)?\s*\(\s*['"`]([^'"`${}]+)['"`]/gi,
    
    // Fetch API: fetch('/api/...')
    /fetch\s*\(\s*['"`]([^'"`${}]+)['"`]/gi,
    
    // Axios: axios.get('/api/...') or this.client.post(...)
    /(?:axios|this\.client|this\.apiService)\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`${}]+)['"`]/gi,
    
    // HttpClient with methods from environment
    /this\.http\.(get|post|put|delete|patch)\s*(?:<[^>]*>)?\s*\(\s*(?:environment\.[a-zA-Z]+|['"`][^'"`]+['"`])/gi,
  ];
  
  tsFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    const relativePath = file.replace(/\\/g, '/');
    
    apiPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        // Extraer URL desde diferentes posiciones según el patrón
        let url = null;
        
        // Si hay grupo 2, es la URL (después del método HTTP)
        if (match[2]) {
          url = match[2];
        }
        // Si hay grupo 1 pero no 2, podría ser fetch() o axios()
        else if (match[1] && !match[1].match(/^(get|post|put|delete|patch)$/i)) {
          url = match[1];
        }
        
        if (!url || url.length < 5) continue; // Skip muy cortas
        if (url.includes('environment.') || url.includes('http://') || url.includes('https://')) continue;
        
        // Normalizar URL
        if (!url.startsWith('/api')) {
          url = '/api' + (url.startsWith('/') ? url : '/' + url);
        }
        
        // Limpiar query parameters
        url = url.split('?')[0];
        
        // Normalizar parámetros dinámicos
        const cleanUrl = url
          .replace(/\/:[a-zA-Z0-9_]+/g, '/:param')
          .replace(/\/\$\{[^}]+\}/g, '/:param');
        
        if (!frontendCalls.has(cleanUrl)) {
          const lineNum = content.substring(0, match.index).split('\n').length;
          frontendCalls.set(cleanUrl, { file: relativePath, line: lineNum, url });
  console.log(`✅ Encontradas ${frontendCalls.size} llamadas de API en Frontend\n`);
} catch (err) {
  console.error(`❌ Error al escanear Frontend: ${err.message}`);
  process.exit(1);
}

// ============================================================================
// 3. COMPARAR COHERENCIA
// ============================================================================

console.log('📊 [3/3] Validando coherencia API...\n');

for (const [frontendUrl, detail] of frontendCalls.entries()) {
  // Normalizar ambas URLs para comparar sin parámetros dinámicos
  const normalizeFrontend = frontendUrl
    .replace(/\/:[a-zA-Z0-9_]+/g, '/:param')
    .split('/:')[0];
  
  let found = false;
  let closeMatches = [];
  
  for (const backendUrl of backendRoutes.keys()) {
    const normalizeBackend = backendUrl
      .replace(/\/:[a-zA-Z0-9_]+/g, '/:param')
      .split('/:')[0];
    
    // Match exacto o match parcial (primeros segmentos iguales)
    if (normalizeFrontend === normalizeBackend) {
      found = true;
      break;
    }
    
    // Detectar matches parciales para avisos
    const frontendParts = normalizeFrontend.split('/').filter(p => p);
    const backendParts = normalizeBackend.split('/').filter(p => p);
    
    if (frontendParts.length > 0 && 
        backendParts.slice(0, frontendParts.length).join('/') === frontendParts.join('/')) {
      closeMatches.push(backendUrl);
    }
  }
  
  if (!found && closeMatches.length === 0) {
    issues.push({
      frontendUrl,
      file: detail.file,
      line: detail.line,
      severity: 'error',
    });
  } else if (!found && closeMatches.length > 0) {
    // Advertencia: existe ruta similar pero con parámetros diferentes
    issues.push({
      frontendUrl,
      file: detail.file,
      line: detail.line,
      severity: 'warn',
      suggestion: `Similar routes found: ${closeMatches[0]}`,

const duration = ((Date.now() - startTime) / 1000).toFixed(2);

console.log('═'.repeat(80));
console.log('📋 REPORTE DE COHERENCIA API');
console.log('═'.repeat(80));
console.log(`\n⏱️  Duración: ${duration}s`);
console.log(`\n📊 ESTADÍSTICAS:`);
console.log(`   Backend routes:    ${backendRoutes.size}`);
console.log(`   Frontend calls:    ${frontendCalls.size}`);
console.log(`   Inconsistencies:   ${issues.length}`);

if (issues.length > 0) {
  console.log(`\n❌ ERRORES DE COHERENCIA ENCONTRADOS:\n`);
  issues.slice(0, 15).forEach((issue, idx) => {
    console.log(`   ${idx + 1}. ${issue.frontendUrl}`);
    console.log(`      📍 ${issue.file}:${issue.line}\n`);
  });

  if (issues.length > 15) {
    console.log(`   ... y ${issues.length - 15} más\n`);
  }
} else {
  console.log(`\n✅ La coherencia API es correcta. Frontend y Backend están sincronizados.`);
}

// ============================================================================
// 5. GUARDAR REPORTE JSON
// ============================================================================

try {
  const auditDir = path.join(process.cwd(), 'audit');
  if (!fs.existsSync(auditDir)) {
    fs.mkdirSync(auditDir, { recursive: true });
  }

  const report = {
    timestamp: new Date().toISOString(),
    duration,
    backendRoutesCount: backendRoutes.size,
    frontendCallsCount: frontendCalls.size,
    inconsistenciesCount: issues.length,
    backendRoutes: Array.from(backendRoutes.entries()).map(([route, data]) => ({
      route,
      methods: data.methods,
      file: data.file,
    })),
    issues: issues.slice(0, 100),
  };

  fs.writeFileSync(
    path.join(auditDir, 'api-consistency-report.json'),
    JSON.stringify(report, null, 2)
  );
  console.log(`📁 Reporte JSON: audit/api-consistency-report.json\n`);
} catch (err) {
  console.warn(`⚠️  No se pudo guardar reporte JSON: ${err.message}`);
}

console.log('═'.repeat(80));

if (issues.length > 0) {
  console.error(`\n❌ FALLO: Se encontraron ${issues.length} inconsistencias de API.\n`);
  process.exit(1);
} else {
  console.log(`\n✅ ÉXITO: Auditoría de coherencia API completada correctamente.\n`);
  process.exit(0);
}
