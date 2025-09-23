import { Component, inject, type OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { ToastrService } from 'ngx-toastr'
import { ProductExportService } from '@core/services/ui/product-export.service'
import { ProductService } from '@core/services/api/product.service'
import { Product } from '@core/interfaces/api/product.interface'
import { SkuDbDuplicatePipe } from '@/app/shared/pipes/sku-db-duplicate.pipe'
import { NotSkuDbDuplicatePipe } from '@/app/shared/pipes/not-sku-db-duplicate.pipe'
export interface ProductBulkUploadResult {
  validProducts: Product[]
  invalidProducts: any[]
  totalProcessed: number
  successCount: number
  errorCount: number
  importResult?: {
    success: number
    errors: number
    total: number
    successfulProducts: any[]
    failedProducts: any[]
    results: any[]
  }
}
@Component({
  selector: 'app-product-bulk-upload-modal',
  templateUrl: './product-bulk-upload-modal.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    NgbModule,
    SkuDbDuplicatePipe,
    NotSkuDbDuplicatePipe,
  ],
})
export class ProductBulkUploadModalComponent implements OnInit {
  public currentStep = 1
  public selectedFile: File | null = null
  public uploadResult: ProductBulkUploadResult | null = null
  public isProcessing = false
  public uploadProgress = 0
  private readonly activeModal = inject(NgbActiveModal)
  private readonly toastrService = inject(ToastrService)
  private readonly productExportService = inject(ProductExportService)
  private readonly productService = inject(ProductService)
  ngOnInit(): void {}
  public onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
      const file = target.files[0]
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
      ]
      if (!allowedTypes.includes(file.type)) {
        this.toastrService.error(
          'Tipo de archivo no válido. Solo se permiten archivos Excel (.xlsx, .xls) o CSV.',
          'Error'
        )
        return
      }
      this.selectedFile = file
    }
  }
  public async processFile(): Promise<void> {
    if (!this.selectedFile) {
      this.toastrService.error('Debe seleccionar un archivo', 'Error')
      return
    }
    this.isProcessing = true
    this.uploadProgress = 0
    try {
      const progressInterval = setInterval(() => {
        if (this.uploadProgress < 90) {
          this.uploadProgress += 10
        }
      }, 200)
      this.uploadResult = await this.productExportService.processBulkUpload(
        this.selectedFile
      )
      clearInterval(progressInterval)
      this.uploadProgress = 100
      setTimeout(() => {
        this.currentStep = 3
        this.isProcessing = false
      }, 500)
    } catch (error) {
      this.isProcessing = false
      this.uploadProgress = 0
      this.toastrService.error('Error al procesar el archivo', 'Error')
      console.error('Error processing file:', error)
    }
  }
  public async importProducts(): Promise<void> {
    if (!this.uploadResult?.validProducts.length) {
      this.toastrService.error(
        'No hay productos válidos para importar',
        'Error'
      )
      return
    }
    const dbDuplicates = (this.uploadResult.invalidProducts || []).filter(
      (e) => {
        const msg = (e.error || '').toLowerCase()
        return (
          msg.includes('sku ya existe en el sistema') ||
          msg.includes('duplicate entry')
        )
      }
    )
    if (dbDuplicates.length > 0) {
      this.toastrService.error(
        'Existen productos con códigos ya registrados en la base de datos. Corrige los duplicados antes de importar.',
        'Error de duplicados'
      )
      return
    }
    this.isProcessing = true
    try {
      this.productExportService
        .importValidProducts(this.uploadResult.validProducts)
        .subscribe({
          next: (result) => {
            this.handleImportResult(result)
          },
          error: (error) => {
            console.error('Error importing products:', error)
            this.toastrService.error('Error al importar productos', 'Error')
            this.isProcessing = false
          },
        })
    } catch (error) {
      this.toastrService.error('Error al importar productos', 'Error')
      console.error('Error importing products:', error)
      this.isProcessing = false
    }
  }
  private handleImportResult(result: any): void {
    this.isProcessing = false
    this.currentStep = 4
    this.productExportService.showImportResultNotifications(result)
    if (this.uploadResult) {
      this.uploadResult = {
        ...this.uploadResult,
        importResult: result,
      }
    }
    if (result.success > 0 && result.errors === 0) {
      this.toastrService.success(
        `Se importaron ${result.success} productos correctamente`,
        'Éxito'
      )
    } else if (result.success > 0 && result.errors > 0) {
      this.toastrService.warning(
        `Se importaron ${result.success} productos. ${result.errors} productos fallaron.`,
        'Importación Parcial'
      )
      if (result.failedProducts && result.failedProducts.length > 0) {
        const duplicados = result.failedProducts.filter((f: any) =>
          (f.error || '').toLowerCase().includes('duplic')
        )
        if (duplicados.length > 0) {
          this.toastrService.error(
            'Algunos productos no se importaron por código duplicado u otros errores.',
            'Error de duplicación'
          )
        }
      }
    } else {
      let msg = 'No se pudieron importar los productos. Verifique los datos.'
      if (result.failedProducts && result.failedProducts.length > 0) {
        const duplicados = result.failedProducts.filter((f: any) =>
          (f.error || '').toLowerCase().includes('duplic')
        )
        if (duplicados.length > 0) {
          msg =
            'No se importó ningún producto porque los códigos ya existen o hay errores de duplicación.'
        } else {
          msg = 'No se importó ningún producto. Revise los errores reportados.'
        }
      }
      this.toastrService.error(msg, 'Error')
    }
  }
  public downloadTemplate(): void {
    this.productExportService.downloadBulkUploadTemplate()
    this.toastrService.info('Descargando plantilla...', 'Info')
  }
  public nextStep(): void {
    if (this.currentStep < 4) {
      this.currentStep++
    }
  }
  public previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--
    }
  }
  public resetModal(): void {
    this.currentStep = 1
    this.selectedFile = null
    this.uploadResult = null
    this.isProcessing = false
    this.uploadProgress = 0
  }
  public close(): void {
    this.activeModal.close()
  }
  public dismiss(): void {
    this.activeModal.dismiss()
  }
  public get canProceedToValidation(): boolean {
    return this.selectedFile !== null
  }
  public get canProceedToImport(): boolean {
    return (
      this.uploadResult !== null && this.uploadResult.validProducts.length > 0
    )
  }
  public get stepProgress(): number {
    return (this.currentStep / 4) * 100
  }
  public get importSummary(): string {
    if (!this.uploadResult?.importResult) {
      return 'Sin resultados de importación'
    }
    const result = this.uploadResult.importResult
    return `${result.success} productos importados exitosamente, ${result.errors} errores`
  }
  public get hasImportErrors(): boolean {
    return (this.uploadResult?.importResult?.errors ?? 0) > 0
  }
  public get importErrors(): any[] {
    return this.uploadResult?.importResult?.failedProducts || []
  }
}
