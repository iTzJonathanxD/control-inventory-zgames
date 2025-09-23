import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '@environment/environment'
import { ApiResponse } from '@core/interfaces/api/api-response.interface'
import {
  UserDebtResponse,
  AddDebtRequest,
  ReduceDebtRequest,
  DebtOperationResponse,
  ClearDebtResponse,
  UserWithDebt,
} from '@core/interfaces/api/user-debt.interface'
@Injectable({
  providedIn: 'root',
})
export class UserDebtService {
  private _http = inject(HttpClient)
  private readonly baseUrl = `${environment.apiBaseUrl}/users/debt`
  getUserDebt(userId: number): Observable<ApiResponse<UserDebtResponse>> {
    return this._http.get<ApiResponse<UserDebtResponse>>(
      `${this.baseUrl}/${userId}`
    )
  }
  getUsersWithDebt(): Observable<ApiResponse<UserWithDebt[]>> {
    return this._http.get<ApiResponse<UserWithDebt[]>>(this.baseUrl)
  }
  addDebt(
    userId: number,
    request: AddDebtRequest
  ): Observable<ApiResponse<DebtOperationResponse>> {
    return this._http.post<ApiResponse<DebtOperationResponse>>(
      `${this.baseUrl}/${userId}/add`,
      request
    )
  }
  reduceDebt(
    userId: number,
    request: ReduceDebtRequest
  ): Observable<ApiResponse<DebtOperationResponse>> {
    return this._http.post<ApiResponse<DebtOperationResponse>>(
      `${this.baseUrl}/${userId}/reduce`,
      request
    )
  }
  clearDebt(userId: number): Observable<ApiResponse<ClearDebtResponse>> {
    return this._http.patch<ApiResponse<ClearDebtResponse>>(
      `${this.baseUrl}/${userId}/clear`,
      {}
    )
  }
}
