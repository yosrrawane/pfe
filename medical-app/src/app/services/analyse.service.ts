import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout, catchError } from 'rxjs';
import { Analyse } from '../models/analyse.model';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnalyseService {
  private apiUrl = `${environment.apiUrl}/analyses`;

  constructor(private http: HttpClient) { }

  getAnalyses(): Observable<Analyse[]> {
    return this.http.get<Analyse[]>(this.apiUrl);
  }

  getAnalyseById(id: string): Observable<Analyse> {
    return this.http.get<Analyse>(`${this.apiUrl}/${id}`);
  }

  getAnalysesByTechnicien(id: string): Observable<Analyse[]> {
    // Filtrage fait côté client pour le moment, ou peut être fait via query param coté serveur
    return this.http.get<Analyse[]>(this.apiUrl).pipe(
      map(analyses => analyses.filter(a => a.technicienId === id))
    );
  }

  getPendingAnalyses(): Observable<Analyse[]> {
    return this.http.get<Analyse[]>(`${this.apiUrl}/pending`);
  }

  getValidatedAnalyses(): Observable<Analyse[]> {
    return this.http.get<Analyse[]>(`${this.apiUrl}/history`);
  }

  uploadScannerAndAnalyze(
    uploaderId: string, 
    patientId: string, 
    age: number, 
    sexe: string, 
    imageFace: File, 
    imageProfil: File, 
    mock: boolean = false,
    poids?: number | null,
    taille?: number | null,
    antecedents?: string
  ): Observable<Analyse> {
    const formData = new FormData();
    formData.append('uploaderId', uploaderId);
    formData.append('patientId', patientId);
    formData.append('age', age.toString());
    formData.append('sexe', sexe);
    if (poids) formData.append('poids', poids.toString());
    if (taille) formData.append('taille', taille.toString());
    if (antecedents) formData.append('antecedents', antecedents);
    formData.append('imageFace', imageFace);
    formData.append('imageProfil', imageProfil);
    
    return this.http.post<Analyse>(`${this.apiUrl}/upload?mock=${mock}`, formData).pipe(
      timeout(30000), // Augmenté à 30s pour double upload
      catchError(err => {
        console.error("🚩 [RESEAU] Erreur lors de l'upload patient:", err);
        throw err;
      })
    );
  }

  validateAnalyse(
    analyseId: string, 
    medecinId: string,
    commentaire: string, 
    clinicalData: any
  ): Observable<Analyse> {
    const payload = { 
      medecinId,
      commentaire, 
      isValide: true,
      ...clinicalData 
    };
    return this.http.post<Analyse>(`${this.apiUrl}/${analyseId}/validate`, payload);
  }

  correctAnalyse(
    analyseId: string, 
    medecinId: string, 
    commentaire: string, 
    pathoCorrigee: string, 
    rapportCorrige: string,
    clinicalData: any
  ): Observable<Analyse> {
    const payload = { 
      medecinId, 
      commentaire, 
      pathoCorrigee, 
      rapportCorrige,
      ...clinicalData
    };
    return this.http.post<Analyse>(`${this.apiUrl}/${analyseId}/correct`, payload);
  }

  triggerRetrain(): Observable<any> {
    return this.http.post(`${environment.apiUrl}/admin/retrain`, {});
  }

  getGlobalStats(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/admin/stats`);
  }
}
