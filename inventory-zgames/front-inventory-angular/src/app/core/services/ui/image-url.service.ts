import { Injectable } from '@angular/core'
@Injectable({
  providedIn: 'root',
})
export class ImageUrlService {
  private readonly baseUrl = 'http://localhost:3000'
  getProductImageUrl(imagePath?: string | null): string {
    if (!imagePath) {
      return 'assets/images/default-product.png'
    }
    if (imagePath.startsWith('https://res.cloudinary.com/')) {
      return imagePath
    }
    if (imagePath.startsWith('http')) {
      return imagePath
    }
    if (imagePath.startsWith('/uploads/')) {
      return `${this.baseUrl}${imagePath}`
    }
    return `${this.baseUrl}/uploads/products/${imagePath}`
  }
  getUserProfileImageUrl(imagePath?: string | null): string {
    if (!imagePath) {
      return 'assets/images/default-avatar.png'
    }
    if (imagePath.startsWith('https://res.cloudinary.com/')) {
      return imagePath
    }
    if (imagePath.startsWith('http')) {
      return imagePath
    }
    if (imagePath.startsWith('/uploads/')) {
      return `${this.baseUrl}${imagePath}`
    }
    return `${this.baseUrl}/uploads/users/${imagePath}`
  }
  getEvidenceImageUrl(imagePath?: string | null): string {
    if (!imagePath) {
      return 'assets/images/default-evidence.png'
    }
    if (imagePath.startsWith('https://res.cloudinary.com/')) {
      return imagePath
    }
    if (imagePath.startsWith('http')) {
      return imagePath
    }
    if (imagePath.startsWith('/uploads/')) {
      return `${this.baseUrl}${imagePath}`
    }
    return `${this.baseUrl}/uploads/payments/${imagePath}`
  }
}
