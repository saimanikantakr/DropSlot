import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/delivery.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container py-5" style="max-width: 780px;">
      <!-- Title Banner -->
      <div class="text-center mb-4">
        <div class="display-6 fw-bold mb-1" style="font-family: var(--ds-font-serif); color: var(--ds-ink-primary);">
          <i class="bi bi-clock-history text-warning me-2"></i>DropSlot
        </div>
        <p class="text-muted small text-uppercase letter-spacing-1">
          Smart Delivery Slot & Dispatch Management Portal
        </p>
      </div>

      <!-- Quick Persona Selection -->
      <div class="ds-card mb-4">
        <div class="ds-card-header">
          <h5 class="ds-card-title">
            <i class="bi bi-person-bounding-box text-warning"></i>
            Select Interactive Portal Persona
          </h5>
          <span class="badge bg-secondary">Instant Demo Access</span>
        </div>
        <div class="ds-card-body">
          <p class="text-muted small mb-3">
            Select one of the three operational roles below to experience DropSlot from each stakeholder's perspective:
          </p>

          <div class="row g-3">
            <!-- Admin Persona -->
            <div class="col-md-4">
              <div
                class="p-3 border rounded h-100 cursor-pointer role-card"
                (click)="quickLogin('admin')"
              >
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <span class="badge bg-dark">HUB ADMIN</span>
                  <i class="bi bi-shield-check fs-5 text-primary"></i>
                </div>
                <strong class="d-block text-dark mb-1">Operations Hub</strong>
                <p class="text-muted small mb-2" style="font-size: 0.78rem;">
                  Manage all dispatches, assign couriers, balance slot capacity, and edit consignments.
                </p>
                <button type="button" class="ds-btn ds-btn-primary ds-btn-sm w-100 justify-content-center">
                  Launch Admin <i class="bi bi-arrow-right"></i>
                </button>
              </div>
            </div>

            <!-- Partner Persona -->
            <div class="col-md-4">
              <div
                class="p-3 border rounded h-100 cursor-pointer role-card"
                (click)="quickLogin('partner')"
              >
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <span class="badge bg-primary">COURIER FLEET</span>
                  <i class="bi bi-bicycle fs-5 text-success"></i>
                </div>
                <strong class="d-block text-dark mb-1">Rajesh Sharma</strong>
                <p class="text-muted small mb-2" style="font-size: 0.78rem;">
                  View assigned run-sheet, slot windows, customer gate instructions, and mark deliveries.
                </p>
                <button type="button" class="ds-btn ds-btn-accent ds-btn-sm w-100 justify-content-center">
                  Launch Partner <i class="bi bi-arrow-right"></i>
                </button>
              </div>
            </div>

            <!-- Customer Persona -->
            <div class="col-md-4">
              <div
                class="p-3 border rounded h-100 cursor-pointer role-card"
                (click)="quickLogin('customer')"
              >
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <span class="badge bg-warning text-dark">CONSIGNEE</span>
                  <i class="bi bi-box2-heart fs-5 text-warning"></i>
                </div>
                <strong class="d-block text-dark mb-1">Manikanta Reddy</strong>
                <p class="text-muted small mb-2" style="font-size: 0.78rem;">
                  Track incoming packages, pick Morning/Afternoon/Evening slots, and enter gate notes.
                </p>
                <button type="button" class="ds-btn ds-btn-outline ds-btn-sm w-100 justify-content-center">
                  Launch Customer <i class="bi bi-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Traditional Credentials Fallback -->
      <div class="ds-card">
        <div class="ds-card-header">
          <span class="fw-bold small text-uppercase">Custom Account Sign In</span>
        </div>
        <div class="ds-card-body">
          <form (ngSubmit)="manualLogin()">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="ds-form-label">Email or Phone</label>
                <input
                  type="text"
                  class="ds-form-control"
                  placeholder="admin@dropslot.com"
                  [(ngModel)]="email"
                  name="email"
                />
              </div>
              <div class="col-md-6">
                <label class="ds-form-label">Role Target</label>
                <select class="ds-form-control" [(ngModel)]="selectedRole" name="role">
                  <option value="admin">Operations Admin</option>
                  <option value="partner">Delivery Partner</option>
                  <option value="customer">Customer / Consignee</option>
                </select>
              </div>
              <div class="col-12 text-end">
                <button type="submit" class="ds-btn ds-btn-primary">
                  Sign In <i class="bi bi-box-arrow-in-right"></i>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .role-card {
      background: #faf8f3;
      border-color: var(--ds-border) !important;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .role-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
      background: #ffffff;
    }
  `]
})
export class LoginComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  email = 'admin@dropslot.com';
  selectedRole: UserRole = 'admin';

  quickLogin(role: UserRole): void {
    this.authService.loginWithDemo(role);
    this.navigateForRole(role);
  }

  manualLogin(): void {
    this.authService.login(this.email, this.selectedRole);
    this.navigateForRole(this.selectedRole);
  }

  private navigateForRole(role: UserRole): void {
    if (role === 'admin') {
      this.router.navigate(['/admin']);
    } else if (role === 'partner') {
      this.router.navigate(['/partner']);
    } else {
      this.router.navigate(['/customer']);
    }
  }
}
