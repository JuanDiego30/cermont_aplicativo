import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import {
  ChangeEstadoOrdenDto,
  HistorialEstado,
  Orden,
  OrdenEstado,
  Prioridad,
} from '../../../../core/models/orden.model';
import { logError } from '../../../../core/utils/logger';
import { OrdersService } from '../../services/orders.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css'],
})
export class OrderDetailComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly ordersService = inject(OrdersService);
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

    // Lógica de transiciones permitidas (aligned with Prisma OrderStatus enum)
    const transitions: Record<OrdenEstado, OrdenEstado[]> = {
      [OrdenEstado.PENDIENTE]: [OrdenEstado.PLANEACION, OrdenEstado.CANCELADA],
      [OrdenEstado.PLANEACION]: [
        OrdenEstado.EJECUCION, // Updated from EN_PROGRESO → EJECUCION (matches Prisma)
        OrdenEstado.PENDIENTE,
        OrdenEstado.CANCELADA,
      ],
      [OrdenEstado.EJECUCION]: [
        OrdenEstado.COMPLETADA,
        OrdenEstado.PAUSADA, // Added: PAUSADA is valid transition (per Prisma schema)
        OrdenEstado.PLANEACION,
        OrdenEstado.CANCELADA,
      ],
      [OrdenEstado.COMPLETADA]: [], // Removed: ARCHIVADA does not exist in Prisma
      [OrdenEstado.PAUSADA]: [OrdenEstado.EJECUCION, OrdenEstado.CANCELADA],
      [OrdenEstado.CANCELADA]: [OrdenEstado.PENDIENTE],
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

    this.ordersService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: orden => {
          this.orden.set(orden);
          this.loading.set(false);
        },
        error: err => {
          this.error.set(err.message || 'Error al cargar la orden');
          this.loading.set(false);
        },
      });
  }

  loadHistorial(id: string): void {
    this.ordersService
      .getHistorial(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: historial => {
          this.historial.set(historial);
        },
        error: err => {
          logError('Error al cargar historial', err);
        },
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
    const requiresReason = [OrdenEstado.CANCELADA, OrdenEstado.COMPLETADA].includes(
      estado as OrdenEstado
    );
    if (requiresReason && !this.motivoCambio().trim()) {
      alert('Debes proporcionar un motivo para este cambio de estado');
      return;
    }

    this.changingEstado.set(true);

    const dto: ChangeEstadoOrdenDto = {
      nuevoEstado: estado as OrdenEstado,
      motivo: this.motivoCambio().trim() || undefined,
    };

    this.ordersService
      .changeEstado(orden.id, dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: updatedOrden => {
          this.orden.set(updatedOrden);
          this.loadHistorial(orden.id);
          this.closeEstadoModal();
          this.changingEstado.set(false);
        },
        error: err => {
          alert(err.message || 'Error al cambiar el estado');
          this.changingEstado.set(false);
        },
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

    this.ordersService.asignarTecnico(orden.id, { tecnicoId }).subscribe({
      next: updatedOrden => {
        this.orden.set(updatedOrden);
        this.closeAsignarTecnicoModal();
        this.assigningTecnico.set(false);
      },
      error: err => {
        alert(err.message || 'Error al asignar técnico');
        this.assigningTecnico.set(false);
      },
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

    this.ordersService
      .delete(orden.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/orders']);
        },
        error: err => {
          alert(err.message || 'Error al eliminar la orden');
          this.deleting.set(false);
        },
      });
  }

  // ... UI helper methods stay the same ...

  goBack() {
    this.router.navigate(['/orders']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
