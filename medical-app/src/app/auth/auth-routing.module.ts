import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HelpButtonsComponent } from './components/help-buttons/help-buttons.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'help-buttons', component: HelpButtonsComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
