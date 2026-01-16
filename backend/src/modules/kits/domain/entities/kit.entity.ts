/**
 * Aggregate Root: Kit
 *
 * Representa un kit de herramientas/equipos con todos sus items.
 * Invariantes:
 * - Nombre no puede estar vacío
 * - Solo kits activos pueden asignarse
 * - Kits en uso no pueden editarse
 */
import { KitId } from '../value-objects/kit-id.vo';
import { KitCodigo } from '../value-objects/kit-codigo.vo';
import { CategoriaKit, CategoriaKitEnum } from '../value-objects/categoria-kit.vo';
import { TipoKit, TipoKitEnum } from '../value-objects/tipo-kit.vo';
import { EstadoKit, EstadoKitEnum } from '../value-objects/estado-kit.vo';
import { CostoTotal } from '../value-objects/costo.vo';
import { KitItem, CreateKitItemProps } from './kit-item.entity';
import { BusinessRuleViolationError, ValidationError } from '../../../../shared/domain/exceptions';
import {
  KitCreatedEvent,
  KitUpdatedEvent,
  KitItemAddedEvent,
  KitItemRemovedEvent,
} from '../events';

export interface CreateKitProps {
  nombre: string;
  descripcion?: string;
  categoria: string;
  tipo?: string;
  creadoPor: string;
  esPlantilla?: boolean;
  duracionEstimadaHoras?: number;
  items?: CreateKitItemProps[];
}

export class Kit {
  private _domainEvents: unknown[] = [];

  private constructor(
    private readonly _id: KitId,
    private _codigo: KitCodigo,
    private _nombre: string,
    private _descripcion: string | undefined,
    private _categoria: CategoriaKit,
    private _tipo: TipoKit,
    private _estado: EstadoKit,
    private _items: KitItem[],
    private _costoTotal: CostoTotal,
    private _esPlantilla: boolean,
    private _duracionEstimadaHoras: number,
    private _creadoPor: string,
    private _creadoEn: Date,
    private _actualizadoEn: Date | undefined,
    private _version: number
  ) {
    this.validate();
  }

  /**
   * Factory method: Create new Kit
   */
  public static create(props: CreateKitProps, codigoSequence: number = 1): Kit {
    const id = KitId.generate();
    const categoria = CategoriaKit.create(props.categoria);
    const codigo = KitCodigo.generate(categoria.getCodigo(), codigoSequence);
    const tipo = props.tipo ? TipoKit.create(props.tipo) : TipoKit.basico();
    const estado = EstadoKit.activo();

    const items: KitItem[] = [];
    if (props.items) {
      for (const itemProps of props.items) {
        items.push(KitItem.create(itemProps));
      }
    }

    const kit = new Kit(
      id,
      codigo,
      props.nombre,
      props.descripcion,
      categoria,
      tipo,
      estado,
      items,
      CostoTotal.zero(),
      props.esPlantilla || false,
      props.duracionEstimadaHoras || 0,
      props.creadoPor,
      new Date(),
      undefined,
      1
    );

    kit.recalcularCosto();

    kit.addDomainEvent(
      new KitCreatedEvent({
        kitId: id.getValue(),
        nombre: props.nombre,
        categoria: categoria.getValue(),
        creadoPor: props.creadoPor,
      })
    );

    return kit;
  }

  /**
   * Recreate from persistence
   */
  public static fromPersistence(props: {
    id: string;
    codigo: string;
    nombre: string;
    descripcion?: string;
    categoria: string;
    tipo: string;
    estado: string;
    items: unknown[];
    costoTotal: number;
    esPlantilla: boolean;
    duracionEstimadaHoras: number;
    creadoPor: string;
    creadoEn: Date;
    actualizadoEn?: Date;
    version: number;
  }): Kit {
    const items = (props.items as unknown[]).map((item: unknown) => {
      const i = item as Record<string, unknown>;
      return KitItem.fromPersistence({
        id: i['id'] as string,
        itemId: i['itemId'] as string,
        itemType: (i['itemType'] as string) || 'HERRAMIENTA',
        nombre: i['nombre'] as string,
        descripcion: i['descripcion'] as string | undefined,
        cantidad: (i['cantidad'] as number) || 1,
        costoUnitario: (i['costoUnitario'] as number) || 0,
        unidad: (i['unidad'] as string) || 'unidad',
        esOpcional: (i['esOpcional'] as boolean) || false,
        requiereCertificacion:
          (i['requiereCertificacion'] as boolean) || (i['certificacion'] as boolean) || false,
        notas: i['notas'] as string | undefined,
      });
    });

    return new Kit(
      KitId.create(props.id),
      KitCodigo.create(props.codigo),
      props.nombre,
      props.descripcion,
      CategoriaKit.create(props.categoria),
      TipoKit.create(props.tipo),
      EstadoKit.create(props.estado),
      items,
      CostoTotal.create(props.costoTotal),
      props.esPlantilla,
      props.duracionEstimadaHoras,
      props.creadoPor,
      props.creadoEn,
      props.actualizadoEn,
      props.version
    );
  }

  // ========================================================================
  // Item Management
  // ========================================================================

  public addItem(itemProps: CreateKitItemProps): void {
    if (!this.puedeEditar()) {
      throw new BusinessRuleViolationError('Kit en uso, no se puede modificar');
    }

    const item = KitItem.create(itemProps);

    if (this.hasItemWithName(item.getNombre())) {
      throw new BusinessRuleViolationError(`Item "${item.getNombre()}" ya existe en el kit`);
    }

    this._items.push(item);
    this.recalcularCosto();
    this.markAsUpdated();

    this.addDomainEvent(
      new KitItemAddedEvent({
        kitId: this._id.getValue(),
        itemId: item.getId(),
        itemNombre: item.getNombre(),
      })
    );
  }

  public removeItem(itemId: string): void {
    if (!this.puedeEditar()) {
      throw new BusinessRuleViolationError('Kit en uso, no se puede modificar');
    }

    const index = this._items.findIndex(i => i.getId() === itemId);
    if (index === -1) {
      throw new BusinessRuleViolationError(`Item ${itemId} no encontrado en el kit`);
    }

    const removedItem = this._items.splice(index, 1)[0];
    this.recalcularCosto();
    this.markAsUpdated();

    this.addDomainEvent(
      new KitItemRemovedEvent({
        kitId: this._id.getValue(),
        itemId: removedItem.getId(),
        itemNombre: removedItem.getNombre(),
      })
    );
  }

  public updateItemCantidad(itemId: string, nuevaCantidad: number): void {
    if (!this.puedeEditar()) {
      throw new BusinessRuleViolationError('Kit en uso, no se puede modificar');
    }

    const item = this.findItem(itemId);
    if (!item) {
      throw new BusinessRuleViolationError(`Item ${itemId} no encontrado`);
    }

    item.updateCantidad(nuevaCantidad);
    this.recalcularCosto();
    this.markAsUpdated();
  }

  // ========================================================================
  // State Management
  // ========================================================================

  public activate(): void {
    if (this._estado.esActivo()) {
      throw new BusinessRuleViolationError('Kit ya está activo');
    }
    this._estado = EstadoKit.activo();
    this.markAsUpdated();
  }

  public deactivate(): void {
    if (this._estado.esInactivo()) {
      throw new BusinessRuleViolationError('Kit ya está inactivo');
    }
    if (this._estado.esEnUso()) {
      throw new BusinessRuleViolationError('Kit en uso no puede desactivarse');
    }
    this._estado = EstadoKit.inactivo();
    this.markAsUpdated();
  }

  public markAsEnUso(): void {
    if (!this._estado.esActivo()) {
      throw new BusinessRuleViolationError('Solo kits activos pueden asignarse');
    }
    this._estado = EstadoKit.enUso();
    this.markAsUpdated();
  }

  public markAsDisponible(): void {
    if (!this._estado.esEnUso()) {
      throw new BusinessRuleViolationError('Kit no está en uso');
    }
    this._estado = EstadoKit.activo();
    this.markAsUpdated();
  }

  // ========================================================================
  // Update Info
  // ========================================================================

  public updateInfo(updates: {
    nombre?: string;
    descripcion?: string;
    duracionEstimadaHoras?: number;
  }): void {
    if (!this.puedeEditar()) {
      throw new BusinessRuleViolationError('Kit en uso, no se puede modificar');
    }

    if (updates.nombre !== undefined) {
      if (updates.nombre.trim().length === 0) {
        throw new ValidationError('Nombre no puede estar vacío', 'nombre');
      }
      this._nombre = updates.nombre.trim();
    }

    if (updates.descripcion !== undefined) {
      this._descripcion = updates.descripcion?.trim();
    }

    if (updates.duracionEstimadaHoras !== undefined) {
      this._duracionEstimadaHoras = updates.duracionEstimadaHoras;
    }

    this.markAsUpdated();

    this.addDomainEvent(
      new KitUpdatedEvent({
        kitId: this._id.getValue(),
        nombre: this._nombre,
      })
    );
  }

  // ========================================================================
  // Private Methods
  // ========================================================================

  private recalcularCosto(): void {
    let total = 0;
    for (const item of this._items) {
      total += item.getCostoTotal().getValue();
    }
    this._costoTotal = CostoTotal.create(total);
  }

  private puedeEditar(): boolean {
    return this._estado.puedeEditarse();
  }

  private hasItemWithName(nombre: string): boolean {
    return this._items.some(i => i.getNombre().toLowerCase() === nombre.toLowerCase());
  }

  private findItem(itemId: string): KitItem | undefined {
    return this._items.find(i => i.getId() === itemId);
  }

  private markAsUpdated(): void {
    this._actualizadoEn = new Date();
    this._version++;
  }

  private validate(): void {
    if (!this._nombre || this._nombre.trim().length === 0) {
      throw new ValidationError('Nombre del kit es requerido', 'nombre');
    }
  }

  // ========================================================================
  // Domain Events
  // ========================================================================

  private addDomainEvent(event: unknown): void {
    this._domainEvents.push(event);
  }

  public getDomainEvents(): unknown[] {
    return [...this._domainEvents];
  }

  public clearDomainEvents(): void {
    this._domainEvents = [];
  }

  // ========================================================================
  // Getters & Queries
  // ========================================================================

  public getId(): KitId {
    return this._id;
  }

  public getCodigo(): KitCodigo {
    return this._codigo;
  }

  public getNombre(): string {
    return this._nombre;
  }

  public getDescripcion(): string | undefined {
    return this._descripcion;
  }

  public getCategoria(): CategoriaKit {
    return this._categoria;
  }

  public getTipo(): TipoKit {
    return this._tipo;
  }

  public getEstado(): EstadoKit {
    return this._estado;
  }

  public getItems(): ReadonlyArray<KitItem> {
    return [...this._items];
  }

  public getCantidadItems(): number {
    return this._items.length;
  }

  public getCostoTotal(): CostoTotal {
    return this._costoTotal;
  }

  public esPlantilla(): boolean {
    return this._esPlantilla;
  }

  public getDuracionEstimadaHoras(): number {
    return this._duracionEstimadaHoras;
  }

  public getCreadoPor(): string {
    return this._creadoPor;
  }

  public getCreadoEn(): Date {
    return this._creadoEn;
  }

  public getActualizadoEn(): Date | undefined {
    return this._actualizadoEn;
  }

  public getVersion(): number {
    return this._version;
  }

  public esActivo(): boolean {
    return this._estado.esActivo();
  }

  public esEnUso(): boolean {
    return this._estado.esEnUso();
  }

  public getItemsByType(type: string): KitItem[] {
    return this._items.filter(i => i.getItemType().getValue() === type);
  }

  public getHerramientas(): KitItem[] {
    return this.getItemsByType('HERRAMIENTA');
  }

  public getEquipos(): KitItem[] {
    return this.getItemsByType('EQUIPO');
  }

  public toPersistence(): Record<string, unknown> {
    return {
      id: this._id.getValue(),
      codigo: this._codigo.getValue(),
      nombre: this._nombre,
      descripcion: this._descripcion,
      categoria: this._categoria.getValue(),
      tipo: this._tipo.getValue(),
      estado: this._estado.getValue(),
      items: this._items.map(i => i.toPersistence()),
      costoTotal: this._costoTotal.getValue(),
      esPlantilla: this._esPlantilla,
      duracionEstimadaHoras: this._duracionEstimadaHoras,
      creadoPor: this._creadoPor,
      creadoEn: this._creadoEn,
      actualizadoEn: this._actualizadoEn,
      version: this._version,
    };
  }
}
