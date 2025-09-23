import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
@Injectable({
  providedIn: 'root',
})
export class SelectionService {
  public selectedRoleId$ = new BehaviorSubject<number | null>(null)
  public selectedModuleId$ = new BehaviorSubject<number | null>(null)
  public hasModules$ = new BehaviorSubject<boolean>(false)
  setRoleId(roleId: number | null): void {
    this.selectedRoleId$.next(roleId)
    if (!roleId) {
      this.selectedModuleId$.next(null)
      this.hasModules$.next(false)
    }
  }
  setModuleId(moduleId: number | null): void {
    this.selectedModuleId$.next(moduleId)
  }
  setHasModules(hasModules: boolean): void {
    this.hasModules$.next(hasModules)
  }
}
