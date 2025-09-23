import { TranslationsPerLanguage } from '../ui/language.interface'
export interface MsgTranslate {
  es: string
  en: string
}
export interface ApiMessage {
  text: string
  type: string
}
export type ApiMessageLegacy = string | TranslationsPerLanguage
