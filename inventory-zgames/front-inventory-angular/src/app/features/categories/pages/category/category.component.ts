import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { CategoryTableComponent } from '../../components/tables/category-management/category-table.component';
@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, TranslateModule, NgbModule, CategoryTableComponent],
  templateUrl: './category.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CategoriesComponent {}
