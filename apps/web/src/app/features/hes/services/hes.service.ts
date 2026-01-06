import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HesApi, ListHesQuery } from '../../../core/api/hes.api';
import { CreateHESDto, HES, SignHESDto } from '../../../core/models/hes.model';

@Injectable({
  providedIn: 'root',
})
export class HesService {
  private readonly hesApi = inject(HesApi);

  list(query?: ListHesQuery): Observable<HES[]> {
    return this.hesApi.list(query);
  }

  getById(id: string): Observable<HES> {
    return this.hesApi.getById(id);
  }

  getByOrden(ordenId: string): Observable<HES> {
    return this.hesApi.getByOrden(ordenId);
  }

  create(dto: CreateHESDto): Observable<HES> {
    return this.hesApi.create(dto);
  }

  signCliente(id: string, dto: SignHESDto): Observable<HES> {
    return this.hesApi.signCliente(id, dto);
  }

  signTecnico(id: string, dto: SignHESDto): Observable<HES> {
    return this.hesApi.signTecnico(id, dto);
  }

  complete(id: string): Observable<HES> {
    return this.hesApi.complete(id);
  }

  downloadPdf(id: string): Observable<Blob> {
    return this.hesApi.downloadPdf(id);
  }
}
