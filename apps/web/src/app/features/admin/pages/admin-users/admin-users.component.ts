import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, catchError, tap, throwError } from 'rxjs';
import { AdminApi } from '@app/core/api/admin.api';
import { ToastService } from '@app/shared/services/toast.service';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'user';
  estado: 'activo' | 'inactivo';
  fechaCreacion: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private fb = inject(FormBuilder);
  private adminApi = inject(AdminApi);
  private toastService = inject(ToastService);

  usuarios: Usuario[] = [];
  loading = false;
  total = 0;
  currentPage = 1;
  pageSize = 10;
  searchForm!: FormGroup;

  roles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'user', label: 'Usuario' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadUsuarios(1);
  }

  private initForm(): void {
    this.searchForm = this.fb.group({
      search: [''],
      rol: ['']
    });
  }

  private loadUsuarios(page: number): void {
    this.loading = true;
    const filters = this.searchForm.value;

    this.adminApi.listUsers(page, this.pageSize, filters)
      .pipe(
        takeUntil(this.destroy$),
        tap((response: PaginatedResponse<Usuario>) => {
          this.usuarios = response.data;
          this.total = response.total;
          this.currentPage = page;
          this.loading = false;
        }),
        catchError((err) => {
          this.loading = false;
          this.toastService.error('Error cargando usuarios');
          return throwError(() => err);
        })
      )
      .subscribe();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadUsuarios(1);
  }

  onPageChange(page: number): void {
    this.loadUsuarios(page);
  }

  onChangeRole(usuarioId: string, nuevoRol: string): void {
    this.loading = true;

    this.adminApi.updateUserRole(usuarioId, nuevoRol)
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.toastService.success('Rol actualizado correctamente');
          this.loadUsuarios(this.currentPage);
        }),
        catchError((err) => {
          this.loading = false;
          this.toastService.error('Error actualizando rol del usuario');
          return throwError(() => err);
        })
      )
      .subscribe();
  }

  onToggleStatus(usuarioId: string, estadoActual: string): void {
    const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
    this.loading = true;

    this.adminApi.updateUserStatus(usuarioId, nuevoEstado)
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.toastService.success(`Usuario ${nuevoEstado} correctamente`);
          this.loadUsuarios(this.currentPage);
        }),
        catchError((err) => {
          this.loading = false;
          this.toastService.error('Error actualizando estado del usuario');
          return throwError(() => err);
        })
      )
      .subscribe();
  }

  onDelete(usuarioId: string): void {
    if (!confirm('¿Estas seguro de que deseas eliminar este usuario?')) {
      return;
    }

    this.loading = true;
    this.adminApi.deleteUser(usuarioId)
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.toastService.success('Usuario eliminado correctamente');
          this.loadUsuarios(this.currentPage);
        }),
        catchError((err) => {
          this.loading = false;
          this.toastService.error('Error eliminando usuario');
          return throwError(() => err);
        })
      )
      .subscribe();
  }

  getEstadoClass(estado: string): string {
    return estado === 'activo' ? 'badge-success' : 'badge-danger';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
