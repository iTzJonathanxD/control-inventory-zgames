import { Injectable } from '@angular/core'
import { saveAs } from 'file-saver'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import {
  InventoryMovement,
  MovementType,
} from '@core/interfaces/api/movement.interface'
@Injectable({
  providedIn: 'root',
})
export class ExportService {
  private readonly companyLogo = 'assets/images/ZGames.png'
  private readonly companyName = 'ZGames'
  private readonly companyAddress = 'Dirección de la empresa'
  private readonly companyPhone = 'Teléfono: +1234567890'
  constructor() {}
  /**
   * Exporta los movimientos de inventario a PDF
   */
  public async exportToPDF(
    movements: InventoryMovement[],
    filters?: Record<string, any>
  ): Promise<void> {
    try {
      const pdf = new jsPDF()
      const pageWidth = pdf.internal.pageSize.width
      await this.addLogo(pdf)
      pdf.setFontSize(18)
      pdf.setFont('helvetica', 'bold')
      pdf.text('REPORTE DE MOVIMIENTOS DE INVENTARIO', pageWidth / 2, 60, {
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
      const tableData = movements.map((movement) => [
        movement.id?.toString() || '',
        this.getMovementTypeLabel(movement.movementType),
        movement.product?.productName || 'Sin nombre',
        movement.quantity.toString(),
        movement.previousStock?.toString() || '0',
        movement.newStock?.toString() || '0',
        `${movement.user?.firstName || ''} ${movement.user?.lastName || ''}`.trim() ||
          'No asignado',
        movement.createdAt
          ? new Date(movement.createdAt).toLocaleDateString('es-ES')
          : 'N/A',
      ])
      autoTable(pdf, {
        head: [
          [
            'ID',
            'Tipo',
            'Producto',
            'Cantidad',
            'Stock Ant.',
            'Stock Act.',
            'Responsable',
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
          3: { cellWidth: 20 },
          4: { cellWidth: 20 },
          5: { cellWidth: 20 },
          6: { cellWidth: 35 },
          7: { cellWidth: 25 },
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
      this.addStatisticsSummary(pdf, movements)
      const fileName = `movimientos_inventario_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error('Error al generar PDF:', error)
      throw new Error('Error al generar el reporte PDF')
    }
  }
  /**
   * Exporta los movimientos de inventario a Excel
   */
  public exportToExcel(
    movements: InventoryMovement[],
    filters?: Record<string, any>
  ): void {
    try {
      const workbook = XLSX.utils.book_new()
      const excelData = movements.map((movement) => ({
        ID: movement.id || '',
        'Tipo de Movimiento': this.getMovementTypeLabel(movement.movementType),
        Producto: movement.product?.productName || 'Sin nombre',
        'Código de Producto': movement.product?.productCode || 'N/A',
        Cantidad: movement.quantity,
        'Stock Anterior': movement.previousStock || 0,
        'Stock Actual': movement.newStock || 0,
        Diferencia: (movement.newStock || 0) - (movement.previousStock || 0),
        Responsable:
          `${movement.user?.firstName || ''} ${movement.user?.lastName || ''}`.trim() ||
          'No asignado',
        'Email Responsable': movement.user?.email || 'N/A',
        'Fecha y Hora': movement.createdAt
          ? new Date(movement.createdAt).toLocaleString('es-ES')
          : 'N/A',
        Observaciones: 'Sin observaciones', // movement.observations || 'Sin observaciones'
      }))
      const worksheet = XLSX.utils.json_to_sheet(excelData)
      const columnWidths = [
        { wch: 8 }, // ID
        { wch: 18 }, // Tipo de Movimiento
        { wch: 30 }, // Producto
        { wch: 15 }, // Código de Producto
        { wch: 10 }, // Cantidad
        { wch: 12 }, // Stock Anterior
        { wch: 12 }, // Stock Actual
        { wch: 12 }, // Diferencia
        { wch: 25 }, // Responsable
        { wch: 25 }, // Email Responsable
        { wch: 20 }, // Fecha y Hora
        { wch: 30 }, // Observaciones
      ]
      worksheet['!cols'] = columnWidths
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        'Movimientos de Inventario'
      )
      if (movements.length > 0) {
        const summaryData = this.generateExcelSummary(movements, filters)
        const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData)
        summaryWorksheet['!cols'] = [{ wch: 25 }, { wch: 15 }]
        XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Resumen')
      }
      const fileName = `movimientos_inventario_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(workbook, fileName)
    } catch (error) {
      console.error('Error al generar Excel:', error)
      throw new Error('Error al generar el archivo Excel')
    }
  }
  /**
   * Procesa un archivo CSV/Excel para carga masiva
   */
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
  /**
   * Genera una plantilla Excel para carga masiva
   */
  public generateImportTemplate(): void {
    try {
      const templateData = [
        {
          'Tipo de Movimiento': 'ENTRY/EXIT/ADJUSTMENT',
          'Código de Producto': 'PROD001',
          Cantidad: 10,
          Observaciones: 'Descripción del movimiento',
        },
        {
          'Tipo de Movimiento': 'ENTRY',
          'Código de Producto': 'PROD002',
          Cantidad: 25,
          Observaciones: 'Ejemplo de entrada de inventario',
        },
        {
          'Tipo de Movimiento': 'EXIT',
          'Código de Producto': 'PROD003',
          Cantidad: 5,
          Observaciones: 'Ejemplo de salida de inventario',
        },
      ]
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(templateData)
      worksheet['!cols'] = [
        { wch: 25 }, // Tipo de Movimiento
        { wch: 20 }, // Código de Producto
        { wch: 12 }, // Cantidad
        { wch: 40 }, // Observaciones
      ]
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla')
      const instructionsData = [
        {
          Campo: 'Tipo de Movimiento',
          Descripción: 'ENTRY (Entrada), EXIT (Salida), ADJUSTMENT (Ajuste)',
        },
        {
          Campo: 'Código de Producto',
          Descripción: 'Código único del producto en el sistema',
        },
        { Campo: 'Cantidad', Descripción: 'Cantidad numérica positiva' },
        {
          Campo: 'Observaciones',
          Descripción:
            'Descripción opcional del movimiento (máximo 255 caracteres)',
        },
      ]
      const instructionsWorksheet = XLSX.utils.json_to_sheet(instructionsData)
      instructionsWorksheet['!cols'] = [{ wch: 25 }, { wch: 60 }]
      XLSX.utils.book_append_sheet(
        workbook,
        instructionsWorksheet,
        'Instrucciones'
      )
      const fileName = `plantilla_carga_masiva_inventario.xlsx`
      XLSX.writeFile(workbook, fileName)
    } catch (error) {
      console.error('Error al generar plantilla:', error)
      throw new Error('Error al generar la plantilla')
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
  private addStatisticsSummary(
    pdf: jsPDF,
    movements: InventoryMovement[]
  ): void {
    try {
      const entries = movements.filter(
        (m) => m.movementType === MovementType.ENTRY
      ).length
      const exits = movements.filter(
        (m) => m.movementType === MovementType.EXIT
      ).length
      const adjustments = movements.filter(
        (m) => m.movementType === MovementType.ADJUSTMENT
      ).length
      const totalQuantityIn = movements
        .filter((m) => m.movementType === MovementType.ENTRY)
        .reduce((sum, m) => sum + m.quantity, 0)
      const totalQuantityOut = movements
        .filter((m) => m.movementType === MovementType.EXIT)
        .reduce((sum, m) => sum + m.quantity, 0)
      pdf.addPage()
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('RESUMEN ESTADÍSTICO', 20, 30)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      const summaryData = [
        ['Total de movimientos:', movements.length.toString()],
        ['Entradas:', `${entries} movimientos (${totalQuantityIn} unidades)`],
        ['Salidas:', `${exits} movimientos (${totalQuantityOut} unidades)`],
        ['Ajustes:', `${adjustments} movimientos`],
        ['Balance neto:', `${totalQuantityIn - totalQuantityOut} unidades`],
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
    movements: InventoryMovement[],
    filters?: Record<string, any>
  ): any[] {
    const entries = movements.filter(
      (m) => m.movementType === MovementType.ENTRY
    ).length
    const exits = movements.filter(
      (m) => m.movementType === MovementType.EXIT
    ).length
    const adjustments = movements.filter(
      (m) => m.movementType === MovementType.ADJUSTMENT
    ).length
    const totalQuantityIn = movements
      .filter((m) => m.movementType === MovementType.ENTRY)
      .reduce((sum, m) => sum + m.quantity, 0)
    const totalQuantityOut = movements
      .filter((m) => m.movementType === MovementType.EXIT)
      .reduce((sum, m) => sum + m.quantity, 0)
    const summary = [
      {
        Concepto: 'Fecha del reporte',
        Valor: new Date().toLocaleDateString('es-ES'),
      },
      { Concepto: 'Total de movimientos', Valor: movements.length },
      {
        Concepto: 'Entradas',
        Valor: `${entries} (${totalQuantityIn} unidades)`,
      },
      { Concepto: 'Salidas', Valor: `${exits} (${totalQuantityOut} unidades)` },
      { Concepto: 'Ajustes', Valor: adjustments },
      {
        Concepto: 'Balance neto',
        Valor: `${totalQuantityIn - totalQuantityOut} unidades`,
      },
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
          !rowData['Tipo de Movimiento'] ||
          !rowData['Código de Producto'] ||
          !rowData['Cantidad']
        ) {
          throw new Error(
            `Fila ${index + 2}: Faltan campos obligatorios (Tipo de Movimiento, Código de Producto, Cantidad)`
          )
        }
        const validTypes = ['ENTRY', 'EXIT', 'ADJUSTMENT']
        if (!validTypes.includes(rowData['Tipo de Movimiento'])) {
          throw new Error(
            `Fila ${index + 2}: Tipo de movimiento inválido. Use: ${validTypes.join(', ')}`
          )
        }
        const quantity = parseFloat(rowData['Cantidad'])
        if (isNaN(quantity) || quantity <= 0) {
          throw new Error(
            `Fila ${index + 2}: La cantidad debe ser un número positivo`
          )
        }
        return {
          movementType: rowData['Tipo de Movimiento'],
          productCode: rowData['Código de Producto'],
          quantity: quantity,
          observations: rowData['Observaciones'] || '',
          rowNumber: index + 2,
        }
      })
      .filter((item) => item !== null)
    return processedData
  }
  private getMovementTypeLabel(type: MovementType): string {
    switch (type) {
      case MovementType.ENTRY:
        return 'Entrada'
      case MovementType.EXIT:
        return 'Salida'
      case MovementType.ADJUSTMENT:
        return 'Ajuste'
      default:
        return 'Desconocido'
    }
  }
  private getFilterLabel(key: string): string {
    const labels: Record<string, string> = {
      fromDate: 'Fecha desde',
      toDate: 'Fecha hasta',
      productCode: 'Código de producto',
      movementType: 'Tipo de movimiento',
      responsibleId: 'Responsable',
    }
    return labels[key] || key
  }
}
