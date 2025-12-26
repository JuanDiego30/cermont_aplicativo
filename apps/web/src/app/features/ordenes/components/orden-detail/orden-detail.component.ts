import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrdenesService } from '../../services/ordenes.service';
import { Orden, OrdenEstado, Prioridad, HistorialEstado, ChangeEstadoOrdenDto } from '../../../../core/models/orden.model';

@Component({
  selector: 'app-orden-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './orden-detail.component.html',
  styleUrls: ['./orden-detail.component.css']
})
export class OrdenDetailComponent implements OnInit {
  private readonly ordenesService = inject(OrdenesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  orden = signal<Orden | null>(null);
  historial = signal<HistorialEstado[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Modal de cambio de estado
  showEstadoModal = signal(false);
  nuevoEstado = signal<OrdenEstado | ''>('');
  motivoCambio = signal('');
  changingEstado = signal(false);

  // Modal de asignar técnico
  showAsignarTecnicoModal = signal(false);
  tecnicoId = signal('');
  assigningTecnico = signal(false);

  // Modal de eliminar
  showDeleteModal = signal(false);
  deleting = signal(false);

  // Computed
  readonly OrdenEstado = OrdenEstado;
  readonly Prioridad = Prioridad;
  readonly estadosOptions = Object.values(OrdenEstado);
  
  allowedEstados = computed(() => {
    const currentEstado = this.orden()?.estado;
    if (!currentEstado) return [];
    
    // Lógica de transiciones permitidas
    const transitions: Record<OrdenEstado, OrdenEstado[]> = {
      [OrdenEstado.PENDIENTE]: [OrdenEstado.PLANEACION, OrdenEstado.CANCELADA],
      [OrdenEstado.PLANEACION]: [OrdenEstado.EN_PROGRESO, OrdenEstado.PENDIENTE, OrdenEstado.CANCELADA],
      [OrdenEstado.EN_PROGRESO]: [OrdenEstado.EJECUCION, OrdenEstado.PLANEACION, OrdenEstado.CANCELADA],
      [OrdenEstado.EJECUCION]: [OrdenEstado.COMPLETADA, OrdenEstado.PLANEACION, OrdenEstado.CANCELADA],
      [OrdenEstado.COMPLETADA]: [OrdenEstado.ARCHIVADA],
      [OrdenEstado.CANCELADA]: [OrdenEstado.PENDIENTE],
      [OrdenEstado.ARCHIVADA]: [],
    };
    
    return transitions[currentEstado as OrdenEstado] || [];
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrden(id);
      this.loadHistorial(id);
    }
  }

  loadOrden(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.ordenesService.getById(id).subscribe({
      next: (orden) => {
        this.orden.set(orden);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Error al cargar la orden');
        this.loading.set(false);
      }
    });
  }

  loadHistorial(id: string): void {
    this.ordenesService.getHistorial(id).subscribe({
      next: (historial) => {
        this.historial.set(historial);
      },
      error: (err) => {
        console.error('Error al cargar historial:', err);
      }
    });
  }

  openEstadoModal(): void {
    this.nuevoEstado.set('');
    this.motivoCambio.set('');
    this.showEstadoModal.set(true);
  }

  closeEstadoModal(): void {
    this.showEstadoModal.set(false);
    this.nuevoEstado.set('');
    this.motivoCambio.set('');
  }

  onCambiarEstado(): void {
    const orden = this.orden();
    const estado = this.nuevoEstado();
    
    if (!orden || !estado) return;

    // Validar que requiere motivo para ciertos estados
    const requiresReason = [OrdenEstado.CANCELADA, OrdenEstado.COMPLETADA].includes(estado as OrdenEstado);
    if (requiresReason && !this.motivoCambio().trim()) {
      alert('Debes proporcionar un motivo para este cambio de estado');
      return;
    }

    this.changingEstado.set(true);

    const dto: ChangeEstadoOrdenDto = {
      nuevoEstado: estado as OrdenEstado,
      motivo: this.motivoCambio().trim() || undefined,
    };

    this.ordenesService.changeEstado(orden.id, dto).subscribe({
      next: (updatedOrden) => {
        this.orden.set(updatedOrden);
        this.loadHistorial(orden.id);
        this.closeEstadoModal();
        this.changingEstado.set(false);
      },
      error: (err) => {
        alert(err.message || 'Error al cambiar el estado');
        this.changingEstado.set(false);
      }
    });
  }

  openAsignarTecnicoModal(): void {
    this.tecnicoId.set(this.orden()?.asignadoId || '');
    this.showAsignarTecnicoModal.set(true);
  }

  closeAsignarTecnicoModal(): void {
    this.showAsignarTecnicoModal.set(false);
    this.tecnicoId.set('');
  }

  onAsignarTecnico(): void {
    const orden = this.orden();
    const tecnicoId = this.tecnicoId().trim();
    
    if (!orden || !tecnicoId) return;

    this.assigningTecnico.set(true);

    this.ordenesService.asignarTecnico(orden.id, { tecnicoId }).subscribe({
      next: (updatedOrden) => {
        this.orden.set(updatedOrden);
        this.closeAsignarTecnicoModal();
        this.assigningTecnico.set(false);
      },
      error: (err) => {
        alert(err.message || 'Error al asignar técnico');
        this.assigningTecnico.set(false);
      }
    });
  }

  openDeleteModal(): void {
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
  }

  onDelete(): void {
    const orden = this.orden();
    if (!orden) return;

    this.deleting.set(true);

    this.ordenesService.delete(orden.id).subscribe({
      next: () => {
        this.router.navigate(['/ordenes']);
      },
      error: (err) => {
        alert(err.message || 'Error al eliminar la orden');
        this.deleting.set(false);
      }
    });
  }

  getEstadoColor(estado: OrdenEstado): string {
    const colors: Record<OrdenEstado, string> = {
      [OrdenEstado.PENDIENTE]: 'bg-gray-100 text-gray-800',
      [OrdenEstado.PLANEACION]: 'bg-blue-100 text-blue-800',
      [OrdenEstado.EN_PROGRESO]: 'bg-yellow-100 text-yellow-800',
      [OrdenEstado.EJECUCION]: 'bg-orange-100 text-orange-800',
      [OrdenEstado.COMPLETADA]: 'bg-green-100 text-green-800',
      [OrdenEstado.CANCELADA]: 'bg-red-100 text-red-800',
      [OrdenEstado.ARCHIVADA]: 'bg-gray-100 text-gray-600',
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  }

  getPrioridadColor(prioridad: Prioridad): string {
    const colors: Record<Prioridad, string> = {
      [Prioridad.BAJA]: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
      [Prioridad.MEDIA]: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      [Prioridad.ALTA]: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      [Prioridad.URGENTE]: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    };
    return colors[prioridad] || 'bg-gray-100 text-gray-700';
  }

  formatDate(date: string | null | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number | null | undefined): string {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  getEstadoIcon(estado: OrdenEstado): string {
    const icons: Record<OrdenEstado, string> = {
      [OrdenEstado.PENDIENTE]: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      [OrdenEstado.PLANEACION]: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      [OrdenEstado.EN_PROGRESO]: 'M13 10V3L4 14h7v7l9-11h-7z',
      [OrdenEstado.EJECUCION]: 'M13 10V3L4 14h7v7l9-11h-7z',
      [OrdenEstado.COMPLETADA]: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      [OrdenEstado.CANCELADA]: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      [OrdenEstado.ARCHIVADA]: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
    };
    return icons[estado] || '';
  }

  goBack() {
    this.router.navigate(['/ordenes']);
  }
}
