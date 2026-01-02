import { Component, OnInit, inject } from '@angular/core';

import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdvancedTableComponent, TableColumn, TableAction } from '../../../shared/components/advanced-table/advanced-table.component';
import { ModalComponent, ModalConfig, ModalAction } from '../../../shared/components/modal/modal.component';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'operador' | 'cliente';
  estado: 'activo' | 'inactivo';
  fechaCreacion: string;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    AdvancedTableComponent,
    ModalComponent
],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Gestión de Usuarios</h1>
          <p class="text-gray-600 dark:text-gray-400">Administra los usuarios del sistema</p>
        </div>
        <button
          (click)="openCreateModal()"
          class="px-6 py-2.5 bg-cermont-primary-600 text-white rounded-lg hover:bg-cermont-primary-700 font-medium transition"
        >
          + Nuevo Usuario
        </button>
      </div>

      <!-- Filtros -->
      <div class="flex flex-col md:flex-row gap-3">
        <select
          [(ngModel)]="filterRol"
          (change)="applyFilters()"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cermont-primary-500"
        >
          <option value="">Todos los roles</option>
          <option value="admin">Admin</option>
          <option value="operador">Operador</option>
          <option value="cliente">Cliente</option>
        </select>

        <select
          [(ngModel)]="filterEstado"
          (change)="applyFilters()"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cermont-primary-500"
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>

      <!-- Tabla -->
      <app-advanced-table
        [columns]="columns"
        [data]="filteredUsuarios"
        [actions]="tableActions"
        [selectable]="true"
      ></app-advanced-table>

      <!-- Modal: Crear/Editar Usuario -->
      <app-modal
        [config]="modalConfig"
        [actions]="modalActions"
        [isOpen]="showModal"
        (closeEvent)="closeModal()"
      >
        <form [formGroup]="usuarioForm" class="space-y-4">
          <!-- Nombre -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre Completo</label>
            <input
              type="text"
              formControlName="nombre"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cermont-primary-500"
              placeholder="Juan Pérez"
            />
          </div>

          <!-- Email -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input
              type="email"
              formControlName="email"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cermont-primary-500"
              placeholder="juan@example.com"
            />
          </div>

          <!-- Rol -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rol</label>
            <select
              formControlName="rol"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cermont-primary-500"
            >
              <option value="admin">Admin</option>
              <option value="operador">Operador</option>
              <option value="cliente">Cliente</option>
            </select>
          </div>

          <!-- Contraseña (solo crear) -->
          @if (!editingId) {
            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contraseña</label>
              <input
                type="password"
                formControlName="password"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cermont-primary-500"
                placeholder="••••••••"
              />
            </div>
          }

          <!-- Estado -->
          <div class="form-group">
            <label class="flex items-center gap-2">
              <input type="checkbox" formControlName="activo" class="rounded" />
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Usuario Activo</span>
            </label>
          </div>
        </form>
      </app-modal>

      <!-- Modal: Confirmación de Eliminación -->
      <app-modal
        [config]="confirmDeleteConfig"
        [actions]="confirmDeleteActions"
        [isOpen]="showDeleteConfirm"
        (closeEvent)="closeDeleteConfirm()"
      >
        <p class="text-gray-700 dark:text-gray-300">
          ¿Estás seguro de que deseas eliminar al usuario
          <strong>{{ usuarioToDelete?.nombre }}</strong
          >? Esta acción no se puede deshacer.
        </p>
      </app-modal>
    </div>
  `,
  styles: []
})
export class UsuariosComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  columns: TableColumn[] = [
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'rol', label: 'Rol', sortable: true },
    { key: 'estado', label: 'Estado', sortable: true },
    { key: 'fechaCreacion', label: 'Fecha Creación', sortable: true },
  ];

  usuarios: Usuario[] = [];
  filteredUsuarios: Usuario[] = [];
  filterRol = '';
  filterEstado = '';

  showModal = false;
  showDeleteConfirm = false;
  editingId: string | null = null;
  usuarioToDelete: Usuario | null = null;

  usuarioForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    rol: ['operador', Validators.required],
    password: ['', Validators.required],
    activo: [true],
  });
  modalConfig: ModalConfig = {
    title: 'Nuevo Usuario',
    subtitle: 'Completa los datos para crear un nuevo usuario',
    size: 'md',
  };

  confirmDeleteConfig: ModalConfig = {
    title: 'Confirmar Eliminación',
    subtitle: 'Esta acción es irreversible',
    size: 'sm',
  };

  tableActions: TableAction[] = [
    {
      label: 'Editar',
      icon: '✏️',
      color: 'primary',
      onClick: (item) => this.editUsuario(item),
    },
    {
      label: 'Eliminar',
      icon: '🗑️',
      color: 'error',
      onClick: (item) => this.confirmDelete(item),
    },
  ];

  modalActions: ModalAction[] = [
    {
      label: 'Cancelar',
      type: 'secondary',
      onClick: () => this.closeModal(),
    },
    {
      label: 'Guardar',
      type: 'primary',
      onClick: () => this.saveUsuario(),
    },
  ];

  confirmDeleteActions: ModalAction[] = [
    {
      label: 'Cancelar',
      type: 'secondary',
      onClick: () => this.closeDeleteConfirm(),
    },
    {
      label: 'Eliminar',
      type: 'danger',
      onClick: () => this.deleteUsuario(),
    },
  ];

  ngOnInit() {
    this.loadUsuarios();
  }

  private loadUsuarios() {
    // Datos simulados
    this.usuarios = [
      {
        id: '1',
        nombre: 'Juan Admin',
        email: 'admin@cermont.com',
        rol: 'admin',
        estado: 'activo',
        fechaCreacion: '2025-01-01',
      },
      {
        id: '2',
        nombre: 'María Operadora',
        email: 'maria@cermont.com',
        rol: 'operador',
        estado: 'activo',
        fechaCreacion: '2025-06-15',
      },
      {
        id: '3',
        nombre: 'Pedro Cliente',
        email: 'pedro@cliente.com',
        rol: 'cliente',
        estado: 'activo',
        fechaCreacion: '2025-11-20',
      },
    ];
    this.applyFilters();
  }

  applyFilters() {
    this.filteredUsuarios = this.usuarios.filter(usuario => {
      if (this.filterRol && usuario.rol !== this.filterRol) return false;
      if (this.filterEstado && usuario.estado !== this.filterEstado) return false;
      return true;
    });
  }

  openCreateModal() {
    this.editingId = null;
    this.usuarioForm.reset({ activo: true });
    this.modalConfig.title = 'Nuevo Usuario';
    this.usuarioForm.get('password')?.setValidators(Validators.required);
    this.showModal = true;
  }

  editUsuario(usuario: Usuario) {
    this.editingId = usuario.id;
    this.usuarioForm.patchValue(usuario);
    this.usuarioForm.get('password')?.clearValidators();
    this.modalConfig.title = 'Editar Usuario';
    this.showModal = true;
  }

  saveUsuario() {
    if (this.usuarioForm.valid) {
      if (this.editingId) {
        // Actualizar usuario existente
        const index = this.usuarios.findIndex(u => u.id === this.editingId);
        if (index > -1) {
          this.usuarios[index] = {
            ...this.usuarios[index],
            ...this.usuarioForm.value,
          };
        }
      } else {
        // Crear nuevo usuario
        const newUsuario: Usuario = {
          id: Date.now().toString(),
          ...this.usuarioForm.value,
          estado: this.usuarioForm.get('activo')?.value ? 'activo' : 'inactivo',
          fechaCreacion: new Date().toISOString().split('T')[0],
        };
        this.usuarios.push(newUsuario);
      }
      this.applyFilters();
      this.closeModal();
    }
  }

  confirmDelete(usuario: Usuario) {
    this.usuarioToDelete = usuario;
    this.showDeleteConfirm = true;
  }

  deleteUsuario() {
    if (this.usuarioToDelete) {
      this.usuarios = this.usuarios.filter(u => u.id !== this.usuarioToDelete!.id);
      this.applyFilters();
      this.closeDeleteConfirm();
    }
  }

  closeModal() {
    this.showModal = false;
  }

  closeDeleteConfirm() {
    this.showDeleteConfirm = false;
    this.usuarioToDelete = null;
  }
}
