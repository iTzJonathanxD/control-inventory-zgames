import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
@Injectable({
  providedIn: 'root',
})
export class FilterCommunicationService {
  private filterSource = new BehaviorSubject<any>(null)
  currentFilter = this.filterSource.asObservable()
  public getFilterObservable(): Observable<Record<string, any>> {
    return this.filterSource.asObservable()
  }
  changeFilter(filter: any) {
    this.filterSource.next(filter)
  }
  getCurrentFilter(): any {
    return this.filterSource.value
  }
  resetFilter() {
    this.filterSource.next({})
  }
}
