import { Pipe, PipeTransform } from '@angular/core'
@Pipe({ name: 'notSkuDbDuplicate' })
export class NotSkuDbDuplicatePipe implements PipeTransform {
  transform(errors: any[]): any[] {
    if (!errors) return []
    return errors.filter(
      (e) =>
        !(
          typeof e.error === 'string' &&
          (e.error.toLowerCase().includes('sku ya existe en el sistema') ||
            e.error.toLowerCase().includes('duplicate entry'))
        )
    )
  }
}
