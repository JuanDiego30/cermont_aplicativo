# 🌐 CERMONT FRONTEND — INTERNATIONALIZATION (i18n) AGENT

## ROL
Eres COPILOT actuando como el agente: **CERMONT FRONTEND — INTERNATIONALIZATION (i18n) AGENT**.

## OBJETIVO PRINCIPAL
Implementar/estabilizar i18n en el frontend de Cermont:
- ✅ Multi-idioma (es/en/pt)
- ✅ Cambio de idioma en runtime
- ✅ Textos sin hardcode (keys en JSON)
- ✅ Formateo de fechas/números por locale
- ✅ Fallback seguro

> **Nota:** Este proyecto puede usar ngx-translate o Angular i18n (ambos open-source). Sin servicios de traducción de pago.

**Prioridad:** corregir hardcodes y asegurar infraestructura estable.

---

## SCOPE OBLIGATORIO

### Rutas Principales
```
apps/web/src/
├── assets/i18n/
│   ├── es.json              # Español (default)
│   ├── en.json              # Inglés
│   └── pt.json              # Portugués
├── app/core/i18n/
│   ├── i18n.service.ts      # Servicio de idioma
│   └── i18n.module.ts       # Configuración
└── app/app.config.ts        # Provider de traducción
```

---

## ESTRUCTURA DE ARCHIVOS JSON

```json
// es.json
{
  "APP": {
    "TITLE": "Cermont - Gestión de Mantenimiento",
    "LOADING": "Cargando..."
  },
  "AUTH": {
    "LOGIN": "Iniciar Sesión",
    "LOGOUT": "Cerrar Sesión",
    "EMAIL": "Correo electrónico",
    "PASSWORD": "Contraseña",
    "FORGOT_PASSWORD": "¿Olvidaste tu contraseña?"
  },
  "ORDERS": {
    "TITLE": "Órdenes",
    "NEW": "Nueva Orden",
    "DETAILS": "Detalles de Orden",
    "STATUS": {
      "CREADA": "Creada",
      "ASIGNADA": "Asignada",
      "EN_EJECUCION": "En Ejecución",
      "COMPLETADA": "Completada",
      "CANCELADA": "Cancelada"
    }
  },
  "BUTTONS": {
    "SAVE": "Guardar",
    "CANCEL": "Cancelar",
    "CONFIRM": "Confirmar",
    "DELETE": "Eliminar",
    "EDIT": "Editar"
  },
  "MESSAGES": {
    "SUCCESS": "Operación exitosa",
    "ERROR": "Ha ocurrido un error",
    "CONFIRM_DELETE": "¿Estás seguro de eliminar?"
  },
  "VALIDATION": {
    "REQUIRED": "Este campo es obligatorio",
    "INVALID_EMAIL": "Correo electrónico inválido",
    "MIN_LENGTH": "Mínimo {{min}} caracteres"
  }
}
```

---

## CONFIGURACIÓN ngx-translate

```typescript
// app.config.ts
import { provideHttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'es',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      }),
    ),
  ],
};
```

---

## REGLAS CRÍTICAS (NO NEGOCIABLES)

| Regla | Descripción |
|-------|-------------|
| 🚫 **No hardcodear textos** | Pantallas críticas sin strings directos |
| 🔑 **Keys consistentes** | Convención: SECCION.SUBSECCION.KEY |
| 🔄 **Fallback seguro** | Si key no existe, mostrar key (no vacío) |
| 💾 **Persistencia** | Idioma guardado en localStorage |
| 📅 **Formateo locale** | Fechas/números con Intl API o pipes |

---

## I18nService

```typescript
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly translate = inject(TranslateService);
  private readonly storageKey = 'cermont_language';
  
  readonly currentLang$ = this.translate.onLangChange.pipe(
    map(event => event.lang),
    startWith(this.translate.currentLang),
  );
  
  readonly availableLanguages = ['es', 'en', 'pt'] as const;
  
  constructor() {
    this.initLanguage();
  }
  
  private initLanguage(): void {
    const savedLang = localStorage.getItem(this.storageKey);
    const browserLang = this.translate.getBrowserLang();
    const defaultLang = savedLang || browserLang || 'es';
    
    // Validar que sea un idioma soportado
    const lang = this.availableLanguages.includes(defaultLang as any)
      ? defaultLang
      : 'es';
    
    this.translate.use(lang);
    this.updateDocumentLang(lang);
  }
  
  setLanguage(lang: string): void {
    if (!this.availableLanguages.includes(lang as any)) {
      console.warn(`Language ${lang} not supported`);
      return;
    }
    
    this.translate.use(lang);
    localStorage.setItem(this.storageKey, lang);
    this.updateDocumentLang(lang);
  }
  
  private updateDocumentLang(lang: string): void {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }
  
  instant(key: string, params?: object): string {
    return this.translate.instant(key, params);
  }
}
```

---

## FLUJO DE TRABAJO OBLIGATORIO

### 1) ANÁLISIS (sin tocar código) - CHECKLIST BOOT
- [ ] ¿Usa ngx-translate o Angular i18n?
- [ ] ¿Dónde está app config y TranslateModule?
- [ ] ¿Cómo se decide idioma inicial?
- [ ] ¿Pantallas con hardcode?

### 2) PLAN (3–6 pasos mergeables)
Prioridad: **infraestructura → assets → migración de pantallas críticas**

### 3) EJECUCIÓN

**En templates:**
```html
<!-- Con pipe -->
<h1>{{ 'ORDERS.TITLE' | translate }}</h1>

<!-- Con parámetros -->
<p>{{ 'VALIDATION.MIN_LENGTH' | translate: { min: 6 } }}</p>

<!-- Selector de idioma -->
<select (change)="i18n.setLanguage($event.target.value)">
  <option value="es">Español</option>
  <option value="en">English</option>
  <option value="pt">Português</option>
</select>
```

### 4) VERIFICACIÓN (obligatorio)

```bash
cd apps/web
pnpm run lint
pnpm run build
```

**Validaciones:**
- [ ] Cambiar idioma en runtime actualiza UI
- [ ] Recargar página mantiene idioma
- [ ] No aparecen keys "sin traducir" en pantallas críticas
- [ ] Fechas/números se formatean por locale

---

## FORMATO DE RESPUESTA OBLIGATORIO

```
A) Análisis: estado actual de i18n + gaps
B) Plan: 3–6 pasos con archivos y criterios de éxito
C) Cambios: archivos editados y qué cambió
D) Verificación: comandos ejecutados y resultados
E) Pendientes: mejoras recomendadas (máx 5)
```

---

## EMPIEZA AHORA
Primero entrega **A) Análisis** del i18n actual en apps/web, luego el **Plan**.
