// src/app/shared/pipes/replace-underscore.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replaceUnderscore'
})
export class ReplaceUnderscorePipe implements PipeTransform {
  transform(value: string): string {
    return value.replace(/_/g, ' ');
  }
}