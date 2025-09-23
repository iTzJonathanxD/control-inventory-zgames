import { CommonModule } from '@angular/common'
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  OnInit,
  Output,
  TemplateRef,
  inject,
} from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import { Store } from '@ngrx/store'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import {
  NgbDropdownModule,
  NgbModal,
  NgbModalModule,
  NgbOffcanvasModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap'
import { SimplebarAngularModule } from 'simplebar-angular'
import { splitArray } from '@core/helpers/ui/utils'
import { currency } from '@core/helpers/ui/constants'
import { appData, languages, languageToFlagMap } from './data'
import { User } from '@core/interfaces/api/user.interface'
import { GlobalService } from '@core/services/ui/global.service'
import { CartService } from '@core/services/api/cart.service'
import { UserActions } from '@core/states/auth/auth.actions'
import { LogoComponent } from '../logo/logo.component'
import { environment } from '@environment/environment'
import { changetheme } from '@core/states/layout/layout-action'
import { LayoutState } from '@core/states/layout/layout-reducers'
import { getLayoutColor } from '@core/states/layout/layout-selector'
import { Observable } from 'rxjs'
import { Cart } from '@core/interfaces/api/cart.model'
@Component({
  selector: 'app-topbar',
  standalone: true,
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    NgbOffcanvasModule,
    NgbDropdownModule,
    NgbTooltipModule,
    SimplebarAngularModule,
    NgbModalModule,
    LogoComponent,
    TranslateModule,
  ],
  styles: `
    .cart-dropdown {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border: none;
      border-radius: 8px;
    }
    .cart-dropdown .dropdown-header {
      background-color: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
      padding: 0.75rem 1rem;
    }
    .topbar-link {
      position: relative;
      transition: all 0.2s ease;
    }
    .topbar-link:hover {
      transform: translateY(-1px);
    }
    .badge {
      font-size: 0.65rem !important;
      min-width: 18px;
      height: 18px;
      line-height: 18px;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% {
        transform: translate(-50%, -50%) scale(1);
      }
      50% {
        transform: translate(-50%, -50%) scale(1.1);
      }
      100% {
        transform: translate(-50%, -50%) scale(1);
      }
    }
  `,
})
export class TopbarComponent implements OnInit {
  public userProfile!: User
  public currency = currency
  public languageList = languages
  public appsChunks = splitArray(appData, 3)
  public color!: string
  public readonly languageToFlagMap = languageToFlagMap
  private baseUrl: string = environment.apiBaseUrl
  public userImage: string = ''
  public userDebt: number = 0
  public hasDebt: boolean = false
  public cart$!: Observable<Cart | null>
  @Output() settingsButtonClicked = new EventEmitter<void>()
  @Output() mobileMenuButtonClicked = new EventEmitter<void>()
  private modalService = inject(NgbModal)
  private store = inject(Store)
  public translate = inject(TranslateService)
  private profileService = inject(GlobalService)
  private router = inject(Router)
  private cartService = inject(CartService)
  ngOnInit(): void {
    this.initializeLanguage()
    this.getProfile()
    this.getLayoutTheme()
    this.initializeCart()
  }
  private getProfile(): void {
    this.profileService.profile.subscribe((user) => {
      this.userProfile = user
      console.log('Topbar - Profile data:', user) // Para debug
      console.log('Topbar - Profile photo path:', user.profilePhoto) // Para debug
      if (user.profilePhoto) {
        this.userImage = this.formatUrl(user.profilePhoto)
        console.log('Topbar - Formatted image URL:', this.userImage) // Para debug
      } else {
        this.userImage = 'assets/images/default-avatar.png'
      }
      this.userDebt = user.debt || 0
      this.hasDebt = this.userDebt > 0
    })
  }
  private formatUrl(url?: string): string {
    if (!url) {
      return 'assets/images/default-avatar.png'
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    const baseUrl = environment.apiBaseUrl.replace('/api', '')
    return `${baseUrl}/${url.replace(/\\/g, '/').replace(/^\/+/, '')}`
  }
  onImageError(event: any): void {
    console.log('Topbar - Error loading image, falling back to default avatar')
    console.log('Topbar - Failed URL:', event.target.src)
    event.target.src = 'assets/images/default-avatar.png'
  }
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }
  getDebtStatusClass(): string {
    return ''
  }
  private initializeLanguage(): void {
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'en'
    this.translate.setDefaultLang('en')
    this.translate.use(savedLanguage)
  }
  private getLayoutTheme(): void {
    this.store.select('layout').subscribe((data: LayoutState) => {
      this.color = data.LAYOUT_THEME
    })
  }
  open(content: TemplateRef<any>): void {
    this.modalService.open(content, { size: 'lg' })
  }
  settingMenu(): void {
    this.settingsButtonClicked.emit()
  }
  toggleMobileMenu(): void {
    this.mobileMenuButtonClicked.emit()
  }
  changeTheme(): void {
    const currentTheme =
      document.documentElement.getAttribute('data-bs-theme') || 'light'
    const newTheme = currentTheme === 'light' ? 'dark' : 'light'
    this.store.dispatch(changetheme({ color: newTheme }))
    this.store.select(getLayoutColor).subscribe((theme) => {
      document.documentElement.setAttribute('data-bs-theme', theme)
    })
  }
  changeLanguage(language: string): void {
    this.translate.use(language)
    localStorage.setItem('preferredLanguage', language)
  }
  logout(): void {
    this.store.dispatch(UserActions.userLogout())
  }
  private initializeCart(): void {
    this.cart$ = this.cartService.cart$
    this.cartService.getUserCart().subscribe()
  }
  getCartItemCount(): number {
    return this.cartService.getCartItemCount()
  }
  getCartTotal(): number {
    return this.cartService.getCartTotal()
  }
  goToCart(): void {
    this.router.navigate(['/cart'])
  }
  goToUserProducts(): void {
    this.router.navigate(['/user-products'])
  }
}
