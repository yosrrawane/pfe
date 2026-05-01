import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedecinRoutingModule } from './medecin-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    DashboardComponent,
    SettingsComponent
  ],
  imports: [
    CommonModule,
    MedecinRoutingModule,
    FormsModule,
    SharedModule
  ]
})
export class MedecinModule { }
