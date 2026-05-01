import { Component, OnInit } from '@angular/core';
import { AnalyseService } from '../../../services/analyse.service';
import { AuthService } from '../../../services/auth.service';
import { Analyse } from '../../../models/analyse.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-technicien-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Form Data
  patientId: string = '';
  age: number | null = null;
  sexe: 'Homme' | 'Femme' = 'Homme';
  poids: number | null = null;
  taille: number | null = null;
  antecedents: string = '';

  // Files
  selectedFileFace: File | null = null;
  selectedFileProfil: File | null = null;
  
  // Previews
  previewFace: string | ArrayBuffer | null = null;
  previewProfil: string | ArrayBuffer | null = null;

  isProcessing: boolean = false;
  isMockMode: boolean = false; 
  today: Date = new Date();

  constructor(
    private analyseService: AnalyseService,
    private authService: AuthService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void { }

  onFileSelected(event: any, side: 'FACE' | 'PROFIL') {
    const file = event.target.files[0];
    if (file) {
      if (side === 'FACE') {
        this.selectedFileFace = file;
        const reader = new FileReader();
        reader.onload = e => this.previewFace = reader.result;
        reader.readAsDataURL(file);
      } else {
        this.selectedFileProfil = file;
        const reader = new FileReader();
        reader.onload = e => this.previewProfil = reader.result;
        reader.readAsDataURL(file);
      }
    }
  }

  get isFormValid(): boolean {
    return !!this.patientId && !!this.age && !!this.selectedFileFace && !!this.selectedFileProfil;
  }

  launchAnalysis() {
    if (!this.isFormValid) {
      this.toastr.warning('Veuillez remplir tous les champs et uploader les deux images.', 'Formulaire incomplet');
      return;
    }

    this.isProcessing = true;
    const uploaderId = this.authService.getCurrentUser()?.id || 'TECHNICIAN_DEFAUT';

    this.toastr.info('Lancement de l\'analyse IA (Vue Frontale)...', 'Oxalia RadioAI');

    this.analyseService.uploadScannerAndAnalyze(
      uploaderId,
      this.patientId,
      this.age!,
      this.sexe,
      this.selectedFileFace!,
      this.selectedFileProfil!,
      this.isMockMode,
      this.poids,
      this.taille,
      this.antecedents
    ).subscribe({
      next: (res) => {
        this.isProcessing = false;
        this.toastr.success('Analyse terminée avec succès !', 'Félicitations');
        this.resetForm();
      },
      error: (err) => {
        this.isProcessing = false;
        this.toastr.error('Erreur lors de l\'analyse. Veuillez réessayer.', 'Erreur Serveur');
      }
    });
  }

  resetForm() {
    this.patientId = '';
    this.age = null;
    this.sexe = 'Homme';
    this.poids = null;
    this.taille = null;
    this.antecedents = '';
    this.selectedFileFace = null;
    this.selectedFileProfil = null;
    this.previewFace = null;
    this.previewProfil = null;
    this.isProcessing = false;
  }
}
