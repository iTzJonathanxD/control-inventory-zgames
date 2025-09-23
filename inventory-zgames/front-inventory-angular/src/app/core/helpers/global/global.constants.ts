export const TOKEN_HEADER_KEY = 'x-api-key'
export const USER_SESSION = 'USER_SESSION'
export const USER_SESSION_PRE = 'USER_SESSION_PRE'
export const LOCAL_STORAGE_NAMES = {
  LANGUAGE: 'Language',
  THEME: 'Theme',
}
export const MOVEMENT_TYPE_OPTIONS = {
  ENTRY: 'entry',
  EXIT: 'exit',
  ADJUSTMENT: 'adjustment',
}
export const AVAILABLE_LANGUAGES = {
  ES: 'es',
  EN: 'en',
} as const
export const USER_SESSION_LOGIN = {
  USER: 'user',
} as const
export const BLOCKED_OPTIONS = [
  { value: true, label: 'WORDS.YES' },
  { value: false, label: 'WORDS.NO' },
]
export const ACTIVE_OPTIONS = [
  { value: true, label: 'WORDS.YES' },
  { value: false, label: 'WORDS.NO' },
]
export const DEBT_OPTIONS = [
  { value: true, label: 'Con deudas' },
  { value: false, label: 'Sin deudas' },
]
export const MODAL_TYPE = {
  ROLE_FORM: 'role-form',
  MODULE_FORM: 'module-form',
  PERMISSION_FORM: 'permission-form',
}
