import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, Output } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { TranslateModule } from '@ngx-translate/core'
@Component({
  selector: 'app-product-filters',
  standalone: true,
  imports: [CommonModule, TranslateModule, NgbModule, FormsModule],
  templateUrl: './product-filters.component.html',
  styleUrl: './product-filters.component.scss',
})
export class ProductFiltersComponent {
  @Input() categories: string[] = []
  @Input() searchTerm = ''
  @Input() selectedCategory = ''
  @Input() sortBy = 'name'
  @Output() searchChange = new EventEmitter<string>()
  @Output() categoryChange = new EventEmitter<string>()
  @Output() sortChange = new EventEmitter<string>()
  onSearchChange(value: string): void {
    this.searchChange.emit(value)
  }
  onCategoryChange(category: string): void {
    this.categoryChange.emit(category)
  }
  onSortChange(sortBy: string): void {
    this.sortChange.emit(sortBy)
  }
  clearFilters(): void {
    this.searchChange.emit('')
    this.categoryChange.emit('')
    this.sortChange.emit('name')
  }
}
