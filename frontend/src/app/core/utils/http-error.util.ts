import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { logError } from './logger';

export function createHttpErrorHandler(
  context: string
): (error: HttpErrorResponse) => Observable<never> {
  return (error: HttpErrorResponse) => {
    let errorMessage = 'Ha ocurrido un error';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
    }

    logError(`Error en ${context}`, error, { errorMessage });
    return throwError(() => new Error(errorMessage));
  };
}
