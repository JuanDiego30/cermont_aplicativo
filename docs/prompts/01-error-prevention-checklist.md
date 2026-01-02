# ✅ CHECKLIST DE PREVENCIÓN DE ERRORES

**28 errores comunes en Cermont - MAL vs BIEN**

---

## 🔐 BACKEND AUTH (Regla 6)

### ❌ MAL: Loguear secretos
```typescript
logger.info(`User login: ${email}:${password}`);
logger.debug(`JWT token: ${token}`);
logger.error(`API key: ${apiKey}`);
```

### ✅ BIEN: Sanitizar antes de loguear
```typescript
logger.info(`User login: ${email}`, { userId });
logger.debug(`JWT issued for user`, { userId, tokenExp });
logger.error(`Auth failed`, { userId, reason: 'invalid_password' });
```

---

## 📦 ÓRDENES (Regla 14)

### ❌ MAL: Editar orden confirmada
```typescript
@Patch(':id')
async updateOrder(@Param('id') id, @Body() data) {
  return this.ordersService.update(id, data); // Sin validar status
}
```

### ✅ BIEN: Guard en CONFIRMED
```typescript
@Patch(':id')
async updateOrder(@Param('id') id, @Body() data) {
  const order = await this.ordersService.findOne(id);
  if (order.status === 'CONFIRMED') {
    throw new ForbiddenException('Cannot edit confirmed order');
  }
  return this.ordersService.update(id, data);
}
```

---

## 📸 EVIDENCIAS (Regla 21)

### ❌ MAL: Sin validar MIME
```typescript
@Post('upload')
async upload(@UploadedFile() file) {
  return this.storage.save(file); // Cualquier archivo
}
```

### ✅ BIEN: MIME whitelist
```typescript
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

@Post('upload')
@UseInterceptors(FileInterceptor('file'))
async upload(@UploadedFile() file) {
  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    throw new BadRequestException('Invalid file type');
  }
  return this.storage.save(file);
}
```

---

## 📋 FORMULARIOS (Regla 37)

### ❌ MAL: Frontend valida todo
```typescript
// Angular component
validateEmail(email: string): boolean {
  return email.includes('@');
}

// Usuario malintencionado puede bypassear
```

### ✅ BIEN: Frontend UI, backend SIEMPRE
```typescript
// Angular component (solo UI feedback)
validateEmail(email: string): boolean {
  return email.includes('@');
}

// NestJS controller (SIEMPRE valida)
@Post('submit')
async submitForm(@Body() dto: FormDTO) {
  const schema = Joi.object({
    email: Joi.string().email().required()
  });
  const { error } = schema.validate(dto);
  if (error) throw new BadRequestException(error);
  // Procesar
}
```

---

## 🔄 SYNC (Idempotencia)

### ❌ MAL: Sin idempotencia
```typescript
@Post('sync')
async sync(@Body() changes: any[]) {
  for (const change of changes) {
    await this.db.update(change); // Si llega 2x, procesa 2x
  }
}
```

### ✅ BIEN: Idempotency key
```typescript
@Post('sync')
async sync(@Body() payload: { idempotencyKey: string; changes: any[] }) {
  const existing = await this.db.findOne({ 
    idempotency_key: payload.idempotencyKey 
  });
  if (existing) return existing; // Ya procesado
  
  const result = { idempotency_key: payload.idempotencyKey, data: {} };
  for (const change of payload.changes) {
    result.data = await this.db.update(change);
  }
  await this.db.save(result);
  return result;
}
```

---

## 📄 REPORTES (Puppeteer)

### ❌ MAL: Sin caché, cada generación es lenta
```typescript
@Get('pdf/:id')
async getPDF(@Param('id') id) {
  return this.pdfService.generate(id); // 5 segundos cada vez
}
```

### ✅ BIEN: Caché 24h
```typescript
@Get('pdf/:id')
async getPDF(@Param('id') id) {
  const cacheKey = `pdf_${id}`;
  const cached = await this.cache.get(cacheKey);
  if (cached) return cached; // Desde caché
  
  const pdf = await this.pdfService.generate(id);
  await this.cache.set(cacheKey, pdf, { ttl: 86400 }); // 24h
  return pdf;
}
```

---

## 🔗 FRONTEND API (Regla 41)

### ❌ MAL: Lógica en frontend
```typescript
// Angular component
calculateTotal() {
  return this.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

onSubmitOrder() {
  const total = this.calculateTotal();
  const tax = total * 0.19; // Ley impuestos en frontend
  const final = total + tax;
  this.api.post('/orders', { items: this.items, total: final });
}
```

### ✅ BIEN: Backend es fuente de verdad
```typescript
// Angular component (SOLO UI)
items: OrderItem[] = [];

onSubmitOrder() {
  // Backend calcula TODO
  this.api.post('/orders', { items: this.items })
    .subscribe(order => {
      console.log('Total:', order.total); // Del backend
      console.log('Tax:', order.tax);     // Del backend
    });
}

// NestJS controller (Backend calcula)
@Post()
async createOrder(@Body() dto: CreateOrderDTO) {
  const items = await this.getItems(dto.items);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const tax = subtotal * 0.19; // Ley de impuestos
  const total = subtotal + tax;
  
  return this.db.save({
    items,
    subtotal,
    tax,
    total,
    status: 'DRAFT'
  });
}
```

---

## 📊 STATE MANAGEMENT (Regla 41)

### ❌ MAL: Estado duplicado frontend/backend
```typescript
// Angular service
@Injectable()
export class OrderState {
  orders$ = new BehaviorSubject([]);
  
  getOrders() {
    this.api.get('/orders').subscribe(orders => {
      this.orders$.next(orders); // Copia local
    });
  }
  
  cancelOrder(id) {
    this.api.post(`/orders/${id}/cancel`).subscribe(() => {
      const orders = this.orders$.value;
      const idx = orders.findIndex(o => o.id === id);
      orders[idx].status = 'CANCELED'; // Actualizar copia local
      this.orders$.next(orders); // Problema: ¿Y si falla?
    });
  }
}
```

### ✅ BIEN: Backend es fuente, frontend solo consume
```typescript
// Angular service
@Injectable()
export class OrderState {
  orders$ = this.api.get('/orders').pipe(
    shareReplay(1) // Compartir suscripción
  );
  
  cancelOrder(id) {
    return this.api.post(`/orders/${id}/cancel`).pipe(
      switchMap(() => this.api.get('/orders')), // Recargar desde backend
      tap(orders => this.orders$.next(orders))
    );
  }
}
```

---

## ⚡ PERFORMANCE (OnPush)

### ❌ MAL: Sin OnPush, re-renders innecesarios
```typescript
@Component({
  selector: 'app-order-item',
  template: `<div>{{ order.total }}</div>`
})
export class OrderItemComponent {
  @Input() order: any;
}
```

### ✅ BIEN: OnPush para detectar cambios
```typescript
@Component({
  selector: 'app-order-item',
  template: `<div>{{ order.total }}</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderItemComponent {
  @Input() order: any;
}
```

---

## 🔄 MEMORY LEAKS (takeUntil)

### ❌ MAL: Sin cleanup
```typescript
ngOnInit() {
  this.api.getOrders().subscribe(orders => {
    this.orders = orders; // Leak: nunca unsubscribe
  });
}
```

### ✅ BIEN: takeUntil(destroy$)
```typescript
destroy$ = new Subject<void>();

ngOnInit() {
  this.api.getOrders()
    .pipe(takeUntil(this.destroy$))
    .subscribe(orders => {
      this.orders = orders;
    });
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

---

## 🎛️ RATE LIMITING (Regla 7)

### ❌ MAL: Sin rate limit
```typescript
@Post('login')
async login(@Body() dto: LoginDTO) {
  // Usuario puede intentar 1000 veces/segundo
  return this.authService.login(dto);
}
```

### ✅ BIEN: 5 intentos = 15 min bloqueo
```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 3 },    // 3/segundo
      { name: 'long', ttl: 900000, limit: 5 }    // 5/15min
    ])
  ]
})

@UseGuards(ThrottlerGuard)
@Post('login')
async login(@Body() dto: LoginDTO) {
  // Automáticamente limitado
  return this.authService.login(dto);
}
```

---

## 📸 THUMBNAILS (Regla 23)

### ❌ MAL: Sin thumbnails, cargar imagen 2MB cada vez
```html
<img [src]="'/api/evidencias/' + evidence.id" />
```

### ✅ BIEN: Thumbnails para preview
```html
<img [src]="'/api/evidencias/' + evidence.id + '/thumb?size=150'" />
```

---

## 🔐 PERMISOS (Regla 25)

### ❌ MAL: Sin validar propietario
```typescript
@Get(':id/evidencias')
async getEvidences(@Param('id') orderId) {
  return this.evidenceService.findByOrderId(orderId); // Sin validar user
}
```

### ✅ BIEN: Validar ownership
```typescript
@Get(':id/evidencias')
async getEvidences(@Param('id') orderId, @Request() req) {
  const order = await this.ordersService.findOne(orderId);
  if (order.user_id !== req.user.id && !req.user.isAdmin) {
    throw new ForbiddenException('Access denied');
  }
  return this.evidenceService.findByOrderId(orderId);
}
```

---

## 📝 LOGGING SENSIBLES (Regla 6)

### ❌ MAL: Loguear email completo
```typescript
logger.info(`Password reset email sent to: ${user.email}`);
```

### ✅ BIEN: Solo dominio
```typescript
const domain = user.email.split('@')[1];
logger.info(`Password reset email sent to domain: ${domain}`);
```

---

## 🌍 I18N (Hardcoded)

### ❌ MAL: Strings en HTML
```html
<button>Submit Order</button>
<p>Loading orders...</p>
```

### ✅ BIEN: Translation keys
```html
<button>{{ 'orders.submit' | translate }}</button>
<p>{{ 'common.loading' | translate }}</p>
```

---

## ✔️ MACHINE STATES (Regla 11)

### ❌ MAL: Sin validar transiciones
```typescript
@Patch(':id/status')
async updateStatus(@Param('id') id, @Body('status') status) {
  return this.ordersService.update(id, { status }); // Cualquier estado
}
```

### ✅ BIEN: Validar máquina de estados
```typescript
const VALID_TRANSITIONS = {
  'DRAFT': ['PENDING', 'CANCELED'],
  'PENDING': ['CONFIRMED', 'CANCELED'],
  'CONFIRMED': ['SHIPPED'],
  'SHIPPED': ['DELIVERED'],
  'DELIVERED': ['CLOSED'],
  'CLOSED': []
};

@Patch(':id/status')
async updateStatus(@Param('id') id, @Body('status') newStatus) {
  const order = await this.ordersService.findOne(id);
  if (!VALID_TRANSITIONS[order.status]?.includes(newStatus)) {
    throw new BadRequestException(
      `Cannot transition from ${order.status} to ${newStatus}`
    );
  }
  return this.ordersService.update(id, { status: newStatus });
}
```

---

## 📊 AUDIT LOG (Regla 3)

### ❌ MAL: Sin historial
```typescript
async login(@Body() dto: LoginDTO) {
  return this.authService.login(dto); // ¿Quién se logueó y cuándo?
}
```

### ✅ BIEN: Registrar evento
```typescript
async login(@Body() dto: LoginDTO, @Req() request) {
  const result = await this.authService.login(dto);
  
  await this.auditLog.create({
    action: 'AUTH_LOGIN',
    user_id: result.user.id,
    timestamp: new Date(),
    ip: request.ip,
    user_agent: request.headers['user-agent']
  });
  
  return result;
}
```

---

## 🔑 JWT EXPIRATION (Regla 9)

### ❌ MAL: Sin expiración
```typescript
const token = jwt.sign({ userId: user.id }, SECRET);
```

### ✅ BIEN: Access 15min, Refresh 7 días
```typescript
const accessToken = jwt.sign(
  { userId: user.id },
  SECRET,
  { expiresIn: '15m' }
);

const refreshToken = jwt.sign(
  { userId: user.id, type: 'refresh' },
  REFRESH_SECRET,
  { expiresIn: '7d' }
);
```

---

## 📦 DRAFT AUTOSAVE (Regla 38)

### ❌ MAL: Pierde datos si se cierra tab
```typescript
onInputChange() {
  this.formData = this.form.value;
  // Sin guardar
}
```

### ✅ BIEN: Autosave cada 30s
```typescript
autosaveInterval = setInterval(() => {
  this.api.post(`/formularios/${this.id}/draft`, this.form.value)
    .subscribe();
}, 30000);

ngOnDestroy() {
  clearInterval(this.autosaveInterval);
}
```

---

## 🌓 DARK MODE

### ❌ MAL: Sin soporte
```typescript
@Component({
  template: `<div class="bg-white text-black">Content</div>`
})
```

### ✅ BIEN: CSS variables / Tailwind dark
```typescript
@Component({
  template: `<div class="bg-white dark:bg-gray-900 text-black dark:text-white">Content</div>`
})
```

---

## 🎯 RESUMEN DE 20 ERRORES CRÍTICOS

| # | Error | Solución |
|---|-------|----------|
| 1 | Loguear secretos | Sanitizar |
| 2 | Editar orden confirmada | Guard en status |
| 3 | Sin MIME whitelist | Validar tipos |
| 4 | Frontend valida todo | Backend SIEMPRE |
| 5 | Sin idempotencia | Idempotency key |
| 6 | Sin caché PDF | Caché 24h |
| 7 | Lógica en frontend | Backend es fuente |
| 8 | Estado duplicado | Recargar desde backend |
| 9 | Sin OnPush | ChangeDetectionStrategy.OnPush |
| 10 | Memory leaks | takeUntil(destroy$) |
| 11 | Sin rate limit | ThrottlerGuard |
| 12 | Sin thumbnails | Thumbnails 150x150 |
| 13 | Sin validar owner | Guard ownership |
| 14 | Email en logs | Solo dominio |
| 15 | Hardcoded strings | Translation keys |
| 16 | Sin validar transiciones | Máquina de estados |
| 17 | Sin audit log | Registrar eventos |
| 18 | JWT sin exp | Access 15m, Refresh 7d |
| 19 | Sin autosave | Autosave 30s |
| 20 | Sin dark mode | CSS variables |

---

## 📌 ANTES DE pnpm run dev

```bash
✅ grep -ri "password\|secret\|token\|apikey" src/ | grep -i "log\|console" | wc -l
   Esperado: 0 líneas

✅ pnpm run test -- --testPathPattern=auth
   Esperado: >80% cobertura

✅ pnpm run test -- --testPathPattern=ordenes
   Esperado: >80% cobertura

✅ pnpm run build
   Esperado: Build exitoso

✅ docker build -t cermont:test .
   Esperado: Docker image creada

✅ docker-compose up -d
   Esperado: Servicios online

✅ curl http://localhost:3000/api/docs
   Esperado: Swagger accesible

✅ Lighthouse >90
   Esperado: Performance, Accessibility en verde
```
