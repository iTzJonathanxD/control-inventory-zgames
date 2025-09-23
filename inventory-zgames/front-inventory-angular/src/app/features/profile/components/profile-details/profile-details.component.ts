import {
  Component,
  type ElementRef,
  inject,
  type OnInit,
  ViewChild,
} from '@angular/core'
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'
import type { User } from '@core/interfaces/api/user.interface'
import { TranslatePipe, TranslateService } from '@ngx-translate/core'
import { GlobalService } from '@core/services/ui/global.service'
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap'
import { Store } from '@ngrx/store'
import { UserActions } from '@core/states/auth/auth.actions'
import { environment } from '@environment/environment'
import { DomSanitizer } from '@angular/platform-browser'
import { ToastrNotificationService } from '@core/services/ui/notification.service'
import type { FilePreview } from '@core/interfaces/ui/file-preview.interface'
import Swal from 'sweetalert2'
import { ImageCompressionService } from '@core/services/ui/image-compression.service'
import { NgClass } from '@angular/common'
import { ImageUrlService } from '@core/services/ui/image-url.service'
@Component({
  selector: 'profile-details',
  imports: [TranslatePipe, ReactiveFormsModule, NgbTooltipModule, NgClass],
  templateUrl: './profile-details.component.html',
  styleUrl: './profile-details.component.scss',
})
export class ProfileDetailsComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef
  public userProfile: User = {} as User
  public isEditing = false
  public profileForm: FormGroup = new FormGroup({})
  public originalFormValues: User = {} as User
  private baseUrl: string = environment.apiBaseUrl
  public userImage = ''
  public selectedFiles: FilePreview[] = []
  private _profileService = inject(GlobalService)
  private _fb = inject(FormBuilder)
  private store = inject(Store)
  private sanitizer = inject(DomSanitizer)
  private notificationService = inject(ToastrNotificationService)
  private translateService = inject(TranslateService)
  private imageCompressionService = inject(ImageCompressionService)
  private imageUrlService = inject(ImageUrlService)
  ngOnInit(): void {
    this.getProfileData()
    this.profileForm = this.getConfigForm()
    this.debugImagePaths()
  }
  private debugImagePaths(): void {
    console.log('=== DEBUG IMAGE PATHS ===')
    console.log('Environment API Base URL:', environment.apiBaseUrl)
    console.log('Base URL for images:', this.baseUrl)
    console.log('Current user image URL:', this.userImage)
    console.log('User profile object:', this.userProfile)
  }
  getProfileData(): void {
    this._profileService.profile.subscribe(async (profile) => {
      this.userProfile = profile
      console.log('Profile data:', profile) // Para debug
      console.log('Profile photo path:', profile.profilePhoto) // Para debug
      await this.setProfileImage(profile.profilePhoto)
      this.profileForm.patchValue({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        address: profile.address,
      })
      this.originalFormValues = this.profileForm.value
    })
  }
  getConfigForm(): FormGroup {
    return (this.profileForm = this._fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      address: ['', [Validators.required]],
    }))
  }
  toggleEdit(): void {
    this.isEditing = !this.isEditing
  }
  triggerFileInput() {
    this.fileInput.nativeElement.click()
  }
  fileUrl(file: File): any {
    const url = URL.createObjectURL(file)
    return this.sanitizer.bypassSecurityTrustResourceUrl(url)
  }
  async onFileSelected(event: any) {
    const file: File = event.target.files[0]
    if (file) {
      if (!this.isImageFile(file)) {
        const message = this.translateService.instant(
          'PROFILE.MY_PROFILE.ONLY_ALWAY_IMAGE'
        )
        this.notificationService.showNotification({
          type: 'success',
          message,
        })
        return
      }
      const compressedFile = await this.compressImage(file)
      const url = this.fileUrl(compressedFile)
      this.selectedFiles = [
        {
          file: compressedFile,
          urlFile: url,
        },
      ]
      this.showImagePreview(file)
    }
  }
  isImageFile(file: File): boolean {
    return file.type.startsWith('image/')
  }
  showImagePreview(file: File): void {
    const reader = new FileReader()
    reader.onload = () => {
      const newImagePreview = reader.result
      const title = this.translateService.instant('SWEET_ALERT.ARE_YOU_SURE')
      const text = this.translateService.instant(
        'PROFILE.SWEET_ALERT.CHANGE_PHOTO'
      )
      const confirmButton = this.translateService.instant(
        'SWEET_ALERT.YES_I_AM_SURE'
      )
      const cancelButton = this.translateService.instant('SWEET_ALERT.CANCEL')
      Swal.fire({
        title: title,
        text: text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: confirmButton,
        cancelButtonText: cancelButton,
        iconColor: '#8C98A1',
      }).then((result) => {
        if (result.isConfirmed) {
          this.updateUserProfilePicture()
        } else {
          const message = this.translateService.instant(
            'PROFILE.MY_PROFILE.CANCEL_CHANGE'
          )
          this.notificationService.showNotification({
            type: 'success',
            message,
          })
        }
        this.fileInput.nativeElement.value = ''
      })
    }
    reader.readAsDataURL(file)
  }
  compressImage(file: File): Promise<File> {
    return this.imageCompressionService.compressImage(file)
  }
  onSubmit(): void {
    if (this.profileForm.valid) {
      this.store.dispatch(
        UserActions.requestUserProfileUpdate({ user: this.profileForm.value })
      )
      this.isEditing = false
      this.originalFormValues = this.profileForm.value
    }
  }
  updateUserProfilePicture(): void {
    const formData = new FormData()
    const file = this.selectedFiles[0].file
    formData.append('profilePhoto', file)
    this.store.dispatch(
      UserActions.requestUserProfileUpdate({ user: formData })
    )
  }
  testImageUrl(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(true)
      img.onerror = () => resolve(false)
      img.src = url
    })
  }
  private async setProfileImage(profilePhoto?: string): Promise<void> {
    console.log('=== SETTING PROFILE IMAGE ===')
    console.log('Profile photo parameter:', profilePhoto)
    if (!profilePhoto) {
      console.log('No profile photo provided, using default avatar')
      this.userImage = 'assets/images/default-avatar.png'
      return
    }
    const serviceUrl = this.imageUrlService.getUserProfileImageUrl(profilePhoto)
    console.log('Image service URL:', serviceUrl)
    const possibleUrls = [
      serviceUrl,
      `http://localhost:3000/uploads/users/${profilePhoto}`,
      `http://localhost:3000/uploads/profiles/${profilePhoto}`,
      `http://localhost:3000/uploads/${profilePhoto}`,
      `http://localhost:3000/${profilePhoto}`,
      profilePhoto.startsWith('http')
        ? profilePhoto
        : `http://localhost:3000/${profilePhoto}`,
    ]
    console.log('Testing profile image URLs:', possibleUrls)
    for (const url of possibleUrls) {
      console.log(`Testing URL: ${url}`)
      const isValid = await this.testImageUrl(url)
      console.log(`URL ${url} is valid: ${isValid}`)
      if (isValid) {
        console.log('✅ Valid image URL found:', url)
        this.userImage = url
        return
      }
    }
    console.log('❌ No valid image URL found, using default avatar')
    this.userImage = 'assets/images/default-avatar.png'
  }
  onImageError(event: any): void {
    console.log('Error loading image, falling back to default avatar')
    console.log('Failed URL:', event.target.src)
    console.log('Profile photo path from user:', this.userProfile?.profilePhoto)
    const currentSrc = event.target.src
    const profilePhoto = this.userProfile?.profilePhoto
    if (profilePhoto && !currentSrc.includes('default-avatar.png')) {
      const alternativeUrls = [
        `http://localhost:3000/uploads/users/${profilePhoto}`,
        `http://localhost:3000/uploads/profiles/${profilePhoto}`,
        `http://localhost:3000/${profilePhoto}`,
        profilePhoto.startsWith('http')
          ? profilePhoto
          : `http://localhost:3000/${profilePhoto}`,
      ]
      for (const url of alternativeUrls) {
        if (url !== currentSrc) {
          console.log('Trying alternative URL:', url)
          event.target.src = url
          return
        }
      }
    }
    event.target.src = 'assets/images/default-avatar.png'
    this.userImage = 'assets/images/default-avatar.png'
  }
  getRoleClasses(): string {
    const roleName = this.userProfile?.role?.roleName?.toLowerCase()
    switch (roleName) {
      case 'admin':
      case 'administrador':
        return 'role-badge role-admin'
      case 'empleado':
      case 'employee':
        return 'role-badge role-employee'
      default:
        return 'role-badge role-default'
    }
  }
  getRoleIcon(): string {
    const roleName = this.userProfile?.role?.roleName?.toLowerCase()
    switch (roleName) {
      case 'admin':
      case 'empleado':
      default:
        return 'ti ti-user-circle'
    }
  }
  getRolePrefix(): string {
    const roleName = this.userProfile?.role?.roleName?.toLowerCase()
    switch (roleName) {
      case 'admin':
      case 'administrador':
        return '👑'
      case 'empleado':
      case 'employee':
        return '💼'
      default:
        return '👤'
    }
  }
}
