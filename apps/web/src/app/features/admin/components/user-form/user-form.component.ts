import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminService } from '../../../../core/services/admin.service';
import { UserRole } from '../../../../core/models/user.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  form!: FormGroup;
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
    this.form.get('password')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(password => {
        if (password) {
          this.validatePasswordStrength(password);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUser(id: string): void {
    this.loading.set(true);
    this.adminService.getUserById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.form.patchValue({
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone || '',
            avatar: user.avatar || '',
          });
          // En modo edición, el password es opcional
          this.form.get('email')?.disable();
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Error al cargar el usuario');
          this.loading.set(false);
        }
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formValue = this.form.getRawValue(); // getRawValue incluye campos disabled

    if (this.isEditMode() && this.userId) {
      // Actualizar usuario (sin password)
      const { email, password, ...updateDto } = formValue;

      this.adminService.updateUser(this.userId, updateDto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (user) => {
            this.router.navigate(['/admin/users', user.id]);
          },
          error: (err) => {
            this.error.set(err.error?.message || 'Error al actualizar usuario');
            this.loading.set(false);
          }
        });
    } else {
      // Crear nuevo usuario
      this.adminService.createUser(formValue)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (user) => {
            this.router.navigate(['/admin/users', user.id]);
          },
          error: (err) => {
            this.error.set(err.error?.message || 'Error al crear usuario');
            this.loading.set(false);
          }
        });
    }
  }

  onCancel(): void {
    if (this.isEditMode() && this.userId) {
      this.router.navigate(['/admin/users', this.userId]);
    } else {
      this.router.navigate(['/admin/users']);
    }
  }

  hasError(field: string, error: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.hasError(error) && control.touched);
  }

  getErrorMessage(field: string): string {
    const control = this.form.get(field);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;
    if (errors['required']) return 'Este campo es requerido';
    if (errors['email']) return 'Email inválido';
    if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['pattern']) return 'Formato inválido';

    return 'Campo inválido';
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

