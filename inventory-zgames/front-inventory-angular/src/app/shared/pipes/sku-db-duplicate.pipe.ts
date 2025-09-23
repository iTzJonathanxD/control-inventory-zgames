import { Pipe, PipeTransform } from '@angular/core'
@Pipe({ name: 'skuDbDuplicate' })
export class SkuDbDuplicatePipe implements PipeTransform {
  transform(errors: any[]): any[] {
    if (!errors) return []
    return errors.filter(
      (e) =>
        typeof e.error === 'string' &&
        (e.error.toLowerCase().includes('sku ya existe en el sistema') ||
          e.error.toLowerCase().includes('duplicate entry'))
    )
  }
}
