// src/app/core/models/sale.model.ts
export interface Sale {
  id: string;
  productName: string;
  customerName: string;
  amount: number;
  date: Date;
  status: 'completed' | 'pending' | 'cancelled';
  paymentMethod: 'credit_card' | 'cash' | 'bank_transfer';
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
export interface SalesResponse {
  success: boolean;
  data: Sale[];
  total: number;
  page: number;
  limit: number;
}
export interface SaleResponse {
  success: boolean;
  data: Sale;
}