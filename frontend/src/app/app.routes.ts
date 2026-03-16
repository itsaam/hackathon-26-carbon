import { Routes } from '@angular/router';

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
    loadComponent: () =>
      import('./features/sites/site-list/site-list.component').then((m) => m.SiteListComponent)
  },
  {
    path: 'sites/new',
    loadComponent: () =>
      import('./features/sites/site-form/site-form.component').then((m) => m.SiteFormComponent)
  },
  {
    path: 'sites/:id',
    loadComponent: () =>
      import('./features/sites/site-detail/site-detail.component').then(
        (m) => m.SiteDetailComponent
      )
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
  },
  {
    path: 'compare',
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
