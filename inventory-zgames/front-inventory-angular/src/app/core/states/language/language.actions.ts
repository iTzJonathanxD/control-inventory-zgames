import { createAction, props } from '@ngrx/store'
import { LanguageCode } from '../../interfaces/ui/language.interface'
export const loadPreviewLanguage = createAction(
  '[Language] Load Preview Language'
)
export const loadPreviewLanguageSuccess = createAction(
  '[Language] Load Preview Language Success',
  props<{ language: LanguageCode }>()
)
export const change = createAction(
  '[Language] Change Language',
  props<{ language: LanguageCode }>()
)
