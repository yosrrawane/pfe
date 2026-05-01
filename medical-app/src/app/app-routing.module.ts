import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { LayoutComponent } from './shared/components/layout/layout.component';

import { LandingComponent } from './landing/landing.component';

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
  {
    path: 'dashboard',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'medecin', pathMatch: 'full' },
      { 
        path: 'admin', 
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN'] },
        loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) 
      },
      { 
        path: 'medecin', 
        canActivate: [roleGuard],
        data: { roles: ['ROLE_MEDECIN'] },
        loadChildren: () => import('./medecin/medecin.module').then(m => m.MedecinModule) 
      },
      { 
        path: 'technicien', 
        canActivate: [roleGuard],
        data: { roles: ['ROLE_TECHNICIEN'] },
        loadChildren: () => import('./technicien/technicien.module').then(m => m.TechnicienModule) 
      }
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
