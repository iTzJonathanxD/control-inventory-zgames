export interface DashboardStats {
  totalProducts: number
  activeProducts: number
  lowStockProducts: number
  totalInventoryValue: number
}
export interface BestSellingProduct {
  id: number
  productName: string
  codeName: string
  unitPrice: number
  stockCurrent: number
  totalSold: number
  category: {
    name: string
  }
}
export interface MonthlySalesData {
  month: number
  year: number
  sales: number
}
