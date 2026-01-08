import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';


  interface Product {
    code: string;
    name: string;
    category: string;
    quantity: string;
  }

@Component({
  selector: 'app-almacen',
  imports: [CardModule, TableModule, InputGroupModule, InputGroupAddonModule, FormsModule, InputTextModule, SelectModule, InputNumberModule, ButtonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './almacen.html',
  styleUrl: './almacen.css',
})
export class Almacen {
  constructor(private messageService: MessageService) {}  
  products: Product[] = []; 
  text1: string = '';
  text2: string = '';
  text3: string = '';
  text4: string = '';
  agregar(): void {
    this.products.push({
      code: this.text1,
      name: this.text2,
      category: this.text3,
      quantity: this.text4,
    });
    this.text1 = '';
    this.text2 = '';
    this.text3 = '';
    this.text4 = '';
    this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Message Content', life: 3000 });
  }
}

