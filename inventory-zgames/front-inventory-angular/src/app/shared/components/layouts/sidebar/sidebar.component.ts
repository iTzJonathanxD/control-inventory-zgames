import {
  Component,
  inject,
  type OnInit,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core'
import { SimplebarAngularModule } from 'simplebar-angular'
import { LogoComponent } from '../logo/logo.component'
import { MENU_ITEMS, type MenuItemType } from '@core/helpers/ui/menu-meta'
import {
  selectUserPermissions,
  selectUser,
} from '@core/states/auth/auth.selectors'
import { basePath } from '@core/helpers/ui/constants'
import { NavigationEnd, Router, RouterModule } from '@angular/router'
import { Store } from '@ngrx/store'
import { findAllParent, findMenuItem } from '@core/helpers/ui/utils'
import { NgbCollapseModule, type NgbCollapse } from '@ng-bootstrap/ng-bootstrap'
import { CommonModule } from '@angular/common'
import { TranslateModule } from '@ngx-translate/core'
import { changesidebarsize } from '@core/states/layout/layout-action'
import { getSidebarsize } from '@core/states/layout/layout-selector'
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    SimplebarAngularModule,
    LogoComponent,
    CommonModule,
    NgbCollapseModule,
    RouterModule,
    TranslateModule,
  ],
  templateUrl: './sidebar.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class SidebarComponent implements OnInit {
  menuItems: MenuItemType[] = []
  userPermissions: string[] = []
  userRole: string | null = null
  activeMenuItems: string[] = []
  collapsedMenuItems: { [key: string]: boolean } = {}
  previousModule = ''
  currentMainModule = ''
  openSubmenus: Set<string> = new Set()
  router = inject(Router)
  trimmedURL = this.router.url?.replaceAll(
    basePath !== '' ? basePath + '/' : '',
    '/'
  )
  store = inject(Store)
  constructor() {
    this.router.events.forEach((event) => {
      if (event instanceof NavigationEnd) {
        this.trimmedURL = this.router.url?.replaceAll(
          basePath !== '' ? basePath + '/' : '',
          '/'
        )
        this._activateMenu()
        setTimeout(() => {
          this.scrollToActive()
        }, 200)
      }
    })
  }
  ngOnInit(): void {
    this.store.select(selectUserPermissions).subscribe((perms) => {
      this.userPermissions = perms || []
      this.updateMenuItems()
    })
    this.store.select(selectUser).subscribe((user) => {
      this.userRole = user?.role?.roleName || null
      this.updateMenuItems()
    })
  }
  private updateMenuItems(): void {
    this.menuItems = this.filterMenuByPermissions(MENU_ITEMS)
  }
  filterMenuByPermissions(items: MenuItemType[]): MenuItemType[] {
    if (this.userRole === 'ADMIN') {
      return items.map((item) => {
        if (item.children) {
          return {
            ...item,
            children: this.filterMenuByPermissions(item.children),
          }
        }
        return item
      })
    }
    return items
      .filter((item) => {
        if (
          !item.requiredPermissions ||
          item.requiredPermissions.length === 0
        ) {
          return true
        }
        return item.requiredPermissions.every((perm) =>
          this.userPermissions.includes(perm)
        )
      })
      .map((item) => {
        if (item.children) {
          return {
            ...item,
            children: this.filterMenuByPermissions(item.children),
          }
        }
        return item
      })
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this._activateMenu()
    })
    setTimeout(() => {
      this.scrollToActive()
    }, 200)
  }
  hasSubmenu(menu: MenuItemType): boolean {
    return menu.children ? true : false
  }
  findMainModule(menuItem: MenuItemType): MenuItemType | null {
    const allParents = findAllParent(this.menuItems, menuItem)
    if (allParents.length === 0) {
      return menuItem // Es un módulo principal
    }
    const mainModuleKey = allParents[allParents.length - 1]
    return this.findMenuItemByKey(mainModuleKey) || null
  }
  findMenuItemByKey(key: string): MenuItemType | null {
    const findInItems = (items: MenuItemType[]): MenuItemType | null => {
      for (const item of items) {
        if (item.key === key) {
          return item
        }
        if (item.children) {
          const found = findInItems(item.children)
          if (found) return found
        }
      }
      return null
    }
    return findInItems(this.menuItems)
  }
  getAllSubmodules(mainModule: MenuItemType): string[] {
    const submodules: string[] = []
    const collectSubmodules = (items: MenuItemType[]) => {
      items.forEach((item) => {
        if (item.key) {
          submodules.push(item.key)
        }
        if (item.children) {
          collectSubmodules(item.children)
        }
      })
    }
    if (mainModule.children) {
      collectSubmodules(mainModule.children)
    }
    return submodules
  }
  scrollToActive(): void {
    const activatedItem = document.querySelector('.side-nav-item li a.active')
    if (activatedItem) {
      const simplebarContent = document.querySelector(
        '.sidenav-menu .simplebar-content-wrapper'
      )
      if (simplebarContent) {
        const activatedItemRect = activatedItem.getBoundingClientRect()
        const simplebarContentRect = simplebarContent.getBoundingClientRect()
        const activatedItemOffsetTop =
          activatedItemRect.top + simplebarContent.scrollTop
        const centerOffset =
          activatedItemOffsetTop -
          simplebarContentRect.top -
          simplebarContent.clientHeight / 2 +
          activatedItemRect.height / 2
        this.scrollTo(simplebarContent, centerOffset, 600)
      }
    }
  }
  easeInOutQuad(t: number, b: number, c: number, d: number): number {
    t /= d / 2
    if (t < 1) return (c / 2) * t * t + b
    t--
    return (-c / 2) * (t * (t - 2) - 1) + b
  }
  scrollTo(element: Element, to: number, duration: number): void {
    const start = element.scrollTop
    const change = to - start
    const increment = 20
    let currentTime = 0
    const animateScroll = () => {
      currentTime += increment
      const val = this.easeInOutQuad(currentTime, start, change, duration)
      element.scrollTop = val
      if (currentTime < duration) {
        setTimeout(animateScroll, increment)
      }
    }
    animateScroll()
  }
  _activateMenu(): void {
    const div = document.querySelector('.sidenav-menu')
    let matchingMenuItem = null
    if (div) {
      const items: any = div.getElementsByClassName('nav-link-ref')
      for (let i = 0; i < items.length; ++i) {
        if (
          this.trimmedURL === items[i].pathname ||
          (this.trimmedURL.startsWith('/invoice/') &&
            items[i].pathname === '/invoice/RB6985') ||
          (this.trimmedURL.startsWith('/ecommerce/product/') &&
            items[i].pathname === '/ecommerce/product/1')
        ) {
          matchingMenuItem = items[i]
          break
        }
      }
      if (matchingMenuItem) {
        const mid = matchingMenuItem.getAttribute('aria-controls')
        const activeMt = findMenuItem(this.menuItems, mid)
        if (activeMt) {
          const matchingObjs = [
            activeMt['key'],
            ...findAllParent(this.menuItems, activeMt),
          ]
          this.activeMenuItems = matchingObjs
          const currentMainModule = this.findMainModule(activeMt)
          if (currentMainModule) {
            const newMainModuleKey = currentMainModule.key!
            if (
              this.currentMainModule &&
              this.currentMainModule !== newMainModuleKey
            ) {
              this.menuItems.forEach((menu: MenuItemType) => {
                if (menu.key !== newMainModuleKey && !menu.isTitle) {
                  menu.collapsed = true
                }
              })
              this.openSubmenus.clear()
            }
            this.currentMainModule = newMainModuleKey
            const currentSubmodules = this.getAllSubmodules(currentMainModule)
            this.menuItems.forEach((menu: MenuItemType) => {
              if (matchingObjs.includes(menu.key!)) {
                menu.collapsed = false
                if (menu.key) {
                  this.openSubmenus.add(menu.key)
                }
              } else if (menu.key === newMainModuleKey) {
                menu.collapsed = false
              } else if (
                currentSubmodules.includes(menu.key!) &&
                this.openSubmenus.has(menu.key!)
              ) {
                menu.collapsed = false
              } else if (
                !currentSubmodules.includes(menu.key!) &&
                menu.key !== newMainModuleKey
              ) {
                menu.collapsed = true
              }
            })
          }
        }
      }
    }
  }
  /**
   * toggles open menu - VERSIÓN MEJORADA FINAL
   * @param menuItem clicked menuitem
   * @param collapse collapse instance
   */
  toggleMenuItem(menuItem: MenuItemType, collapse: NgbCollapse): void {
    const wasCollapsed = menuItem.collapsed
    collapse.toggle()
    if (wasCollapsed) {
      const clickedMainModule = this.findMainModule(menuItem)
      if (clickedMainModule) {
        const clickedMainModuleKey = clickedMainModule.key!
        if (
          this.currentMainModule &&
          this.currentMainModule !== clickedMainModuleKey
        ) {
          this.menuItems.forEach((menu: MenuItemType) => {
            if (menu.key !== clickedMainModuleKey && !menu.isTitle) {
              menu.collapsed = true
            }
          })
          this.openSubmenus.clear()
        }
        this.currentMainModule = clickedMainModuleKey
        const openMenuItems: string[] = [
          menuItem['key'],
          ...findAllParent(this.menuItems, menuItem),
        ]
        openMenuItems.forEach((key) => {
          const item = this.findMenuItemByKey(key)
          if (item) {
            item.collapsed = false
            this.openSubmenus.add(key)
          }
        })
        if (menuItem.key) {
          this.openSubmenus.add(menuItem.key)
        }
      }
    } else {
      if (menuItem.key) {
        this.openSubmenus.delete(menuItem.key)
        const closeChildren = (item: MenuItemType) => {
          if (item.children) {
            item.children.forEach((child) => {
              if (child.key) {
                this.openSubmenus.delete(child.key)
                child.collapsed = true
              }
              closeChildren(child)
            })
          }
        }
        closeChildren(menuItem)
      }
    }
  }
  changeSidebarSize() {
    let size = document.documentElement.getAttribute('data-sidenav-size')
    if (size == 'sm-hover') {
      size = 'sm-hover-active'
    } else {
      size = 'sm-hover'
    }
    this.store.dispatch(changesidebarsize({ size }))
    this.store.select(getSidebarsize).subscribe((size) => {
      document.documentElement.setAttribute('data-sidenav-size', size)
    })
  }
}
