import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../../../environments/environment'
import {
  WhatsAppInstance,
  WhatsAppConfig,
  CreateInstanceDto,
  UpdateInstanceDto,
  CreateWhatsAppConfigDto,
  UpdateWhatsAppConfigDto,
  SendDebtMessageDto,
  SendCustomMessageDto,
  QRCodeResponse,
} from '../../interfaces/api/whatsapp.interface'
@Injectable({
  providedIn: 'root',
})
export class WhatsAppService {
  private readonly apiUrl = `${environment.apiBaseUrl}/whatsapp`
  constructor(private http: HttpClient) {}
  createConfig(configDto: CreateWhatsAppConfigDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/config`, configDto)
  }
  updateConfig(configDto: UpdateWhatsAppConfigDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/config`, configDto)
  }
  getConfig(): Observable<any> {
    return this.http.get(`${this.apiUrl}/config`)
  }
  createInstance(instanceDto: CreateInstanceDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/instances`, instanceDto)
  }
  getInstances(): Observable<any> {
    return this.http.get(`${this.apiUrl}/instances`)
  }
  getInstance(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/instances/${id}`)
  }
  updateInstance(id: number, instanceDto: UpdateInstanceDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/instances/${id}`, instanceDto)
  }
  deleteInstance(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/instances/${id}`)
  }
  getQRCode(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/instances/${id}/qr`)
  }
  setPrimaryInstance(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/instances/${id}/primary`, {})
  }
  removePrimaryInstance(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/instances/${id}/primary`)
  }
  refreshInstanceStatuses(): Observable<any> {
    return this.http.put(`${this.apiUrl}/instances/refresh-status`, {})
  }
  sendDebtMessage(messageDto: SendDebtMessageDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-debt-message`, messageDto)
  }
  sendCustomMessage(messageDto: SendCustomMessageDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-message`, messageDto)
  }
}
