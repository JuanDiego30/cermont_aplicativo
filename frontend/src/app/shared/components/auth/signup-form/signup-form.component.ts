import { Component, OnDestroy, inject } from '@angular/core';
import { LabelComponent } from '../../form/label/label.component';
import { CheckboxComponent } from '../../form/input/checkbox.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { logError } from '../../../../core/utils/logger';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-signup-form',
  standalone: true,
  imports: [LabelComponent, CheckboxComponent, InputFieldComponent, RouterModule, FormsModule],
  templateUrl: './signup-form.component.html',
  styles: ``,
})
export class SignupFormComponent implements OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  showPassword = false;
  isChecked = false;

  fname = '';
  lname = '';
  email = '';
  password = '';

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSignIn() {
    this.authService
      .register({
        name: `${this.fname} ${this.lname}`,
        email: this.email,
        password: this.password,
        role: 'tecnico', // Default role for self-registration, adjust as needed
        phone: '0000000000', // Placeholder or add phone field to form
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err: HttpErrorResponse) => {
          logError('Registration failed', err);
          // Handle error (show message to user)
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
