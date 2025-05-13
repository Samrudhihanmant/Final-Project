// src/app/products/product-form/product-form.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProductService } from '../product/product.service';
import { Product, PRODUCT_CATEGORIES } from '../product/poduct.model';
import { finalize } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';
import './product.css';

@Component({
  selector: 'app-product-form',
  templateUrl: '../product/product-form.component.html',
  styleUrls: ['../product/product.css']
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  isEditMode = false;
  loading = false;
  categories = PRODUCT_CATEGORIES;
  
  // Image upload variables
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  uploadPercent: Observable<number> | undefined;
  downloadURL: Observable<string> | undefined;

  constructor(
    private fb: FormBuilder,
    private productsService: ProductService,
    private dialogRef: MatDialogRef<ProductFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { product: Product },
    private storage: AngularFireStorage
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      price: [0, [Validators.required, Validators.min(0.01), Validators.max(100000)]],
      category: ['', Validators.required],
      stock: [0, [Validators.required, Validators.min(0), Validators.max(10000)]],
      sku: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9-]+$/)]],
      imageUrl: ['']
    });
  }

  ngOnInit(): void {
    if (this.data?.product) {
      this.isEditMode = true;
      this.productForm.patchValue(this.data.product);
      this.previewUrl = this.data.product.imageUrl || null;
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/image\/*/)) {
        alert('Only image files are allowed!');
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2097152) {
        alert('Maximum file size is 2MB');
        return;
      }

      this.selectedFile = file;
      
      // Preview image
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadImage(): Observable<string> {
    if (!this.selectedFile) {
      return new Observable(subscriber => {
        subscriber.next(this.productForm.value.imageUrl || '');
        subscriber.complete();
      });
    }

    const filePath = `products/${Date.now()}_${this.selectedFile.name}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, this.selectedFile);

    this.uploadPercent = task.percentageChanges();

    return new Observable(subscriber => {
      task.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe(url => {
            subscriber.next(url);
            subscriber.complete();
          });
        })
      ).subscribe();
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.markFormGroupTouched(this.productForm);
      return;
    }

    this.loading = true;
    const productData = this.productForm.value;

    this.uploadImage().subscribe(imageUrl => {
      productData.imageUrl = imageUrl;

      if (this.isEditMode) {
        this.productsService.updateProduct(this.data.product.id!, productData)
          .subscribe({
            next: () => {
              this.dialogRef.close(true);
            },
            error: () => {
              this.loading = false;
            }
          });
      } else {
        this.productsService.createProduct(productData)
          .subscribe({
            next: () => {
              this.dialogRef.close(true);
            },
            error: () => {
              this.loading = false;
            }
          });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Helper method to display validation errors
  getValidationError(controlName: string, errorType: string): string {
    const control = this.productForm.get(controlName);
    
    if (!control?.errors) return '';
    
    switch (errorType) {
      case 'required':
        return 'This field is required';
      case 'minlength':
        return `Minimum length is ${control.errors['minlength'].requiredLength}`;
      case 'maxlength':
        return `Maximum length is ${control.errors['maxlength'].requiredLength}`;
      case 'min':
        return `Minimum value is ${control.errors['min'].min}`;
      case 'max':
        return `Maximum value is ${control.errors['max'].max}`;
      case 'pattern':
        return 'Invalid format';
      default:
        return 'Invalid value';
    }
  }
}