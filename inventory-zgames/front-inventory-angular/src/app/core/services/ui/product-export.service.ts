import { Injectable, inject } from '@angular/core'
import { saveAs } from 'file-saver'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { Product } from '@core/interfaces/api/product.interface'
import { ProductService } from '@core/services/api/product.service'
import { Observable, forkJoin, of } from 'rxjs'
import { map, catchError } from 'rxjs/operators'
@Injectable({
  providedIn: 'root',
})
export class ProductExportService {
  private readonly companyLogo = 'assets/images/ZGames.png'
  private readonly companyName = 'ZGames'
  private readonly companyAddress = 'Dirección de la empresa'
  private readonly companyPhone = 'Teléfono: +593 99 592 3599'
  private readonly productService = inject(ProductService)
  constructor() {}
  public async exportToPDF(
    products: Product[],
    filters?: Record<string, any>
  ): Promise<void> {
    try {
      const pdf = new jsPDF()
      const pageWidth = pdf.internal.pageSize.width
      await this.addLogo(pdf)
      pdf.setFontSize(18)
      pdf.setFont('helvetica', 'bold')
      pdf.text('REPORTE DE PRODUCTOS', pageWidth / 2, 60, {
        align: 'center',
      })
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(this.companyAddress, pageWidth / 2, 70, { align: 'center' })
      pdf.text(this.companyPhone, pageWidth / 2, 75, { align: 'center' })
      const currentDate = new Date().toLocaleDateString('es-ES')
      pdf.text(`Fecha del reporte: ${currentDate}`, 20, 85)
      let yPosition = 95
      if (filters && Object.keys(filters).length > 0) {
        pdf.setFont('helvetica', 'bold')
        pdf.text('Filtros aplicados:', 20, yPosition)
        pdf.setFont('helvetica', 'normal')
        yPosition += 8
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            pdf.text(`${this.getFilterLabel(key)}: ${value}`, 25, yPosition)
            yPosition += 5
          }
        })
        yPosition += 5
      }
      const tableData = products.map((product) => [
        product.id?.toString() || '',
        product.codeName || '',
        product.productName || 'Sin nombre',
        product.category?.categoryName || 'Sin categoría',
        product.stockCurrent?.toString() || '0',
        product.stockMin?.toString() || '0',
        this.formatPrice(product.unitPrice),
        product.isActive ? 'Activo' : 'Inactivo',
        product.createdAt
          ? new Date(product.createdAt).toLocaleDateString('es-ES')
          : 'N/A',
      ])
      autoTable(pdf, {
        head: [
          [
            'ID',
            'Código',
            'Producto',
            'Categoría',
            'Stock',
            'Stock Mín.',
            'Precio',
            'Estado',
            'Fecha',
          ],
        ],
        body: tableData,
        startY: yPosition,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [64, 81, 181],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 20 },
          2: { cellWidth: 35 },
          3: { cellWidth: 25 },
          4: { cellWidth: 18 },
          5: { cellWidth: 18 },
          6: { cellWidth: 20 },
          7: { cellWidth: 18 },
          8: { cellWidth: 25 },
        },
      })
      const totalPages = pdf.internal.pages.length - 1
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        pdf.setFontSize(8)
        pdf.text(
          `Página ${i} de ${totalPages}`,
          pageWidth / 2,
          pdf.internal.pageSize.height - 10,
          { align: 'center' }
        )
      }
      this.addStatisticsSummary(pdf, products)
      const fileName = `productos_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error('Error al generar PDF:', error)
      throw new Error('Error al generar el reporte PDF')
    }
  }
  public exportToExcel(
    products: Product[],
    filters?: Record<string, any>
  ): void {
    try {
      const workbook = XLSX.utils.book_new()
      const excelData = products.map((product) => ({
        ID: product.id || '',
        Código: product.codeName || '',
        'Nombre del Producto': product.productName || 'Sin nombre',
        Descripción: product.description || 'Sin descripción',
        Categoría: product.category?.categoryName || 'Sin categoría',
        'Stock Actual': product.stockCurrent || 0,
        'Stock Mínimo': product.stockMin || 0,
        'Precio Unitario': product.unitPrice ? Number(product.unitPrice) : 0,
        Estado: product.isActive ? 'Activo' : 'Inactivo',
        Creado: product.createdAt
          ? new Date(product.createdAt).toLocaleString('es-ES')
          : 'N/A',
        Actualizado: product.updatedAt
          ? new Date(product.updatedAt).toLocaleString('es-ES')
          : 'N/A',
      }))
      const worksheet = XLSX.utils.json_to_sheet(excelData)
      const columnWidths = [
        { wch: 8 }, 
        { wch: 15 }, 
        { wch: 30 }, 
        { wch: 40 }, 
        { wch: 20 }, 
        { wch: 12 }, 
        { wch: 12 }, 
        { wch: 15 }, 
        { wch: 10 }, 
        { wch: 20 }, 
        { wch: 20 }, 
      ]
      worksheet['!cols'] = columnWidths
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos')
      if (products.length > 0) {
        const summaryData = this.generateExcelSummary(products, filters)
        const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData)
        summaryWorksheet['!cols'] = [{ wch: 25 }, { wch: 15 }]
        XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Resumen')
      }
      const fileName = `productos_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(workbook, fileName)
    } catch (error) {
      console.error('Error al generar Excel:', error)
      throw new Error('Error al generar el archivo Excel')
    }
  }
  public async processFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer)
            const workbook = XLSX.read(data, { type: 'array' })
            const firstSheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[firstSheetName]
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
            const processedData = this.validateAndProcessImportData(jsonData)
            resolve(processedData)
          } catch (error) {
            reject(new Error('Error al procesar el archivo: ' + error))
          }
        }
        reader.onerror = () => {
          reject(new Error('Error al leer el archivo'))
        }
        reader.readAsArrayBuffer(file)
      } catch (error) {
        reject(new Error('Error al procesar el archivo: ' + error))
      }
    })
  }
  public generateImportTemplate(): void {
    try {
      const templateData = [
        {
          Código: 'PROD001',
          'Nombre del Producto': 'Laptop Gaming',
          Descripción: 'Laptop para gaming de alta gama',
          'ID Categoría': '1',
          'Stock Actual': 10,
          'Stock Mínimo': 5,
          'Precio Unitario': 1299.99,
        },
        {
          Código: 'PROD002',
          'Nombre del Producto': 'Mouse Inalámbrico',
          Descripción: 'Mouse ergonómico inalámbrico',
          'ID Categoría': '2',
          'Stock Actual': 25,
          'Stock Mínimo': 10,
          'Precio Unitario': 29.99,
        },
        {
          Código: 'PROD003',
          'Nombre del Producto': 'Teclado Mecánico',
          Descripción: 'Teclado mecánico RGB',
          'ID Categoría': '2',
          'Stock Actual': 15,
          'Stock Mínimo': 5,
          'Precio Unitario': 89.99,
        },
      ]
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(templateData)
      worksheet['!cols'] = [
        { wch: 15 }, // Código
        { wch: 30 }, // Nombre del Producto
        { wch: 40 }, // Descripción
        { wch: 15 }, // ID Categoría
        { wch: 15 }, // Stock Actual
        { wch: 15 }, // Stock Mínimo
        { wch: 15 }, // Precio Unitario
      ]
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla')
      const instructionsData = [
        {
          Campo: 'Código',
          Descripción:
            'Código único del producto (alfanumérico, máximo 20 caracteres)',
        },
        {
          Campo: 'Nombre del Producto',
          Descripción:
            'Nombre descriptivo del producto (máximo 100 caracteres)',
        },
        {
          Campo: 'Descripción',
          Descripción:
            'Descripción detallada del producto (máximo 500 caracteres)',
        },
        {
          Campo: 'ID Categoría',
          Descripción: 'ID numérico de la categoría existente en el sistema',
        },
        {
          Campo: 'Stock Actual',
          Descripción: 'Cantidad actual en inventario (número entero positivo)',
        },
        {
          Campo: 'Stock Mínimo',
          Descripción: 'Cantidad mínima requerida (número entero positivo)',
        },
        {
          Campo: 'Precio Unitario',
          Descripción: 'Precio por unidad (número decimal positivo)',
        },
      ]
      const instructionsWorksheet = XLSX.utils.json_to_sheet(instructionsData)
      instructionsWorksheet['!cols'] = [{ wch: 25 }, { wch: 60 }]
      XLSX.utils.book_append_sheet(
        workbook,
        instructionsWorksheet,
        'Instrucciones'
      )
      const fileName = `plantilla_carga_masiva_productos.xlsx`
      XLSX.writeFile(workbook, fileName)
    } catch (error) {
      console.error('Error al generar plantilla:', error)
      throw new Error('Error al generar la plantilla')
    }
  }
  /**
   * Descarga la plantilla de carga masiva
   */
  public downloadBulkUploadTemplate(): void {
    try {
      const templateData = [
        {
          SKU: 'PROD001',
          'Nombre del Producto': 'Laptop Gaming',
          Descripción: 'Laptop para gaming de alta gama',
          'ID Categoría': 1,
          Precio: 1299.99,
          'Stock Actual': 10,
          'Stock Mínimo': 5,
        },
        {
          SKU: 'PROD002',
          'Nombre del Producto': 'Mouse Inalámbrico',
          Descripción: 'Mouse ergonómico inalámbrico',
          'ID Categoría': 2,
          Precio: 29.99,
          'Stock Actual': 25,
          'Stock Mínimo': 10,
        },
        {
          SKU: 'PROD003',
          'Nombre del Producto': 'Teclado Mecánico',
          Descripción: 'Teclado mecánico RGB',
          'ID Categoría': 2,
          Precio: 89.99,
          'Stock Actual': 15,
          'Stock Mínimo': 5,
        },
      ]
      const worksheet = XLSX.utils.json_to_sheet(templateData)
      worksheet['!cols'] = [
        { wch: 15 }, // SKU
        { wch: 30 }, // Nombre del Producto
        { wch: 40 }, // Descripción
        { wch: 15 }, // ID Categoría
        { wch: 12 }, // Precio
        { wch: 15 }, // Stock Actual
        { wch: 15 }, // Stock Mínimo
      ]
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla Productos')
      const instructions = [
        {
          Campo: 'SKU',
          Descripción: 'Código único del producto (obligatorio)',
          Ejemplo: 'PROD001',
        },
        {
          Campo: 'Nombre del Producto',
          Descripción: 'Nombre descriptivo del producto (obligatorio)',
          Ejemplo: 'Laptop Gaming',
        },
        {
          Campo: 'Descripción',
          Descripción: 'Descripción detallada del producto (opcional)',
          Ejemplo: 'Laptop para juegos de alta performance',
        },
        {
          Campo: 'ID Categoría',
          Descripción: 'ID numérico de la categoría existente (obligatorio)',
          Ejemplo: '1',
        },
        {
          Campo: 'Precio',
          Descripción: 'Precio del producto en formato decimal (obligatorio)',
          Ejemplo: '999.99',
        },
        {
          Campo: 'Stock Actual',
          Descripción: 'Cantidad en inventario actual (obligatorio)',
          Ejemplo: '50',
        },
        {
          Campo: 'Stock Mínimo',
          Descripción: 'Cantidad mínima requerida (obligatorio)',
          Ejemplo: '10',
        },
      ]
      const instructionsSheet = XLSX.utils.json_to_sheet(instructions)
      instructionsSheet['!cols'] = [
        { wch: 25 }, // Campo
        { wch: 50 }, // Descripción
        { wch: 25 }, // Ejemplo
      ]
      XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instrucciones')
      const fileName = `plantilla_productos_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(workbook, fileName)
    } catch (error) {
      console.error('Error al generar plantilla:', error)
      throw new Error('Error al generar la plantilla de carga masiva')
    }
  }
  /**
   * Procesa el archivo de carga masiva
   */
  public async processBulkUpload(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)
          if (!jsonData || jsonData.length === 0) {
            reject(
              new Error('El archivo está vacío o no contiene datos válidos')
            )
            return
          }
          const result = this.validateAndProcessProductData(jsonData)
          resolve(result)
        } catch (error) {
          console.error('Error procesando archivo:', error)
          reject(
            new Error('Error al procesar el archivo. Verifique el formato.')
          )
        }
      }
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'))
      }
      reader.readAsArrayBuffer(file)
    })
  }
  /**
   * Valida y procesa los datos de productos del archivo
   */
  private async validateAndProcessProductData(data: any[]): Promise<any> {
    const validProducts: any[] = []
    const invalidProducts: any[] = []
    let totalProcessed = 0
    const skuCount: Record<string, number> = {}
    data.forEach((row) => {
      const sku = row['SKU']?.toString().trim()
      if (sku) {
        skuCount[sku] = (skuCount[sku] || 0) + 1
      }
    })
    const allSKUs = data
      .map((row) => row['SKU']?.toString().trim())
      .filter(Boolean)
    const allIDs = data
      .map((row) => (row['ID'] ? Number(row['ID']) : null))
      .filter((id) => id !== null)
    let existingSKUs: string[] = []
    let existingIDs: number[] = []
    try {
      if (allSKUs.length > 0) {
        const response = await this.productService
          .findAllProducts(1, allSKUs.length, { codeName: allSKUs.join(',') })
          .toPromise()
        if (response && response.data && response.data.result) {
          existingSKUs = response.data.result.map((p: any) => p.codeName)
        }
      }
      if (allIDs.length > 0) {
        const idChecks = await Promise.all(
          allIDs.map(async (id) => {
            try {
              const res = await this.productService
                .findProductById(id)
                .toPromise()
              return res && res.data && res.data.id ? res.data.id : null
            } catch {
              return null
            }
          })
        )
        existingIDs = idChecks.filter((id) => id !== null)
      }
    } catch (e) {
      existingSKUs = []
      existingIDs = []
    }
    const seenSKUs = new Set<string>()
    const seenIDs = new Set<number>()
    data.forEach((row, index) => {
      totalProcessed++
      try {
        const sku = row['SKU']?.toString().trim()
        if (!sku) {
          throw new Error('SKU es obligatorio')
        }
        if (skuCount[sku] > 1) {
          throw new Error('SKU repetido en archivo')
        }
        if (seenSKUs.has(sku)) {
          throw new Error('SKU repetido en archivo')
        }
        seenSKUs.add(sku)
        if (
          !row['Nombre del Producto'] ||
          !row['ID Categoría'] ||
          !row['Precio'] ||
          row['Stock Actual'] === undefined ||
          row['Stock Mínimo'] === undefined
        ) {
          throw new Error(
            'Campos obligatorios faltantes: SKU, Nombre del Producto, ID Categoría, Precio, Stock Actual, Stock Mínimo'
          )
        }
        if (row['ID']) {
          const id = Number(row['ID'])
          if (seenIDs.has(id)) {
            throw new Error('ID repetido en archivo')
          }
          seenIDs.add(id)
        }
        if (existingSKUs.includes(sku)) {
          throw new Error('SKU ya existe en el sistema')
        }
        if (row['ID'] && existingIDs.includes(Number(row['ID']))) {
          throw new Error('ID ya existe en el sistema')
        }
        const price = parseFloat(row['Precio'])
        const stockActual = parseInt(row['Stock Actual'])
        const stockMinimo = parseInt(row['Stock Mínimo'])
        const categoryId = parseInt(row['ID Categoría'])
        if (isNaN(price) || price < 0) {
          throw new Error(
            'El precio debe ser un número válido mayor o igual a 0'
          )
        }
        if (isNaN(stockActual) || stockActual < 0) {
          throw new Error(
            'El stock actual debe ser un número entero mayor o igual a 0'
          )
        }
        if (isNaN(stockMinimo) || stockMinimo < 0) {
          throw new Error(
            'El stock mínimo debe ser un número entero mayor o igual a 0'
          )
        }
        if (isNaN(categoryId) || categoryId <= 0) {
          throw new Error(
            'El ID de categoría debe ser un número entero positivo'
          )
        }
        const product = {
          codeName: sku,
          productName: row['Nombre del Producto'].toString().trim(),
          description: row['Descripción']
            ? row['Descripción'].toString().trim()
            : '',
          categoryId: categoryId,
          unitPrice: price,
          stockCurrent: stockActual,
          stockMin: stockMinimo,
          isActive: true,
          rowNumber: index + 2,
        }
        validProducts.push(product)
      } catch (error) {
        invalidProducts.push({
          row: index + 2,
          error: error instanceof Error ? error.message : 'Error desconocido',
          data: row,
        })
      }
    })
    return {
      validProducts,
      invalidProducts,
      totalProcessed,
      successCount: validProducts.length,
      errorCount: invalidProducts.length,
    }
  }
  public importValidProducts(validProducts: any[]): Observable<any> {
    if (!validProducts || validProducts.length === 0) {
      return of({ success: 0, errors: 0, results: [] })
    }
    const insertRequests = validProducts.map((product) => {
      const productData = {
        codeName: product.codeName,
        productName: product.productName,
        description: product.description || '',
        categoryId: product.categoryId,
        unitPrice: product.unitPrice,
        stockCurrent: product.stockCurrent,
        stockMin: product.stockMin,
        isActive: true,
      }
      return this.productService.createProduct(productData).pipe(
        map((response) => ({
          success: true,
          data: response,
          originalProduct: product,
        })),
        catchError((error) =>
          of({
            success: false,
            error: error.message || 'Error al crear producto',
            originalProduct: product,
          })
        )
      )
    })
    return forkJoin(insertRequests).pipe(
      map((results) => {
        const successful = results.filter((r) => r.success)
        const failed = results.filter((r) => !r.success)
        return {
          success: successful.length,
          errors: failed.length,
          total: results.length,
          successfulProducts: successful.map((r) => r.originalProduct),
          failedProducts: failed.map((r) => ({
            product: r.originalProduct,
            error: (r as any).error || 'Error desconocido',
          })),
          results: results,
        }
      }),
      catchError((error) => {
        console.error('Error en importación masiva:', error)
        return of({
          success: 0,
          errors: validProducts.length,
          total: validProducts.length,
          successfulProducts: [],
          failedProducts: validProducts.map((p) => ({
            product: p,
            error: 'Error general en la importación',
          })),
          results: [],
        })
      })
    )
  }
  public showImportResultNotifications(result: any): void {
    if (result.success > 0 && result.errors === 0) {
      console.log(
        `✅ Importación exitosa: ${result.success} productos importados`
      )
    } else if (result.success > 0 && result.errors > 0) {
      console.log(
        `⚠️ Importación parcial: ${result.success} productos importados, ${result.errors} fallaron`
      )
      if (result.failedProducts && result.failedProducts.length > 0) {
        console.group('Productos que fallaron:')
        result.failedProducts.forEach((failure: any, index: number) => {
          console.log(
            `${index + 1}. ${failure.product.productName} (Fila ${failure.product.rowNumber}): ${failure.error}`
          )
        })
        console.groupEnd()
      }
    } else {
      console.error(
        `❌ Error en la importación: No se pudieron importar productos`
      )
      if (result.failedProducts && result.failedProducts.length > 0) {
        console.group('Errores encontrados:')
        result.failedProducts.forEach((failure: any, index: number) => {
          console.error(
            `${index + 1}. ${failure.product.productName}: ${failure.error}`
          )
        })
        console.groupEnd()
      }
    }
  }
  private async addLogo(pdf: jsPDF): Promise<void> {
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      return new Promise((resolve) => {
        img.onload = () => {
          try {
            pdf.addImage(img, 'PNG', 20, 15, 40, 20)
          } catch (error) {
            console.warn('No se pudo cargar el logo:', error)
          }
          resolve()
        }
        img.onerror = () => {
          console.warn('No se pudo cargar el logo')
          resolve()
        }
        img.src = this.companyLogo
      })
    } catch (error) {
      console.warn('Error al cargar logo:', error)
    }
  }
  private addStatisticsSummary(pdf: jsPDF, products: Product[]): void {
    try {
      const activeProducts = products.filter((p) => p.isActive).length
      const inactiveProducts = products.filter((p) => !p.isActive).length
      const lowStockProducts = products.filter(
        (p) => p.stockCurrent <= p.stockMin
      ).length
      const totalValue = products.reduce(
        (sum, p) =>
          sum + this.getNumericValue(p.unitPrice) * (p.stockCurrent || 0),
        0
      )
      const avgPrice =
        products.length > 0
          ? products.reduce(
              (sum, p) => sum + this.getNumericValue(p.unitPrice),
              0
            ) / products.length
          : 0
      pdf.addPage()
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('RESUMEN ESTADÍSTICO', 20, 30)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      const summaryData = [
        ['Total de productos:', products.length.toString()],
        ['Productos activos:', activeProducts.toString()],
        ['Productos inactivos:', inactiveProducts.toString()],
        ['Productos con stock bajo:', lowStockProducts.toString()],
        ['Valor total del inventario:', `$${totalValue.toFixed(2)}`],
        ['Precio promedio:', `$${avgPrice.toFixed(2)}`],
      ]
      autoTable(pdf, {
        body: summaryData,
        startY: 40,
        theme: 'grid',
        styles: {
          fontSize: 10,
        },
        columnStyles: {
          0: { cellWidth: 80, fontStyle: 'bold' },
          1: { cellWidth: 80 },
        },
      })
    } catch (error) {
      console.warn('Error al agregar resumen estadístico:', error)
    }
  }
  private generateExcelSummary(
    products: Product[],
    filters?: Record<string, any>
  ): any[] {
    const activeProducts = products.filter((p) => p.isActive).length
    const inactiveProducts = products.filter((p) => !p.isActive).length
    const lowStockProducts = products.filter(
      (p) => p.stockCurrent <= p.stockMin
    ).length
    const totalValue = products.reduce(
      (sum, p) =>
        sum + this.getNumericValue(p.unitPrice) * (p.stockCurrent || 0),
      0
    )
    const avgPrice =
      products.length > 0
        ? products.reduce(
            (sum, p) => sum + this.getNumericValue(p.unitPrice),
            0
          ) / products.length
        : 0
    const summary = [
      {
        Concepto: 'Fecha del reporte',
        Valor: new Date().toLocaleDateString('es-ES'),
      },
      { Concepto: 'Total de productos', Valor: products.length },
      { Concepto: 'Productos activos', Valor: activeProducts },
      { Concepto: 'Productos inactivos', Valor: inactiveProducts },
      { Concepto: 'Productos con stock bajo', Valor: lowStockProducts },
      {
        Concepto: 'Valor total del inventario',
        Valor: `$${totalValue.toFixed(2)}`,
      },
      { Concepto: 'Precio promedio', Valor: `$${avgPrice.toFixed(2)}` },
    ]
    if (filters && Object.keys(filters).length > 0) {
      summary.push({ Concepto: '', Valor: '' })
      summary.push({ Concepto: 'FILTROS APLICADOS', Valor: '' })
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          summary.push({
            Concepto: this.getFilterLabel(key),
            Valor: value.toString(),
          })
        }
      })
    }
    return summary
  }
  private validateAndProcessImportData(data: any[]): any[] {
    if (!data || data.length < 2) {
      throw new Error(
        'El archivo debe contener al menos una fila de datos además del encabezado'
      )
    }
    const headers = data[0]
    const rows = data.slice(1)
    const processedData = rows
      .map((row, index) => {
        if (!row || row.length === 0) return null
        const rowData: any = {}
        headers.forEach((header: string, colIndex: number) => {
          rowData[header] = row[colIndex]
        })
        if (
          !rowData['Código'] ||
          !rowData['Nombre del Producto'] ||
          !rowData['ID Categoría']
        ) {
          throw new Error(
            `Fila ${index + 2}: Faltan campos obligatorios (Código, Nombre del Producto, ID Categoría)`
          )
        }
        const price = parseFloat(rowData['Precio Unitario'])
        if (isNaN(price) || price < 0) {
          throw new Error(
            `Fila ${index + 2}: El precio unitario debe ser un número positivo`
          )
        }
        const stockCurrent = parseInt(rowData['Stock Actual'])
        const stockMin = parseInt(rowData['Stock Mínimo'])
        if (isNaN(stockCurrent) || stockCurrent < 0) {
          throw new Error(
            `Fila ${index + 2}: El stock actual debe ser un número entero positivo`
          )
        }
        if (isNaN(stockMin) || stockMin < 0) {
          throw new Error(
            `Fila ${index + 2}: El stock mínimo debe ser un número entero positivo`
          )
        }
        return {
          codeName: rowData['Código'],
          productName: rowData['Nombre del Producto'],
          description: rowData['Descripción'] || '',
          categoryId: parseInt(rowData['ID Categoría']),
          stockCurrent: stockCurrent,
          stockMin: stockMin,
          unitPrice: price,
          rowNumber: index + 2,
        }
      })
      .filter((item) => item !== null)
    return processedData
  }
  private getFilterLabel(key: string): string {
    const labels: Record<string, string> = {
      fromDate: 'Fecha desde',
      toDate: 'Fecha hasta',
      categoryId: 'Categoría',
      isActive: 'Estado',
      stockLevel: 'Nivel de stock',
    }
    return labels[key] || key
  }
  private formatPrice(price: any): string {
    const numericPrice = this.getNumericValue(price)
    return `$${numericPrice.toFixed(2)}`
  }
  private getNumericValue(value: any): number {
    if (value === null || value === undefined) {
      return 0
    }
    if (typeof value === 'number') {
      return isNaN(value) ? 0 : value
    }
    if (typeof value === 'string') {
      const parsed = parseFloat(value)
      return isNaN(parsed) ? 0 : parsed
    }
    return 0
  }
}
