import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { timeout } from 'rxjs/operators'
import { environment } from '../../../../environments/environment'
import {
  Payment,
  CreatePaymentDto,
  UpdatePaymentDto,
  PaymentEvidence,
  PaymentFilter,
} from '../../interfaces/api/payment.model'
@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly apiUrl = `${environment.apiBaseUrl}/payments`
  constructor(private http: HttpClient) {}
  createPayment(
    paymentDto: CreatePaymentDto,
    evidenceFiles?: File[]
  ): Observable<Payment> {
    console.log(
      'PaymentService: Creating payment with files:',
      evidenceFiles?.length || 0
    )
    const formData = new FormData()
    formData.append('orderId', paymentDto.orderId.toString())
    formData.append('amount', paymentDto.amount.toString())
    formData.append('method', paymentDto.method)
    if (paymentDto.userId) {
      formData.append('userId', paymentDto.userId.toString())
    }
    if (paymentDto.companyId) {
      formData.append('companyId', paymentDto.companyId.toString())
    }
    if (paymentDto.reference) {
      formData.append('reference', paymentDto.reference)
    }
    if (paymentDto.description) {
      formData.append('description', paymentDto.description)
    }
    if (paymentDto.evidenceNotes) {
      formData.append('evidenceNotes', paymentDto.evidenceNotes)
    }
    if (paymentDto.isVerified !== undefined) {
      formData.append('isVerified', paymentDto.isVerified.toString())
    }
    if (evidenceFiles && evidenceFiles.length > 0) {
      console.log('PaymentService: Adding files to FormData...')
      evidenceFiles.forEach((file, index) => {
        console.log(
          `File ${index + 1}: ${file.name}, Size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
        )
        formData.append('evidence', file)
      })
    }
    console.log('PaymentService: Sending request to backend...')
    return this.http.post<Payment>(this.apiUrl, formData).pipe(
      timeout(60000) // 60 segundos timeout
    )
  }
  updatePayment(id: number, paymentDto: UpdatePaymentDto): Observable<Payment> {
    return this.http.patch<Payment>(`${this.apiUrl}/${id}`, paymentDto)
  }
  getPaymentById(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/${id}`)
  }
  getPaymentsByOrder(orderId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/order/${orderId}`)
  }
  getUserPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/user`)
  }
  getAllPayments(filters?: PaymentFilter): Observable<any> {
    let url = this.apiUrl
    if (filters) {
      const params = new URLSearchParams()
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.minAmount)
        params.append('minAmount', filters.minAmount.toString())
      if (filters.maxAmount)
        params.append('maxAmount', filters.maxAmount.toString())
      if (filters.status && filters.status.length)
        params.append('status', filters.status.join(','))
      if (filters.method && filters.method.length)
        params.append('method', filters.method.join(','))
      if (filters.isVerified !== undefined)
        params.append('isVerified', filters.isVerified.toString())
      if (filters.companyId)
        params.append('companyId', filters.companyId.toString())
      if (filters.userId) params.append('userId', filters.userId.toString())
      if (filters.orderId) params.append('orderId', filters.orderId.toString())
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)
      url += `?${params.toString()}`
    }
    return this.http.get<any>(url)
  }
  findAllPayments(
    page: number = 1,
    limit: number = 10,
    filters?: any
  ): Observable<any> {
    console.log('🌐 Payment Service - Called with params:', {
      page,
      limit,
      filters,
    })
    let url = `${this.apiUrl}?page=${page}&limit=${limit}`
    if (filters) {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.status) params.append('status', filters.status)
      if (filters.method) params.append('method', filters.method)
      if (filters.userId) params.append('userId', filters.userId.toString())
      if (filters.orderId) params.append('orderId', filters.orderId.toString())
      if (filters.amountFrom)
        params.append('minAmount', filters.amountFrom.toString())
      if (filters.amountTo)
        params.append('maxAmount', filters.amountTo.toString())
      if (filters.fromDate) params.append('startDate', filters.fromDate)
      if (filters.toDate) params.append('endDate', filters.toDate)
      if (filters.dateFrom) params.append('startDate', filters.dateFrom)
      if (filters.dateTo) params.append('endDate', filters.dateTo)
      if (filters.isVerified !== undefined)
        params.append('isVerified', filters.isVerified.toString())
      if (filters.companyId)
        params.append('companyId', filters.companyId.toString())
      const queryString = params.toString()
      if (queryString) {
        url += `&${queryString}`
      }
    }
    console.log('🔗 Payment Service - Final URL:', url)
    return this.http.get<any>(url)
  }
  processPayment(id: number): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/${id}/process`, {})
  }
  rejectPayment(id: number, reason?: string): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/${id}/reject`, { reason })
  }
  getPaymentEvidence(id: number): Observable<PaymentEvidence> {
    return this.http.get<PaymentEvidence>(`${this.apiUrl}/${id}/evidence`)
  }
  refundPayment(id: number): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/${id}/refund`, {})
  }
}
