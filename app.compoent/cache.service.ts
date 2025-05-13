// src/app/core/services/cache.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache = new Map<string, { data: any, expires: number }>();
  private defaultExpiry = 300000; // 5 minutes in milliseconds

  get<T>(key: string): Observable<T> | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return of(item.data);
  }

  set(key: string, data: any, expiresIn: number = this.defaultExpiry): void {
    const expires = Date.now() + expiresIn;
    this.cache.set(key, { data, expires });
  }

  clear(key: string): void {
    this.cache.delete(key);
  }

  clearAll(): void {
    this.cache.clear();
  }
}
