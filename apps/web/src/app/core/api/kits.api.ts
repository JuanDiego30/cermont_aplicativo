/**
 * KitsApi - Kits API client
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import {
  Kit,
  CreateKitDto,
  UpdateKitDto,
  AddItemToKitDto,
  ListKitsQueryDto,
  PaginatedKits
} from '../models/kit.model';

@Injectable({
  providedIn: 'root'
})
export class KitsApi extends ApiBaseService {
  /**
   * List all kits with optional filters
   */
  list(params?: ListKitsQueryDto): Observable<PaginatedKits> {
    return this.get<PaginatedKits>('/kits', params);
  }

  /**
   * Get kit by ID
   */
  getById(id: string): Observable<Kit> {
    return this.get<Kit>(`/kits/${id}`);
  }

  /**
   * Create new kit
   */
  create(data: CreateKitDto): Observable<{ message: string; data: Kit }> {
    return this.post<{ message: string; data: Kit }>('/kits', data);
  }

  /**
   * Update existing kit
   */
  update(id: string, data: UpdateKitDto): Observable<{ message: string; data: Kit }> {
    return this.put<{ message: string; data: Kit }>(`/kits/${id}`, data);
  }

  /**
   * Delete kit
   */
  delete(id: string): Observable<{ message: string }> {
    return this.deleteRequest<{ message: string }>(`/kits/${id}`);
  }

  /**
   * Add item to kit
   */
  addItem(kitId: string, data: AddItemToKitDto): Observable<{ message: string; data: Kit }> {
    return this.post<{ message: string; data: Kit }>(`/kits/${kitId}/items`, data);
  }

  /**
   * Remove item from kit
   */
  removeItem(kitId: string, itemId: string): Observable<{ message: string; data: Kit }> {
    return this.deleteRequest<{ message: string; data: Kit }>(`/kits/${kitId}/items/${itemId}`);
  }

  /**
   * Activate kit
   */
  activate(id: string): Observable<{ message: string; data: Kit }> {
    return this.patch<{ message: string; data: Kit }>(`/kits/${id}/activate`, {});
  }

  /**
   * Deactivate kit
   */
  deactivate(id: string): Observable<{ message: string; data: Kit }> {
    return this.patch<{ message: string; data: Kit }>(`/kits/${id}/deactivate`, {});
  }
}

