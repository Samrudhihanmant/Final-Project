// src/app/core/services/sales.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Sale } from '../sales/sales.model';
import { delay, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private sales: Sale[] = [
    {
      id: '1',
      productName: 'MacBook Pro 16"',
      customerName: 'John Smith',
      amount: 2499.99,
      date: new Date('2023-05-15'),
      status: 'completed',
      paymentMethod: 'credit_card'
    },
    {
      id: '2',
      productName: 'iPhone 14 Pro',
      customerName: 'Sarah Johnson',
      amount: 999.00,
      date: new Date('2023-05-18'),
      status: 'pending',
      paymentMethod: 'bank_transfer'
    },
    {
      id: '3',
      productName: 'AirPods Pro',
      customerName: 'Michael Brown',
      amount: 249.00,
      date: new Date('2023-05-20'),
      status: 'completed',
      paymentMethod: 'cash'
    }
  ];

  constructor(private http: HttpClient) {}

  getSales(): Observable<Sale[]> {
    // Simulate API call with delay
    return of(this.sales).pipe(delay(500));
  }

  getSaleById(id: string): Observable<Sale | undefined> {
    return this.getSales().pipe(
      map(sales => sales.find(sale => sale.id === id))
    );
  }

  createSale(sale: Omit<Sale, 'id'>): Observable<Sale> {
    const newSale: Sale = {
      ...sale,
      id: (this.sales.length + 1).toString()
    };
    this.sales.push(newSale);
    return of(newSale).pipe(delay(300));
  }

  updateSale(updatedSale: Sale): Observable<Sale> {
    const index = this.sales.findIndex(s => s.id === updatedSale.id);
    if (index !== -1) {
      this.sales[index] = updatedSale;
    }
    return of(updatedSale).pipe(delay(300));
  }

  deleteSale(id: string): Observable<boolean> {
    this.sales = this.sales.filter(s => s.id !== id);
    return of(true).pipe(delay(300));
  }
}

export { Sale };
