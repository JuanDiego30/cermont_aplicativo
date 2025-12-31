import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OrdenesApi } from '@app/core/api/ordenes.api';
import { ToastService } from '@app/shared/services/toast.service';
import { catchError, tap, throwError } from 'rxjs';
import { Orden } from '@app/core/models/orden.model';

@Component({
  selector: 'app-ordenes-form',
  templateUrl: './ordenes-form.component.html',
  styleUrls: ['./ordenes-form.component.scss']
})
export class OrdenesFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ordenesApi = inject(OrdenesApi);
  private toastService = inject(ToastService);

  form!: FormGroup;
  loading = false;
  isEditMode = false;
  ordenId: string | null = null;

  estados = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_progreso', label: 'En Progreso' },
    { value: 'completada', label: 'Completada' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  private initForm(): void {
    this.form = this.fb.group({
      numero: ['', [Validators.required, Validators.minLength(3)]],
      cliente: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      fecha: ['', Validators.required],
      estado: ['pendiente', Validators.required],
      total: ['', [Validators.required, Validators.min(0)]]
    });
  }

  private checkEditMode(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.ordenId = params['id'];
        this.loadOrden(params['id']);
      }
    });
  }

  private loadOrden(id: string): void {
    this.loading = true;
    this.ordenesApi.getById(id)
      .pipe(
        tap((orden: Orden) => {
          this.form.patchValue(orden);
          this.loading = false;
        }),
        catchError((err) => {
          this.loading = false;
          this.toastService.error('Error cargando orden');
          this.router.navigate(['/ordenes']);
          return throwError(() => err);
        })
      )
      .subscribe();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.toastService.error('Por favor completa todos los campos correctamente');
      return;
    }

    this.loading = true;
    const formData = this.form.value;

    if (this.isEditMode && this.ordenId) {
      this.updateOrden(formData);
    } else {
      this.createOrden(formData);
    }
  }

  private createOrden(formData: Orden): void {
    this.ordenesApi.create(formData)
      .pipe(
        tap(() => {
          this.loading = false;
          this.toastService.success('Orden creada correctamente');
          this.router.navigate(['/ordenes']);
        }),
        catchError((err) => {
          this.loading = false;
          this.toastService.error(err.error?.message || 'Error creando orden');
          return throwError(() => err);
        })
      )
      .subscribe();
  }

  private updateOrden(formData: Orden): void {
    if (!this.ordenId) return;

    this.ordenesApi.update(this.ordenId, formData)
      .pipe(
        tap(() => {
          this.loading = false;
          this.toastService.success('Orden actualizada correctamente');
          this.router.navigate(['/ordenes']);
        }),
        catchError((err) => {
          this.loading = false;
          this.toastService.error(err.error?.message || 'Error actualizando orden');
          return throwError(() => err);
        })
      )
      .subscribe();
  }

  onCancel(): void {
    this.router.navigate(['/ordenes']);
  }
}
