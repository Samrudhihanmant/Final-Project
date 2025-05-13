// src/app/core/models/product.model.ts
export interface Product {
  imageUrl: null;
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  sku: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductResponse {
  success: boolean;
  data: Product;
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  total: number;
  page: number;
  limit: number;
}
export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Food',
  'Books',
  'Home',
  'Sports',
  'Beauty',
  'Toys'
];