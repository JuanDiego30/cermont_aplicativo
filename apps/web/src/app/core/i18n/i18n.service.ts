/**
 * @service I18nService
 * @description Servicio centralizado para internacionalización
 * 
 * Funcionalidades:
 * - Cambio de idioma en runtime
 * - Persistencia en localStorage
 * - Detección de idioma del navegador
 * - Fallback a español
 */
import { Injectable, signal, computed, inject } from '@angular/core';

export type SupportedLanguage = 'es' | 'en';

const STORAGE_KEY = 'cermont_language';
const DEFAULT_LANGUAGE: SupportedLanguage = 'es';
const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['es', 'en'];

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  // Estado reactivo con signals
  private currentLangSignal = signal<SupportedLanguage>(this.getInitialLanguage());
  
  // Computed signals para acceso reactivo
  readonly currentLang = this.currentLangSignal.asReadonly();
  readonly availableLanguages = SUPPORTED_LANGUAGES;
  
  // Cache de traducciones
  private translations: Record<SupportedLanguage, Record<string, unknown>> = {
    es: {},
    en: {},
  };
  private loaded = false;

  constructor() {
    this.loadTranslations();
  }

  /**
   * Obtiene el idioma inicial (localStorage > navegador > default)
   */
  private getInitialLanguage(): SupportedLanguage {
    // 1. Intentar localStorage
    const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
    if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
      return saved;
    }

    // 2. Intentar idioma del navegador
    const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
    if (SUPPORTED_LANGUAGES.includes(browserLang)) {
      return browserLang;
    }

    // 3. Default
    return DEFAULT_LANGUAGE;
  }

  /**
   * Carga las traducciones de forma asíncrona
   */
  private async loadTranslations(): Promise<void> {
    try {
      const [es, en] = await Promise.all([
        fetch('/assets/i18n/es.json').then(r => r.json()),
        fetch('/assets/i18n/en.json').then(r => r.json()),
      ]);
      
      this.translations = { es, en };
      this.loaded = true;
      
      // Actualizar el lang del documento HTML
      this.updateDocumentLang(this.currentLangSignal());
    } catch (error) {
      console.error('[I18nService] Error loading translations:', error);
    }
  }

  /**
   * Cambia el idioma actual
   */
  setLanguage(lang: SupportedLanguage): void {
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      console.warn(`[I18nService] Language ${lang} not supported`);
      return;
    }

    this.currentLangSignal.set(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    this.updateDocumentLang(lang);
  }

  /**
   * Actualiza el atributo lang del HTML
   */
  private updateDocumentLang(lang: SupportedLanguage): void {
    document.documentElement.lang = lang;
  }

  /**
   * Obtiene una traducción por clave
   * Ejemplo: translate('AUTH.LOGIN') -> "Iniciar Sesión"
   */
  translate(key: string, params?: Record<string, string | number>): string {
    const lang = this.currentLangSignal();
    const keys = key.split('.');
    
    let result: unknown = this.translations[lang];
    
    for (const k of keys) {
      if (result && typeof result === 'object') {
        result = (result as Record<string, unknown>)[k];
      } else {
        result = undefined;
        break;
      }
    }

    if (typeof result !== 'string') {
      // Fallback: retornar la key si no se encuentra
      return key;
    }

    // Reemplazar parámetros {{param}}
    if (params) {
      return result.replace(/\{\{(\w+)\}\}/g, (match, paramName) => {
        return String(params[paramName] ?? match);
      });
    }

    return result;
  }

  /**
   * Alias corto para translate()
   */
  t(key: string, params?: Record<string, string | number>): string {
    return this.translate(key, params);
  }
}
