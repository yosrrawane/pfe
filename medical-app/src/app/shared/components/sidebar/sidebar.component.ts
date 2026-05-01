import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

interface MenuItem {
  title: string;
  icon: string;
  link: string;
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menuItems: MenuItem[] = [
    { title: 'Tableau de Bord', icon: 'dashboard', link: '/admin', roles: ['ROLE_ADMIN'] },
    { title: 'Console (Médecin)', icon: 'medical_services', link: '/medecin', roles: ['ROLE_MEDECIN'] },
    { title: 'Analyse Scanner', icon: 'upload_file', link: '/technicien', roles: ['ROLE_TECHNICIEN'] },
    { title: 'Utilisateurs', icon: 'group', link: '/admin/users', roles: ['ROLE_ADMIN'] },
    { title: 'Historique', icon: 'history', link: '/medecin/history', roles: ['ROLE_MEDECIN'] },
    { title: 'Configuration', icon: 'settings', link: '/settings', roles: ['ROLE_ADMIN', 'ROLE_MEDECIN', 'ROLE_TECHNICIEN'] },
  ];

  filteredMenu: MenuItem[] = [];

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.filteredMenu = this.menuItems
        .filter(item => item.roles.some(role => user.roles.includes(role)))
        .map(item => {
          // Dynamic Routing for Configuration
          if (item.title === 'Configuration' && user.roles.includes('ROLE_MEDECIN')) {
            return { ...item, link: '/medecin/settings' };
          }
          return item;
        });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
