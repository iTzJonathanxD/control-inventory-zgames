import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../../../environments/environment'
export interface UploadResponse {
  imageUrl: string
}
@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  private readonly apiUrl = environment.apiBaseUrl
  constructor(private http: HttpClient) {}
  uploadProductImage(file: File): Observable<UploadResponse> {
    const formData = new FormData()
    formData.append('image', file)
    return this.http.post<UploadResponse>(
      `${this.apiUrl}/products/upload-image`,
      formData
    )
  }
  uploadUserProfileImage(
    userId: number,
    file: File
  ): Observable<UploadResponse> {
    const formData = new FormData()
    formData.append('profileImage', file)
    return this.http.post<UploadResponse>(
      `${this.apiUrl}/user/upload-profile-image/${userId}`,
      formData
    )
  }
  uploadPaymentEvidence(files: File[]): Observable<any> {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('evidence', file)
    })
    return this.http.post<any>(`${this.apiUrl}/payments`, formData)
  }
}
