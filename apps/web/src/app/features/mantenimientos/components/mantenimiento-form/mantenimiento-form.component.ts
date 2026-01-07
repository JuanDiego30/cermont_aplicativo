/**
 * MantenimientoFormComponent - Formulario de creación/edición de mantenimiento
 */
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MantenimientosService } from '../../services/mantenimientos.service';
import { 
  MantenimientoTipo, 
  MantenimientoPrioridad,
  CreateMantenimientoDto,
  UpdateMantenimientoDto 
} from '../../../../core/models/mantenimiento.model';

@Component({
  selector: 'app-mantenimiento-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="p-6">
      <!-- Back button -->
      <a routerLink="/dashboard/mantenimientos" 
         class="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        ← Volver a lista
      </a>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {{ isEdit() ? 'Editar Mantenimiento' : 'Nuevo Mantenimiento' }}
        </h1>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Descripción -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción *
            </label>
            <textarea formControlName="descripcion" rows="3"
                      class="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Descripción del mantenimiento..."></textarea>
            @if (form.get('descripcion')?.invalid && form.get('descripcion')?.touched) {
              <p class="text-red-500 text-sm mt-1">La descripción es requerida</p>
            }
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Tipo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo *
              </label>
              <select formControlName="tipo"
                      class="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="">Seleccionar tipo</option>
                <option value="preventivo">Preventivo</option>
                <option value="correctivo">Correctivo</option>
                <option value="predictivo">Predictivo</option>
              </select>
            </div>

            <!-- Prioridad -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prioridad
              </label>
              <select formControlName="prioridad"
                      class="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>

            <!-- Fecha programada -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha Programada *
              </label>
              <input type="datetime-local" formControlName="fechaProgramada"
                     class="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            </div>

            <!-- Duración estimada -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Duración Estimada (horas)
              </label>
              <input type="number" formControlName="duracionEstimada" min="0" step="0.5"
                     class="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                     placeholder="2.5">
            </div>

            <!-- Equipo ID (por ahora manual) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ID del Equipo *
              </label>
              <input type="text" formControlName="equipoId"
                     class="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                     placeholder="UUID del equipo">
            </div>
          </div>

          <!-- Observaciones -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Observaciones
            </label>
            <textarea formControlName="observaciones" rows="2"
                      class="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Observaciones adicionales..."></textarea>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3">
            <a routerLink="/dashboard/mantenimientos"
               class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Cancelar
            </a>
            <button type="submit" [disabled]="form.invalid || saving()"
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
              {{ saving() ? 'Guardando...' : (isEdit() ? 'Actualizar' : 'Crear') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class MantenimientoFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(MantenimientosService);

  form: FormGroup;
  isEdit = signal(false);
  saving = signal(false);
  mantenimientoId: string | null = null;

  constructor() {
    this.form = this.fb.group({
      descripcion: ['', Validators.required],
      tipo: ['preventivo', Validators.required],
      prioridad: ['media'],
      fechaProgramada: ['', Validators.required],
      duracionEstimada: [null],
      equipoId: ['', Validators.required],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.mantenimientoId = id;
      this.loadMantenimiento(id);
    } else {
      // Set default fecha programada to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      this.form.patchValue({
        fechaProgramada: this.formatDateForInput(tomorrow)
      });
    }
  }

  loadMantenimiento(id: string): void {
    this.service.getById(id).subscribe({
      next: (m) => {
        this.form.patchValue({
          descripcion: m.descripcion,
          tipo: m.tipo,
          prioridad: m.prioridad,
          fechaProgramada: this.formatDateForInput(new Date(m.fechaProgramada)),
          duracionEstimada: m.duracionEstimada,
          equipoId: m.equipoId,
          observaciones: m.observaciones
        });
      },
      error: () => {
        this.router.navigate(['/dashboard/mantenimientos']);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.saving.set(true);
    const value = this.form.value;

    if (this.isEdit() && this.mantenimientoId) {
      const dto: UpdateMantenimientoDto = {
        descripcion: value.descripcion,
        fechaProgramada: new Date(value.fechaProgramada).toISOString(),
        prioridad: value.prioridad,
        duracionEstimada: value.duracionEstimada,
        observaciones: value.observaciones
      };
      this.service.update(this.mantenimientoId, dto).subscribe({
        next: () => {
          this.saving.set(false);
          this.router.navigate(['/dashboard/mantenimientos', this.mantenimientoId]);
        },
        error: () => this.saving.set(false)
      });
    } else {
      const dto: CreateMantenimientoDto = {
        descripcion: value.descripcion,
        tipo: value.tipo,
        fechaProgramada: new Date(value.fechaProgramada).toISOString(),
        prioridad: value.prioridad,
        duracionEstimada: value.duracionEstimada,
        equipoId: value.equipoId
      };
      this.service.create(dto).subscribe({
        next: (created) => {
          this.saving.set(false);
          this.router.navigate(['/dashboard/mantenimientos', created.id]);
        },
        error: () => this.saving.set(false)
      });
    }
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().slice(0, 16);
  }
}
