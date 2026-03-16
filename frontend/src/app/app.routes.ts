import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const appRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent)
  },
  {
    path: 'sites',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/sites/site-list/site-list.component').then((m) => m.SiteListComponent)
  },
  {
    path: 'sites/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/sites/site-form/site-form.component').then((m) => m.SiteFormComponent)
  },
  {
    path: 'sites/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/sites/site-detail/site-detail.component').then(
        (m) => m.SiteDetailComponent
      )
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
  },
  {
    path: 'compare',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/compare/compare.component').then((m) => m.CompareComponent)
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'sites'
  },
  {
    path: '**',
    redirectTo: 'sites'
  }
];
