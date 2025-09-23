import { CommonModule } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'
import { Router } from '@angular/router'
import {
  User,
  UserLoginRequest,
  UserState,
} from '@core/interfaces/api/user.interface'
import { AuthenticationService } from '@core/services/api/auth.service'
import { ToastrNotificationService } from '@core/services/ui/notification.service'
import { UserActions } from '@core/states/auth/auth.actions'
import { selectAuth } from '@core/states/auth/auth.selectors'
import { environment } from '@environment/environment'
import { Store } from '@ngrx/store'
import { TranslatePipe, TranslateService } from '@ngx-translate/core'
import { ToastrService } from 'ngx-toastr'
import { Subject, takeUntil } from 'rxjs'
@Component({
  selector: 'lock-screen',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, TranslatePipe],
  templateUrl: './lock-screen.component.html',
  styleUrls: ['./lock-screen.component.scss'],
})
export class LockScreenComponent implements OnInit {
  public userProfile!: User
  public unlockForm!: FormGroup
  private onDestroy$: Subject<boolean> = new Subject()
  public isLoading: boolean = false
  private baseUrl: string = environment.apiBaseUrl
  public userImage: string = ''
  private translate = inject(TranslateService)
  private _store = inject(Store)
  private toastr = inject(ToastrService)
  private notificationService = inject(ToastrNotificationService)
  private _fb = inject(FormBuilder)
  private _authService = inject(AuthenticationService)
  private _router = inject(Router)
  ngOnInit(): void {
    this.getProfile()
    this.initForm()
  }
  private getProfile(): void {
    this._store
      .select(selectAuth)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((state: UserState) => {
        if (state.user) {
          this.userProfile = state.user
          this.userImage = state.user.profilePhoto
            ? this.formatUrl(state.user.profilePhoto)
            : 'assets/images/default-avatar.png'
        }
      })
  }
  private formatUrl(url?: string): string {
    console.log('Lock Screen - formatUrl called with:', url)
    if (!url) {
      console.log('Lock Screen - No URL provided, using default avatar')
      return 'assets/images/default-avatar.png'
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      console.log('Lock Screen - Complete URL detected:', url)
      return url
    }
    const formattedUrl =
      this.baseUrl + '/' + url.replace(/ /g, '%20').replace(/\\/g, '/')
    console.log('Lock Screen - Formatted URL:', formattedUrl)
    return formattedUrl
  }
  onImageError(event: any): void {
    console.log(
      'Lock Screen - Error loading image, falling back to default avatar'
    )
    console.log('Lock Screen - Failed URL:', event.target.src)
    event.target.src = 'assets/images/default-avatar.png'
  }
  private initForm(): void {
    this.unlockForm = this._fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
    })
  }
  unlockSession(): void {
    if (this.unlockForm.valid) {
      const data: UserLoginRequest = {
        email: this.userProfile.email,
        password: this.unlockForm.get('password')?.value,
      }
      if (data) {
        this.isLoading = true
        this._authService.unlock(data).subscribe({
          next: (res) => {
            this.isLoading = false
            this._authService.unlockSession()
            const userRole = this.userProfile?.role?.roleName?.toLowerCase()
            if (userRole === 'admin') {
              this._router.navigate(['/dashboard'])
            } else {
              this._router.navigate(['/user-products'])
            }
            this.notificationService.showNotification({
              type: 'success',
              message: res.message || 'Sesión desbloqueada exitosamente',
            })
          },
          error: (error) => {
            this.isLoading = false
            let errorMessage = 'Contraseña incorrecta'
            if (error?.error?.message) {
              errorMessage = error.error.message
            } else if (error?.message) {
              errorMessage = error.message
            }
            this.notificationService.showNotification({
              type: 'error',
              message: errorMessage,
            })
            this.unlockForm.get('password')?.setValue('')
          },
        })
      }
    } else {
      const warningMsg = this.translate.instant(
        'LOGIN.MESSAGES.FORM_INCOMPLETE'
      )
      this.notificationService.showNotification({
        type: 'warning',
        message: warningMsg,
      })
    }
  }
  getCurrentTime(): string {
    return new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
  }
  ngOnDestroy(): void {
    this.onDestroy$.next(true)
  }
}
