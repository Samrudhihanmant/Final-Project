// src/app/sales/sale-form/sale-form.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Sale } from '../sales/sales.model';
import { SalesService } from '../sales/sales.servics';
@Component({
  selector: 'app-sale-form',
  templateUrl: '../sales/sale-form.component.html',
  styleUrls: ['../sales/sale-form.component.scss']
})
export class SaleFormComponent implements OnInit {
  saleForm: FormGroup;
  isEditMode = false;
  statusOptions = ['completed', 'pending', 'cancelled'];
  paymentMethodOptions = ['credit_card', 'cash', 'bank_transfer'];

  constructor(
    private fb: FormBuilder,
    private salesService: SalesService,
    private dialogRef: MatDialogRef<SaleFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { sale: Sale }
  ) {
    this.saleForm = this.fb.group({
      productName: ['', Validators.required],
      customerName: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]],
      date: [new Date(), Validators.required],
      status: ['pending', Validators.required],
      paymentMethod: ['credit_card', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.data?.sale) {
      this.isEditMode = true;
      this.saleForm.patchValue(this.data.sale);
    }
  }

  onSubmit(): void {
    if (this.saleForm.valid) {
      const saleData = this.saleForm.value;
      
      if (this.isEditMode) {
        const updatedSale: Sale = {
          ...this.data.sale,
          ...saleData
        };
        this.salesService.updateSale(updatedSale).subscribe(() => {
          this.dialogRef.close(true);
        });
      } else {
        this.salesService.createSale(saleData).subscribe(() => {
          this.dialogRef.close(true);
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}