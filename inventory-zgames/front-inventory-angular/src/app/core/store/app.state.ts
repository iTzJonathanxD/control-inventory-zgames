import { User } from '../interfaces/api/user.interface'
import { Company } from '../interfaces/api/company.interface'
export interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  permissions: string[]
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
export interface UIState {
  theme: 'light' | 'dark'
  language: string
  sidebarCollapsed: boolean
  isLoading: boolean
}
export interface AppState {
  auth: AuthState
  ui: UIState
}
export const initialAuthState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  permissions: [],
  isAuthenticated: false,
  isLoading: false,
  error: null,
}
export const initialUIState: UIState = {
  theme: 'light',
  language: 'es',
  sidebarCollapsed: false,
  isLoading: false,
}
export const initialAppState: AppState = {
  auth: initialAuthState,
  ui: initialUIState,
}
