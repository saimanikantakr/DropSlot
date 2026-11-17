import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { PartnerViewComponent } from './pages/partner-view/partner-view.component';
import { CustomerViewComponent } from './pages/customer-view/customer-view.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'admin'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'partner',
    component: PartnerViewComponent,
    canActivate: [authGuard],
    data: { roles: ['partner', 'admin'] }
  },
  {
    path: 'customer',
    component: CustomerViewComponent,
    canActivate: [authGuard],
    data: { roles: ['customer', 'admin'] }
  },
  {
    path: '**',
    redirectTo: 'admin'
  }
];
