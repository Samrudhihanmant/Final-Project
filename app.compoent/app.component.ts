// src/app/app.component.ts
import { Component } from '@angular/core';
import { Sale } from '../sales/sales.servics';
import '../sales/sales-list.component.css';

@Component({
  selector: 'app-root',
  templateUrl: '../app/app.component.html',
  styleUrls: ['../app/app.component.css']
})
export class AppComponent {
  title = 'Sales List App';
  showForm = false;
  currentSale: Sale | null = null;

  openAddForm(): void {
    this.currentSale = {
      id: '0',
      productName: '',
      customerName: '',
      amount: 0,
      paymentMethod: 'cash',
      date: new Date(),
      status: 'pending'
    };
    this.showForm = true;
  }

  onSave(sale: Sale): void {
    // Here you would handle saving to your service
    this.showForm = false;
  }

  onCancel(): void {
    this.showForm = false;
  }
}