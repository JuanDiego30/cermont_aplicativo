---
description: "Agente especializado para integración API en Frontend de Cermont (apps/web): contratos API, tipado, interceptors, manejo de errores, retry, caching selectivo. Garantiza sincronización backend-frontend y DX robusta."
tools: []
---

# CERMONT FRONTEND — API INTEGRATION AGENT

## Qué hace (accomplishes)
Garantiza que la integración frontend-backend sea robusta, tipada y mantenible: servicios HTTP, interceptors, DTOs sincronizados, manejo de errores centralizado, retry lógico y caching cuando aplique. [mcp_tool_github-mcp-direct_get_file_contents:0]
Es el "puente" entre Angular y NestJS: errores aquí afectan toda la experiencia del usuario.

## Scope (dónde trabaja)
- Scope: `apps/web/src/app/core/services/**` (ApiService, servicios por feature, interceptors, modelos).
- Integración: frontend con `apps/api/**` endpoints.

## Cuándo usarlo
- Agregar nuevos endpoints o modificar contratos API (DTOs sync). [mcp_tool_github-mcp-direct_get_file_contents:0]
- Mejorar manejo de errores: toasts, retry, fallback.
- Optimizar performance: caching, batching, abort requests antiguos.
- Refactor: centralizar lógica HTTP, eliminar duplicación.

## Límites (CRÍTICOS)
- No cambia contratos API sin confirmación del backend (DTOs deben estar sincronizados). [mcp_tool_github-mcp-direct_get_file_contents:0]
- No hace llamadas HTTP directas en componentes; siempre via servicios. [mcp_tool_github-mcp-direct_get_file_contents:0]
- No cachea sin validación de stale data (TTL claro, invalidación en cambios).
- No expone URLs/secrets en código; todo via `environment.ts` / `ConfigService`.

## Patrones API Integration (obligatorios)

### ApiService Base (centralizado)
```typescript
@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = this.configService.apiUrl; // env.api.baseUrl

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private logger: LoggerService,
    private errorHandler: ApiErrorHandler
  ) {}

  // GET genérico con retry
  get<T>(endpoint: string, options: HttpOptions = {}): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, this.buildOptions(options))
      .pipe(
        retry({ count: options.retryCount ?? 2, delay: 1000 }),
        catchError(error => this.errorHandler.handle(error, endpoint)),
        tap(() => this.logger.debug(`GET ${endpoint} exitoso`))
      );
  }

  // POST con validación de payload
  post<T>(endpoint: string, payload: any, options: HttpOptions = {}): Observable<T> {
    if (!payload) {
      throw new Error(`POST ${endpoint}: payload vacío`);
    }

    return this.http.post<T>(`${this.apiUrl}${endpoint}`, payload, this.buildOptions(options))
      .pipe(
        retry({ count: options.retryCount ?? 1, delay: 500 }),
        catchError(error => this.errorHandler.handle(error, endpoint)),
        tap(() => this.logger.debug(`POST ${endpoint} exitoso`))
      );
  }

  // PATCH para actualizaciones parciales
  patch<T>(endpoint: string, payload: any, options: HttpOptions = {}): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}${endpoint}`, payload, this.buildOptions(options))
      .pipe(
        catchError(error => this.errorHandler.handle(error, endpoint))
      );
  }

  // DELETE con confirmación
  delete<T>(endpoint: string, options: HttpOptions = {}): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`, this.buildOptions(options))
      .pipe(
        catchError(error => this.errorHandler.handle(error, endpoint))
      );
  }

  private buildOptions(options: HttpOptions): object {
    return {
      headers: this.buildHeaders(options.headers),
      params: this.buildParams(options.params)
    };
  }

  private buildParams(params?: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => (httpParams = httpParams.append(key, String(v))));
          } else {
            httpParams = httpParams.set(key, String(value));
          }
        }
      });
    }
    return httpParams;
  }
}
```

### Servicio por Feature (ejemplo: OrdenesService)
```typescript
@Injectable({ providedIn: 'root' })
export class OrdenesService {
  private readonly endpoint = '/ordenes';

  constructor(
    private api: ApiService,
    private cache: CacheService,
    private logger: LoggerService
  ) {}

  // Listar con filtros + paginación
  list(filtros: OrdenFiltros, page: number = 1, limit: number = 10): Observable<OrdenListResponse> {
    const cacheKey = `ordenes_list_${JSON.stringify(filtros)}_${page}_${limit}`;

    // Intentar cache primero
    const cached = this.cache.get<OrdenListResponse>(cacheKey);
    if (cached) {
      return of(cached);
    }

    return this.api.get<OrdenListResponse>(
      this.endpoint,
      {
        params: { ...filtros, page, limit },
        retryCount: 2
      }
    ).pipe(
      tap(response => {
        // Cachear por 5 minutos
        this.cache.set(cacheKey, response, 5 * 60 * 1000);
        this.logger.debug(`Ordenes listadas (${response.data.length} resultados)`);
      })
    );
  }

  // Obtener por ID
  findById(id: string): Observable<Orden> {
    const cacheKey = `orden_${id}`;
    const cached = this.cache.get<Orden>(cacheKey);
    if (cached) return of(cached);

    return this.api.get<Orden>(`${this.endpoint}/${id}`).pipe(
      tap(orden => this.cache.set(cacheKey, orden, 10 * 60 * 1000)) // 10 min
    );
  }

  // Cambiar estado
  changeEstado(id: string, dto: ChangeStatusDto): Observable<Orden> {
    return this.api.post<Orden>(
      `${this.endpoint}/${id}/cambiar-estado`,
      dto
    ).pipe(
      tap(() => {
        // Invalidar cache de este ítem y listados
        this.cache.invalidate(`orden_${id}`);
        this.cache.invalidatePattern('ordenes_list_');
        this.logger.info(`Estado cambiado: orden ${id}`);
      }),
      catchError(error => {
        this.logger.error(`Error al cambiar estado: ${error.message}`);
        throw error;
      })
    );
  }

  // Asignar técnico
  asignarTecnico(id: string, tecnicoId: string): Observable<Orden> {
    return this.api.post<Orden>(
      `${this.endpoint}/${id}/asignar-tecnico`,
      { tecnicoId }
    ).pipe(
      tap(() => {
        this.cache.invalidate(`orden_${id}`);
        this.cache.invalidatePattern('ordenes_list_');
      })
    );
  }
}
```

### Error Handler Centralizado
```typescript
@Injectable({ providedIn: 'root' })
export class ApiErrorHandler {
  constructor(
    private toastr: NgxToastr,
    private logger: LoggerService,
    private router: Router
  ) {}

  handle(error: HttpErrorResponse, endpoint: string): Observable<never> {
    const mensajeUsuario = this.getMensaje(error);
    const mensajeLog = `${error.status} ${error.statusText} - ${endpoint}`;

    switch (error.status) {
      case 401:
        // No autenticado
        this.logger.warn('Sesión expirada', mensajeLog);
        this.router.navigate(['/login']);
        break;

      case 403:
        // Forbidden
        this.logger.warn('Acceso denegado', mensajeLog);
        this.toastr.error('No tienes permiso para esta acción');
        break;

      case 404:
        // Not found
        this.logger.warn('Recurso no encontrado', mensajeLog);
        this.toastr.error(mensajeUsuario);
        break;

      case 422:
        // Validación fallida
        this.logger.warn('Validación fallida', error.error);
        this.toastr.error(this.formatearErroresValidacion(error.error));
        break;

      case 500:
        // Error del servidor
        this.logger.error('Error del servidor', mensajeLog, error);
        this.toastr.error('Error en el servidor. Inténtalo más tarde.');
        break;

      default:
        // Otros errores
        if (this.esErrorRed(error)) {
          this.logger.warn('Error de red', mensajeLog);
          this.toastr.error('Problemas de conexión. Verifica tu internet.');
        } else {
          this.logger.error('Error desconocido', mensajeLog, error);
          this.toastr.error('Algo salió mal. Inténtalo más tarde.');
        }
    }

    return throwError(() => error);
  }

  private getMensaje(error: HttpErrorResponse): string {
    return error.error?.message || error.message || 'Error desconocido';
  }

  private formatearErroresValidacion(errors: any): string {
    if (Array.isArray(errors)) {
      return errors.slice(0, 3).join(', '); // Máximo 3 errores
    }
    return 'Validación fallida';
  }

  private esErrorRed(error: any): boolean {
    return error.status === 0 || error.message.includes('network');
  }
}
```

### Interceptor de Auth + Logging
```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService, private logger: LoggerService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          this.logger.debug(`[${req.method}] ${req.url} - ${event.status}`);
        }
      })
    );
  }
}
```

## Reglas GEMINI para API Integration
- Regla 1: No duplicar servicios HTTP; centralizar en `ApiService`.
- Regla 5: try/catch en llamadas críticas; error handler centralizado.
- Regla 6: No loguea tokens/sensibles; ólo endpoints y status codes.
- Regla 9: DI obligatorio; no instanciar HttpClient manualmente.

## Entradas ideales (qué confirmar)
- Nuevo endpoint o cambio de contrato API (confirmar con backend).
- Necesidad de caching (qué datos y cuánto tiempo).
- Estrategia de retry (cuántos intentos, cuándo aplica).

## Salidas esperadas (output)
- Servicio actualizado con nuevo endpoint.
- DTOs sincronizados con backend.
- Tests: llamada exitosa, error handling, caching, retry.

## Checklist API Integration "Done"
- ✅ Servicios HTTP centralizados (nunca en componentes).
- ✅ DTOs sincronizados con backend.
- ✅ Error handler centralizado (toastr, logs, redirecciones).
- ✅ Caching con TTL y invalidación.
- ✅ Retry lógico (no reintentar errores 4xx).
- ✅ Auth interceptor agrega Bearer token.
- ✅ Tests: OK, error 404, 500, timeout.
