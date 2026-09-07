export type Currency = {
  code: string // 'USD', 'EUR', 'ARS', etc.
  name: string // 'US Dollar', 'Euro', 'Peso Argentino'
  symbol: string // '$', '€'
  countryCode: string // for flag-icons
  isSelected?: boolean
}
