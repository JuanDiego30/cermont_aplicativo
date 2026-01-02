import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrdenesService } from '../../services/ordenes.service';
import { Orden, OrdenEstado, Prioridad, HistorialEstado, ChangeEstadoOrdenDto } from '../../../../core/models/orden.model';
import { logError } from '../../../../core/utils/logger';

@Component({
  selector: 'app-orden-detail',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './orden-detail.component.html',
  styleUrls: ['./orden-detail.component.css']
})
export class OrdenDetailComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
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

  // Modal de asignar tÃ©cnico
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

    // LÃ³gica de transiciones permitidas
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

    this.ordenesService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
    this.ordenesService.getHistorial(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (historial) => {
          this.historial.set(historial);
        },
        error: (err) => {
          logError('Error al cargar historial', err);
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

    this.ordenesService.changeEstado(orden.id, dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
        alert(err.message || 'Error al asignar tÃ©cnico');
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

    this.ordenesService.delete(orden.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/ordenes']);
        },
        error: (err) => {
          alert(err.message || 'Error al eliminar la orden');
          this.deleting.set(false);
        }
      });
  }

  // ... UI helper methods stay the same ...

  goBack() {
    this.router.navigate(['/ordenes']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

