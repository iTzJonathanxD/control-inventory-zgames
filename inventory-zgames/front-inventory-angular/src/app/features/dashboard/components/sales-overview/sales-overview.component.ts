import { Component, type OnInit } from '@angular/core'
import { NgApexchartsModule } from 'ng-apexcharts'
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap'
import { CommonModule } from '@angular/common'
import { ProductService } from '@core/services/api/product.service'
import {
  BestSellingProduct,
  DashboardStats,
  MonthlySalesData,
} from '@core/interfaces/api/dashboard.interface'
import { TranslateModule } from '@ngx-translate/core'
interface ChartOptions {
  series: any[]
  chart: any
  stroke: any
  fill: any
  markers: any
  xaxis: any
  yaxis: any
  grid: any
  legend: any
  colors: string[]
  tooltip: any
}
@Component({
  selector: 'sales-overview',
  standalone: true,
  imports: [NgApexchartsModule, NgbDropdownModule, TranslateModule,
   CommonModule],
  templateUrl: './sales-overview.component.html',
  styles: ``,
})
export class SalesOverviewComponent implements OnInit {
  loading = false
  monthlySales = 0
  productsSold = 0
  dailyAverage = 0
  growthPercentage = 0
  salesChartOpts: Partial<ChartOptions> = {
    series: [
      {
        name: 'Ventas',
        type: 'area',
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      {
        name: 'Productos Vendidos',
        type: 'line',
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
    ],
    chart: {
      height: 300,
      type: 'line',
      toolbar: {
        show: false,
      },
    },
    stroke: {
      width: [0, 2],
      curve: 'smooth',
    },
    fill: {
      opacity: [0.1, 1],
      type: ['solid', 'solid'],
    },
    markers: {
      size: [0, 4],
      strokeWidth: 2,
      hover: {
        size: 4,
      },
    },
    xaxis: {
      categories: [
        'Ene',
        'Feb',
        'Mar',
        'Abr',
        'May',
        'Jun',
        'Jul',
        'Ago',
        'Sep',
        'Oct',
        'Nov',
        'Dic',
      ],
      axisTicks: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
    },
    yaxis: {
      stepSize: 25,
      min: 0,
      labels: {
        formatter: (val: number) => val + 'k',
        offsetX: -15,
      },
      axisBorder: {
        show: false,
      },
    },
    grid: {
      show: true,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      padding: {
        top: 0,
        right: -15,
        bottom: 15,
        left: -15,
      },
    },
    legend: {
      show: true,
      horizontalAlign: 'center',
      offsetX: 0,
      offsetY: -5,
      itemMargin: {
        horizontal: 10,
        vertical: 0,
      },
    },
    colors: ['#6ac75a', '#465dff'],
    tooltip: {
      shared: true,
      y: [
        {
          formatter: (y: number) => {
            if (typeof y !== 'undefined') {
              return '$' + y.toFixed(2) + 'k'
            }
            return y
          },
        },
        {
          formatter: (y: number) => {
            if (typeof y !== 'undefined') {
              return y.toFixed(0) + ' productos'
            }
            return y
          },
        },
      ],
    },
  }
  constructor(private productService: ProductService) {}
  ngOnInit() {
    this.loadSalesData()
  }
  private loadSalesData() {
    this.loading = true
    this.productService.getMonthlySalesData().subscribe({
      next: (response) => {
        if (response) {
          this.updateChartData(response.data)
          this.calculateMetrics(response.data)
        }
        this.loading = false
      },
      error: (error) => {
        console.error('Error loading sales data:', error)
        this.loading = false
        this.setDefaultData()
      },
    })
  }
  private updateChartData(salesData: MonthlySalesData[]) {
    const monthlyData = new Array(12).fill(0)
    salesData.forEach((data) => {
      if (data.month >= 1 && data.month <= 12) {
        monthlyData[data.month - 1] = data.sales / 1000 // Convertir a miles
      }
    })
    this.salesChartOpts = {
      ...this.salesChartOpts,
      series: [
        {
          name: 'Ventas',
          type: 'area',
          data: monthlyData,
        },
        {
          name: 'Productos Vendidos',
          type: 'line',
          data: monthlyData.map((val) => val * 0.8), // Estimación de productos vendidos
        },
      ],
    }
  }
  private calculateMetrics(salesData: MonthlySalesData[]) {
    const currentMonth = new Date().getMonth() + 1
    const currentMonthData = salesData.find(
      (data) => data.month === currentMonth
    )
    this.monthlySales = currentMonthData ? currentMonthData.sales / 1000 : 0
    this.productsSold = Math.floor(this.monthlySales * 25) // Estimación
    this.dailyAverage = (this.monthlySales * 1000) / 30 // Promedio diario
    this.growthPercentage = 12.5 // Valor de ejemplo
  }
  private setDefaultData() {
    this.monthlySales = 125
    this.productsSold = 1250
    this.dailyAverage = 4200
    this.growthPercentage = 12.5
  }
}
