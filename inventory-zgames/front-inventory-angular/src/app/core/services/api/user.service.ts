import { HttpClient, HttpParams } from '@angular/common/http'
import { inject, Injectable, Injector } from '@angular/core'
import { environment } from '@environment/environment'
import { ToastrNotificationService } from '../ui/notification.service'
import {
  ApiData,
  ApiResponse,
} from '@core/interfaces/api/api-response.interface'
import { catchError, map, Observable, tap, throwError } from 'rxjs'
import { ApiMessage } from '@core/interfaces/api/message.interface'
import { User } from '@core/interfaces/api/user.interface'
@Injectable({
  providedIn: 'root',
})
export class UserService {
  public API_URL = `${environment.apiBaseUrl}/user`
  private _httpClient = inject(HttpClient)
  private _injector = inject(Injector)
  private _notificationService!: ToastrNotificationService
  private get notificationService(): ToastrNotificationService {
    if (!this._notificationService) {
      this._notificationService = this._injector.get(ToastrNotificationService)
    }
    return this._notificationService
  }
  public createUser(user: object): Observable<ApiResponse<User>> {
    console.log('🚀 UserService - Sending user data to backend:', {
      ...user,
      password: '***HIDDEN***',
    })
    console.log(
      '🔑 UserService - Password length:',
      (user as any).password?.length
    )
    const endpoint = `${this.API_URL}/create`
    return this._httpClient.post<ApiResponse<User>>(endpoint, user)
  }
  public getUsers(): Observable<ApiResponse<ApiData<User[]>>> {
    const endpoint = `${this.API_URL}/get-all`
    return this._httpClient.get<ApiResponse<ApiData<User[]>>>(endpoint)
  }
  public findUsers(filter: object): Observable<ApiResponse<ApiData<User[]>>> {
    const endpoint = `${this.API_URL}/get-all`
    const params = new HttpParams({ fromObject: { ...filter } })
    return this._httpClient.get<ApiResponse<ApiData<User[]>>>(endpoint, {
      params,
    })
  }
  public toggleUserStatus(id: number): Observable<ApiResponse<User>> {
    const endpoint = `${this.API_URL}/toggle-status/${id}`
    return this._httpClient
      .put<ApiResponse<User>>(endpoint, {})
      .pipe(
        tap((res) => this.showNotification(res.message, 'USER.TOGGLE.TITLE'))
      )
  }
  public toggleUserLock(id: number): Observable<ApiResponse<User>> {
    const endpoint = `${this.API_URL}/toggle-lock/${id}`
    return this._httpClient
      .put<ApiResponse<User>>(endpoint, {})
      .pipe(tap((res) => this.showNotification(res.message, 'USER.LOCK.TITLE')))
  }
  public findAllUsers(
    page: number,
    limit: number,
    filter: {
      id?: number
      username?: string
      firstName?: string
      lastName?: string
      email?: string
      address?: string
      phone?: string
      debt?: number
      hasDebt?: boolean
      failedLoginAttempts?: number
      isLocked?: boolean
      isActive?: boolean
      roleId?: number
      companyId?: number
      profilePhoto?: string
      createdAt?: string
      updatedAt?: string
      roleName?: string
      companyName?: string
      fullName?: string
      dateFrom?: string
      dateTo?: string
    } = {}
  ): Observable<ApiResponse<ApiData<User[]>>> {
    const endpoint = `${this.API_URL}/get-all`
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
    if (filter.id !== undefined) {
      params = params.set('id', filter.id.toString())
    }
    if (filter.username) {
      params = params.set('username', filter.username)
    }
    if (filter.firstName) {
      params = params.set('firstName', filter.firstName)
    }
    if (filter.lastName) {
      params = params.set('lastName', filter.lastName)
    }
    if (filter.email) {
      params = params.set('email', filter.email)
    }
    if (filter.address) {
      params = params.set('address', filter.address)
    }
    if (filter.phone) {
      params = params.set('phone', filter.phone)
    }
    if (filter.debt !== undefined) {
      params = params.set('debt', filter.debt.toString())
    }
    if (filter.hasDebt !== undefined) {
      params = params.set('hasDebt', filter.hasDebt.toString())
    }
    if (filter.failedLoginAttempts !== undefined) {
      params = params.set(
        'failedLoginAttempts',
        filter.failedLoginAttempts.toString()
      )
    }
    if (filter.isLocked !== undefined) {
      params = params.set('isLocked', filter.isLocked.toString())
    }
    if (filter.isActive !== undefined) {
      params = params.set('isActive', filter.isActive.toString())
    }
    if (filter.roleId !== undefined) {
      params = params.set('roleId', filter.roleId.toString())
    }
    if (filter.companyId !== undefined) {
      params = params.set('companyId', filter.companyId.toString())
    }
    if (filter.profilePhoto) {
      params = params.set('profilePhoto', filter.profilePhoto)
    }
    if (filter.roleName) {
      params = params.set('roleName', filter.roleName)
    }
    if (filter.companyName) {
      params = params.set('companyName', filter.companyName)
    }
    if (filter.fullName) {
      params = params.set('fullName', filter.fullName)
    }
    if (filter.createdAt) {
      params = params.set('createdAt', filter.createdAt)
    }
    if (filter.updatedAt) {
      params = params.set('updatedAt', filter.updatedAt)
    }
    if (filter.dateFrom) {
      params = params.set('dateFrom', filter.dateFrom)
    }
    if (filter.dateTo) {
      params = params.set('dateTo', filter.dateTo)
    }
    return this._httpClient
      .get<ApiResponse<ApiData<User[]>>>(endpoint, { params })
      .pipe(
        map((res) => {
          if (res.data) {
            return res
          } else {
            throw new Error('No users found')
          }
        }),
        catchError((error) => {
          console.error('Error fetching users:', error)
          return throwError(() => new Error('Error the get users'))
        })
      )
  }
  public getUserById(id: string): Observable<ApiResponse<User>> {
    const endpoint = `${this.API_URL}/get-user/${id}`
    return this._httpClient.get<ApiResponse<User>>(endpoint).pipe(
      map((res) => {
        if (res.data) {
          return res
        } else {
          throw new Error('User not found')
        }
      }),
      tap((res) => this.showNotification(res.message, 'USER.GET.TITLE'))
    )
  }
  public deleteUser(id: number): Observable<ApiResponse<User>> {
    const endpoint = `${this.API_URL}/delete-user/${id}`
    return this._httpClient
      .delete<ApiResponse<User>>(endpoint)
      .pipe(
        tap((res) => this.showNotification(res.message, 'USER.DELETE.TITLE'))
      )
  }
  public resetUserPassword(id: string): Observable<ApiResponse<User>> {
    const endpoint = `${this.API_URL}/reset-password/${id}`
    return this._httpClient
      .put<ApiResponse<User>>(endpoint, {})
      .pipe(
        tap((res) => this.showNotification(res.message, 'USER.PASSWORD.RESET'))
      )
  }
  public updateProfile(user: FormData): Observable<ApiResponse<User>> {
    const endpoint = `${this.API_URL}/update-profile`
    return this._httpClient
      .patch<ApiResponse<User>>(endpoint, user)
      .pipe(tap((res) => this.showNotification(res.message, 'PROFILE.TITLE')))
  }
  public setUserPassword(
    id: string,
    newPassword: string
  ): Observable<ApiResponse<User>> {
    const endpoint = `${this.API_URL}/change-password`
    return this._httpClient
      .put<ApiResponse<User>>(endpoint, { id, newPassword })
      .pipe(tap((res) => this.showNotification(res.message)))
  }
  public updateUser(id: number, user: object): Observable<ApiResponse<User>> {
    const endpoint = `${this.API_URL}/update-user/${id}`
    return this._httpClient
      .patch<ApiResponse<User>>(endpoint, user)
      .pipe(
        tap((res) => this.showNotification(res.message, 'USER.UPDATE.TITLE'))
      )
  }
  public addDebt(
    userId: number,
    amount: number,
    reason?: string
  ): Observable<ApiResponse<User>> {
    const endpoint = `${environment.apiBaseUrl}/users/debt/${userId}/add`
    return this._httpClient
      .post<ApiResponse<User>>(endpoint, { amount, reason })
      .pipe(tap((res) => this.showNotification(res.message, 'USER.DEBT.ADD')))
  }
  public reduceDebt(
    userId: number,
    amount: number,
    reason?: string
  ): Observable<ApiResponse<User>> {
    const endpoint = `${environment.apiBaseUrl}/users/debt/${userId}/reduce`
    return this._httpClient
      .post<ApiResponse<User>>(endpoint, { amount, reason })
      .pipe(
        tap((res) => this.showNotification(res.message, 'USER.DEBT.REDUCE'))
      )
  }
  public clearDebt(
    userId: number,
    reason?: string
  ): Observable<ApiResponse<User>> {
    const endpoint = `${environment.apiBaseUrl}/users/debt/${userId}/clear`
    return this._httpClient
      .patch<ApiResponse<User>>(endpoint, { reason })
      .pipe(tap((res) => this.showNotification(res.message, 'USER.DEBT.CLEAR')))
  }
  private showNotification(
    message: ApiMessage,
    title: string = 'profile.title'
  ): void {
    this.notificationService.showNotification({
      title,
      message,
      type: 'success',
    })
  }
}
