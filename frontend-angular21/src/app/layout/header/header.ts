import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { ThemeService } from '../../core/services/theme.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule, ToolbarModule, ButtonModule, InputTextModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  value1: string = "";

  notifCount = 0;

  constructor(public themeService: ThemeService, private router: Router) {} // público para usarlo en template
  @Output() toggleSidebar = new EventEmitter<void>();
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  ngOnInit(): void {
    this.cargarNotifCount();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.cargarNotifCount();
      });
  }

  private cargarNotifCount(): void {
    const raw = localStorage.getItem('transferencia_notif_count');
    const count = raw ? Number(raw) : 0;
    this.notifCount = Number.isFinite(count) && count > 0 ? count : 0;
  }
}
