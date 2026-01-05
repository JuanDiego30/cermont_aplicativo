import { AbstractControl, FormGroup } from '@angular/forms';

export function hasControlError(
  form: FormGroup,
  field: string,
  error: string,
): boolean {
  const control = form.get(field);
  return !!(control && control.touched && control.hasError(error));
}

export function getDefaultControlErrorMessage(
  form: FormGroup,
  field: string,
): string {
  const control = form.get(field);
  return getDefaultControlErrorMessageFromControl(control);
}

export function getDefaultControlErrorMessageFromControl(
  control: AbstractControl | null,
): string {
  if (!control || !control.errors || !control.touched) return '';

  const errors = control.errors as Record<string, any>;
  if (errors['required']) return 'Este campo es requerido';
  if (errors['email']) return 'Email inválido';
  if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
  if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
  if (errors['min']) return `El valor mínimo es ${errors['min'].min}`;
  if (errors['pattern']) return 'Formato inválido';

  return 'Campo inválido';
}
