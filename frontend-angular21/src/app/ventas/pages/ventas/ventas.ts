import { Component } from '@angular/core';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbModule } from 'primeng/breadcrumb';
@Component({
  selector: 'app-ventas',
  imports: [StepperModule, ButtonModule,BreadcrumbModule],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css',
})
export class Ventas {

  breadcrumbItems = [ 
    { label: 'Inicio' },
    { label: 'Ventas' }
    
  ];

}
