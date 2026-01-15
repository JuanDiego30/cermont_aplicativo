---
name: rxjs-patterns
description: Experto en RxJS para Angular y aplicaciones reactivas. Usar para operadores avanzados, manejo de streams, patrones de estado y optimización de observables.
triggers:
  - RxJS
  - Observable
  - Subject
  - BehaviorSubject
  - pipe
  - operators
  - stream
  - reactive
  - subscription
role: specialist
scope: implementation
output-format: code
---

# RxJS Advanced Patterns

Especialista en programación reactiva con RxJS para Angular y Node.js.

## Rol

Desarrollador senior con 7+ años de experiencia en programación reactiva. Experto en RxJS, streams de datos, manejo de estado reactivo y optimización de observables.

## Cuándo Usar Este Skill

- Implementar flujos de datos reactivos
- Combinar múltiples observables
- Manejar errores en streams
- Optimizar subscriptions
- Implementar caché reactivo
- Polling y retry patterns
- Estado reactivo con Subjects
- Debounce, throttle y buffer

## Operadores Esenciales por Categoría

### Creación

```typescript
import { of, from, interval, timer, fromEvent, EMPTY, throwError } from 'rxjs';

// Valores estáticos
const static$ = of(1, 2, 3);

// Desde Promise o Array
const fromPromise$ = from(fetch('/api/data').then(r => r.json()));
const fromArray$ = from([1, 2, 3]);

// Intervalos
const interval$ = interval(1000); // Emite 0, 1, 2... cada segundo
const timer$ = timer(5000, 1000); // Espera 5s, luego emite cada 1s

// Eventos DOM
const clicks$ = fromEvent(document, 'click');

// Vacío o Error
const empty$ = EMPTY;
const error$ = throwError(() => new Error('Something went wrong'));
```

### Transformación

```typescript
import { map, mergeMap, switchMap, concatMap, exhaustMap, scan } from 'rxjs/operators';

// map - Transformar valores
const doubled$ = numbers$.pipe(
  map(n => n * 2)
);

// switchMap - Cancelar anterior, usar nuevo (búsquedas, autocomplete)
const searchResults$ = searchTerm$.pipe(
  debounceTime(300),
  switchMap(term => this.http.get(`/api/search?q=${term}`))
);

// mergeMap - Ejecutar en paralelo (múltiples requests)
const allResults$ = ids$.pipe(
  mergeMap(id => this.http.get(`/api/items/${id}`), 5) // max 5 concurrent
);

// concatMap - Ejecutar en secuencia (orden garantizado)
const orderedResults$ = actions$.pipe(
  concatMap(action => this.processAction(action))
);

// exhaustMap - Ignorar mientras hay request activo (evitar doble click)
const submit$ = submitClick$.pipe(
  exhaustMap(() => this.http.post('/api/submit', data))
);

// scan - Acumular valores (reducer pattern)
const total$ = prices$.pipe(
  scan((acc, price) => acc + price, 0)
);
```

### Filtrado

```typescript
import { filter, distinctUntilChanged, take, takeUntil, skip, first, last } from 'rxjs/operators';

// filter - Filtrar por condición
const adults$ = users$.pipe(
  filter(user => user.age >= 18)
);

// distinctUntilChanged - Solo emitir si cambió
const uniqueSearch$ = search$.pipe(
  distinctUntilChanged()
);

// Con comparador personalizado
const uniqueUsers$ = users$.pipe(
  distinctUntilChanged((prev, curr) => prev.id === curr.id)
);

// take/skip
const first5$ = numbers$.pipe(take(5));
const skipFirst3$ = numbers$.pipe(skip(3));

// takeUntil - Completar cuando otro emita (cleanup pattern)
const data$ = source$.pipe(
  takeUntil(this.destroy$)
);
```

### Combinación

```typescript
import { combineLatest, forkJoin, merge, concat, zip, withLatestFrom } from 'rxjs';

// combineLatest - Emitir cuando cualquiera emita (necesita todos)
const combined$ = combineLatest([user$, settings$, notifications$]).pipe(
  map(([user, settings, notifications]) => ({ user, settings, notifications }))
);

// forkJoin - Esperar todos completen (parallel requests)
const allData$ = forkJoin({
  users: this.http.get('/api/users'),
  products: this.http.get('/api/products'),
  orders: this.http.get('/api/orders'),
});

// merge - Combinar streams (cualquiera emite)
const allClicks$ = merge(
  fromEvent(button1, 'click'),
  fromEvent(button2, 'click'),
);

// withLatestFrom - Combinar con último valor de otro
const enrichedAction$ = action$.pipe(
  withLatestFrom(user$),
  map(([action, user]) => ({ ...action, userId: user.id }))
);
```

### Timing

```typescript
import { debounceTime, throttleTime, delay, timeout, auditTime } from 'rxjs/operators';

// debounceTime - Esperar que pare de emitir (búsqueda)
const debouncedSearch$ = searchInput$.pipe(
  debounceTime(300),
  distinctUntilChanged()
);

// throttleTime - Limitar frecuencia (scroll, resize)
const throttledScroll$ = scroll$.pipe(
  throttleTime(100)
);

// auditTime - Último valor en ventana de tiempo
const audited$ = source$.pipe(
  auditTime(1000) // Emite último valor cada segundo
);

// delay - Retrasar emisiones
const delayed$ = source$.pipe(delay(1000));

// timeout - Error si no emite en tiempo
const withTimeout$ = source$.pipe(
  timeout(5000)
);
```

### Manejo de Errores

```typescript
import { catchError, retry, retryWhen, tap } from 'rxjs/operators';
import { timer } from 'rxjs';

// catchError - Manejar error y continuar
const safe$ = riskyOperation$.pipe(
  catchError(error => {
    console.error('Error:', error);
    return of(defaultValue); // Valor fallback
  })
);

// retry - Reintentar N veces
const resilient$ = httpRequest$.pipe(
  retry(3)
);

// retry con delay exponencial
const exponentialRetry$ = httpRequest$.pipe(
  retryWhen(errors => errors.pipe(
    scan((retryCount, error) => {
      if (retryCount >= 3) throw error;
      return retryCount + 1;
    }, 0),
    delayWhen(retryCount => timer(Math.pow(2, retryCount) * 1000))
  ))
);

// retry moderno (RxJS 7+)
import { retry } from 'rxjs';

const modernRetry$ = httpRequest$.pipe(
  retry({
    count: 3,
    delay: (error, retryCount) => timer(retryCount * 1000),
    resetOnSuccess: true,
  })
);
```

## Patrones Comunes

### Estado Reactivo con BehaviorSubject

```typescript
// state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

interface AppState {
  user: User | null;
  isLoading: boolean;
  notifications: Notification[];
}

@Injectable({ providedIn: 'root' })
export class StateService {
  private readonly state$ = new BehaviorSubject<AppState>({
    user: null,
    isLoading: false,
    notifications: [],
  });

  // Selectores
  readonly user$ = this.select(state => state.user);
  readonly isLoading$ = this.select(state => state.isLoading);
  readonly notifications$ = this.select(state => state.notifications);
  readonly notificationCount$ = this.notifications$.pipe(
    map(n => n.length)
  );

  private select<T>(selector: (state: AppState) => T): Observable<T> {
    return this.state$.pipe(
      map(selector),
      distinctUntilChanged()
    );
  }

  // Acciones
  setUser(user: User | null): void {
    this.updateState({ user });
  }

  setLoading(isLoading: boolean): void {
    this.updateState({ isLoading });
  }

  addNotification(notification: Notification): void {
    const current = this.state$.value.notifications;
    this.updateState({ notifications: [...current, notification] });
  }

  private updateState(partial: Partial<AppState>): void {
    this.state$.next({ ...this.state$.value, ...partial });
  }
}
```

### Cache Pattern

```typescript
// cache.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, shareReplay, timer } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CacheService {
  private cache = new Map<string, Observable<any>>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  get<T>(key: string, fetcher: () => Observable<T>): Observable<T> {
    if (!this.cache.has(key)) {
      this.cache.set(
        key,
        fetcher().pipe(
          shareReplay({ bufferSize: 1, refCount: true }),
          tap({
            complete: () => {
              timer(this.CACHE_DURATION).subscribe(() => {
                this.cache.delete(key);
              });
            },
          })
        )
      );
    }
    return this.cache.get(key) as Observable<T>;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidateAll(): void {
    this.cache.clear();
  }
}

// Uso
const users$ = this.cacheService.get('users', () => 
  this.http.get<User[]>('/api/users')
);
```

### Polling Pattern

```typescript
// polling.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { Subject, timer, switchMap, takeUntil, retry, shareReplay } from 'rxjs';

@Injectable()
export class PollingService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly pause$ = new Subject<boolean>();

  poll<T>(
    fetcher: () => Observable<T>,
    intervalMs: number = 30000
  ): Observable<T> {
    return timer(0, intervalMs).pipe(
      switchMap(() => fetcher()),
      retry({ count: 3, delay: 1000 }),
      takeUntil(this.destroy$),
      shareReplay(1)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// Uso en componente
readonly orders$ = this.pollingService.poll(
  () => this.orderService.getActiveOrders(),
  10000 // Cada 10 segundos
);
```

### Cleanup con takeUntil

```typescript
// component.ts
import { Component, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-example',
  template: `...`,
})
export class ExampleComponent implements OnDestroy {
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Todas las subscriptions se limpian automáticamente
    this.userService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => this.handleUser(user));

    this.dataService.data$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.handleData(data));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Async Pipe (Angular)

```typescript
// Mejor práctica: usar async pipe en lugar de subscribe
@Component({
  selector: 'app-users',
  template: `
    <div *ngIf="loading$ | async; else content">
      <app-spinner />
    </div>
    
    <ng-template #content>
      <ul>
        <li *ngFor="let user of users$ | async">
          {{ user.name }}
        </li>
      </ul>
    </ng-template>
  `,
})
export class UsersComponent {
  readonly users$ = this.userService.getUsers().pipe(
    shareReplay(1)
  );
  
  readonly loading$ = this.users$.pipe(
    map(() => false),
    startWith(true)
  );
}
```

### Signals + RxJS (Angular 16+)

```typescript
import { Component, signal, computed } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-modern',
  template: `
    <p>Count: {{ count() }}</p>
    <p>Doubled: {{ doubled() }}</p>
  `,
})
export class ModernComponent {
  // Observable a Signal
  readonly users = toSignal(this.userService.users$, { initialValue: [] });
  
  // Signal a Observable
  readonly searchTerm = signal('');
  readonly searchTerm$ = toObservable(this.searchTerm);
  
  // Computed Signal
  readonly doubled = computed(() => this.count() * 2);
  
  // Combinar con RxJS
  readonly searchResults = toSignal(
    this.searchTerm$.pipe(
      debounceTime(300),
      switchMap(term => this.searchService.search(term))
    ),
    { initialValue: [] }
  );
}
```

## Anti-Patterns a Evitar

```typescript
// ❌ Nested subscriptions
data$.subscribe(data => {
  this.otherService.process(data).subscribe(result => {
    // Nested hell
  });
});

// ✅ Usar operadores
data$.pipe(
  switchMap(data => this.otherService.process(data))
).subscribe(result => {
  // Flat
});

// ❌ Subscribe sin cleanup
ngOnInit() {
  this.data$.subscribe(); // Memory leak!
}

// ✅ Con takeUntil o async pipe
ngOnInit() {
  this.data$.pipe(takeUntil(this.destroy$)).subscribe();
}

// ❌ Múltiples subscriptions al mismo observable
const data$ = this.http.get('/api/data');
data$.subscribe(a => console.log(a));
data$.subscribe(b => console.log(b)); // Dos HTTP requests!

// ✅ shareReplay
const data$ = this.http.get('/api/data').pipe(shareReplay(1));
data$.subscribe(a => console.log(a));
data$.subscribe(b => console.log(b)); // Una sola request
```

## Restricciones

### DEBE HACER
- Usar takeUntil para cleanup
- Preferir async pipe sobre subscribe
- Usar operadores higher-order (switchMap, mergeMap)
- shareReplay para compartir requests HTTP
- Tipar los observables explícitamente

### NO DEBE HACER
- Nested subscriptions
- Subscribe sin unsubscribe
- Múltiples subscriptions sin share
- Usar any en observables
- Ignorar errores en streams

## Skills Relacionados

- **angular-architect** - Integración con Angular
- **jest-testing** - Testing de observables
- **clean-architecture** - Servicios reactivos
