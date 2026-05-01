import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-help-buttons',
  templateUrl: './help-buttons.component.html',
  styleUrls: ['./help-buttons.component.css']
})
export class HelpButtonsComponent implements OnInit {
  isLightMode = false;

  ngOnInit(): void {
    this.isLightMode = localStorage.getItem('landing-theme') === 'light';
  }

  toggleTheme() {
    this.isLightMode = !this.isLightMode;
    localStorage.setItem('landing-theme', this.isLightMode ? 'light' : 'dark');
  }
}

