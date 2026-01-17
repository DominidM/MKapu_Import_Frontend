// src/app/ventas/pages/generar-venta/ventas/ventas.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    CardModule
  ],
  templateUrl: './ventas.html',
  styleUrls: ['./ventas.css']
})
export class Ventas implements OnInit {

  mostrarNavegacion = true;
  rutaActual = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Detectar cambios de ruta para mostrar/ocultar navegación
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.rutaActual = event.url;
        this.actualizarNavegacion();
      });

    this.rutaActual = this.router.url;
    this.actualizarNavegacion();
  }

  actualizarNavegacion(): void {
    // Mostrar navegación solo si está en la ruta raíz de ventas
    this.mostrarNavegacion = 
      this.rutaActual === '/ventas' || 
      this.rutaActual === '/ventas/generar-venta' ||
      this.rutaActual === '/ventas/generar-venta/';
  }

  irAListado(): void {
    this.router.navigate(['/ventas/generar-venta/listar']);
  }

  irACrearVenta(): void {
    this.router.navigate(['/ventas/generar-venta/crear']);
  }
}
