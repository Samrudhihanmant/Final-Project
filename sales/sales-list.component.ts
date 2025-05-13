// src/app/sales/sales-list/sales-list.component.ts
import { Component, OnInit } from '@angular/core';
import { SalesService } from '../sales/sales.servics';
import { Sale } from '../sales/sales.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { SaleFormComponent } from '../sales/sale-form.component';
@Component({
  selector: 'app-sales-list',
  templateUrl: '../sales/sales-list.component.html',
  styleUrls: ['../sales/sales-list.component.css']
})
export class SalesListComponent implements OnInit {
  displayedColumns: string[] = [
    'productName', 
    'customerName', 
    'amount', 
    'date', 
    'status',
    'paymentMethod',
    'actions'
  ];

  totalSales = 0;
  pageSize = 10;
  currentPage = 1;
  dataSource = new MatTableDataSource<Sale>();
  loading = true;

  
  constructor(
    private salesService: SalesService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales(): void {
    this.loading = true;
    this.salesService.getSales().subscribe({
      next: (sales) => {
        this.dataSource.data = sales;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(SaleFormComponent, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSales();
      }
    });
  }

  openEditDialog(sale: Sale): void {
    const dialogRef = this.dialog.open(SaleFormComponent, {
      width: '600px',
      data: { sale }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSales();
      }
    });
  }

  deleteSale(id: string): void {
    if (confirm('Are you sure you want to delete this sale?')) {
      this.salesService.deleteSale(id).subscribe(() => {
        this.loadSales();
      });
    }
  }

 

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}