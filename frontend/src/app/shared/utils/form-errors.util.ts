import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

export function hasControlError(form: FormGroup, field: string, error: string): boolean {
  const control = form.get(field);
  return !!(control && control.touched && control.hasError(error));
}

export function getDefaultControlErrorMessage(form: FormGroup, field: string): string {
  const control = form.get(field);
  return getDefaultControlErrorMessageFromControl(control);
}

export function getDefaultControlErrorMessageFromControl(control: AbstractControl | null): string {
  if (!control || !control.errors || !control.touched) return '';

  const errors = control.errors as ValidationErrors;
  if (errors['required']) return 'Este campo es requerido';
  if (errors['email']) return 'Email inválido';

  const minlength = errors['minlength'] as { requiredLength: number } | undefined;
  if (minlength) return `Mínimo ${minlength.requiredLength} caracteres`;

  const maxlength = errors['maxlength'] as { requiredLength: number } | undefined;
  if (maxlength) return `Máximo ${maxlength.requiredLength} caracteres`;

  const min = errors['min'] as { min: number } | undefined;
  if (min) return `El valor mínimo es ${min.min}`;

  if (errors['pattern']) return 'Formato inválido';

  return 'Campo inválido';
}
