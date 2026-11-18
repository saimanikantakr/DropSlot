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
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  private deliveryService = inject(DeliveryService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  searchTracking = '';
  private searchSub?: Subscription;

  ngOnInit(): void {
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
