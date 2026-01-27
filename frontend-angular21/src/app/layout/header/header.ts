import { Component, EventEmitter, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-header',
  imports: [ToolbarModule, ButtonModule,InputTextModule ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  value1: string = "";

  constructor(public themeService: ThemeService) {} // público para usarlo en template
  @Output() toggleSidebar = new EventEmitter<void>();
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

}
