import type { DestroyRef, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { AbstractControl } from '@angular/forms';
import type { Observable } from 'rxjs';

function extractErrorMessage(error: unknown, fallbackMessage: string): string {
  if (typeof error === 'string') return error;

  if (error && typeof error === 'object') {
    const maybeError = error as {
      message?: unknown;
      error?: { message?: unknown };
    };

    const nestedMessage = maybeError.error?.message;
    if (typeof nestedMessage === 'string' && nestedMessage.trim()) return nestedMessage;

    const directMessage = maybeError.message;
    if (typeof directMessage === 'string' && directMessage.trim()) return directMessage;
  }

  return fallbackMessage;
}

export function beginFormSubmit(
  form: AbstractControl,
  loading: WritableSignal<boolean>,
  error: WritableSignal<string | null>
): boolean {
  if (form.invalid) {
    form.markAllAsTouched();
    return false;
  }

  loading.set(true);
  error.set(null);
  return true;
}

export function subscribeSubmit<T>(
  request$: Observable<T>,
  destroyRef: DestroyRef,
  loading: WritableSignal<boolean>,
  error: WritableSignal<string | null>,
  onSuccess: (result: T) => void,
  fallbackErrorMessage: string
): void {
  request$.pipe(takeUntilDestroyed(destroyRef)).subscribe({
    next: result => onSuccess(result),
    error: err => {
      error.set(extractErrorMessage(err, fallbackErrorMessage));
      loading.set(false);
    },
  });
}
