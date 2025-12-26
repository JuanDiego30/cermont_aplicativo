import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { OrdenesService } from '../../services/ordenes.service';
import { Prioridad } from '../../../../core/models/orden.model';

@Component({
  selector: 'app-orden-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './orden-form.component.html',
  styleUrls: ['./orden-form.component.css']
})
export class OrdenFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ordenesService = inject(OrdenesService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

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
    this.ordenesService.getById(id).subscribe({
      next: (orden) => {
        this.form.patchValue({
          descripcion: orden.descripcion,
          cliente: orden.cliente,
          prioridad: orden.prioridad,
          fechaFinEstimada: orden.fechaFinEstimada ?
            new Date(orden.fechaFinEstimada).toISOString().split('T')[0] : '',
          presupuestoEstimado: orden.presupuestoEstimado,
          asignadoId: orden.asignadoId || '',
          requiereHES: orden.requiereHES,
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar la orden');
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formValue = this.form.value;
    const dto = {
      ...formValue,
      presupuestoEstimado: formValue.presupuestoEstimado ?
        Number(formValue.presupuestoEstimado) : null,
      fechaFinEstimada: formValue.fechaFinEstimada || null,
      asignadoId: formValue.asignadoId || null,
    };

    const request$ = this.isEditMode() && this.ordenId
      ? this.ordenesService.update(this.ordenId, dto)
      : this.ordenesService.create(dto);

    request$.subscribe({
      next: (orden) => {
        this.router.navigate(['/ordenes', orden.id]);
      },
      error: (err) => {
        this.error.set(err.message || 'Error al guardar la orden');
        this.loading.set(false);
      }
    });
  }

  onCancel(): void {
    if (this.isEditMode() && this.ordenId) {
      this.router.navigate(['/ordenes', this.ordenId]);
    } else {
      this.router.navigate(['/ordenes']);
    }
  }

  hasError(field: string, error: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.hasError(error) && control.touched);
  }

  getErrorMessage(field: string): string {
    const control = this.form.get(field);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;
    if (errors['required']) return 'Este campo es requerido';
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['min']) return `El valor mínimo es ${errors['min'].min}`;

    return 'Campo inválido';
  }
}