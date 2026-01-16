// scripts/audit/check-api-consistency.js
const fs = require('fs');
const glob = require('glob');

console.log("🔍 Iniciando Auditoría de Coherencia API Backend <-> Frontend...");

// 1. Extraer Rutas del Backend (@Controller)
const backendRoutes = [];
const controllerFiles = glob.sync('backend/src/**/*.controller.ts');
controllerFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    // Regex simple para capturar @Controller('ruta') y @Get('ruta')
    const controllerMatch = content.match(/@Controller\(['"]([^'"]+)['"]\)/);
    if (controllerMatch) {
        const basePath = controllerMatch[1];
        // Buscar métodos HTTP
        const methodMatches = [...content.matchAll(/@(Get|Post|Put|Delete|Patch)\(['"]?([^'"]*)['"]?\)/g)];
        methodMatches.forEach(match => {
            const subPath = match[2] ? `/${match[2]}` : '';
            // Limpieza básica de rutas (dobles //)
            const fullPath = `/api/${basePath}${subPath}`.replace('//', '/');
            backendRoutes.push(fullPath);
        });
    }
});

// 2. Extraer Llamadas del Frontend (.api.ts o .service.ts)
const frontendCalls = [];
const apiFiles = glob.sync('frontend/src/app/**/*.api.ts');
apiFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    // Buscar strings que parezcan endpoints que empiecen con /api/ o api/
    // Se asume que el frontend usa environment.apiUrl no hardcode, pero a veces usa paths relativos
    // Buscamos patrones comunes en este codebase
    const matches = [...content.matchAll(/['"`]\/?([a-zA-Z0-9\-_]+)(\/[^'"`]*)?['"`]/g)];
    
    // Esta regex es muy genérica, intentemos ser más específicos para lo que vimos en el código
    // Vimos `path: 'orders'` en routes, pero en API services vimos endpoints.
    // Ajustemos al pattern sugerido por el usuario pero adaptado
    const apiMatches = [...content.matchAll(/['"`](\/?[a-zA-Z0-9\-_]+\/?[^'"`]*)['"`]/g)];
    
    apiMatches.forEach(match => {
        const potentialPath = match[1];
        // Solo considerar si no es un path de angular routing (que no suele llevar api prefix explicito salvo en proxy)
        // En este proyecto vimos que el environment.apiUrl es http://localhost:4000/api
        // Asi que los endpoints suelen ser 'auth/login' o '/orders'
        // Vamos a asumir que si parece un path de API lo agregamos
       if(potentialPath.includes('/') && !potentialPath.startsWith('./')) {
            // Normalizar a /api/...
             if(potentialPath.startsWith('/api/')) {
                 frontendCalls.push(potentialPath);
             } else if (!potentialPath.startsWith('/')) {
                 frontendCalls.push(`/api/${potentialPath}`);
             } else {
                 // Si empieza con /, asumo que se le concatena api base url que ya tiene /api? 
                 // Ojo, si environment.apiUrl tiene /api, entonces 'orders' -> /api/orders
                 frontendCalls.push(`/api${potentialPath}`);
             }
       }
    });
});

// 3. Comparar
console.log(`\n📊 Rutas Backend Encontradas: ${backendRoutes.length}`);
// console.log(backendRoutes);
console.log(`📊 Llamadas Frontend (Estimado) Encontradas: ${frontendCalls.length}`);

const brokenLinks = frontendCalls.filter(call => {
    // Lógica difusa: verificar si la llamada del front coincide con alguna ruta del back
    // (Ignorando parámetros dinámicos como :id por simplicidad en este script básico)
    // Quitamos los parametros :id o ${} del frontend call para comparar base
    const baseCall = call.split('/:')[0].split('${')[0]; 
    
    return !backendRoutes.some(route => {
        // Quitamos params del route backend tambien (/orders/:id -> /orders/)
        const baseRoute = route.split('/:')[0];
        return baseRoute.includes(baseCall) || baseCall.includes(baseRoute);
    });
});

if (brokenLinks.length > 0) {
    console.log("\n⚠️  ADVERTENCIA: Posibles rutas rotas (Scan heurístico):");
    // Filtrar falsos positivos comunes
    const realBroken = brokenLinks.filter(l => !l.includes('assets') && !l.includes('svg'));
    
    if(realBroken.length > 0) {
        realBroken.forEach(link => console.log(` - ${link}`));
       // No fallamos el proceso (exit 1) todavía porque es heurístico y puede haber falsos positivos
       // Dejamos que el humano revise
    } else {
        console.log("   (Falsos positivos descartados)");
    }
} else {
    console.log("\n✅ Coherencia API: Aparentemente correcta.");
}
