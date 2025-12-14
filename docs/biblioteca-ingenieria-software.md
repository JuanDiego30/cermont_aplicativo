# 📚 TU BIBLIOTECA COMPLETA: Ingeniería de Software - Conceptos Avanzados

**Última actualización**: Diciembre 2025  
**Nivel**: Principiante a Avanzado  
**Enfoque**: Aplicación práctica en tu proyecto Cermont

---

## 📑 TABLA DE CONTENIDOS

1. [Principios SOLID](#principios-solid)
2. [Principios de Modularidad y DRY](#modularidad-dry)
3. [Design Patterns - Patrones de Diseño](#design-patterns)
4. [Clean Code y Refactoring](#clean-code-refactoring)
5. [Testing - Estrategias de Prueba](#testing-strategies)
6. [Arquitectura de Software](#arquitectura-software)
7. [API Design - REST vs GraphQL](#api-design)
8. [State Management](#state-management)
9. [Performance Optimization](#performance-optimization)
10. [Error Handling y Excepciones](#error-handling)

---

# PRINCIPIOS SOLID

## S - Single Responsibility Principle (SRP)

**Definición**: Una clase/función debe tener una única razón para cambiar.

### 🎯 Objetivo
Cada componente debe hacer **UNA SOLA COSA** bien. Minimizar el acoplamiento y maximizar la cohesión.

### ❌ Mal (Violación SRP)
```typescript
class UserManager {
  // ❌ Responsabilidad 1: Obtener usuario
  getUser(id: string) {
    return fetch(`/api/users/${id}`).then(r => r.json());
  }
  
  // ❌ Responsabilidad 2: Guardar usuario
  saveUser(user: User) {
    return fetch('/api/users', { method: 'POST', body: JSON.stringify(user) });
  }
  
  // ❌ Responsabilidad 3: Validar email
  validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  // ❌ Responsabilidad 4: Enviar notificación
  notifyUser(email: string) {
    console.log(`Email sent to ${email}`);
  }
}
```

### ✅ Bien (Cumple SRP)
```typescript
// 1️⃣ Responsabilidad: Obtener/guardar datos
class UserRepository {
  async getUser(id: string): Promise<User> {
    return fetch(`/api/users/${id}`).then(r => r.json());
  }
  
  async saveUser(user: User): Promise<void> {
    await fetch('/api/users', { method: 'POST', body: JSON.stringify(user) });
  }
}

// 2️⃣ Responsabilidad: Validar datos
class EmailValidator {
  validate(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

// 3️⃣ Responsabilidad: Enviar notificaciones
class EmailService {
  notify(email: string): void {
    console.log(`Email sent to ${email}`);
  }
}

// 4️⃣ Coordinador (opcional)
class UserService {
  constructor(
    private repo: UserRepository,
    private validator: EmailValidator,
    private emailService: EmailService
  ) {}
  
  async registerUser(user: User): Promise<void> {
    if (!this.validator.validate(user.email)) {
      throw new Error('Email inválido');
    }
    await this.repo.saveUser(user);
    this.emailService.notify(user.email);
  }
}
```

### 🎓 Beneficios
- ✅ Fácil de testear (cada clase hace una cosa)
- ✅ Fácil de mantener (cambios aislados)
- ✅ Fácil de reutilizar (componentes pequeños y específicos)

---

## O - Open/Closed Principle (OCP)

**Definición**: "Abierto para extensión, cerrado para modificación"

### 🎯 Objetivo
Agregar nuevas funcionalidades **sin modificar** código existente que funciona.

### ❌ Mal (Violación OCP)
```typescript
// Cada vez que agregos un nuevo tipo de reporte, tengo que modificar esta función
function generarReporte(tipo: string, data: any) {
  if (tipo === 'pdf') {
    return generarPDF(data);
  } else if (tipo === 'excel') {
    return generarExcel(data);
  } else if (tipo === 'csv') {
    return generarCSV(data);
  }
  // ❌ Si quiero agregar JSON, tengo que volver aquí y modificar
}
```

### ✅ Bien (Cumple OCP)
```typescript
// 1️⃣ Interfaz que define el contrato
interface GeneradorReporte {
  generar(data: any): Buffer;
}

// 2️⃣ Implementaciones específicas
class GeneradorPDF implements GeneradorReporte {
  generar(data: any): Buffer {
    // Lógica para generar PDF
    return pdfBuffer;
  }
}

class GeneradorExcel implements GeneradorReporte {
  generar(data: any): Buffer {
    // Lógica para generar Excel
    return excelBuffer;
  }
}

// 3️⃣ ✅ Agregar nuevo tipo SIN modificar código existente
class GeneradorJSON implements GeneradorReporte {
  generar(data: any): Buffer {
    return Buffer.from(JSON.stringify(data));
  }
}

// 4️⃣ Servicio que usa generadores
class ServicioReportes {
  private generadores: Map<string, GeneradorReporte> = new Map();
  
  registrarGenerador(tipo: string, generador: GeneradorReporte) {
    this.generadores.set(tipo, generador);
  }
  
  generar(tipo: string, data: any): Buffer {
    const generador = this.generadores.get(tipo);
    if (!generador) throw new Error(`Tipo de reporte no soportado: ${tipo}`);
    return generador.generar(data);
  }
}

// Uso:
const servicio = new ServicioReportes();
servicio.registrarGenerador('pdf', new GeneradorPDF());
servicio.registrarGenerador('excel', new GeneradorExcel());
servicio.registrarGenerador('json', new GeneradorJSON()); // ✅ Nueva extensión
```

---

## L - Liskov Substitution Principle (LSP)

**Definición**: "Los objetos derivados deben ser sustituibles por los objetos base"

### 🎯 Objetivo
Si `B extends A`, entonces `B` debe poder usarse en cualquier lugar donde se espera `A` sin romper la funcionalidad.

### ❌ Mal (Violación LSP)
```typescript
class Pajaro {
  volar(): void {
    console.log('Volando...');
  }
}

class Pinguino extends Pajaro {
  volar(): void {
    throw new Error('Los pingüinos no pueden volar'); // ❌ Rompe el contrato
  }
}

// Código que falla:
function hacerVolarPajaro(pajaro: Pajaro) {
  pajaro.volar(); // ❌ EXPLOTA si recibe un Pinguino
}

const pinguino = new Pinguino();
hacerVolarPajaro(pinguino); // ❌ Error
```

### ✅ Bien (Cumple LSP)
```typescript
abstract class Pajaro {
  abstract moverse(): void; // Contrato más general
}

class Aguila extends Pajaro {
  moverse(): void {
    console.log('Volando...');
  }
}

class Pinguino extends Pajaro {
  moverse(): void {
    console.log('Nadando...');
  }
}

// Código que funciona con ambos:
function hacerMoversePajaro(pajaro: Pajaro) {
  pajaro.moverse(); // ✅ Funciona con CUALQUIER tipo de Pajaro
}

hacerMoversePajaro(new Aguila()); // ✅ OK
hacerMoversePajaro(new Pinguino()); // ✅ OK
```

---

## I - Interface Segregation Principle (ISP)

**Definición**: "Los clientes no deben depender de interfaces que no usan"

### 🎯 Objetivo
Crear muchas interfaces pequeñas y específicas en lugar de pocas grandes y genéricas.

### ❌ Mal (Interfaz grande)
```typescript
interface Trabajador {
  trabajar(): void;
  comer(): void;
  dormir(): void;
}

class Robot implements Trabajador {
  trabajar() { /* OK */ }
  comer() { throw new Error('Los robots no comen'); } // ❌ Obligado
  dormir() { throw new Error('Los robots no duermen'); } // ❌ Obligado
}
```

### ✅ Bien (Interfaces segregadas)
```typescript
interface Trabajable {
  trabajar(): void;
}

interface Humano {
  comer(): void;
  dormir(): void;
}

class Robot implements Trabajable {
  trabajar() { /* OK */ } // ✅ Solo implementa lo que necesita
}

class Persona implements Trabajable, Humano {
  trabajar() { /* OK */ }
  comer() { /* OK */ }
  dormir() { /* OK */ }
}
```

---

## D - Dependency Inversion Principle (DIP)

**Definición**: "Depende de abstracciones, no de implementaciones concretas"

### 🎯 Objetivo
Los módulos de alto nivel no deben depender de módulos de bajo nivel. Ambos deben depender de abstracciones.

### ❌ Mal (Dependencia concreta)
```typescript
class OrdenService {
  private apiClient = new AxiosHttpClient(); // ❌ Dependencia directa
  
  async getOrdenes() {
    return this.apiClient.get('/ordenes');
  }
}
```

### ✅ Bien (Dependencia inyectada)
```typescript
// 1️⃣ Abstracción
interface HttpClient {
  get<T>(url: string): Promise<T>;
}

// 2️⃣ Implementación concreta
class AxiosHttpClient implements HttpClient {
  async get<T>(url: string): Promise<T> {
    // ...
  }
}

// 3️⃣ Servicio depende de abstracción
class OrdenService {
  constructor(private httpClient: HttpClient) {} // ✅ Inyección
  
  async getOrdenes() {
    return this.httpClient.get('/ordenes');
  }
}

// Uso:
const httpClient = new AxiosHttpClient();
const service = new OrdenService(httpClient);

// En tests puedo usar MockHttpClient sin cambiar OrdenService
const mockClient = new MockHttpClient();
const testService = new OrdenService(mockClient); // ✅ Fácil de testear
```

---

# MODULARIDAD Y DRY

## Modularidad - Divide y Conquistarás

### Principios clave
- **Cohesión alta**: Todo en el módulo está relacionado
- **Acoplamiento bajo**: Los módulos dependen poco unos de otros
- **Encapsulación**: Los detalles internos están ocultos

### Estructura recomendada para Cermont
```
src/
├── features/
│   ├── ordenes/
│   │   ├── components/          # UI reutilizable
│   │   │   ├── OrdenCard.tsx
│   │   │   └── OrdenForm.tsx
│   │   ├── hooks/              # Lógica de datos
│   │   │   ├── useOrdenes.ts
│   │   │   └── useCreateOrden.ts
│   │   ├── api/                # Comunicación HTTP
│   │   │   └── ordenes.api.ts
│   │   ├── types/              # Tipos TypeScript
│   │   │   └── orden.types.ts
│   │   └── utils/              # Utilidades específicas
│   │       └── ordenCalculos.ts
│   ├── evidencias/
│   ├── costos/
│   └── ...
├── shared/                      # Código compartido
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── types/
└── lib/                         # Librerías y dependencias
    ├── api/
    └── storage/
```

## DRY - Don't Repeat Yourself

### 🎯 Objetivo
Cada pieza de **conocimiento** debe existir una sola vez en el sistema.

### Patrón: Extract Duplicated Logic
```typescript
// ❌ Duplicación
const totalOrdenConIVA = orden.total * 1.19;
const totalCostoConIVA = costo.subtotal * 1.19;
const totalFacturaConIVA = factura.base * 1.19;

// ✅ DRY
// lib/utils/calculos.ts
export const IVA_COLOMBIA = 0.19;

export function calcularTotalConIVA(base: number): number {
  return base + (base * IVA_COLOMBIA);
}

// Uso en cualquier lugar:
const totalOrdenConIVA = calcularTotalConIVA(orden.total);
const totalCostoConIVA = calcularTotalConIVA(costo.subtotal);
```

---

# DESIGN PATTERNS - Patrones de Diseño

## Patrones Creacionales (Cómo crear objetos)

### 1. Singleton Pattern
**Uso**: Una sola instancia de una clase en toda la aplicación.

```typescript
class LoggerService {
  private static instance: LoggerService;
  
  private constructor() {} // Privado para evitar new
  
  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }
  
  log(message: string) {
    console.log(message);
  }
}

// Uso:
const logger1 = LoggerService.getInstance();
const logger2 = LoggerService.getInstance();
logger1 === logger2; // true (misma instancia)
```

### 2. Factory Pattern
**Uso**: Crear objetos sin especificar exactamente qué clase instanciar.

```typescript
interface Formulario {
  renderizar(): void;
}

class FormularioCCTV implements Formulario {
  renderizar() { /* CCTV form */ }
}

class FormularioPlaneacion implements Formulario {
  renderizar() { /* Planeación form */ }
}

class FormularioFactory {
  static crearFormulario(tipo: string): Formulario {
    switch (tipo) {
      case 'cctv':
        return new FormularioCCTV();
      case 'planeacion':
        return new FormularioPlaneacion();
      default:
        throw new Error(`Tipo desconocido: ${tipo}`);
    }
  }
}

// Uso:
const form = FormularioFactory.crearFormulario('cctv');
form.renderizar();
```

### 3. Builder Pattern
**Uso**: Construir objetos complejos paso a paso.

```typescript
class Orden {
  id: string;
  titulo: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  
  private constructor() {}
  
  static builder() {
    return new OrdenBuilder();
  }
}

class OrdenBuilder {
  private orden = new Orden();
  
  setId(id: string) {
    this.orden.id = id;
    return this;
  }
  
  setTitulo(titulo: string) {
    this.orden.titulo = titulo;
    return this;
  }
  
  setDescripcion(descripcion: string) {
    this.orden.descripcion = descripcion;
    return this;
  }
  
  build(): Orden {
    return this.orden;
  }
}

// Uso:
const orden = Orden.builder()
  .setId('1')
  .setTitulo('Nueva orden')
  .setDescripcion('Descripción')
  .build();
```

## Patrones Estructurales (Cómo combinar objetos)

### 1. Adapter Pattern
**Uso**: Hacer que una interfaz incompatible sea compatible.

```typescript
// API antigua que no podemos cambiar
class APIVieja {
  traerDatos() {
    return { usuario: { nombre: 'Juan' } };
  }
}

// Nueva interfaz que esperamos
interface APIModerna {
  getDatos(): Promise<{ user: { name: string } }>;
}

// Adaptador
class AdaptadorAPI implements APIModerna {
  constructor(private apiVieja: APIVieja) {}
  
  async getDatos(): Promise<{ user: { name: string } }> {
    const datos = this.apiVieja.traerDatos();
    return {
      user: {
        name: datos.usuario.nombre
      }
    };
  }
}

// Uso:
const apiVieja = new APIVieja();
const apiModerna = new AdaptadorAPI(apiVieja);
await apiModerna.getDatos();
```

### 2. Decorator Pattern
**Uso**: Agregar funcionalidad a objetos dinámicamente.

```typescript
interface Componente {
  procesar(): void;
}

class ComponenteBase implements Componente {
  procesar() {
    console.log('Procesando...');
  }
}

// Decorador que agrega logging
class LoggerDecorador implements Componente {
  constructor(private componente: Componente) {}
  
  procesar() {
    console.log('Iniciando procesamiento...');
    this.componente.procesar();
    console.log('Procesamiento finalizado');
  }
}

// Decorador que agrega timing
class TimingDecorador implements Componente {
  constructor(private componente: Componente) {}
  
  procesar() {
    const inicio = Date.now();
    this.componente.procesar();
    const tiempo = Date.now() - inicio;
    console.log(`Tiempo: ${tiempo}ms`);
  }
}

// Uso:
let componente: Componente = new ComponenteBase();
componente = new LoggerDecorador(componente);
componente = new TimingDecorador(componente);
componente.procesar();
// Output:
// Iniciando procesamiento...
// Procesando...
// Procesamiento finalizado
// Tiempo: Xms
```

## Patrones Conductuales (Cómo comunicarse)

### 1. Observer Pattern
**Uso**: Notificar a múltiples observadores sobre cambios.

```typescript
interface Observador {
  update(evento: string): void;
}

class EventEmitter {
  private observadores: Observador[] = [];
  
  suscribirse(observador: Observador) {
    this.observadores.push(observador);
  }
  
  desuscribirse(observador: Observador) {
    this.observadores = this.observadores.filter(o => o !== observador);
  }
  
  emitir(evento: string) {
    this.observadores.forEach(o => o.update(evento));
  }
}

class Notificador implements Observador {
  update(evento: string) {
    console.log(`Notificación: ${evento}`);
  }
}

// Uso:
const emitter = new EventEmitter();
const notificador = new Notificador();
emitter.suscribirse(notificador);
emitter.emitir('Orden creada'); // Notificador.update es llamado
```

### 2. Strategy Pattern
**Uso**: Cambiar algoritmos en tiempo de ejecución.

```typescript
interface EstrategiaOrdenamiento {
  ordenar(datos: any[]): any[];
}

class OrdenamientoPorNombre implements EstrategiaOrdenamiento {
  ordenar(datos: any[]) {
    return [...datos].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }
}

class OrdenamientoPorFecha implements EstrategiaOrdenamiento {
  ordenar(datos: any[]) {
    return [...datos].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  }
}

class Ordenador {
  constructor(private estrategia: EstrategiaOrdenamiento) {}
  
  setEstrategia(estrategia: EstrategiaOrdenamiento) {
    this.estrategia = estrategia;
  }
  
  ejecutar(datos: any[]) {
    return this.estrategia.ordenar(datos);
  }
}

// Uso:
const ordenes = [
  { nombre: 'Zoe', fecha: '2025-01-01' },
  { nombre: 'Ana', fecha: '2025-01-02' }
];

const ordenador = new Ordenador(new OrdenamientoPorNombre());
console.log(ordenador.ejecutar(ordenes)); // Ordenado por nombre

ordenador.setEstrategia(new OrdenamientoPorFecha());
console.log(ordenador.ejecutar(ordenes)); // Ordenado por fecha
```

### 3. State Pattern
**Uso**: Cambiar comportamiento según el estado interno.

```typescript
interface EstadoOrden {
  siguiente(): EstadoOrden;
  anterior(): EstadoOrden;
  descripcion(): string;
}

class EstadoPendiente implements EstadoOrden {
  siguiente() { return new EstadoEnProgreso(); }
  anterior() { return this; }
  descripcion() { return 'PENDIENTE'; }
}

class EstadoEnProgreso implements EstadoOrden {
  siguiente() { return new EstadoCompletada(); }
  anterior() { return new EstadoPendiente(); }
  descripcion() { return 'EN_PROGRESO'; }
}

class EstadoCompletada implements EstadoOrden {
  siguiente() { return this; }
  anterior() { return new EstadoEnProgreso(); }
  descripcion() { return 'COMPLETADA'; }
}

class Orden {
  private estado: EstadoOrden = new EstadoPendiente();
  
  avanzar() {
    this.estado = this.estado.siguiente();
  }
  
  retroceder() {
    this.estado = this.estado.anterior();
  }
  
  getEstado() {
    return this.estado.descripcion();
  }
}
```

---

# CLEAN CODE Y REFACTORING

## Principios de Clean Code

### 1. Nombres Significativos
```typescript
// ❌ Malo
const d = 5; // ¿Qué es d?
const users = getUserData(); // ¿Qué datos?

// ✅ Bueno
const diasPlazo = 5;
const usuariosActivos = getUsersWithActiveStatus();
```

### 2. Funciones Pequeñas y Enfocadas
```typescript
// ❌ Malo - función hace mucho
function procesar(usuario) {
  validarEmail(usuario.email);
  guardarEnBD(usuario);
  enviarEmail(usuario.email);
  registrarAuditoria(usuario);
  return usuario;
}

// ✅ Bueno - funciones pequeñas
function validarUsuario(usuario) {
  if (!isValidEmail(usuario.email)) {
    throw new Error('Email inválido');
  }
}

function guardarYNotificar(usuario) {
  guardarEnBD(usuario);
  enviarEmail(usuario.email);
}

function procesarUsuario(usuario) {
  validarUsuario(usuario);
  guardarYNotificar(usuario);
  registrarAuditoria(usuario);
  return usuario;
}
```

### 3. Comentarios Útiles (no obvios)
```typescript
// ❌ Comentarios obvios
const edad = hoy - nacimiento; // Calcula la edad

// ✅ Comentarios útiles
// Calcula la edad sin contar el cumpleaños del año actual
const edad = hoy.getFullYear() - nacimiento.getFullYear();
if (hoy.getMonth() < nacimiento.getMonth() || 
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate())) {
  edad--;
}
```

## Técnicas de Refactoring

### 1. Extract Method
```typescript
// ❌ Antes
function procesarOrden(orden) {
  // validaciones
  if (!orden.cliente) throw new Error('Cliente requerido');
  if (orden.total <= 0) throw new Error('Total debe ser mayor a 0');
  if (orden.items.length === 0) throw new Error('Items requeridos');
  
  // guardar
  return guardarEnBD(orden);
}

// ✅ Después
function validarOrden(orden) {
  if (!orden.cliente) throw new Error('Cliente requerido');
  if (orden.total <= 0) throw new Error('Total debe ser mayor a 0');
  if (orden.items.length === 0) throw new Error('Items requeridos');
}

function procesarOrden(orden) {
  validarOrden(orden);
  return guardarEnBD(orden);
}
```

### 2. Extract Class
```typescript
// ❌ Antes - clase hace demasiado
class Usuario {
  nombre: string;
  email: string;
  direccion: string;
  ciudad: string;
  pais: string;
  
  enviarEmail() { /* ... */ }
  validarEmail() { /* ... */ }
}

// ✅ Después
class Direccion {
  ciudad: string;
  pais: string;
}

class Usuario {
  nombre: string;
  email: string;
  direccion: Direccion;
}

class EmailService {
  enviar(email: string) { /* ... */ }
  validar(email: string) { /* ... */ }
}
```

### 3. Red-Green-Refactor (TDD)
```typescript
// 🔴 RED: Escribe test que falla
describe('calcularTotalConIVA', () => {
  it('debe retornar el total con IVA incluido', () => {
    expect(calcularTotalConIVA(100)).toBe(119);
  });
});

// 🟢 GREEN: Escribe código mínimo para pasar
function calcularTotalConIVA(base: number): number {
  return base * 1.19;
}

// 🔵 REFACTOR: Mejora el código
const IVA = 0.19;
function calcularTotalConIVA(base: number): number {
  return base * (1 + IVA);
}
```

---

# TESTING STRATEGIES

## La Pirámide de Testing

```
         E2E (5-10%)
        /         \
       /           \
   Integration   (15-25%)
      /               \
     /                 \
   Unit (60-70%)
```

### 1. Unit Tests
**Qué**: Prueban funciones/métodos en aislamiento  
**Cuándo**: Siempre (es lo más importante)  
**Herramientas**: Jest, Vitest, Mocha

```typescript
describe('calcularTotalConIVA', () => {
  it('calcula correctamente el IVA', () => {
    expect(calcularTotalConIVA(100)).toBe(119);
  });
  
  it('maneja valores negativos', () => {
    expect(calcularTotalConIVA(-50)).toBe(-59.5);
  });
  
  it('maneja cero', () => {
    expect(calcularTotalConIVA(0)).toBe(0);
  });
});
```

### 2. Integration Tests
**Qué**: Prueban cómo funcionan múltiples componentes juntos  
**Cuándo**: Para flujos críticos  
**Herramientas**: Jest, Testing Library

```typescript
describe('Crear orden', () => {
  it('crea orden y envía notificación', async () => {
    const mockEmailService = {
      enviar: jest.fn()
    };
    
    const service = new OrdenService(mockEmailService);
    await service.crear({ titulo: 'Nueva orden' });
    
    expect(mockEmailService.enviar).toHaveBeenCalled();
  });
});
```

### 3. E2E Tests
**Qué**: Prueban toda una característica desde la perspectiva del usuario  
**Cuándo**: Para flujos críticos  
**Herramientas**: Cypress, Playwright, Selenium

```typescript
describe('Flujo de crear orden', () => {
  it('usuario puede crear una nueva orden', () => {
    cy.visit('/ordenes');
    cy.contains('Nueva Orden').click();
    cy.get('input[name="titulo"]').type('Mi orden');
    cy.get('button[type="submit"]').click();
    cy.contains('Orden creada exitosamente').should('be.visible');
  });
});
```

## Best Practices de Testing

- ✅ Usa descriptive test names
- ✅ Arrange-Act-Assert pattern
- ✅ Test one thing per test
- ✅ Use mocks para dependencias externas
- ✅ Test edge cases and happy paths
- ✅ Mantén tests independientes

```typescript
// AAA Pattern
describe('loginUser', () => {
  it('logs in successfully with valid credentials', () => {
    // Arrange
    const credentials = { email: 'test@example.com', password: 'password' };
    const expectedResult = { token: 'abc123' };
    jest.spyOn(api, 'login').mockResolvedValue(expectedResult);
    
    // Act
    const result = await loginUser(credentials);
    
    // Assert
    expect(result).toEqual(expectedResult);
    expect(api.login).toHaveBeenCalledWith(credentials);
  });
});
```

---

# ARQUITECTURA DE SOFTWARE

## Clean Architecture

### Capas (de dentro hacia afuera)
```
┌─────────────────────────────────────┐
│  UI/Controllers (Frameworks)        │
├─────────────────────────────────────┤
│  Interface Adapters                 │
│  (Gateways, Presenters, Controllers)│
├─────────────────────────────────────┤
│  Application (Use Cases)            │
│  (Business Logic, Workflows)        │
├─────────────────────────────────────┤
│  Entities (Domain, Business Rules)  │
└─────────────────────────────────────┘

Las dependencias siempre apuntan HACIA ADENTRO
```

### Estructura en Cermont
```
src/
├── domain/                          # Entidades y lógica pura
│   ├── entities/
│   │   ├── Orden.ts
│   │   └── Evidencia.ts
│   └── repositories/
│       └── IOrdenRepository.ts      # Interfaz
├── application/                     # Use Cases
│   ├── use-cases/
│   │   ├── CreateOrden.ts
│   │   └── UpdateOrdenEstado.ts
│   └── dtos/                        # Data Transfer Objects
├── infrastructure/                  # Implementaciones técnicas
│   ├── repositories/
│   │   └── OrdenRepository.ts       # Implementación de IOrdenRepository
│   └── external/
│       └── EmailService.ts
└── presentation/                    # Controllers, Routes
    ├── controllers/
    └── routes/
```

## Microservices Architecture

### Domain-Driven Design (DDD)
```
Cermont puede dividirse en bounded contexts:

┌────────────┐  ┌────────────┐  ┌────────────┐
│  Ordenes   │  │ Evidencias │  │  Costos    │
│  Service   │  │  Service   │  │  Service   │
│            │  │            │  │            │
│ - Create   │  │ - Upload   │  │ - Register │
│ - Update   │  │ - Delete   │  │ - Calculate│
│ - Query    │  │ - List     │  │ - Report   │
└────┬───────┘  └────┬───────┘  └────┬───────┘
     │                │               │
     └────────────┬───┴───────────────┘
                  │
            API Gateway
```

---

# API DESIGN - REST vs GraphQL

## REST Principles

### 1. Resource-Based Endpoints
```
GET    /api/ordenes           # Obtener todas
GET    /api/ordenes/{id}      # Obtener una
POST   /api/ordenes           # Crear
PUT    /api/ordenes/{id}      # Actualizar
DELETE /api/ordenes/{id}      # Eliminar
```

### 2. HTTP Status Codes
```typescript
200 OK              // Éxito
201 Created         // Recurso creado
204 No Content      // Éxito sin cuerpo
400 Bad Request     // Error del cliente
401 Unauthorized    // Sin autenticación
403 Forbidden       // Sin autorización
404 Not Found       // No existe
500 Server Error    // Error del servidor
```

### 3. Mejor Práctica: Versioning
```typescript
GET /api/v1/ordenes
GET /api/v2/ordenes  // Nueva versión con cambios
```

## GraphQL

### Ventajas
- ✅ Cliente pide exactamente lo que necesita
- ✅ Una sola request en lugar de múltiples
- ✅ Self-documenting (introspection)
- ✅ Evoluciona sin versiones

### Desventajas
- ❌ Más complejo de implementar
- ❌ Query complexity attacks
- ❌ Caching más complicado

### Ejemplo
```graphql
query {
  orden(id: "1") {
    id
    titulo
    evidencias {
      url
      tipo
    }
    # Solo pido los campos que necesito
  }
}
```

## REST vs GraphQL
| Aspecto | REST | GraphQL |
|---------|------|---------|
| Over-fetching | ❌ Sí | ✅ No |
| Under-fetching | ❌ Sí (múltiples requests) | ✅ No (un request) |
| Caching | ✅ Fácil | ❌ Complejo |
| Seguridad | ✅ Bien conocida | ⚠️ Query complexity |
| Curva aprendizaje | ✅ Baja | ❌ Alta |
| Implementación | ✅ Simple | ❌ Compleja |

**Recomendación para Cermont**: Usa REST + GraphQL:
- REST para CRUD simple
- GraphQL para queries complejas

---

# STATE MANAGEMENT

## Redux (Complejo, escalable)
```typescript
// 1. Action
export const createOrden = (orden: Orden) => ({
  type: 'CREATE_ORDEN',
  payload: orden
});

// 2. Reducer
const initialState: OrdenesState = { ordenes: [], loading: false };

function ordenesReducer(state = initialState, action) {
  switch (action.type) {
    case 'CREATE_ORDEN':
      return { ...state, ordenes: [...state.ordenes, action.payload] };
    default:
      return state;
  }
}

// 3. Store
const store = createStore(ordenesReducer);

// 4. Componente
function OrdenesPage() {
  const dispatch = useDispatch();
  const ordenes = useSelector(state => state.ordenes);
  
  const handleCreate = () => {
    dispatch(createOrden({ titulo: 'Nueva' }));
  };
}
```

## Context API (Simple, limitado)
```typescript
// 1. Crear contexto
const OrdenesContext = React.createContext();

// 2. Provider
export function OrdenesProvider({ children }) {
  const [ordenes, setOrdenes] = useState([]);
  
  const createOrden = (orden) => {
    setOrdenes([...ordenes, orden]);
  };
  
  return (
    <OrdenesContext.Provider value={{ ordenes, createOrden }}>
      {children}
    </OrdenesContext.Provider>
  );
}

// 3. Usar en componente
function OrdenesPage() {
  const { ordenes, createOrden } = useContext(OrdenesContext);
  // ...
}
```

## Cuándo usar cada uno
| Caso | Recomendación |
|------|---------------|
| Pequeña app (<5 screens) | Context API |
| App media (5-20 screens) | Context API + hooks |
| App grande (>20 screens, much state) | Redux |
| Manejo complejo con middleware | Redux |
| Async actions complejas | Redux Thunk/Saga |

---

# PERFORMANCE OPTIMIZATION

## Memoization en React
```typescript
// useMemo - memoriza valores
function Component() {
  const [count, setCount] = useState(0);
  const total = useMemo(() => {
    return expensiveCalculation(count);
  }, [count]); // Solo recalcula si count cambia
  
  return <div>{total}</div>;
}

// useCallback - memoriza funciones
const handleClick = useCallback(() => {
  doSomething(count);
}, [count]);

// React.memo - memoriza componentes
const OrdenCard = React.memo(({ orden }) => {
  return <div>{orden.titulo}</div>;
});
// Solo re-renderiza si las props cambian
```

## Throttling vs Debouncing

### Throttling
- Ejecuta función **cada X millisegundos**
- Mejor para: Scroll, Resize, Mouse move
- ✅ Mantiene actualización constante

```typescript
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Uso
window.addEventListener('scroll', throttle(() => {
  console.log('Scrolling...');
}, 1000)); // Max cada 1 segundo
```

### Debouncing
- Ejecuta función **después de X ms de inactividad**
- Mejor para: Search, Auto-save, Form validation
- ✅ Evita múltiples llamadas innecesarias

```typescript
function debounce(func, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// Uso
const handleSearch = debounce((query) => {
  searchAPI(query);
}, 500); // Busca solo después de 500ms sin escribir

input.addEventListener('keyup', (e) => {
  handleSearch(e.target.value);
});
```

## Lazy Loading
```typescript
// React
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

## Caching Strategies
```typescript
// 1. Client-side caching
const cache = new Map();

function getCachedData(key) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  const data = fetchData(key);
  cache.set(key, data);
  return data;
}

// 2. React Query caching
const { data } = useQuery(['ordenes'], () => ordenesApi.getAll(), {
  staleTime: 5 * 60 * 1000, // 5 minutos
  cacheTime: 10 * 60 * 1000 // 10 minutos
});
```

---

# ERROR HANDLING

## Estrategias

### 1. Throw Early, Catch Late
```typescript
// ✅ Bueno - validar temprano
function processOrden(orden: Orden) {
  // Validar al inicio
  if (!orden.cliente) throw new Error('Cliente requerido');
  if (orden.total <= 0) throw new Error('Total debe ser positivo');
  
  // Procesar sabiendo que es válido
  return saveToDatabase(orden);
}

// Capturar al nivel más alto
try {
  const resultado = processOrden(orden);
} catch (error) {
  logger.error(error);
  notify.error('Error al procesar orden');
}
```

### 2. Custom Exceptions
```typescript
class ValidationError extends Error {
  constructor(public field: string, public message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class OrdenNotFoundException extends Error {
  constructor(public id: string) {
    super(`Orden ${id} no encontrada`);
    this.name = 'OrdenNotFoundException';
  }
}

// Uso
try {
  validateOrden(orden);
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(`Error en campo ${error.field}`);
  } else if (error instanceof OrdenNotFoundException) {
    console.log(`No existe la orden ${error.id}`);
  }
}
```

### 3. Error Middleware (Express/NestJS)
```typescript
// Express
app.use((error, req, res, next) => {
  logger.error(error);
  
  if (error instanceof ValidationError) {
    return res.status(400).json({ error: error.message });
  }
  
  if (error instanceof OrdenNotFoundException) {
    return res.status(404).json({ error: error.message });
  }
  
  return res.status(500).json({ error: 'Error interno' });
});

// NestJS
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    if (exception instanceof ValidationError) {
      response.status(400).json({ error: exception.message });
    } else {
      response.status(500).json({ error: 'Error interno' });
    }
  }
}
```

### 4. Graceful Degradation
```typescript
async function loadUserData(userId: string) {
  try {
    return await apiClient.getUser(userId);
  } catch (error) {
    logger.warn(`Error obteniendo usuario ${userId}, usando datos locales`);
    return localStorage.getItem(`user_${userId}`);
  }
}
```

---

## 📋 CHECKLIST FINAL

### Arquitectura y Diseño
- [ ] ¿Cumples SOLID principles?
- [ ] ¿El código es modular (no monolítico)?
- [ ] ¿Aplicas DRY (no hay duplicación)?
- [ ] ¿Las dependencias van hacia adentro?

### Code Quality
- [ ] ¿Los nombres son descriptivos?
- [ ] ¿Las funciones son pequeñas (<30 líneas)?
- [ ] ¿Los componentes tienen una responsabilidad?
- [ ] ¿Hay cobertura de tests (>80%)?

### Performance
- [ ] ¿Usas memoization donde es necesario?
- [ ] ¿Implementas lazy loading?
- [ ] ¿Tienes estrategia de caching?
- [ ] ¿Evitas N+1 queries?

### Testing
- [ ] ¿Tienes unit tests?
- [ ] ¿Tienes integration tests?
- [ ] ¿Tienes E2E tests para flujos críticos?
- [ ] ¿Los tests son independientes?

### Error Handling
- [ ] ¿Validas temprano?
- [ ] ¿Captura tardío?
- [ ] ¿Registras errores?
- [ ] ¿Tienes custom exceptions?

---

**Última actualización**: Diciembre 2025  
**Mantén este documento actualizado mientras aprendes nuevos conceptos**
