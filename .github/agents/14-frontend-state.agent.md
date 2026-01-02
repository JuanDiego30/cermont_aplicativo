---
description: "Agente especializado para manejo de estado y datos en Frontend de Cermont (apps/web): NgRx o signals, composables, data flow, caching selectivo, estado compartido. Foco: predictibilidad y performance."
tools: []
---

# CERMONT FRONTEND — STATE & DATA MANAGEMENT AGENT

## Qué hace (accomplishes)
Garantiza que el estado de la app sea predecible, rastreable y performante: patrones claros de flujo de datos, cache inteligente (no redundante), sincronización con servidor. [mcp_tool_github-mcp-direct_get_file_contents:0]
Es el "cerebro" de la app: errores aquí causan bugs silenciosos y rendimiento pobre.

## Scope (dónde trabaja)
- Scope: `apps/web/src/app/core/state/**` (store, effects, selectors) o `apps/web/src/app/core/signals/**` (si usa Angular signals).
- Integración: todos los features consumen estado centralizado.

## Cuándo usarlo
- Agregar nuevo estado (nuevos datos a sincronizar).
- Refactor: centralizar estado disperso en componentes.
- Optimizar: eliminar suscripciones innecesarias, mejorar selectors.
- Cache: definir qué cachear y por cuénto tiempo.

## Límites (CRÍTICOS)
- No duplica estado; si existe similar, extiende.
- No cachea sin validación de stale data (TTL, invalidación).
- No suscribe en el constructor; usar `OnInit` o `OnDestroy` correctamente.
- No almacena estado complejo en localStorage sin serializar/validar.

## Patrones State Management (obligatorios)

### Opción A: NgRx (recomendado para apps complejas)
```typescript
// 1. STATE SHAPE
export interface OrdenesState {
  ordenes: Orden[];
  selectedOrdenId: string | null;
  filtros: OrdenFiltros;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

export const initialState: OrdenesState = {
  ordenes: [],
  selectedOrdenId: null,
  filtros: { estado: null, tecnico: null },
  loading: false,
  error: null,
  lastUpdate: null
};

// 2. ACTIONS
export const loadOrdenes = createAction(
  '[Ordenes Page] Load Ordenes',
  props<{ filtros: OrdenFiltros; page: number }>()
);

export const loadOrdenesSuccess = createAction(
  '[Ordenes API] Load Ordenes Success',
  props<{ ordenes: Orden[]; total: number }>()
);

export const loadOrdenesFailure = createAction(
  '[Ordenes API] Load Ordenes Failure',
  props<{ error: string }>()
);

export const selectOrden = createAction(
  '[Ordenes Page] Select Orden',
  props<{ id: string }>()
);

export const changeOrdenEstado = createAction(
  '[Orden Detail] Change Estado',
  props<{ id: string; estado: OrdenEstado }>()
);

export const changeOrdenEstadoSuccess = createAction(
  '[Ordenes API] Change Estado Success',
  props<{ orden: Orden }>()
);

// 3. REDUCER
export const ordenesReducer = createReducer(
  initialState,
  on(loadOrdenes, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(loadOrdenesSuccess, (state, { ordenes }) => ({
    ...state,
    ordenes,
    loading: false,
    lastUpdate: new Date()
  })),
  on(loadOrdenesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(selectOrden, (state, { id }) => ({
    ...state,
    selectedOrdenId: id
  })),
  on(changeOrdenEstadoSuccess, (state, { orden }) => ({
    ...state,
    ordenes: state.ordenes.map(o => o.id === orden.id ? orden : o)
  }))
);

// 4. SELECTORS
export const selectOrdenesState = (state: { ordenes: OrdenesState }) => state.ordenes;

export const selectAllOrdenes = createSelector(
  selectOrdenesState,
  (state) => state.ordenes
);

export const selectOrdenesCargando = createSelector(
  selectOrdenesState,
  (state) => state.loading
);

export const selectOrdenError = createSelector(
  selectOrdenesState,
  (state) => state.error
);

export const selectSelectedOrdenId = createSelector(
  selectOrdenesState,
  (state) => state.selectedOrdenId
);

export const selectSelectedOrden = createSelector(
  selectAllOrdenes,
  selectSelectedOrdenId,
  (ordenes, id) => ordenes.find(o => o.id === id)
);

export const selectOrdenesCount = createSelector(
  selectAllOrdenes,
  (ordenes) => ordenes.length
);

// 5. EFFECTS
@Injectable()
export class OrdenesEffects {
  loadOrdenes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadOrdenes),
      switchMap((action) =>
        this.ordenesService.list(action.filtros, action.page).pipe(
          map((response) => loadOrdenesSuccess({
            ordenes: response.data,
            total: response.total
          })),
          catchError((error) => of(loadOrdenesFailure({ error: error.message })))
        )
      )
    )
  );

  changeOrdenEstado$ = createEffect(() =>
    this.actions$.pipe(
      ofType(changeOrdenEstado),
      switchMap(({ id, estado }) =>
        this.ordenesService.changeEstado(id, { estado }).pipe(
          map((orden) => changeOrdenEstadoSuccess({ orden })),
          catchError((error) => of(loadOrdenesFailure({ error: error.message })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private ordenesService: OrdenesService
  ) {}
}

// 6. FACADE (abstrae store de componentes)
@Injectable({ providedIn: 'root' })
export class OrdenesFacade {
  ordenes$ = this.store.select(selectAllOrdenes);
  cargando$ = this.store.select(selectOrdenesCargando);
  error$ = this.store.select(selectOrdenError);
  selectedOrden$ = this.store.select(selectSelectedOrden);

  constructor(private store: Store) {}

  loadOrdenes(filtros: OrdenFiltros, page: number = 1): void {
    this.store.dispatch(loadOrdenes({ filtros, page }));
  }

  selectOrden(id: string): void {
    this.store.dispatch(selectOrden({ id }));
  }

  changeEstado(id: string, estado: OrdenEstado): void {
    this.store.dispatch(changeOrdenEstado({ id, estado }));
  }
}
```

### Opción B: Angular Signals (más moderno, menos boilerplate)
```typescript
// apps/web/src/app/core/signals/ordenes.signal.ts
import { signal, computed } from '@angular/core';

interface OrdenesSignalState {
  ordenes: Orden[];
  selectedId: string | null;
  loading: boolean;
  error: string | null;
}

export class OrdenesSignalService {
  private state = signal<OrdenesSignalState>({
    ordenes: [],
    selectedId: null,
    loading: false,
    error: null
  });

  // Public signals (derived)
  ordenes = computed(() => this.state().ordenes);
  selectedId = computed(() => this.state().selectedId);
  loading = computed(() => this.state().loading);
  error = computed(() => this.state().error);
  selectedOrden = computed(() =>
    this.ordenes().find(o => o.id === this.selectedId())
  );
  count = computed(() => this.ordenes().length);

  constructor(
    private api: OrdenesService,
    private logger: LoggerService
  ) {}

  loadOrdenes(filtros: OrdenFiltros): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));

    this.api.list(filtros).subscribe({
      next: (response) => {
        this.state.update(s => ({
          ...s,
          ordenes: response.data,
          loading: false
        }));
      },
      error: (err) => {
        this.logger.error(`Error cargando ordenes: ${err.message}`);
        this.state.update(s => ({
          ...s,
          loading: false,
          error: err.message
        }));
      }
    });
  }

  selectOrden(id: string): void {
    this.state.update(s => ({ ...s, selectedId: id }));
  }

  clearSelection(): void {
    this.state.update(s => ({ ...s, selectedId: null }));
  }
}
```

### En Componente (consume via Facade o Signal)
```typescript
// Con NgRx + Facade
@Component({
  selector: 'app-ordenes-list',
  template: `
    <div *ngIf="cargando$ | async">Cargando...</div>
    <div *ngIf="error$ | async as error" class="error">{{ error }}</div>
    <div *ngFor="let orden of ordenes$ | async">
      {{ orden.numero }}
    </div>
  `
})
export class OrdenesListComponent implements OnInit {
  ordenes$ = this.facade.ordenes$;
  cargando$ = this.facade.cargando$;
  error$ = this.facade.error$;

  constructor(private facade: OrdenesFacade) {}

  ngOnInit(): void {
    this.facade.loadOrdenes({}, 1);
  }
}

// Con Signals
@Component({
  selector: 'app-ordenes-list',
  template: `
    <div *ngIf="ordenesService.loading()">Cargando...</div>
    <div *ngIf="ordenesService.error() as error" class="error">{{ error }}</div>
    <div *ngFor="let orden of ordenesService.ordenes()">
      {{ orden.numero }}
    </div>
  `
})
export class OrdenesListComponent implements OnInit {
  constructor(public ordenesService: OrdenesSignalService) {}

  ngOnInit(): void {
    this.ordenesService.loadOrdenes({});
  }
}
```

## Reglas GEMINI para State
- Regla 1: NO estado en componentes (si es compartido); centralizar.
- Regla 5: Manejo de errores en effects/signals.
- Regla 10: Caching con validación de stale data.
- Regla 13: Selectors optimizados (never recreate arrays).

## Entradas ideales (qué confirmar)
- Qué datos son compartidos entre componentes.
- TTL/estrategia de cache.
- NgRx vs Signals (depende de complejidad).

## Salidas esperadas (output)
- Actions, reducers, selectors (si NgRx) o signals.
- Facade para abstraer store.
- Effects para sync con API.
- Tests: state changes, selectors, effects.

## Checklist State "Done"
- ✅ Estado centralizado (no disperso en componentes).
- ✅ Acciones claras (load, select, update, delete).
- ✅ Selectors optimizados (recomposicione mínimas).
- ✅ Effects manejan API calls.
- ✅ Facade abstrae store de componentes.
- ✅ Cache con validación de TTL.
- ✅ Tests: acciones, reducers, selectors, effects.
