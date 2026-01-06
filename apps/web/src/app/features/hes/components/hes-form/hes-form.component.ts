import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HesService } from '../../services/hes.service';
import { PrioridadHES, TipoServicio } from '../../../../core/models/hes.model';
import { beginFormSubmit, subscribeSubmit } from '../../../../shared/utils/form-submit.util';
import { InputFieldComponent } from '../../../../shared/components/form/input/input-field.component';

type HesCreateFormControls = {
  tipoServicio: FormControl<TipoServicio>;
  prioridad: FormControl<PrioridadHES>;
  ordenId: FormControl<string>;
  clienteNombre: FormControl<string>;
  clienteTelefono: FormControl<string>;
  clienteEmail: FormControl<string>;
};

@Component({
  selector: 'app-hes-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputFieldComponent],
  template: `
    <div class="container mx-auto px-4 py-6 max-w-4xl">
      <div class="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Nueva HES</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Crea una Hoja de Entrada y Salida consumiendo el backend.
          </p>
        </div>
        <button type="button" class="btn-outline" (click)="onCancel()" [disabled]="loading()">Volver</button>
      </div>

      @if (error()) {
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p class="text-red-800 dark:text-red-200">{{ error() }}</p>
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="card">
        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de servicio <span class="text-red-500">*</span></label>
              <select class="input" formControlName="tipoServicio">
                @for (t of tiposServicio; track t) {
                  <option [value]="t">{{ t }}</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prioridad</label>
              <select class="input" formControlName="prioridad">
                @for (p of prioridades; track p) {
                  <option [value]="p">{{ p }}</option>
                }
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Orden (opcional)</label>
            <app-input-field type="text" formControlName="ordenId" placeholder="ID de la orden (UUID)" />
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Si la HES está ligada a una orden existente.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cliente <span class="text-red-500">*</span></label>
              <app-input-field type="text" formControlName="clienteNombre" placeholder="Nombre" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Teléfono</label>
              <app-input-field type="text" formControlName="clienteTelefono" placeholder="Teléfono" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <app-input-field type="email" formControlName="clienteEmail" placeholder="Email" />
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button type="button" class="btn-outline" (click)="onCancel()" [disabled]="loading()">Cancelar</button>
          <button type="submit" class="btn-primary" [disabled]="loading() || form.invalid">
            @if (loading()) { Guardando... } @else { Crear HES }
          </button>
        </div>
      </form>
    </div>
  `,
})
export class HesFormComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly hesService = inject(HesService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly tiposServicio = Object.values(TipoServicio);
  readonly prioridades = Object.values(PrioridadHES);

  readonly form: FormGroup<HesCreateFormControls> = this.fb.group({
    tipoServicio: [TipoServicio.MANTENIMIENTO_PREVENTIVO, Validators.required],
    prioridad: [PrioridadHES.MEDIA, Validators.required],
    ordenId: [''],
    clienteNombre: ['', [Validators.required, Validators.maxLength(200)]],
    clienteTelefono: ['', [Validators.maxLength(50)]],
    clienteEmail: ['', [Validators.email, Validators.maxLength(200)]],
  });

  onSubmit(): void {
    if (!beginFormSubmit(this.form, this.loading, this.error)) return;

    const v = this.form.getRawValue();
    const dto = {
      ordenId: v.ordenId || undefined,
      tipoServicio: v.tipoServicio,
      prioridad: v.prioridad,
      cliente: {
        nombre: v.clienteNombre,
        telefono: v.clienteTelefono || undefined,
        email: v.clienteEmail || undefined,
      },
    };

    subscribeSubmit(
      this.hesService.create(dto),
      this.destroyRef,
      this.loading,
      this.error,
      () => this.router.navigate(['/dashboard/hes']),
      'Error al crear la HES',
    );
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/hes']);
  }
}
