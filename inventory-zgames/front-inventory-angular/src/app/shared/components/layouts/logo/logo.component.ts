import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { RouterLink } from '@angular/router'
@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <!-- Logo para Auth -->
    @if (isAuth) {
      <a routerLink="/auth/login" class="auth-brand mb-3">
        <img
          src="/assets/images/ZGames.png"
          alt="dark logo"
          height="42"
          class="logo-dark"
        />
        <img
          src="/assets/images/ZGames.png"
          alt="logo light"
          height="42"
          class="logo-light"
        />
      </a>
    }
    <!-- Logo para Dashboard -->
    @else {
      <a routerLink="/" class="logo">
        <span class="logo-light">
          <span class="logo-lg"
            ><img src="/assets/images/ZGames.png" alt="logo"
          /></span>
          <span class="logo-sm"
            ><img src="/assets/images/logo-sm.png" alt="small logo"
          /></span>
        </span>
        <span class="logo-dark">
          <span class="logo-lg"
            ><img src="/assets/images/logo-dark.png" alt="dark logo"
          /></span>
          <span class="logo-sm"
            ><img src="/assets/images/logo-sm.png" alt="small logo"
          /></span>
        </span>
      </a>
    }
  `,
})
export class LogoComponent {
  @Input() isAuth: boolean = false
}
