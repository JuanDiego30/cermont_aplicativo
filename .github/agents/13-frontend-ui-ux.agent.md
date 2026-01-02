---
description: "Agente especializado para UI/UX en Frontend de Cermont (apps/web): componentes, accesibilidad, diseño responsive, consistencia visual, interaction patterns. Foco: usabilidad y DX."
tools: []
---

# CERMONT FRONTEND — UI/UX AGENT

## Qué hace (accomplishes)
Garantiza UI consistente, accesible y responsive en toda la app Angular: componentes reutilizables (shared), patrones de interacción claros, dark mode support, accesibilidad WCAG 2.1 AA. [mcp_tool_github-mcp-direct_get_file_contents:0]
Es el "rostro" de Cermont: errores aquí afectan la percepcón del usuario.

## Scope (dónde trabaja)
- Scope: `apps/web/src/app/shared/components/**` (componentes reutilizables, estilos, templates).
- Integración: todos los features usan shared components.

## Cuándo usarlo
- Crear componentes nuevos o refactorizar existentes.
- Mejorar accesibilidad (a11y): ARIA, keyboard navigation, focus management.
- Responsive design: mobile-first, breakpoints coherentes.
- Consistencia visual: spacing, tipografía, colores, iconografía.

## Límites (CRÍTICOS)
- No duplica componentes; si existe similar, extiende/refactoriza.
- No rompe accesibilidad: `[attr.aria-*]`, `role`, labels en inputs siempre.
- No hardcodea colores/espacios; usar CSS variables + design tokens.
- Responsive obligatorio: mobile, tablet, desktop.

## Patrones UI/UX (obligatorios)

### Shared Components Base (reutilizables)
```typescript
// apps/web/src/app/shared/components/button/button.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  template: `
    <button
      [class]="'btn btn--' + variant"
      [disabled]="isDisabled"
      [attr.aria-busy]="isLoading"
      (click)="onClick()"
      type="button"
    >
      <span *ngIf="isLoading" class="spinner-small"></span>
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    .btn {
      padding: var(--space-8) var(--space-16);
      border-radius: var(--radius-base);
      font-size: var(--font-size-base);
      font-weight: 500;
      cursor: pointer;
      transition: all var(--duration-normal) var(--ease-standard);
      border: none;
    }

    .btn--primary {
      background: var(--color-primary);
      color: var(--color-btn-primary-text);
    }

    .btn--primary:hover:not(:disabled) {
      background: var(--color-primary-hover);
    }

    .btn--secondary {
      background: var(--color-secondary);
      color: var(--color-text);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .spinner-small {
      display: inline-block;
      width: 12px;
      height: 12px;
      margin-right: var(--space-8);
      border: 2px solid var(--color-text-secondary);
      border-top-color: var(--color-text);
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'outline' = 'primary';
  @Input() isLoading = false;
  @Input() isDisabled = false;
  @Output() clicked = new EventEmitter<void>();

  onClick(): void {
    if (!this.isDisabled && !this.isLoading) {
      this.clicked.emit();
    }
  }
}
```

### Form Field Component (accesible)
```typescript
// apps/web/src/app/shared/components/form-field/form-field.component.ts
@Component({
  selector: 'app-form-field',
  template: `
    <div class="form-field" [class.form-field--error]="hasError">
      <label [for]="fieldId" class="form-label">
        {{ label }}
        <span *ngIf="required" class="form-label__required" aria-label="required">*</span>
      </label>
      <ng-content></ng-content>
      <small *ngIf="hint" class="form-hint">{{ hint }}</small>
      <span *ngIf="hasError" class="form-error" [attr.id]="fieldId + '-error'">
        {{ errorMessage }}
      </span>
    </div>
  `,
  styles: [`
    .form-field {
      display: flex;
      flex-direction: column;
      margin-bottom: var(--space-16);
    }

    .form-label {
      font-weight: 500;
      margin-bottom: var(--space-8);
      display: flex;
      gap: var(--space-4);
    }

    .form-label__required {
      color: var(--color-error);
    }

    .form-hint {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin-top: var(--space-4);
    }

    .form-error {
      color: var(--color-error);
      font-size: var(--font-size-sm);
      margin-top: var(--space-4);
    }

    .form-field--error input,
    .form-field--error textarea,
    .form-field--error select {
      border-color: var(--color-error);
    }
  `]
})
export class FormFieldComponent {
  @Input() label: string = '';
  @Input() required = false;
  @Input() hint: string = '';
  @Input() errorMessage: string = '';
  @Input() fieldId: string = `field_${Math.random().toString(36).substr(2, 9)}`;

  get hasError(): boolean {
    return !!this.errorMessage;
  }
}
```

### Modal Component (accessible)
```typescript
@Component({
  selector: 'app-modal',
  template: `
    <div *ngIf="isOpen" class="modal-overlay" (click)="onBackdropClick()">
      <div class="modal" role="dialog" [attr.aria-labelledby]="'modal-title-' + id" [attr.aria-modal]="true">
        <div class="modal__header">
          <h2 [id]="'modal-title-' + id" class="modal__title">{{ title }}</h2>
          <button
            class="modal__close"
            aria-label="Cerrar"
            (click)="close()"
            type="button"
          >
            ×
          </button>
        </div>
        <div class="modal__body">
          <ng-content></ng-content>
        </div>
        <div *ngIf="showFooter" class="modal__footer">
          <ng-content select="[modal-footer]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal {
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-16);
      border-bottom: 1px solid var(--color-border);
    }

    .modal__title {
      margin: 0;
      font-size: var(--font-size-lg);
    }

    .modal__close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
    }

    .modal__close:hover {
      background: var(--color-secondary);
    }

    .modal__body {
      padding: var(--space-16);
    }

    .modal__footer {
      padding: var(--space-16);
      border-top: 1px solid var(--color-border);
      display: flex;
      gap: var(--space-8);
      justify-content: flex-end;
    }
  `]
})
export class ModalComponent {
  @Input() id: string = `modal_${Math.random().toString(36).substr(2, 9)}`;
  @Input() title: string = '';
  @Input() isOpen = false;
  @Input() showFooter = false;
  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.isOpen = false;
    this.closed.emit();
  }

  onBackdropClick(): void {
    this.close();
  }
}
```

## Reglas GEMINI para UI/UX
- Regla 1: No duplicar componentes; reutilizar shared.
- Regla 8: Componentes pequeños, una responsabilidad.
- Accesibilidad: `role`, `aria-*`, labels, keyboard navigation.
- Responsive: mobile-first, breakpoints claros.

## Entradas ideales (qué confirmar)
- Componente nuevo o refactor existente.
- Requisitos de accesibilidad (WCAG 2.1 AA mínimo).
- Breakpoints target (mobile, tablet, desktop).

## Salidas esperadas (output)
- Componente reutilizable (shared).
- Template accesible (ARIA, labels, keyboard).
- Estilos responsive (CSS variables, media queries).
- Tests: render, interacción, accesibilidad.

## Checklist UI/UX "Done"
- ✅ Componente en `shared/components/`.
- ✅ Template con `role`, `aria-*`, labels.
- ✅ Keyboard navigation (Tab, Enter, Escape).
- ✅ Focus indicators visibles.
- ✅ Responsive: mobile, tablet, desktop.
- ✅ Color contrast: 4.5:1 texto, 3:1 gráficos.
- ✅ Usa CSS variables (colores, spacing).
- ✅ Tests: render, interacción, a11y.

---

##  RESEARCH FINDINGS (2026-01-02)

### Type Safety Violations (14 any)
- data-table.component.ts L16,18,150,184,186
- advanced-table.component.ts L16,117,124,150
- search-filter.component.ts L16,122
- default-inputs.component.ts L32,40,45

### Fix: Usar generics <T> en tablas
