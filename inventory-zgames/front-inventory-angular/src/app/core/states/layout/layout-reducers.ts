import { createReducer, on } from '@ngrx/store'
import {
  changemenucolor,
  changesidebarsize,
  changetheme,
  changetopbarcolor,
  changemode,
  changelayout,
  loadPreviewThemeSuccess,
} from './layout-action'
import {
  LAYOUT_TYPES,
  LAYOUT_COLOR_TYPES,
  LAYOUT_MODE_TYPES,
  TOPBAR_COLOR_TYPES,
  MENU_COLOR_TYPES,
  SIDEBAR_SIZE_TYPES,
} from './layout'
export interface LayoutState {
  LAYOUT: string
  LAYOUT_THEME: string
  LAYOUT_MODE: string
  TOPBAR_COLOR: string
  MENU_COLOR: string
  MENU_SIZE: string
}
export const initialState: LayoutState = {
  LAYOUT: LAYOUT_TYPES.VERTICAL,
  LAYOUT_THEME: LAYOUT_COLOR_TYPES.LIGHTMODE,
  LAYOUT_MODE: LAYOUT_MODE_TYPES.FLUIDMODE,
  TOPBAR_COLOR: TOPBAR_COLOR_TYPES.LIGHT,
  MENU_COLOR: MENU_COLOR_TYPES.DARK,
  MENU_SIZE: SIDEBAR_SIZE_TYPES.HOVER_ACTIVE,
}
export const layoutReducer = createReducer(
  initialState,
  on(changelayout, (state, { layout }) => ({ ...state, LAYOUT: layout })),
  on(changetheme, (state, { color }) => ({ ...state, LAYOUT_THEME: color })),
  on(changemode, (state, { mode }) => ({ ...state, LAYOUT_MODE: mode })),
  on(changetopbarcolor, (state, { topbar }) => ({
    ...state,
    TOPBAR_COLOR: topbar,
  })),
  on(changemenucolor, (state, { menu }) => ({ ...state, MENU_COLOR: menu })),
  on(changesidebarsize, (state, { size }) => ({ ...state, MENU_SIZE: size })),
  on(loadPreviewThemeSuccess, (state, { color }) => ({
    ...state,
    LAYOUT_THEME: color,
  }))
)
