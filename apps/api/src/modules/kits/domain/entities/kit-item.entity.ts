/**
 * Entity: KitItem
 * 
 * Item individual dentro de un kit (herramienta, equipo, material, etc.)
 */
import { v4 as uuidv4 } from 'uuid';
import { ItemType, ItemTypeEnum } from '../value-objects/item-type.vo';
import { Cantidad } from '../value-objects/cantidad.vo';
import { CostoUnitario, CostoTotal } from '../value-objects/costo.vo';

export interface CreateKitItemProps {
    itemId?: string;
    itemType: ItemType | string;
    nombre: string;
    descripcion?: string;
    cantidad: number;
    costoUnitario?: number;
    unidad?: string;
    esOpcional?: boolean;
    requiereCertificacion?: boolean;
    notas?: string;
}

export class KitItem {
    private _id: string;
    private _itemId: string;
    private _itemType: ItemType;
    private _nombre: string;
    private _descripcion?: string;
    private _cantidad: Cantidad;
    private _costoUnitario: CostoUnitario;
    private _costoTotal: CostoTotal;
    private _unidad: string;
    private _esOpcional: boolean;
    private _requiereCertificacion: boolean;
    private _notas?: string;

    private constructor(props: {
        id: string;
        itemId: string;
        itemType: ItemType;
        nombre: string;
        descripcion?: string;
        cantidad: Cantidad;
        costoUnitario: CostoUnitario;
        unidad: string;
        esOpcional: boolean;
        requiereCertificacion: boolean;
        notas?: string;
    }) {
        this._id = props.id;
        this._itemId = props.itemId;
        this._itemType = props.itemType;
        this._nombre = props.nombre;
        this._descripcion = props.descripcion;
        this._cantidad = props.cantidad;
        this._costoUnitario = props.costoUnitario;
        this._unidad = props.unidad;
        this._esOpcional = props.esOpcional;
        this._requiereCertificacion = props.requiereCertificacion;
        this._notas = props.notas;

        this._costoTotal = CostoTotal.create(0);
        this.calculateCostoTotal();
    }

    public static create(props: CreateKitItemProps): KitItem {
        const itemType = typeof props.itemType === 'string'
            ? ItemType.create(props.itemType)
            : props.itemType;

        return new KitItem({
            id: uuidv4(),
            itemId: props.itemId || uuidv4(),
            itemType,
            nombre: props.nombre,
            descripcion: props.descripcion,
            cantidad: Cantidad.create(props.cantidad),
            costoUnitario: CostoUnitario.create(props.costoUnitario || 0),
            unidad: props.unidad || 'unidad',
            esOpcional: props.esOpcional || false,
            requiereCertificacion: props.requiereCertificacion || false,
            notas: props.notas,
        });
    }

    public static fromPersistence(data: {
        id: string;
        itemId: string;
        itemType: string;
        nombre: string;
        descripcion?: string;
        cantidad: number;
        costoUnitario: number;
        unidad: string;
        esOpcional: boolean;
        requiereCertificacion: boolean;
        notas?: string;
    }): KitItem {
        return new KitItem({
            id: data.id,
            itemId: data.itemId,
            itemType: ItemType.create(data.itemType),
            nombre: data.nombre,
            descripcion: data.descripcion,
            cantidad: Cantidad.create(data.cantidad),
            costoUnitario: CostoUnitario.create(data.costoUnitario),
            unidad: data.unidad,
            esOpcional: data.esOpcional,
            requiereCertificacion: data.requiereCertificacion,
            notas: data.notas,
        });
    }

    // Methods
    public updateCantidad(nuevaCantidad: number): void {
        this._cantidad = Cantidad.create(nuevaCantidad);
        this.calculateCostoTotal();
    }

    public updateCostoUnitario(nuevoCosto: number): void {
        this._costoUnitario = CostoUnitario.create(nuevoCosto);
        this.calculateCostoTotal();
    }

    public updateNotas(notas: string): void {
        this._notas = notas;
    }

    private calculateCostoTotal(): void {
        const total = this._costoUnitario.multiply(this._cantidad.getValue());
        this._costoTotal = CostoTotal.create(total);
    }

    public clone(): KitItem {
        return KitItem.create({
            itemId: this._itemId,
            itemType: this._itemType,
            nombre: this._nombre,
            descripcion: this._descripcion,
            cantidad: this._cantidad.getValue(),
            costoUnitario: this._costoUnitario.getValue(),
            unidad: this._unidad,
            esOpcional: this._esOpcional,
            requiereCertificacion: this._requiereCertificacion,
            notas: this._notas,
        });
    }

    // Getters
    public getId(): string {
        return this._id;
    }

    public getItemId(): string {
        return this._itemId;
    }

    public getItemType(): ItemType {
        return this._itemType;
    }

    public getNombre(): string {
        return this._nombre;
    }

    public getDescripcion(): string | undefined {
        return this._descripcion;
    }

    public getCantidad(): Cantidad {
        return this._cantidad;
    }

    public getCostoUnitario(): CostoUnitario {
        return this._costoUnitario;
    }

    public getCostoTotal(): CostoTotal {
        return this._costoTotal;
    }

    public getUnidad(): string {
        return this._unidad;
    }

    public isOpcional(): boolean {
        return this._esOpcional;
    }

    public isRequiereCertificacion(): boolean {
        return this._requiereCertificacion;
    }

    public getNotas(): string | undefined {
        return this._notas;
    }

    public toPersistence(): Record<string, unknown> {
        return {
            id: this._id,
            itemId: this._itemId,
            itemType: this._itemType.getValue(),
            nombre: this._nombre,
            descripcion: this._descripcion,
            cantidad: this._cantidad.getValue(),
            costoUnitario: this._costoUnitario.getValue(),
            costoTotal: this._costoTotal.getValue(),
            unidad: this._unidad,
            esOpcional: this._esOpcional,
            requiereCertificacion: this._requiereCertificacion,
            notas: this._notas,
        };
    }
}
