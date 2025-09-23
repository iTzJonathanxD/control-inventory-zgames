import { CommonModule } from '@angular/common'
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { TranslateModule } from '@ngx-translate/core'
import { InventoryTableComponent } from '../components/tables/table-inventory/inventory-table.component'
@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    NgbModule,
    InventoryTableComponent,
  ],
  templateUrl: './inventory.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class IventoryComponent {}
