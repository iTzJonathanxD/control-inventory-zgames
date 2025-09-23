import { inject, Injectable } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import { filter } from 'rxjs/operators'
import { TranslateService } from '@ngx-translate/core'
import { combineLatest } from 'rxjs' // <-- Importar combineLatest
@Injectable({
  providedIn: 'root',
})
export class TitleService {
  private titleService = inject(Title)
  private router = inject(Router)
  private activatedRoute = inject(ActivatedRoute)
  private translate = inject(TranslateService)
  init(): void {
    combineLatest([
      this.router.events.pipe(
        filter((event) => event instanceof NavigationEnd)
      ),
      this.translate.onLangChange,
    ]).subscribe(() => {
      this.updateTitle()
    })
  }
  private updateTitle(): void {
    let route = this.activatedRoute
    while (route.firstChild) {
      route = route.firstChild
    }
    const titleKey = route.snapshot.data['title']
    if (titleKey) {
      this.translate.get(titleKey).subscribe((translatedTitle: string) => {
        const finalTitle = translatedTitle + ' | ZFacturacion'
        this.titleService.setTitle(finalTitle)
      })
    }
  }
}
