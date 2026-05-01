import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LayoutComponent } from './components/layout/layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AiChatComponent } from './components/ai-chat/ai-chat.component';
import { FormsModule } from '@angular/forms';
@NgModule({
  declarations: [
    NavbarComponent,
    LayoutComponent,
    SidebarComponent,
    AiChatComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    BaseChartDirective,
    FormsModule
  ],
  exports: [
    NavbarComponent,
    LayoutComponent,
    SidebarComponent,
    AiChatComponent,
    BaseChartDirective,
    RouterModule,
    CommonModule,
    FormsModule
  ]
})
export class SharedModule { }
