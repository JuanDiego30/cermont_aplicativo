import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from './i18n.service';

/**
 * Pipe para usar traducciones en templates
 *
 * Uso:
 * {{ 'AUTH.LOGIN' | translate }}
 * {{ 'VALIDATION.MIN_LENGTH' | translate: { min: 6 } }}
 */
@Pipe({
  name: 'translate',
  standalone: true,
  pure: false, // Necesario para que se actualice al cambiar idioma
})
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(key: string, params?: Record<string, string | number>): string {
    return this.i18n.translate(key, params);
  }
}
