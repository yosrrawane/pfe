import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  isLightMode = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
    this.isLightMode = localStorage.getItem('landing-theme') === 'light';
  }

  toggleTheme() {
    this.isLightMode = !this.isLightMode;
    localStorage.setItem('landing-theme', this.isLightMode ? 'light' : 'dark');
  }

  fillCredentials(email: string, role: string) {
    // Mock login for UI demonstration
    const fakeUser = {
      token: 'demo-token',
      type: 'Bearer',
      id: 'demo-1',
      nom: 'Demo',
      prenom: role.charAt(0).toUpperCase() + role.slice(1),
      email: email,
      roles: ['ROLE_' + role.toUpperCase()]
    };
    
    // Update local storage and service state
    localStorage.setItem('currentUser', JSON.stringify(fakeUser));
    
    // Force reload to apply state if we can't access the private subject
    // Or we can just navigate and let the guard read localStorage
    if (role.toUpperCase() === 'ADMIN') {
      window.location.href = '/dashboard/admin';
    } else if (role.toUpperCase() === 'MEDECIN') {
      window.location.href = '/dashboard/medecin';
    } else {
      window.location.href = '/dashboard/technicien';
    }
  }

  onSubmit() {
    if (this.loginForm.invalid) return;
    
    this.isLoading = true;
    const credentials = this.loginForm.value;
    
    this.authService.login(credentials).subscribe({
      next: (user) => {
        this.isLoading = false;
        this.toastr.success(`Bienvenue, ${user.prenom} !`, 'Connexion réussie');
        
        if (user.roles?.includes('ROLE_ADMIN')) {
          this.router.navigate(['/admin']);
        } else if (user.roles?.includes('ROLE_MEDECIN')) {
          this.router.navigate(['/medecin']);
        } else if (user.roles?.includes('ROLE_TECHNICIEN')) {
          this.router.navigate(['/technicien']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error('Identifiants incorrects ou serveur injoignable.', 'Erreur de connexion');
        console.error(err);
      }
    });
  }
}

