import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { isBefore } from 'date-fns'
import { User, UserLoginRequest } from '@core/interfaces/api/user.interface'
import { StorageService } from '../ui/storage.service'
import { Router } from '@angular/router'
import { environment } from '@environment/environment'
import { Observable, tap } from 'rxjs'
import { ApiResponse } from '@core/interfaces/api/api-response.interface'
import { USER_SESSION } from '@core/helpers/global/global.constants'
import * as CryptoJS from 'crypto-js'
const SESSION_LOCK_KEY = 'session_locked'
const STORAGE_KEY_USER = 'rememberedUser'
const STORAGE_KEY_PASS = 'rememberedPass'
const SECRET_KEY = 'baseProjectKey2025!'
@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private _http = inject(HttpClient)
  private _storageService = inject(StorageService)
  private router = inject(Router)
  public url: string = environment.apiBaseUrl + '/auth'
  login = (request: UserLoginRequest): Observable<ApiResponse<User>> => {
    const endpoint = `${this.url}/login`
    const headers = new HttpHeaders({ skip: 'skip' })
    const options = { headers }
    return this._http.post<ApiResponse<User>>(endpoint, request, options).pipe(
      tap((response: ApiResponse<User>) => {
        this._storageService.secureStorage.setItem(
          USER_SESSION,
          JSON.stringify(response.data)
        )
        sessionStorage.removeItem(SESSION_LOCK_KEY)
      })
    )
  }
  unlock = (request: UserLoginRequest): Observable<ApiResponse<User>> => {
    const endpoint = `${this.url}/unlock`
    const headers = new HttpHeaders({ skip: 'skip' })
    const options = { headers }
    return this._http.post<ApiResponse<User>>(endpoint, request, options)
  }
  public getMeUser(): Observable<ApiResponse<User>> {
    return this._http.get<ApiResponse<User>>(`${this.url}/get-me-user`)
  }
  logout(): void {
    this._storageService.secureStorage.removeItem(USER_SESSION)
    sessionStorage.removeItem(SESSION_LOCK_KEY)
    this.router.navigate([`/auth/login`])
  }
  public isLoggedIn(): boolean {
    const expirationDate = this.getExpiration()
    if (!expirationDate) {
      return false
    }
    return isBefore(new Date(), expirationDate)
  }
  isLoggedOut(): boolean {
    return !this.isLoggedIn()
  }
  getExpiration = () => {
    const session = JSON.parse(
      this._storageService.secureStorage.getItem(USER_SESSION)
    )
    if (!session) {
      return null
    }
    const { exp } = this._storageService.parseJwt(session)
    return new Date(exp * 1000)
  }
  lockSession() {
    sessionStorage.setItem(SESSION_LOCK_KEY, 'true')
  }
  isLocked(): boolean {
    return sessionStorage.getItem(SESSION_LOCK_KEY) === 'true'
  }
  unlockSession() {
    sessionStorage.removeItem(SESSION_LOCK_KEY)
  }
  rememberUser(email: string, password: string) {
    localStorage.setItem(STORAGE_KEY_USER, email)
    const encryptedPass = CryptoJS.AES.encrypt(password, SECRET_KEY).toString()
    localStorage.setItem(STORAGE_KEY_PASS, encryptedPass)
  }
  getRememberedUser(): { email: string; password: string } | null {
    const email = localStorage.getItem(STORAGE_KEY_USER)
    const encryptedPass = localStorage.getItem(STORAGE_KEY_PASS)
    if (email && encryptedPass) {
      try {
        const bytes = CryptoJS.AES.decrypt(encryptedPass, SECRET_KEY)
        const decryptedPass = bytes.toString(CryptoJS.enc.Utf8)
        return { email, password: decryptedPass }
      } catch (error) {
        return null
      }
    }
    return null
  }
  clearRememberedUser() {
    localStorage.removeItem(STORAGE_KEY_USER)
    localStorage.removeItem(STORAGE_KEY_PASS)
  }
}
