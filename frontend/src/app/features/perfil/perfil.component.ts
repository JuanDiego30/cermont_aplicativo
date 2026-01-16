import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { UpdateUserDto, User, UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  // template: `<div>Perfil Component Works (Inline)</div>`,
  styleUrls: ['./perfil.component.css'],
})
export class PerfilComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly destroy$ = new Subject<void>();

  user = signal<User | null>(null);
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  loading = signal(false);
  saving = signal(false);
  success = signal<string | null>(null);
  error = signal<string | null>(null);

  activeTab = signal<'profile' | 'security' | 'preferences'>('profile');

  ngOnInit(): void {
    const currentUser = this.authService.currentUserSignal();
    if (currentUser) {
      this.user.set(currentUser as User);
    }
    this.initializeForms();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeForms(): void {
    const user = this.user();

    this.profileForm = this.fb.group({
      name: [user?.name || '', [Validators.required, Validators.minLength(3)]],
      email: [user?.email || '', [Validators.required, Validators.email]],
      phone: [user?.phone || '', [Validators.pattern(/^[0-9]{10}$/)]],
      avatar: [user?.avatar || null],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  onAvatarChanged(url: string): void {
    this.profileForm.patchValue({ avatar: url });
    this.saveProfile();
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);

    const userId = this.user()?.id;
    if (!userId) return;

    const updateData: UpdateUserDto = this.profileForm.value;

    this.userService
      .updateUser(userId, updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: updatedUser => {
          this.user.set(updatedUser);
          this.success.set('Perfil actualizado exitosamente');
          this.saving.set(false);
          setTimeout(() => this.success.set(null), 3000);
        },
        error: err => {
          this.error.set(err.error?.message || 'Error al actualizar el perfil');
          this.saving.set(false);
          setTimeout(() => this.error.set(null), 3000);
        },
      });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.userService
      .changePassword(currentPassword, newPassword)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.success.set('Contraseña actualizada exitosamente');
          this.passwordForm.reset();
          this.saving.set(false);
          setTimeout(() => this.success.set(null), 3000);
        },
        error: err => {
          this.error.set(err.error?.message || 'Error al cambiar la contraseña');
          this.saving.set(false);
          setTimeout(() => this.error.set(null), 3000);
        },
      });
  }

  setActiveTab(tab: 'profile' | 'security' | 'preferences'): void {
    this.activeTab.set(tab);
  }

  hasError(formName: 'profile' | 'password', controlName: string, errorType: string): boolean {
    const form = formName === 'profile' ? this.profileForm : this.passwordForm;
    const control = form.get(controlName);
    return !!(control?.hasError(errorType) && control?.touched);
  }

  getTabClass(tabName: 'profile' | 'security' | 'preferences') {
    const isActive = this.activeTab() === tabName;
    return {
      'bg-cermont-primary-50': isActive,
      'dark:bg-cermont-primary-900/20': isActive,
      'text-cermont-primary-700': isActive,
      'dark:text-cermont-primary-400': isActive,
    };
  }
}
