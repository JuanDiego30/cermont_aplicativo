import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { KitsApi } from '../../../core/api/kits.api';
import {
  Kit,
  CreateKitDto,
  UpdateKitDto,
  AddItemToKitDto,
  ListKitsQueryDto,
  PaginatedKits
} from '../../../core/models/kit.model';

@Injectable({
  providedIn: 'root'
})
export class KitsService {
  private readonly kitsApi = inject(KitsApi);

  /**
   * Lista todos los kits con filtros opcionales
   */
  list(params?: ListKitsQueryDto): Observable<PaginatedKits> {
    return this.kitsApi.list(params);
  }

  /**
   * Obtiene un kit por ID
   */
  getById(id: string): Observable<Kit> {
    return this.kitsApi.getById(id);
  }

  /**
   * Crea un nuevo kit
   */
  create(data: CreateKitDto): Observable<{ message: string; data: Kit }> {
    return this.kitsApi.create(data);
  }

  /**
   * Actualiza un kit existente
   */
  update(id: string, data: UpdateKitDto): Observable<{ message: string; data: Kit }> {
    return this.kitsApi.update(id, data);
  }

  /**
   * Elimina un kit
   */
  delete(id: string): Observable<{ message: string }> {
    return this.kitsApi.delete(id);
  }

  /**
   * Agrega un item a un kit
   */
  addItem(kitId: string, data: AddItemToKitDto): Observable<{ message: string; data: Kit }> {
    return this.kitsApi.addItem(kitId, data);
  }

  /**
   * Elimina un item de un kit
   */
  removeItem(kitId: string, itemId: string): Observable<{ message: string; data: Kit }> {
    return this.kitsApi.removeItem(kitId, itemId);
  }

  /**
   * Activa un kit
   */
  activate(id: string): Observable<{ message: string; data: Kit }> {
    return this.kitsApi.activate(id);
  }

  /**
   * Desactiva un kit
   */
  deactivate(id: string): Observable<{ message: string; data: Kit }> {
    return this.kitsApi.deactivate(id);
  }
}

