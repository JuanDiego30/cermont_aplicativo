---
description: "Agente especializado para internacionalización (i18n) en Frontend de Cermont: multi-idioma, ngx-translate, formateo de fechas/números por locale, soporte RTL."
tools: []
---

# 🌐 FRONTEND INTERNATIONALIZATION (i18n) AGENT

**Especialidad:** Multi-idioma, traducción de UI, formateo de fechas/números, RTL support  
**Stack:** ngx-translate, Angular i18n, Intl API  
**Ubicación:** `apps/web/src/assets/i18n/`, `apps/web/src/app/core/i18n/`

---

## 🎯 Cuando Usarlo

| Situación | Usa Este Agente |
|-----------|---------------|
| Soporte multi-idioma | ✅ |
| Traducir textos dinámicos | ✅ |
| Formatear fechas por locale | ✅ |
| Soporte RTL | ✅ |
| Cambiar idioma en runtime | ✅ |
| Pluralización de textos | ✅ |
| Interpolación de variables | ✅ |

---

## 📋 Patrón Obligatorio

### 1. Configuración Global

```typescript
// apps/web/src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(
    http,
    './assets/i18n/',
    '.json'
  );
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
      })
    ),
  ],
};
```

### 2. I18n Service

```typescript
// apps/web/src/app/core/i18n/i18n.service.ts
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Language = 'es' | 'en' | 'pt';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private currentLanguage$ = new BehaviorSubject<Language>('es');

  constructor(private translate: TranslateService) {
    this.initializeLanguage();
  }

  private initializeLanguage(): void {
    const stored = localStorage.getItem('language') as Language || 'es';
    this.setLanguage(stored);
  }

  setLanguage(lang: Language): void {
    this.translate.use(lang);
    this.currentLanguage$.next(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = this.isRTL(lang) ? 'rtl' : 'ltr';
  }

  getCurrentLanguage(): Observable<Language> {
    return this.currentLanguage$.asObservable();
  }

  get(key: string, params?: any): Observable<string> {
    return this.translate.get(key, params);
  }

  instant(key: string, params?: any): string {
    return this.translate.instant(key, params);
  }

  private isRTL(lang: Language): boolean {
    return ['ar', 'he'].includes(lang);
  }
}
```

### 3. Usar en Componentes

```typescript
// Componente inteligente
@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="orders-container">
      <h1>{{ 'ORDERS.TITLE' | translate }}</h1>
      
      <div *ngFor="let order of orders" class="order-card">
        <p>{{ 'ORDERS.NUMBER' | translate }}: {{ order.number }}</p>
        <p>{{ 'ORDERS.STATUS' | translate }}: {{ order.status }}</p>
        <p>{{ 'ORDERS.DATE' | translate }}: {{ order.createdAt | date: 'short' }}</p>
      </div>

      <p *ngIf="orders.length === 0">
        {{ 'ORDERS.EMPTY' | translate }}
      </p>
    </div>
  `,
})
export class OrdersListComponent {
  orders: Order[] = [];
}

// Componente con integración de servicio
@Component({
  selector: 'app-header',
  template: `
    <header>
      <h1>{{ title$ | async }}</h1>
      
      <select (change)="changeLanguage($event)">
        <option value="es" i18n="@@language.es">Español</option>
        <option value="en" i18n="@@language.en">English</option>
        <option value="pt" i18n="@@language.pt">Portugués</option>
      </select>
    </header>
  `,
})
export class HeaderComponent {
  title$: Observable<string>;

  constructor(private i18n: I18nService) {
    this.title$ = this.i18n.get('APP.TITLE');
  }

  changeLanguage(event: any): void {
    this.i18n.setLanguage(event.target.value);
  }
}
```

### 4. Archivos de Traducción

```json
// apps/web/src/assets/i18n/es.json
{
  "APP": {
    "TITLE": "Cermont - Gestión de Órdenes",
    "DESCRIPTION": "Aplicativo de gestión integral"
  },
  "ORDERS": {
    "TITLE": "Mis Órdenes",
    "NUMBER": "Número",
    "STATUS": "Estado",
    "DATE": "Fecha",
    "EMPTY": "No hay órdenes disponibles",
    "CREATE": "Nueva Orden",
    "EDIT": "Editar",
    "DELETE": "Eliminar"
  },
  "BUTTONS": {
    "SAVE": "Guardar",
    "CANCEL": "Cancelar",
    "DELETE": "Eliminar",
    "SUBMIT": "Enviar"
  },
  "MESSAGES": {
    "SUCCESS": "Acción completada exitosamente",
    "ERROR": "Ocurrió un error. Por favor, intente nuevamente",
    "CONFIRM_DELETE": "¿Está seguro de que desea eliminar este elemento?"
  }
}
```

```json
// apps/web/src/assets/i18n/en.json
{
  "APP": {
    "TITLE": "Cermont - Order Management",
    "DESCRIPTION": "Comprehensive management application"
  },
  "ORDERS": {
    "TITLE": "My Orders",
    "NUMBER": "Number",
    "STATUS": "Status",
    "DATE": "Date",
    "EMPTY": "No orders available",
    "CREATE": "New Order",
    "EDIT": "Edit",
    "DELETE": "Delete"
  },
  "BUTTONS": {
    "SAVE": "Save",
    "CANCEL": "Cancel",
    "DELETE": "Delete",
    "SUBMIT": "Submit"
  },
  "MESSAGES": {
    "SUCCESS": "Action completed successfully",
    "ERROR": "An error occurred. Please try again",
    "CONFIRM_DELETE": "Are you sure you want to delete this item?"
  }
}
```

### 5. Formateo de Fechas por Locale

```typescript
// apps/web/src/app/shared/pipes/locale-date.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { I18nService } from 'src/app/core/i18n/i18n.service';

@Pipe({
  name: 'localeDate',
  standalone: true,
})
export class LocaleDatePipe implements PipeTransform {
  constructor(private i18n: I18nService) {}

  transform(value: Date | string, format: string = 'short'): string {
    const date = new Date(value);
    const lang = this.i18n.getCurrentLanguage();
    
    return new Intl.DateTimeFormat(this.getLocale(), {
      year: 'numeric',
      month: format === 'short' ? 'short' : 'long',
      day: 'numeric',
    }).format(date);
  }

  private getLocale(): string {
    const lang = localStorage.getItem('language') || 'es';
    const localeMap = {
      es: 'es-ES',
      en: 'en-US',
      pt: 'pt-BR',
    };
    return localeMap[lang] || 'es-ES';
  }
}

// Uso: {{ order.createdAt | localeDate }}
```

---

## ✅ Checklist

- [ ] ngx-translate instalado
- [ ] I18nService creado
- [ ] Archivos JSON de traducción
- [ ] TranslateModule importado en app config
- [ ] Pipes de traducción en templates
- [ ] Todos los textos extraidos a JSON
- [ ] Soporte para más idiomas (es, en, pt)
- [ ] Tests para I18nService
- [ ] LocaleDatePipe para formateo por locale

---

## 🚫 Límites

| ❌ NO | ✅ HACER |
|-----|----------|
| Textos hardcodeados | Usar i18n siempre |
| Idiomas incompletos | Completar todas las keys |
| Olvidar plurales | Usar sintaxis plural |
| Sin respaldo (fallback) | Definir idioma default |

---

**Status:** ✅ Listo para uso  
**Última actualización:** 2026-01-02
