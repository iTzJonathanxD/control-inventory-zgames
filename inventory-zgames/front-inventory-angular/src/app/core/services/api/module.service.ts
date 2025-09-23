import { HttpClient, HttpParams } from '@angular/common/http'
import { inject, Injectable, Injector } from '@angular/core'
import {
  ApiData,
  ApiResponse,
} from '@core/interfaces/api/api-response.interface'
import { ApiMessage } from '@core/interfaces/api/message.interface'
import { Module } from '@core/interfaces/api/module.interface'
import { environment } from '@environment/environment'
import { Observable, tap } from 'rxjs'
import { ToastrNotificationService } from '../ui/notification.service'
@Injectable({
  providedIn: 'root',
})
export class ModuleService {
  public API_URL = `${environment.apiBaseUrl}/module`
  private _notificationService!: ToastrNotificationService
  private _httpClient = inject(HttpClient)
  private _injector = inject(Injector)
  private get notificationService(): ToastrNotificationService {
    if (!this._notificationService) {
      this._notificationService = this._injector.get(ToastrNotificationService)
    }
    return this._notificationService
  }
  public createModule(module: object): Observable<ApiResponse<Module>> {
    const endpoint = `${this.API_URL}/create`
    return this._httpClient
      .post<ApiResponse<Module>>(endpoint, module)
      .pipe(
        tap((res) =>
          this.showNotification(
            res.message,
            'ROLES_AND_PERMISSIONS.MODULE.TITLE'
          )
        )
      )
  }
  public findModules(
    filter: object
  ): Observable<ApiResponse<ApiData<Module[]>>> {
    const endpoint = `${this.API_URL}/get-all`
    const params = new HttpParams({ fromObject: { ...filter } })
    return this._httpClient.get<ApiResponse<ApiData<Module[]>>>(endpoint, {
      params,
    })
  }
  public getModuleById(id: number): Observable<ApiResponse<ApiData<Module>>> {
    const endpoint = `${this.API_URL}/${id}`
    return this._httpClient.get<ApiResponse<ApiData<Module>>>(endpoint)
  }
  public getModulesByRole(
    roleId: number
  ): Observable<ApiResponse<ApiData<Module[]>>> {
    const endpoint = `${this.API_URL}/${roleId}/modules`
    return this._httpClient.get<ApiResponse<ApiData<Module[]>>>(endpoint)
  }
  public updateModule(
    id: number,
    module: object
  ): Observable<ApiResponse<Module>> {
    const endpoint = `${this.API_URL}/update/${id}`
    return this._httpClient
      .patch<ApiResponse<Module>>(endpoint, module)
      .pipe(
        tap((res) =>
          this.showNotification(
            res.message,
            'ROLES_AND_PERMISSIONS.MODULE.TITLE'
          )
        )
      )
  }
  public toggleModuleStatus(
    roleId: number,
    moduleId: number
  ): Observable<ApiResponse<Module>> {
    const endpoint = `${this.API_URL}/update-status/${roleId}/${moduleId}`
    return this._httpClient
      .patch<ApiResponse<Module>>(endpoint, {})
      .pipe(
        tap((res) =>
          this.showNotification(
            res.message,
            'ROLES_AND_PERMISSIONS.MODULE.TITLE'
          )
        )
      )
  }
  private showNotification(
    message: ApiMessage,
    title: string = 'ROLES_AND_PERMISSIONS.MODULE.TITLE'
  ): void {
    this.notificationService.showNotification({
      title,
      message,
      type: 'success',
    })
  }
}
