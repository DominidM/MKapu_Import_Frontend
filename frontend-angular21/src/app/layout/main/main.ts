import { Component } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { Header } from "../header/header";
import { RouterModule } from "@angular/router";
import { ThemeService } from '../../core/services/theme.service';
import { Dashboard } from "../../dashboard/pages/dashboard/dashboard";

@Component({
  selector: 'app-main',
  imports: [Sidebar, Header, RouterModule, Dashboard],
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class Main {

  constructor(private themeService: ThemeService){}

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
