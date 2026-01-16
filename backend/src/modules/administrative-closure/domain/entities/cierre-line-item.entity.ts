/**
 * @entity CierreLineItem
 *
 * Line item in a cierre administrativo (material, labor, other costs)
 */

import { randomUUID } from 'crypto';
import { ValidationError } from '../exceptions';

export interface CierreLineItemProps {
  id: string;
  concepto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  categoria: 'MATERIAL' | 'MANO_OBRA' | 'OTROS';
}

export class CierreLineItem {
  private constructor(private readonly props: CierreLineItemProps) {
    Object.freeze(this.props);
  }

  static create(data: {
    concepto: string;
    cantidad: number;
    precioUnitario: number;
    categoria: string;
  }): CierreLineItem {
    if (!data.concepto || data.concepto.trim().length === 0) {
      throw new ValidationError('Concepto es requerido', 'concepto');
    }

    if (data.cantidad <= 0) {
      throw new ValidationError('Cantidad debe ser mayor a 0', 'cantidad');
    }

    if (data.precioUnitario < 0) {
      throw new ValidationError('Precio unitario no puede ser negativo', 'precioUnitario');
    }

    const validCategories = ['MATERIAL', 'MANO_OBRA', 'OTROS'];
    if (!validCategories.includes(data.categoria)) {
      throw new ValidationError(`Categoría inválida: ${data.categoria}`, 'categoria');
    }

    const subtotal = Math.round(data.cantidad * data.precioUnitario * 100) / 100;

    return new CierreLineItem({
      id: randomUUID(),
      concepto: data.concepto.trim(),
      cantidad: data.cantidad,
      precioUnitario: data.precioUnitario,
      subtotal,
      categoria: data.categoria as 'MATERIAL' | 'MANO_OBRA' | 'OTROS',
    });
  }

  static fromPersistence(data: CierreLineItemProps): CierreLineItem {
    return new CierreLineItem(data);
  }

  get id(): string {
    return this.props.id;
  }

  get concepto(): string {
    return this.props.concepto;
  }

  get cantidad(): number {
    return this.props.cantidad;
  }

  get precioUnitario(): number {
    return this.props.precioUnitario;
  }

  get subtotal(): number {
    return this.props.subtotal;
  }

  get categoria(): string {
    return this.props.categoria;
  }

  toJSON(): CierreLineItemProps {
    return { ...this.props };
  }
}
