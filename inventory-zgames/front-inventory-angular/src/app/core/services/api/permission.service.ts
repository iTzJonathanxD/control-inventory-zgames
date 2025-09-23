import { HttpClient, HttpParams } from '@angular/common/http'
import { inject, Injectable, Injector } from '@angular/core'
import { environment } from '@environment/environment'
import { ToastrNotificationService } from '../ui/notification.service'
import {
  ApiData,
  ApiResponse,
} from '@core/interfaces/api/api-response.interface'
import { map, Observable, tap } from 'rxjs'
import { ApiMessage } from '@core/interfaces/api/message.interface'
import { Permission } from '@core/interfaces/api/permission.interface'
@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  public API_URL = `${environment.apiBaseUrl}/permission`
  private _notificationService!: ToastrNotificationService
  private _httpClient = inject(HttpClient)
  private _injector = inject(Injector)
  private get notificationService(): ToastrNotificationService {
    if (!this._notificationService) {
      this._notificationService = this._injector.get(ToastrNotificationService)
    }
    return this._notificationService
  }
  public createPermission(
    permission: object
  ): Observable<ApiResponse<Permission>> {
    const endpoint = `${this.API_URL}/create`
    return this._httpClient
      .post<ApiResponse<Permission>>(endpoint, permission)
      .pipe(
        tap((res) =>
          this.showNotification(
            res.message,
            'ROLES_AND_PERMISSIONS.PERMISSION.TITLE'
          )
        )
      )
  }
  public findPermissions(
    filter: object
  ): Observable<ApiResponse<ApiData<Permission[]>>> {
    const endpoint = `${this.API_URL}/get-all`
    const params = new HttpParams({ fromObject: { ...filter } })
    return this._httpClient.get<ApiResponse<ApiData<Permission[]>>>(endpoint, {
      params,
    })
  }
  public getPermissionById(
    id: string
  ): Observable<ApiResponse<ApiData<Permission>>> {
    const endpoint = `${this.API_URL}/${id}`
    return this._httpClient.get<ApiResponse<ApiData<Permission>>>(endpoint)
  }
  public getPermissionsByRoleAndModule(
    roleId: number,
    moduleId: number,
    permissionName?: string,
    page: number = 1,
    limit: number = 10
  ): Observable<ApiResponse<ApiData<Permission[]>>> {
    const endpoint = `${this.API_URL}/${roleId}/modules/${moduleId}/permissions`
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
    if (permissionName) {
      params = params.set('permissionName', permissionName)
    }
    return this._httpClient.get<ApiResponse<ApiData<Permission[]>>>(endpoint, {
      params,
    })
  }
  public updatePermission(
    id: string,
    permission: object
  ): Observable<ApiResponse<Permission>> {
    const endpoint = `${this.API_URL}/update/${id}`
    return this._httpClient
      .patch<ApiResponse<Permission>>(endpoint, permission)
      .pipe(
        tap((res) =>
          this.showNotification(
            res.message,
            'ROLES_AND_PERMISSIONS.PERMISSION.TITLE'
          )
        )
      )
  }
  public togglePermissionStatus(
    roleId: number,
    permissionId: number
  ): Observable<ApiResponse<Permission>> {
    const endpoint = `${this.API_URL}/${roleId}/permissions/${permissionId}/status`
    return this._httpClient.patch<ApiResponse<Permission>>(endpoint, {}).pipe(
      tap((res) => {
        this.showNotification(
          res.message,
          'ROLES_AND_PERMISSIONS.PERMISSION.TITLE'
        )
      })
    )
  }
  private showNotification(
    message: ApiMessage,
    title: string = 'ROLES_AND_PERMISSIONS.PERMISSION.TITLE'
  ): void {
    this.notificationService.showNotification({
      title,
      message,
      type: 'success',
    })
  }
}
