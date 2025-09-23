import { inject, Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '@environment/environment'
import {
  ApiData,
  ApiResponse,
} from '@core/interfaces/api/api-response.interface'
import { Company } from '@core/interfaces/api/company.interface'
@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private API_URL = `${environment.apiBaseUrl}/company`
  private _httpClient = inject(HttpClient)
  public getCompanies(): Observable<ApiResponse<ApiData<Company[]>>> {
    const endpoint = `${this.API_URL}/get-all`
    return this._httpClient.get<ApiResponse<ApiData<Company[]>>>(endpoint)
  }
}
