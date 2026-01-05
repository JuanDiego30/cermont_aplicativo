import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OrdenesApi } from '@app/core/api/ordenes.api';
import { ToastService } from '@app/shared/services/toast.service';
import { catchError, tap, throwError, Subject, takeUntil } from 'rxjs';

interface Orden {
  id: string;
  numero: string;
  cliente: string;
  fecha: string;
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
  total: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

@Component({
  selector: 'app-ordenes-list',
  templateUrl: './ordenes-list.component.html',
  styleUrls: ['./ordenes-list.component.scss']
})
export class OrdenesListComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private ordenesApi = inject(OrdenesApi);
  private toastService = inject(ToastService);
  private readonly destroy$ = new Subject<void>();

  ordenes: Orden[] = [];
  loading = false;
  total = 0;
  currentPage = 1;
  pageSize = 10;
  searchForm!: FormGroup;

  estados = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_progreso', label: 'En Progreso' },
    { value: 'completada', label: 'Completada' },
    { value: 'cancelada', label: 'Cancelada' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadOrdenes(1);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.searchForm = this.fb.group({
      search: [''],
      estado: ['']
    });
  }

  private loadOrdenes(page: number): void {
    this.loading = true;
    const filters = this.searchForm.value;

    this.ordenesApi.list({ page, limit: this.pageSize, ...filters })
      .pipe(
        takeUntil(this.destroy$),
        tap((response: any) => {
          this.ordenes = response.data;
          this.total = response.total;
          this.currentPage = page;
          this.loading = false;
        }),
        catchError((err: any) => {
          this.loading = false;
          this.toastService.error('Error cargando órdenes');
          return throwError(() => err);
        })
      )
      .subscribe();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadOrdenes(1);
  }

  onPageChange(page: number): void {
    this.loadOrdenes(page);
  }

  onDelete(id: string): void {
    if (!confirm('¿Estas seguro de que deseas eliminar esta orden?')) {
      return;
    }

    this.loading = true;
    this.ordenesApi.delete(id)
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.toastService.success('Orden eliminada correctamente');
          this.loadOrdenes(this.currentPage);
        }),
        catchError((err) => {
          this.loading = false;
          this.toastService.error('Error eliminando orden');
          return throwError(() => err);
        })
      )
      .subscribe();
  }

  getEstadoClass(estado: string): string {
    const classes: { [key: string]: string } = {
      'pendiente': 'badge-warning',
      'en_progreso': 'badge-info',
      'completada': 'badge-success',
      'cancelada': 'badge-danger'
    };
    return classes[estado] || 'badge-secondary';
  }
}
