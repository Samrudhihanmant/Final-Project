// src/app/services/product.service.ts
import { Injectable } from '@angular/core';
import { Product } from '../product/poduct.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  createProduct(productData: any) {
    throw new Error('Method not implemented.');
  }
  updateProduct(arg0: string, productData: any) {
    throw new Error('Method not implemented.');
  }
  private products: Product[] = [];
  private nextId = 1;

  constructor() { }

  getProducts(): Product[] {
    return this.products;
  }

  addProduct(product: Omit<Product, 'id'>): Product {
    const newProduct = { ...product, 'id': this.nextId++ };
    this.products.push(newProduct);
    return newProduct;
  }

  deleteProduct(id: number): void {
    this.products = this.products.filter(product => product.id !== 'id');
  }
}