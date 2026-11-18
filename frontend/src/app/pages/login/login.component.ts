import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, SignUpPayload } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  authMode: 'login' | 'signup' = 'login';
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  loginForm: FormGroup;
  signUpForm: FormGroup;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['admin@dropslot.com', [Validators.required, Validators.email]],
      password: ['password123', Validators.required]
    });

    this.signUpForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', [Validators.pattern(/^[6-9][0-9]{9}$/)]],
      role: ['ROLE_CUSTOMER', Validators.required],
      vehicleType: ['Electric Bike'],
      serviceZone: ['Central Hub']
    });
  }

  setMode(mode: 'login' | 'signup'): void {
    this.authMode = mode;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onlyNumbers(event: KeyboardEvent): boolean {
    const input = event.target as HTMLInputElement;
    const selectedLength = (input.selectionEnd || 0) - (input.selectionStart || 0);
    if (input.value.length >= 10 && selectedLength === 0) {
      event.preventDefault();
      return false;
    }
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let cleaned = (input.value || '').replace(/\D/g, '');
    if (cleaned.length > 10) cleaned = cleaned.substring(0, 10);
    input.value = cleaned;
    this.signUpForm.get('phone')?.setValue(cleaned);
  }

  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;
    this.authService.realLogin(email, password).subscribe({
      next: (session) => {
        this.isLoading = false;
        this.navigateForRole(session.role);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid email or password. Please verify your credentials.';
      }
    });
  }

  onSignUpSubmit(): void {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    const payload: SignUpPayload = this.signUpForm.value;
    this.authService.realSignUp(payload).subscribe({
      next: (session) => {
        this.isLoading = false;
        this.successMessage = `Account created successfully! Redirecting...`;
        setTimeout(() => this.navigateForRole(session.role), 700);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Registration failed. An account with this email may already exist.';
      }
    });
  }

  private navigateForRole(role: string): void {
    if (role === 'admin') {
      this.router.navigate(['/admin']);
    } else if (role === 'partner') {
      this.router.navigate(['/partner']);
    } else {
      this.router.navigate(['/customer']);
    }
  }
}
