import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, SignUpPayload } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-container">
        <!-- Brand Header -->
        <div class="text-center mb-4">
          <div class="brand-logo mb-2">
            <i class="bi bi-clock-history"></i>
          </div>
          <h2 class="auth-brand-name">DropSlot</h2>
          <p class="auth-brand-subtitle">Smart Delivery Slot & Dispatch Management Portal</p>
        </div>

        <!-- Auth Card -->
        <div class="auth-card">
          <!-- Segmented Navigation Pill -->
          <div class="auth-tabs">
            <button
              type="button"
              class="auth-tab-btn"
              [class.active]="authMode === 'login'"
              (click)="setMode('login')"
            >
              Sign In
            </button>
            <button
              type="button"
              class="auth-tab-btn"
              [class.active]="authMode === 'signup'"
              (click)="setMode('signup')"
            >
              Create Account
            </button>
          </div>

          <!-- Alert Notifications -->
          @if (errorMessage) {
            <div class="alert alert-danger py-2 px-3 small d-flex align-items-center mb-3">
              <i class="bi bi-exclamation-circle-fill me-2 fs-6"></i>
              <div class="flex-grow-1">{{ errorMessage }}</div>
              <button type="button" class="btn-close py-1" (click)="errorMessage = ''"></button>
            </div>
          }
          @if (successMessage) {
            <div class="alert alert-success py-2 px-3 small d-flex align-items-center mb-3">
              <i class="bi bi-check-circle-fill me-2 fs-6"></i>
              <div class="flex-grow-1">{{ successMessage }}</div>
              <button type="button" class="btn-close py-1" (click)="successMessage = ''"></button>
            </div>
          }

          <!-- SIGN IN FORM -->
          @if (authMode === 'login') {
            <form [formGroup]="loginForm" (ngSubmit)="onLoginSubmit()">
              <div class="mb-3">
                <label class="form-label-custom">Email Address</label>
                <div class="input-icon-group">
                  <i class="bi bi-envelope"></i>
                  <input
                    type="email"
                    class="form-control-custom"
                    placeholder="name@company.com"
                    formControlName="email"
                    autocomplete="email"
                  />
                </div>
                @if (loginForm.get('email')?.touched && loginForm.get('email')?.invalid) {
                  <small class="field-error">Please enter a valid email address.</small>
                }
              </div>

              <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <label class="form-label-custom mb-0">Password</label>
                  <span class="text-muted small" style="font-size: 0.76rem;">Default: <code>password123</code></span>
                </div>
                <div class="input-icon-group">
                  <i class="bi bi-lock"></i>
                  <input
                    [type]="showPassword ? 'text' : 'password'"
                    class="form-control-custom"
                    placeholder="Enter your password"
                    formControlName="password"
                    autocomplete="current-password"
                  />
                  <button
                    type="button"
                    class="password-toggle"
                    (click)="showPassword = !showPassword"
                    tabindex="-1"
                  >
                    <i class="bi" [class.bi-eye]="!showPassword" [class.bi-eye-slash]="showPassword"></i>
                  </button>
                </div>
                @if (loginForm.get('password')?.touched && loginForm.get('password')?.invalid) {
                  <small class="field-error">Password is required.</small>
                }
              </div>

              <button
                type="submit"
                class="btn-submit"
                [disabled]="loginForm.invalid || isLoading"
              >
                @if (isLoading) {
                  <span class="spinner-border spinner-border-sm me-2"></span> Signing in...
                } @else {
                  Sign In <i class="bi bi-arrow-right ms-1"></i>
                }
              </button>

              <div class="auth-footer-prompt mt-3 text-center">
                <span class="text-muted small">Don't have an account? </span>
                <a href="javascript:void(0)" class="switch-link" (click)="setMode('signup')">Create one now</a>
              </div>
            </form>
          }

          <!-- CREATE ACCOUNT (SIGN UP) FORM -->
          @if (authMode === 'signup') {
            <form [formGroup]="signUpForm" (ngSubmit)="onSignUpSubmit()">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label-custom">Full Name</label>
                  <div class="input-icon-group">
                    <i class="bi bi-person"></i>
                    <input
                      type="text"
                      class="form-control-custom"
                      placeholder="e.g. Manikanta Reddy"
                      formControlName="fullName"
                    />
                  </div>
                  @if (signUpForm.get('fullName')?.touched && signUpForm.get('fullName')?.invalid) {
                    <small class="field-error">Full name is required (min 2 characters).</small>
                  }
                </div>

                <div class="col-12">
                  <label class="form-label-custom">Email Address</label>
                  <div class="input-icon-group">
                    <i class="bi bi-envelope"></i>
                    <input
                      type="email"
                      class="form-control-custom"
                      placeholder="e.g. user@dropslot.com"
                      formControlName="email"
                    />
                  </div>
                  @if (signUpForm.get('email')?.touched && signUpForm.get('email')?.invalid) {
                    <small class="field-error">Please enter a valid email address.</small>
                  }
                </div>

                <div class="col-md-6">
                  <label class="form-label-custom">Mobile Number (10 Digits)</label>
                  <div class="input-icon-group">
                    <i class="bi bi-telephone"></i>
                    <input
                      type="text"
                      inputmode="numeric"
                      maxlength="10"
                      class="form-control-custom"
                      placeholder="9876543210"
                      formControlName="phone"
                      (input)="onPhoneInput($event)"
                      (keypress)="onlyNumbers($event)"
                    />
                  </div>
                </div>

                <div class="col-md-6">
                  <label class="form-label-custom">Password (Min 6 chars)</label>
                  <div class="input-icon-group">
                    <i class="bi bi-lock"></i>
                    <input
                      type="password"
                      class="form-control-custom"
                      placeholder="••••••••"
                      formControlName="password"
                    />
                  </div>
                  @if (signUpForm.get('password')?.touched && signUpForm.get('password')?.invalid) {
                    <small class="field-error">Password must be at least 6 characters.</small>
                  }
                </div>

                <div class="col-12">
                  <label class="form-label-custom">Account Role</label>
                  <select class="form-control-custom select-custom" formControlName="role">
                    <option value="ROLE_CUSTOMER">Customer (Track deliveries & book slots)</option>
                    <option value="ROLE_PARTNER">Delivery Courier Partner (Route manifest & deliveries)</option>
                    <option value="ROLE_ADMIN">Hub Operations Administrator (Master dispatch ledger)</option>
                  </select>
                </div>

                @if (signUpForm.get('role')?.value === 'ROLE_PARTNER') {
                  <div class="col-md-6">
                    <label class="form-label-custom">Vehicle Type</label>
                    <select class="form-control-custom select-custom" formControlName="vehicleType">
                      <option value="Electric Cargo Van">Electric Cargo Van</option>
                      <option value="Electric Bike">Electric Bike</option>
                      <option value="Motorcycle">Motorcycle</option>
                      <option value="EV 3-Wheeler">EV 3-Wheeler</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label-custom">Assigned Zone</label>
                    <input
                      type="text"
                      class="form-control-custom"
                      placeholder="e.g. Bangalore South"
                      formControlName="serviceZone"
                    />
                  </div>
                }
              </div>

              <button
                type="submit"
                class="btn-submit mt-4"
                [disabled]="signUpForm.invalid || isLoading"
              >
                @if (isLoading) {
                  <span class="spinner-border spinner-border-sm me-2"></span> Creating Account...
                } @else {
                  Create Account <i class="bi bi-check-lg ms-1"></i>
                }
              </button>

              <div class="auth-footer-prompt mt-3 text-center">
                <span class="text-muted small">Already have an account? </span>
                <a href="javascript:void(0)" class="switch-link" (click)="setMode('login')">Sign In</a>
              </div>
            </form>
          }
        </div>

        <!-- Discreet System Credentials Reference -->
        <div class="text-center mt-3">
          <small class="text-muted" style="font-size: 0.74rem;">
            Seeded Accounts: <code>admin&#64;dropslot.com</code> &bull; <code>rajesh.delivery&#64;dropslot.com</code> &bull; <code>manikanta&#64;gmail.com</code> (Password: <code>password123</code>)
          </small>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f4f1ea;
      padding: 2rem 1rem;
    }
    .auth-container {
      width: 100%;
      max-width: 460px;
    }
    .brand-logo {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background: #17222c;
      color: #c9883b;
      font-size: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(23, 34, 44, 0.15);
    }
    .auth-brand-name {
      font-family: var(--ds-font-serif, Georgia, serif);
      color: #17222c;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .auth-brand-subtitle {
      font-size: 0.8rem;
      color: #6c757d;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-top: 2px;
    }
    .auth-card {
      background: #ffffff;
      border: 1px solid #e0dbce;
      border-radius: 14px;
      padding: 2rem;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
    }
    .auth-tabs {
      display: flex;
      background: #f0ece1;
      padding: 4px;
      border-radius: 10px;
      margin-bottom: 1.5rem;
    }
    .auth-tab-btn {
      flex: 1;
      border: none;
      background: transparent;
      padding: 8px 12px;
      font-size: 0.88rem;
      font-weight: 600;
      color: #6c757d;
      border-radius: 8px;
      transition: all 0.18s ease;
      cursor: pointer;
    }
    .auth-tab-btn.active {
      background: #ffffff;
      color: #17222c;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    }
    .form-label-custom {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: #2c3844;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .input-icon-group {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-icon-group i.bi:not(.bi-eye):not(.bi-eye-slash) {
      position: absolute;
      left: 12px;
      color: #9ba3ab;
      font-size: 1rem;
      pointer-events: none;
    }
    .form-control-custom {
      width: 100%;
      padding: 10px 12px 10px 38px;
      border: 1.5px solid #d5cec0;
      border-radius: 8px;
      background: #fdfcf9;
      font-size: 0.92rem;
      color: #17222c;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .form-control-custom:focus {
      outline: none;
      border-color: #c9883b;
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(201, 136, 59, 0.15);
    }
    .select-custom {
      padding-left: 14px;
    }
    .password-toggle {
      position: absolute;
      right: 10px;
      background: none;
      border: none;
      color: #8c959f;
      cursor: pointer;
      padding: 4px;
    }
    .field-error {
      color: #dc3545;
      font-size: 0.76rem;
      margin-top: 4px;
      display: block;
    }
    .btn-submit {
      width: 100%;
      padding: 11px;
      background: #17222c;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: background 0.15s ease, transform 0.1s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-submit:hover:not(:disabled) {
      background: #253443;
      transform: translateY(-1px);
    }
    .btn-submit:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }
    .switch-link {
      color: #b0742f;
      font-weight: 600;
      text-decoration: none;
    }
    .switch-link:hover {
      text-decoration: underline;
    }
  `]
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
