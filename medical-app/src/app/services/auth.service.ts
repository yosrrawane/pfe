import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface JwtResponse {
  token: string;
  type: string;
  id: string;
  nom: string;
  prenom: string;
  email: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<JwtResponse | null>(null);

  constructor(private http: HttpClient) {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      this.currentUserSubject.next(JSON.parse(saved));
    }
  }

  login(credentials: any): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('currentUser', JSON.stringify(response));
          this.currentUserSubject.next(response);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): JwtResponse | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    const user = this.getCurrentUser();
    return user ? user.token : null;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user ? user.roles.includes('ROLE_ADMIN') : false;
  }

  isMedecin(): boolean {
    const user = this.getCurrentUser();
    return user ? user.roles.includes('ROLE_MEDECIN') : false;
  }

  isTechnicien(): boolean {
    const user = this.getCurrentUser();
    return user ? user.roles.includes('ROLE_TECHNICIEN') : false;
  }
}

