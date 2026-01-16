import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Prioridad } from '../../../../core/models/orden.model';
import {
  getDefaultControlErrorMessage,
  hasControlError,
} from '../../../../shared/utils/form-errors.util';
import { beginFormSubmit, subscribeSubmit } from '../../../../shared/utils/form-submit.util';
import { OrdenesService } from '../../services/ordenes.service';

@Component({
  selector: 'app-orden-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './orden-form.component.html',
  styleUrls: ['./orden-form.component.css'],
})
export class OrdenFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ordenesService = inject(OrdenesService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  form!: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  isEditMode = signal(false);
  ordenId: string | null = null;

  readonly Prioridad = Prioridad;
  readonly prioridadesOptions = Object.values(Prioridad);

  ngOnInit(): void {
    this.ordenId = this.route.snapshot.paramMap.get('id');
    this.isEditMode.set(!!this.ordenId);

    this.initForm();

    if (this.isEditMode() && this.ordenId) {
      this.loadOrden(this.ordenId);
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      descripcion: ['', [Validators.required, Validators.maxLength(1000)]],
      cliente: ['', [Validators.required, Validators.maxLength(200)]],
      prioridad: [Prioridad.MEDIA, Validators.required],
      fechaFinEstimada: [''],
      presupuestoEstimado: [null, [Validators.min(0)]],
      asignadoId: [''],
      requiereHES: [false],
    });
  }

  loadOrden(id: string): void {
    this.loading.set(true);
    this.ordenesService
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: orden => {
          this.form.patchValue({
            descripcion: orden.descripcion,
            cliente: orden.cliente,
            prioridad: orden.prioridad,
            fechaFinEstimada: orden.fechaFinEstimada
              ? new Date(orden.fechaFinEstimada).toISOString().split('T')[0]
              : '',
            presupuestoEstimado: orden.presupuestoEstimado,
            asignadoId: orden.asignadoId || '',
            requiereHES: orden.requiereHES,
          });
          this.loading.set(false);
        },
        error: err => {
          this.error.set('Error al cargar la orden');
          this.loading.set(false);
        },
      });
  }

  onSubmit(): void {
    if (!beginFormSubmit(this.form, this.loading, this.error)) return;

    const formValue = this.form.value;
    const dto = {
      ...formValue,
      presupuestoEstimado: formValue.presupuestoEstimado
        ? Number(formValue.presupuestoEstimado)
        : null,
      fechaFinEstimada: formValue.fechaFinEstimada || null,
      asignadoId: formValue.asignadoId || null,
    };

    const request$ =
      this.isEditMode() && this.ordenId
        ? this.ordenesService.update(this.ordenId, dto)
        : this.ordenesService.create(dto);

    subscribeSubmit(
      request$,
      this.destroyRef,
      this.loading,
      this.error,
      orden => this.router.navigate(['/orders', orden.id]),
      'Error al guardar la orden'
    );
  }

  onCancel(): void {
    if (this.isEditMode() && this.ordenId) {
      this.router.navigate(['/orders', this.ordenId]);
    } else {
      this.router.navigate(['/orders']);
    }
  }

  hasError(field: string, error: string): boolean {
    return hasControlError(this.form, field, error);
  }

  getErrorMessage(field: string): string {
    return getDefaultControlErrorMessage(this.form, field);
  }
}
