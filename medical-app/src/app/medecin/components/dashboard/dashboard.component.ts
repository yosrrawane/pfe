import { Component, OnInit } from '@angular/core';
import { AnalyseService } from '../../../services/analyse.service';
import { AuthService } from '../../../services/auth.service';
import { Analyse } from '../../../models/analyse.model';
import { ToastrService } from 'ngx-toastr';
import { ChartConfiguration, ChartData } from 'chart.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  pendingAnalyses: Analyse[] = [];
  historyAnalyses: Analyse[] = [];
  groupedPending: { dateLabel: string; items: Analyse[] }[] = [];
  groupedHistory: { dateLabel: string; items: Analyse[] }[] = [];
  selectedAnalyse: Analyse | null = null;
  today: Date = new Date();
  searchTerm: string = '';

  get filteredHistory() {
    if (!this.searchTerm) return this.historyAnalyses;
    return this.historyAnalyses.filter(a => 
      a.patientId.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  get filteredGroupedHistory() {
    return this.groupByDate(this.filteredHistory);
  }

  evaluationComment: string = '';
  isSaving: boolean = false;

  activeTab: 'PENDING' | 'HISTORY' = 'PENDING';
  showHeatmap: boolean = true;

  selectedFile: File | null = null;
  filePreview: string | ArrayBuffer | null = null;
  isAnalyzing: boolean = false;
  isLoadingImage: boolean = false;
  private pollingInterval: any;
  private lastPendingCount = 0;

  // Advanced Correction Mode
  isCorrectionMode: boolean = false;
  correctedPathology: string = '';
  correctedRapport: string = '';

  availablePathologies: string[] = [
    "Cardiomegaly",
    "Edema",
    "Consolidation",
    "Pneumonia",
    "Atelectasis",
    "Pneumothorax",
    "Pleural Effusion",
    "Normal"
  ];

  // Clinical Exam Data
  toux: boolean = false;
  fievre: boolean = false;
  douleurThoracique: boolean = false;
  auscultation: string = '';
  anomaliesRespiratoires: string = '';
  signesCliniques: string = '';

  // Viewer Controls
  brightness: number = 100;
  contrast: number = 100;
  invert: boolean = false;

  resetFilters() {
    this.brightness = 100;
    this.contrast = 100;
    this.invert = false;
  }


  // Chart Properties for Dark Themed Dashboard
  public barChartData: ChartData<'bar'> = {
    labels: ['Risque Élevé', 'Risque Moyen', 'Risque Faible'],
    datasets: [
      {
        data: [12, 19, 3],
        label: 'Distribution des Risques',
        backgroundColor: ['rgba(239, 68, 68, 0.6)', 'rgba(245, 158, 11, 0.6)', 'rgba(16, 185, 129, 0.6)'],
        borderColor: ['#ef4444', '#f59e0b', '#10b981'],
        borderWidth: 1,
        borderRadius: 8
      }
    ]
  };

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
    }
  };

  public lineChartData: ChartData<'line'> = {
    labels: ['Jan', 'Féb', 'Mar', 'Avr', 'Mai', 'Juin'],
    datasets: [
      {
        data: [33, 25, 35, 51, 54, 76],
        label: 'Volume de Diagnostics',
        fill: true,
        tension: 0.4,
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        pointBackgroundColor: '#0ea5e9'
      }
    ]
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
    }
  };

  constructor(
    private analyseService: AnalyseService,
    private authService: AuthService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadData();
    this.startPolling();
  }

  ngOnDestroy(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  startPolling() {
    this.pollingInterval = setInterval(() => {
      this.analyseService.getPendingAnalyses().subscribe(analyses => {
        // Logique de notification uniquement si de nouveaux scanners arrivent
        if (analyses.length > this.lastPendingCount) {
          this.toastr.info('Nouveau scanner reçu du technicien !', 'Notification Case-Manager', {
            positionClass: 'toast-top-right',
            timeOut: 5000
          });
        }

        // Mise à jour systématique de la liste pour garantir la synchronisation
        this.pendingAnalyses = analyses;
        this.lastPendingCount = analyses.length;
        this.groupedPending = this.groupByDate(analyses);
      });
    }, 5000); // 5 secondes pour un effet temps réel
  }

  loadData() {
    this.analyseService.getPendingAnalyses().subscribe(a => {
      this.pendingAnalyses = a;
      this.lastPendingCount = a.length;
      this.groupedPending = this.groupByDate(a);
    });
    this.analyseService.getValidatedAnalyses().subscribe(a => {
      this.historyAnalyses = a;
      this.groupedHistory = this.groupByDate(a);
    });
  }

  get doctorStats() {
    const today = new Date().toDateString();
    return {
      validatedToday: this.historyAnalyses.filter(a => new Date(a.dateValidation || '').toDateString() === today).length,
      approvalRate: Math.round((this.historyAnalyses.filter(a => a.statutValidation === 'VALIDE').length / (this.historyAnalyses.length || 1)) * 100),
      highRiskPending: this.pendingAnalyses.filter(a => (a.scoreConfianceGlobal || 0) > 85).length
    };
  }

  groupByDate(analyses: Analyse[]): { dateLabel: string; items: Analyse[] }[] {
    const groups: { [key: string]: Analyse[] } = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    analyses.forEach(a => {
      const dStart = new Date(a.dateAnalyse);
      dStart.setHours(0, 0, 0, 0);

      let label = dStart.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

      if (dStart.getTime() === today.getTime()) label = "Aujourd'hui";
      else if (dStart.getTime() === yesterday.getTime()) label = "Hier";

      if (!groups[label]) groups[label] = [];
      groups[label].push(a);
    });

    return Object.keys(groups).map(label => ({
      dateLabel: label.charAt(0).toUpperCase() + label.slice(1),
      items: groups[label].sort((a, b) => new Date(b.dateAnalyse).getTime() - new Date(a.dateAnalyse).getTime())
    }));
  }

  viewAnalyseDetails(a: Analyse) {
    this.selectedAnalyse = a;
    this.isLoadingImage = true;

    // Fetch full analysis with image (Lazy Loading)
    this.analyseService.getAnalyseById(a.id).subscribe({
      next: (fullAnalyse) => {
        this.selectedAnalyse = fullAnalyse;
        this.evaluationComment = fullAnalyse.commentaireMedecin || '';
        this.correctedPathology = fullAnalyse.pathologies?.[0]?.nom || '';
        this.correctedRapport = fullAnalyse.rapport || '';
        
        // Load existing clinical data if available
        if (fullAnalyse.examenClinique) {
          this.toux = fullAnalyse.examenClinique.toux || false;
          this.fievre = fullAnalyse.examenClinique.fievre || false;
          this.douleurThoracique = fullAnalyse.examenClinique.douleurThoracique || false;
          this.auscultation = fullAnalyse.examenClinique.auscultation || '';
          this.anomaliesRespiratoires = fullAnalyse.examenClinique.anomaliesRespiratoires || '';
          this.signesCliniques = fullAnalyse.examenClinique.signesCliniques || '';
        } else {
          this.resetClinicalForm();
        }
        
        this.isLoadingImage = false;
      },
      error: (err) => {
        this.toastr.error('Erreur lors du chargement de l\'image haute résolution.', 'Erreur');
        this.isLoadingImage = false;
      }
    });
  }

  toggleCorrectionMode() {
    this.isCorrectionMode = !this.isCorrectionMode;
  }

  submitCorrection() {
    if (!this.selectedAnalyse || this.isSaving) return;

    this.isSaving = true;
    const medecinId = this.authService.getCurrentUser()?.id || 'unknown';

    this.analyseService.correctAnalyse(
      this.selectedAnalyse.id,
      medecinId,
      this.evaluationComment || 'Correction manuelle du diagnostic',
      this.correctedPathology,
      this.correctedRapport || this.selectedAnalyse.rapport,
      this.getClinicalData()
    ).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.toastr.success('Logiciel IA mis à jour avec vos corrections.', 'Feedback Loop Actif');
        this.selectedAnalyse = null;
        this.loadData();
      },
      error: (err) => {
        this.isSaving = false;
        this.toastr.error('Erreur lors de la sauvegarde de la correction', 'Échec');
      }
    });
  }

  switchTab(tab: 'PENDING' | 'HISTORY') {
    this.activeTab = tab;
    this.selectedAnalyse = null;
  }

  validateAnalyse() {
    if (!this.selectedAnalyse || this.isSaving) return;
    this.isSaving = true;

    const medecinId = this.authService.getCurrentUser()?.id || 'unknown';
    this.analyseService.validateAnalyse(this.selectedAnalyse.id, medecinId, this.evaluationComment || 'Validé sans commentaire particulier', this.getClinicalData())
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.toastr.success('Analyse validée avec observations cliniques.', 'Succès');
          this.selectedAnalyse = null;
          this.loadData();
        },
        error: () => {
          this.isSaving = false;
          this.toastr.error('Échec de la validation.', 'Erreur');
        }
      });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.toastr.warning('Veuillez sélectionner une image scanner (DICOM/JPG/PNG)', 'Fichier non supporté');
        return;
      }
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = e => this.filePreview = reader.result;
      reader.readAsDataURL(file);
    }
  }


  resetForm() {
    this.selectedFile = null;
    this.filePreview = null;
  }

  resetClinicalForm() {
    this.toux = false;
    this.fievre = false;
    this.douleurThoracique = false;
    this.auscultation = '';
    this.anomaliesRespiratoires = '';
    this.signesCliniques = '';
  }

  getClinicalData() {
    return {
      toux: this.toux,
      fievre: this.fievre,
      douleurThoracique: this.douleurThoracique,
      auscultation: this.auscultation,
      anomaliesRespiratoires: this.anomaliesRespiratoires,
      signesCliniques: this.signesCliniques
    };
  }

  copyReportToClipboard() {
    if (this.selectedAnalyse && this.selectedAnalyse.rapport) {
      navigator.clipboard.writeText(this.selectedAnalyse.rapport).then(() => {
        this.toastr.success('Le rapport a été copié dans le presse-papiers.', 'Copié !');
      }).catch(err => {
        this.toastr.error('Impossible de copier le texte.', 'Erreur');
        console.error('Failed to copy text: ', err);
      });
    } else {
      this.toastr.warning('Aucun rapport à copier.', 'Attention');
    }
  }

  exportReportAsPDF() {
    const element = document.getElementById('reportArea');
    if (!element) {
      this.toastr.error('Impossible de trouver la zone du rapport.', 'Erreur');
      return;
    }

    this.toastr.info('Génération du PDF en cours...', 'Veuillez patienter');

    html2canvas(element, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`rapport_ia_${this.selectedAnalyse?.id || 'export'}.pdf`);

      this.toastr.success('PDF généré avec succès !', 'Terminé');
    }).catch(err => {
      this.toastr.error('Erreur lors de la génération du PDF.', 'Erreur');
      console.error(err);
    });
  }
}
