import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  
  settings = {
    autoProcess: true,
    autoReport: true,
    defaultHeatmap: true,
    exportFormat: 'PDF'
  };

  constructor(private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    const saved = localStorage.getItem('nexusMedecinSettings');
    if (saved) {
      try {
        this.settings = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
  }

  saveSettings(): void {
    localStorage.setItem('nexusMedecinSettings', JSON.stringify(this.settings));
    this.toastr.success('Préférences sauvegardées avec succès.', 'Configuration');
  }
}
