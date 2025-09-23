import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TranslateModule } from '@ngx-translate/core'
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="loading-container" [class.full-screen]="fullScreen">
      <div class="loading-content">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
        </div>
        <h4 class="loading-title" *ngIf="title">
          {{ title | translate }}
        </h4>
        <p class="loading-subtitle" *ngIf="subtitle">
          {{ subtitle | translate }}
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 400px;
        background: var(--bs-body-bg);
        border-radius: 16px;
        margin: 2rem 0;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        border: 1px solid var(--bs-border-color);
        &.full-screen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          margin: 0;
          border-radius: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
        }
        .loading-content {
          text-align: center;
          padding: 2rem;
          .loading-spinner {
            position: relative;
            width: 80px;
            height: 80px;
            margin: 0 auto 2rem;
            .spinner-ring {
              position: absolute;
              width: 100%;
              height: 100%;
              border: 4px solid transparent;
              border-top: 4px solid #1e40af;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              &:nth-child(2) {
                width: 60px;
                height: 60px;
                top: 10px;
                left: 10px;
                border-top-color: #3b82f6;
                animation-duration: 0.8s;
                animation-direction: reverse;
              }
              &:nth-child(3) {
                width: 40px;
                height: 40px;
                top: 20px;
                left: 20px;
                border-top-color: #60a5fa;
                animation-duration: 0.6s;
              }
            }
          }
          .loading-title {
            color: #1e40af;
            font-weight: 600;
            margin-bottom: 0.5rem;
            font-size: 1.5rem;
          }
          .loading-subtitle {
            color: var(--bs-secondary-color);
            margin: 0;
            font-size: 1rem;
          }
        }
      }
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
      .loading-container.small {
        min-height: 200px;
        margin: 1rem 0;
        .loading-content {
          padding: 1rem;
          .loading-spinner {
            width: 50px;
            height: 50px;
            margin-bottom: 1rem;
            .spinner-ring {
              &:nth-child(2) {
                width: 35px;
                height: 35px;
                top: 7.5px;
                left: 7.5px;
              }
              &:nth-child(3) {
                width: 20px;
                height: 20px;
                top: 15px;
                left: 15px;
              }
            }
          }
          .loading-title {
            font-size: 1.2rem;
          }
          .loading-subtitle {
            font-size: 0.9rem;
          }
        }
      }
      .loading-container.large {
        min-height: 600px;
        .loading-content {
          .loading-spinner {
            width: 120px;
            height: 120px;
            .spinner-ring {
              &:nth-child(2) {
                width: 90px;
                height: 90px;
                top: 15px;
                left: 15px;
              }
              &:nth-child(3) {
                width: 60px;
                height: 60px;
                top: 30px;
                left: 30px;
              }
            }
          }
          .loading-title {
            font-size: 2rem;
          }
          .loading-subtitle {
            font-size: 1.2rem;
          }
        }
      }
      @media (prefers-color-scheme: dark) {
        .loading-container {
          background: var(--bs-dark);
          &.full-screen {
            background: rgba(33, 37, 41, 0.95);
          }
          .loading-content {
            .loading-title {
              color: #60a5fa;
            }
            .loading-subtitle {
              color: var(--bs-light);
            }
          }
        }
      }
    `,
  ],
})
export class LoadingSpinnerComponent {
  @Input() title: string = 'COMMON.LOADING'
  @Input() subtitle: string = 'COMMON.PLEASE_WAIT'
  @Input() fullScreen: boolean = false
  @Input() size: 'small' | 'normal' | 'large' = 'normal'
}
