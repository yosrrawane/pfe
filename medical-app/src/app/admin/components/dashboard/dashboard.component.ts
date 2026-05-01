import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { User, Role } from '../../../models/user.model';
import { ToastrService } from 'ngx-toastr';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { AnalyseService } from '../../../services/analyse.service';
import { Analyse } from '../../../models/analyse.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  users: User[] = [];
  analyses: Analyse[] = [];
  stats: any = { totalUsers: 0, activeUsers: 0, totalAnalys: 0 };
  
  showUserForm = false;
  editingUser: User | null = null;
  userForm!: FormGroup;
  roles = Object.values(Role);

  isRetraining = false;

  roleLabels: { [key: string]: string } = {
    ADMIN: '🔐 Administrateur',
    MEDECIN: '⚕️ Médecin Radiologue',
    TECHNICIEN: '🦾 Technicien Radiologue'
  };

  activeView: 'OVERVIEW' | 'USERS' = 'OVERVIEW';

  get userStats() {
    return {
      admins: this.users.filter(u => u.role === Role.ADMIN).length,
      medecins: this.users.filter(u => u.role === Role.MEDECIN).length,
      techniciens: this.users.filter(u => u.role === Role.TECHNICIEN).length,
      total: this.users.length
    };
  }

  // Chart Properties
  public lineChartData: ChartData<'line'> = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [
      {
        data: [65, 59, 80, 81, 56, 55, 40],
        label: 'Activités Système',
        fill: true,
        tension: 0.4,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#6366f1'
      }
    ]
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  public pieChartData: ChartData<'pie'> = {
    labels: ['Médecins Radiologues', 'Techniciens Radiologues', 'Admins'],
    datasets: [{
      data: [300, 500, 100],
      backgroundColor: ['#6366f1', '#0ea5e9', '#10b981'],
      hoverBackgroundColor: ['#4f46e5', '#0284c7', '#059669'],
      borderWidth: 0
    }]
  };

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#94a3b8', font: { family: 'Outfit' } }
      }
    }
  };

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toastr: ToastrService,
    private analyseService: AnalyseService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.url.subscribe(() => {
      const path = this.route.snapshot.url[0]?.path;
      this.activeView = path === 'users' ? 'USERS' : 'OVERVIEW';
    });
    this.initForm();
    this.loadData();
  }

  initForm() {
    this.userForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: [Role.MEDECIN, Validators.required],
      password: [''],
      isActive: [true]
    });
  }

  loadData() {
    this.userService.getUsers().subscribe(u => {
      this.users = u;
      this.updatePieChart(u);
    });
    
    this.analyseService.getAnalyses().subscribe(a => {
      this.analyses = a;
      this.updateActivityChart(a);
      this.updateStats(a);
    });

    this.userService.getStats().subscribe(s => {
      this.stats = { ...this.stats, ...s };
    });

    this.fetchGlobalKPIs();
  }

  fetchGlobalKPIs() {
    this.analyseService.getGlobalStats().subscribe({
      next: (s) => {
        this.stats = { ...this.stats, ...s };
      },
      error: (err) => console.error('Error fetching global KPIs:', err)
    });
  }

  updateStats(analyses: Analyse[]) {
    this.stats.totalAnalys = analyses.length;
    this.stats.totalUsers = this.users.length;
    this.stats.activeUsers = this.users.filter(u => u.isActive).length;
  }

  updateActivityChart(analyses: Analyse[]) {
    const last7Days = [];
    const counts = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('fr-FR', { weekday: 'short' });
      last7Days.push(label);
      
      const count = analyses.filter(a => {
        const aDate = new Date(a.dateAnalyse);
        return aDate.getDate() === d.getDate() && aDate.getMonth() === d.getMonth();
      }).length;
      counts.push(count);
    }

    this.lineChartData = {
      labels: last7Days,
      datasets: [{
        ...this.lineChartData.datasets[0],
        data: counts
      }]
    };
  }

  updatePieChart(users: User[]) {
    const counts = {
      [Role.MEDECIN]: users.filter(u => u.role === Role.MEDECIN).length,
      [Role.TECHNICIEN]: users.filter(u => u.role === Role.TECHNICIEN).length,
      [Role.ADMIN]: users.filter(u => u.role === Role.ADMIN).length,
    };
    
    this.pieChartData = {
      labels: ['Médecins Radiologues', 'Techniciens Radiologues', 'Admins'],
      datasets: [{
        ...this.pieChartData.datasets[0],
        data: [counts[Role.MEDECIN], counts[Role.TECHNICIEN], counts[Role.ADMIN]]
      }]
    };
  }

  deleteUser(id: string) {
    if(confirm('Supprimer cet utilisateur ?')) {
      this.userService.deleteUser(id).subscribe(() => {
        this.toastr.success('Utilisateur supprimé');
        this.loadData();
      });
    }
  }

  editUser(user: User) {
    this.editingUser = { ...user };
    this.userForm.patchValue(user);
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.showUserForm = true;
  }

  openAddForm() {
    this.editingUser = null;
    this.userForm.reset({ isActive: true, role: Role.MEDECIN });
    // Password is now optional (defaults to 123456 in backend)
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.showUserForm = true;
  }

  saveUser() {
    if (this.userForm.invalid) {
      this.toastr.warning('Veuillez vérifier les champs du formulaire (Email valide requis).', 'Formulaire Incomplet');
      return;
    }
    
    const userData = { ...this.userForm.value };
    if (this.editingUser) {
      userData.id = this.editingUser.id;
      this.userService.updateUser(userData as User).subscribe({
        next: () => {
          this.toastr.success('Utilisateur mis à jour');
          this.showUserForm = false;
          this.loadData();
        },
        error: (err) => {
          const msg = err.error?.message === 'Email already in use' ? 'Email déjà existant' : (err.error?.message || 'Erreur lors de la mise à jour');
          this.toastr.error(msg, 'Échec');
          console.error(err);
        }
      });
    } else {
      this.userService.addUser(userData as User).subscribe({
        next: () => {
          this.toastr.success('Utilisateur créé avec succès');
          this.showUserForm = false;
          this.loadData();
        },
        error: (err) => {
          const msg = err.error?.message === 'Email already in use' ? 'Email déjà existant' : (err.error?.message || 'Erreur lors de la création');
          this.toastr.error(msg, 'Échec');
          console.error(err);
        }
      });
    }
  }

  cancelForm() {
    this.showUserForm = false;
  }

  getCorrectionsPendingRetrain(): number {
    return this.analyses.filter(a => a.statutValidation === 'CORRIGE' || a.aEteCorrige).length;
  }

  triggerModelRetraining() {
    const pendingCount = this.getCorrectionsPendingRetrain();
    if (pendingCount === 0) {
      this.toastr.warning('Aucune correction disponible pour le ré-entraînement.', 'Action limitée');
      return;
    }

    this.isRetraining = true;
    this.toastr.info('Transmission des corrections à l\'infrastructure ML...', 'Fine-tuning IA');

    this.analyseService.triggerRetrain().subscribe({
      next: (res) => {
        console.log('✅ [ADMIN] Retrain success:', res);
        this.isRetraining = false;
        this.toastr.success(
          `Modèle mis à jour avec ${pendingCount} échantillons. Amélioration : ${res.improvement_detected}`,
          'Cycle de vie ML complété',
          { timeOut: 8000 }
        );
      },
      error: (err) => {
        console.error('🔥 [ADMIN] Retrain error:', err);
        this.isRetraining = false;
        this.toastr.error('Échec de la connexion avec le serveur IA.', 'Erreur Critique');
      }
    });
  }
}
