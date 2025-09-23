import { CommonModule } from '@angular/common'
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { TranslateModule } from '@ngx-translate/core'
import { ProductsListComponent } from '../products-list/products-list.component'
@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, TranslateModule, NgbModule, ProductsListComponent],
  templateUrl: './products.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProductsComponent {}
