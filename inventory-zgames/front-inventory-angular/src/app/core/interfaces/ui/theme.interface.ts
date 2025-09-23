export interface Config {
  settings: Settings
  color: Color
}
export interface Settings {
  layout: string
  layout_type: string
  layout_version: string
  icon: string
}
export interface Color {
  primary_color: string
  secondary_color: string
}
