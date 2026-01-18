import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminService } from '../../../../core/services/admin.service';
import { UserRole } from '../../../../core/models/user.model';
import {
  getDefaultControlErrorMessage,
  hasControlError,
} from '../../../../shared/utils/form-errors.util';
import { beginFormSubmit, subscribeSubmit } from '../../../../shared/utils/form-submit.util';

type UserFormGroup = FormGroup<{
  email: FormControl<string>;
  password: FormControl<string>;
  name: FormControl<string>;
  role: FormControl<UserRole>;
  phone: FormControl<string>;
  avatar: FormControl<string>;
}>;

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css'],
})
export class UserFormComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  form!: UserFormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  isEditMode = signal(false);
  userId: string | null = null;

  readonly UserRole = UserRole;
  readonly rolesOptions = Object.values(UserRole);

  // Validación de contraseña
  passwordStrength = signal<{
    score: number;
    feedback: string[];
    color: string;
  }>({ score: 0, feedback: [], color: 'gray' });

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEditMode.set(!!this.userId);

    this.initForm();

    if (this.isEditMode() && this.userId) {
      this.loadUser(this.userId);
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode() ? [] : [Validators.required, Validators.minLength(8)]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      role: [UserRole.TECNICO, Validators.required],
      phone: ['', [Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      avatar: [''],
    });

    // Monitorear cambios en la contraseña para validación en tiempo real
    this.form.controls.password.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(password => {
        if (password) {
          this.validatePasswordStrength(password);
        }
      });
  }

  loadUser(id: string): void {
    this.loading.set(true);
    this.adminService
      .getUserById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: user => {
          this.form.patchValue({
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone || '',
            avatar: user.avatar || '',
          });
          // En modo edición, el password es opcional
          this.form.controls.email.disable();
          this.loading.set(false);
        },
        error: err => {
          this.error.set('Error al cargar el usuario');
          this.loading.set(false);
        },
      });
  }

  validatePasswordStrength(password: string): void {
    let score = 0;
    const feedback: string[] = [];

    // Longitud
    if (password.length >= 8) score++;
    else feedback.push('Debe tener al menos 8 caracteres');

    // Mayúsculas
    if (/[A-Z]/.test(password)) score++;
    else feedback.push('Debe incluir al menos una mayúscula');

    // Minúsculas
    if (/[a-z]/.test(password)) score++;
    else feedback.push('Debe incluir al menos una minúscula');

    // Números
    if (/[0-9]/.test(password)) score++;
    else feedback.push('Debe incluir al menos un número');

    // Caracteres especiales
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    else feedback.push('Debe incluir al menos un carácter especial');

    // Determinar color según score
    let color = 'gray';
    if (score >= 4) color = 'green';
    else if (score >= 3) color = 'yellow';
    else if (score >= 2) color = 'orange';
    else color = 'red';

    this.passwordStrength.set({ score, feedback, color });
  }

  onSubmit(): void {
    if (!beginFormSubmit(this.form, this.loading, this.error)) return;

    const formValue = this.form.getRawValue(); // getRawValue incluye campos disabled

    if (this.isEditMode() && this.userId) {
      // Actualizar usuario (sin password)
      const { email, password, ...updateDto } = formValue;

      subscribeSubmit(
        this.adminService.updateUser(this.userId, updateDto),
        this.destroyRef,
        this.loading,
        this.error,
        user => this.router.navigate(['/admin/users', user.id]),
        'Error al actualizar usuario'
      );
    } else {
      // Crear nuevo usuario
      subscribeSubmit(
        this.adminService.createUser(formValue),
        this.destroyRef,
        this.loading,
        this.error,
        user => this.router.navigate(['/admin/users', user.id]),
        'Error al crear usuario'
      );
    }
  }

  onCancel(): void {
    const userId = this.userId;
    const commands = this.isEditMode() && userId ? ['/admin/users', userId] : ['/admin/users'];

    this.router.navigate(commands);
  }

  hasError(field: string, error: string): boolean {
    const form = this.form;
    return hasControlError(form, field, error);
  }

  getErrorMessage(field: string): string {
    const form = this.form;
    return getDefaultControlErrorMessage(form, field);
  }

  getPasswordStrengthLabel(): string {
    const score = this.passwordStrength().score;
    if (score >= 5) return 'Muy fuerte';
    if (score >= 4) return 'Fuerte';
    if (score >= 3) return 'Media';
    if (score >= 2) return 'Débil';
    return 'Muy débil';
  }
}
