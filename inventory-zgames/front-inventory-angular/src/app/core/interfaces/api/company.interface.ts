export interface Company {
  id: string
  companyName: string
  description?: string
  isActive?: boolean
  logoUrl?: string
  createdAt?: string
  updatedAt?: string
}
export interface CompanyState {
  companies: Company[]
  selectedCompany: Company | null
  loading: boolean
  message: string | null
}
