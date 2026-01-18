import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private _isOpen = signal(false);

  /** Signal for modal open state */
  isOpen = this._isOpen.asReadonly();

  /** Open the modal */
  openModal(): void {
    this._isOpen.set(true);
  }

  /** Close the modal */
  closeModal(): void {
    this._isOpen.set(false);
  }

  /** Toggle the modal */
  toggleModal(): void {
    this._isOpen.update(v => !v);
  }
}
