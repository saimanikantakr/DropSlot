import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { DeliveryService } from '../../services/delivery.service';
import { UserRole } from '../../models/delivery.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <header class="ds-masthead">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
        <!-- Logo and Branding -->
        <div class="d-flex align-items-center gap-3">
          <a routerLink="/" class="text-decoration-none text-reset ds-masthead-title">
            <i class="bi bi-clock-history text-warning"></i>
            <span>DropSlot</span>
          </a>
          <span class="ds-masthead-badge">Dispatch & Slot Coordination</span>
        </div>

        <!-- Quick Live Tracking Search (Two-Way Binding, Live Match on Typing) -->
        <div class="d-flex align-items-center gap-2">
          <div class="input-group input-group-sm" style="max-width: 320px;">
            <span class="input-group-text bg-dark text-muted border-secondary">
              <i class="bi bi-search"></i>
            </span>
            <input
              type="text"
              class="form-control form-control-sm bg-dark text-light border-secondary"
              placeholder="Live track / search consignments..."
              [(ngModel)]="searchTracking"
              (ngModelChange)="onSearchInput($event)"
              autocomplete="off"
            />
            @if (searchTracking) {
              <button
                class="btn btn-dark btn-sm text-muted border-secondary"
                type="button"
                (click)="clearSearch()"
                title="Clear filter"
              >
                <i class="bi bi-x-lg"></i>
              </button>
            }
            <button class="btn btn-outline-warning btn-sm" type="button" (click)="onSearchInput(searchTracking)">
              Track
            </button>
          </div>
        </div>

        <!-- User Profile & Sign Out -->
        <div class="d-flex align-items-center gap-2">
          @if (authService.currentSession; as session) {
            <div class="d-flex align-items-center gap-2 bg-black bg-opacity-25 px-2 py-1 rounded border border-secondary border-opacity-50">
              <span class="badge" [class.bg-warning]="session.role === 'admin'" [class.bg-primary]="session.role === 'partner'" [class.bg-success]="session.role === 'customer'" [class.text-dark]="session.role === 'admin'">
                {{ session.role | uppercase }}
              </span>
              <div class="text-end d-none d-md-block">
                <div class="small fw-bold text-light lh-1">{{ session.username }}</div>
                <small class="text-muted" style="font-size: 0.72rem;">{{ session.email }}</small>
              </div>
              <button
                class="btn btn-sm btn-outline-danger py-1 px-2"
                (click)="logout()"
                title="Sign out of portal"
              >
                <i class="bi bi-box-arrow-right"></i>
              </button>
            </div>
          } @else {
            <a routerLink="/login" class="btn btn-sm btn-warning">Sign In</a>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .ds-masthead {
      border-bottom: 2px solid var(--ds-accent);
      background: #17222c;
    }
    .btn-warning {
      background-color: #c9883b;
      border-color: #b0742f;
      color: #1a1610;
      font-weight: 600;
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  private deliveryService = inject(DeliveryService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  searchTracking = '';
  private searchSub?: Subscription;

  ngOnInit(): void {
    // Keep local header input synchronized if searchQuery$ is updated elsewhere (e.g. from table filter)
    this.searchSub = this.deliveryService.searchQuery$.subscribe(val => {
      if (this.searchTracking !== val) {
        this.searchTracking = val || '';
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  onSearchInput(val: string): void {
    const query = val || '';
    this.deliveryService.setSearchQuery(query);

    // If currently not on /admin (or home), navigate to admin to show the live filtered table without clearing input
    const currentUrl = this.router.url;
    if (query.trim() && !currentUrl.startsWith('/admin') && currentUrl !== '/') {
      this.router.navigate(['/admin']);
    }
  }

  clearSearch(): void {
    this.searchTracking = '';
    this.deliveryService.setSearchQuery('');
  }

  switchRole(role: UserRole): void {
    this.authService.switchRole(role);
    if (role === 'admin') this.router.navigate(['/admin']);
    else if (role === 'partner') this.router.navigate(['/partner']);
    else if (role === 'customer') this.router.navigate(['/customer']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
