import { Component } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { Header } from "../header/header";
import { RouterModule } from "@angular/router";
import { ThemeService } from '../../core/services/theme.service';
import { DrawerModule } from 'primeng/drawer';
@Component({
  selector: 'app-main',
  imports: [Sidebar, Header, RouterModule, DrawerModule],
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class Main {

  constructor(private themeService: ThemeService){}

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

mobileSidebarVisible = false;

openMobileSidebar() {
  this.mobileSidebarVisible = true;
}
  

}
