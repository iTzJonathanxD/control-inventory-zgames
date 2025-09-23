import { Component, OnInit, OnDestroy, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'
import { ToastrService } from 'ngx-toastr'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { Subject, interval } from 'rxjs'
import { takeUntil, switchMap } from 'rxjs/operators'
import { WhatsAppService } from '../../../../core/services/api/whatsapp.service'
import {
  WhatsAppInstance,
  InstanceStatus,
} from '../../../../core/interfaces/api/whatsapp.interface'
@Component({
  selector: 'app-whatsapp-instances',
  templateUrl: './whatsapp-instances.component.html',
  styleUrls: ['./whatsapp-instances.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslateModule],
})
export class WhatsAppInstancesComponent implements OnInit, OnDestroy {
  public instances: WhatsAppInstance[] = []
  public isLoading = false
  public isCreating = false
  public showCreateForm = false
  public createInstanceForm!: FormGroup
  public selectedQRCode: string | null = null
  public qrCodeLoading = false
  public selectedInstanceForQR: WhatsAppInstance | null = null
  public readonly InstanceStatus = InstanceStatus
  private destroy$ = new Subject<void>()
  private qrRefreshInterval$ = new Subject<void>()
  private statusPollingSubscription: any = null
  private readonly fb = inject(FormBuilder)
  private readonly whatsappService = inject(WhatsAppService)
  private readonly toastr = inject(ToastrService)
  private readonly modalService = inject(NgbModal)
  ngOnInit(): void {
    this.initCreateForm()
    this.loadInstances()
    this.startStatusPolling()
  }
  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.qrRefreshInterval$.next()
    this.qrRefreshInterval$.complete()
    this.stopStatusPolling()
  }
  private initCreateForm(): void {
    this.createInstanceForm = this.fb.group({
      instanceName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[a-zA-Z0-9_-]+$/),
        ],
      ],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)],
      ],
      isPrimary: [false],
    })
  }
  private loadInstances(): void {
    this.isLoading = true
    this.whatsappService
      .getInstances()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            const previousInstances = [...this.instances]
            this.instances = response.data || []
            this.instances = this.instances.filter((instance) => {
              if (!this.isValidInstance(instance)) {
                console.error(
                  'Invalid instance found and filtered out:',
                  instance
                )
                return false
              }
              return true
            })
            console.log('Loaded instances:', this.instances.length)
            if (
              this.selectedQRCode &&
              this.selectedInstanceForQR &&
              previousInstances.length > 0
            ) {
              this.checkForQRConnectionSuccess(
                previousInstances,
                this.instances
              )
            }
          }
          this.isLoading = false
        },
        error: (error) => {
          console.error('Error loading instances:', error)
          this.toastr.error('Error al cargar las instancias', 'Error')
          this.isLoading = false
        },
      })
  }
  private isValidInstance(instance: any): instance is WhatsAppInstance {
    return (
      instance &&
      typeof instance === 'object' &&
      typeof instance.id === 'number' &&
      instance.id > 0 &&
      typeof instance.instanceName === 'string' &&
      instance.instanceName.trim().length > 0 &&
      typeof instance.phoneNumber === 'string' &&
      Object.values(InstanceStatus).includes(instance.status)
    )
  }
  private startStatusPolling(): void {
    this.stopStatusPolling()
    let pollingInterval = 30000 
    if (this.selectedQRCode && this.selectedInstanceForQR) {
      const selectedInstance = this.instances.find(
        (inst) => inst.id === this.selectedInstanceForQR?.id
      )
      pollingInterval = selectedInstance?.status === 'connecting' ? 2000 : 5000
    } else {
      const hasConnectingInstances = this.instances.some(
        (inst) => inst.status === 'connecting'
      )
      pollingInterval = hasConnectingInstances ? 10000 : 30000
    }
    console.log(`Starting status polling with ${pollingInterval}ms interval`)
    this.statusPollingSubscription = interval(pollingInterval)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.whatsappService.getInstances())
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.handleInstanceStatusUpdate(response.data || [])
          }
        },
        error: (error) => {
          console.error('Error polling instance status:', error)
          setTimeout(
            () => {
              if (!this.statusPollingSubscription) {
                this.startStatusPolling()
              }
            },
            Math.min(pollingInterval * 2, 60000)
          ) 
        },
      })
  }
  private stopStatusPolling(): void {
    if (this.statusPollingSubscription) {
      this.statusPollingSubscription.unsubscribe()
      this.statusPollingSubscription = null
    }
  }
  private handleInstanceStatusUpdate(newInstances: WhatsAppInstance[]): void {
    console.log('🔄 Handling instance status update:', {
      newInstancesCount: newInstances.length,
      currentInstancesCount: this.instances.length,
      selectedQRInstance: this.selectedInstanceForQR?.instanceName,
      hasQRModal: !!this.selectedQRCode,
    })
    const validInstances = newInstances.filter((instance) =>
      this.isValidInstance(instance)
    )
    if (validInstances.length !== newInstances.length) {
      console.warn('Some instances were filtered out due to invalid data')
    }
    const previousInstances = [...this.instances]
    this.instances = validInstances
    for (const newInstance of validInstances) {
      const oldInstance = previousInstances.find(
        (inst) => inst.id === newInstance.id
      )
      if (oldInstance && oldInstance.status !== newInstance.status) {
        console.log(
          `📱 Instance ${newInstance.instanceName}: ${oldInstance.status} → ${newInstance.status}`
        )
      }
    }
    const hasStatusChanges = this.detectSignificantStatusChanges(
      previousInstances,
      validInstances
    )
    if (this.selectedQRCode && this.selectedInstanceForQR) {
      this.checkForQRConnectionSuccess(previousInstances, this.instances)
      this.updateQRCodeIfNeeded()
    }
    if (hasStatusChanges) {
      console.log(
        'Significant status changes detected, adjusting polling frequency'
      )
      this.startStatusPolling()
    }
  }
  private detectSignificantStatusChanges(
    previousInstances: WhatsAppInstance[],
    currentInstances: WhatsAppInstance[]
  ): boolean {
    for (const currentInstance of currentInstances) {
      const previousInstance = previousInstances.find(
        (inst) => inst.id === currentInstance.id
      )
      if (
        previousInstance &&
        previousInstance.status !== currentInstance.status
      ) {
        const isSignificantChange =
          currentInstance.status === 'connecting' ||
          previousInstance.status === 'connecting' ||
          currentInstance.status === 'open' ||
          previousInstance.status === 'open'
        if (isSignificantChange) {
          console.log(
            `Instance ${currentInstance.instanceName} status changed: ${previousInstance.status} → ${currentInstance.status}`
          )
          return true
        }
      }
    }
    return false
  }
  private updateQRCodeIfNeeded(): void {
    if (!this.selectedInstanceForQR) return
    const currentInstance = this.instances.find(
      (inst) => inst.id === this.selectedInstanceForQR?.id
    )
    if (!currentInstance) return
    if (currentInstance.status === InstanceStatus.DISCONNECTED) {
      console.log(
        `Instance ${currentInstance.instanceName} is disconnected, not refreshing QR`
      )
      return
    }
    if (currentInstance.status === InstanceStatus.OPEN) {
      console.log(
        `Instance ${currentInstance.instanceName} is already connected, closing QR modal`
      )
      this.closeQRModal()
      return
    }
    if (
      currentInstance.status === InstanceStatus.CLOSE ||
      currentInstance.status === InstanceStatus.CONNECTING
    ) {
      console.log(
        `Refreshing QR code for instance: ${currentInstance.instanceName} (status: ${currentInstance.status})`
      )
      this.whatsappService
        .getQRCode(currentInstance.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success && response.data.qrCode) {
              if (this.selectedQRCode !== response.data.qrCode) {
                console.log('QR code updated from backend')
                this.selectedQRCode = response.data.qrCode
              }
            } else {
              console.warn('QR code not available, might have expired')
              this.toastr.warning(
                'El código QR ha expirado. Por favor, genere uno nuevo.',
                'QR Expirado'
              )
              setTimeout(() => {
                this.closeQRModal()
              }, 2000)
            }
          },
          error: (error) => {
            console.error('Error refreshing QR code:', error)
            this.toastr.error(
              'Error al obtener el código QR. El modal se cerrará automáticamente.',
              'Error QR'
            )
            setTimeout(() => {
              this.closeQRModal()
            }, 3000)
          },
        })
    }
  }
  private checkForQRConnectionSuccess(
    previousInstances: WhatsAppInstance[],
    currentInstances: WhatsAppInstance[]
  ): void {
    if (!this.selectedInstanceForQR) {
      console.log(
        ' No selectedInstanceForQR, exiting checkForQRConnectionSuccess'
      )
      return
    }
    const previousInstance = previousInstances.find(
      (inst) => inst.id === this.selectedInstanceForQR?.id
    )
    const currentInstance = currentInstances.find(
      (inst) => inst.id === this.selectedInstanceForQR?.id
    )
    console.log('🔍 QR Connection Check:', {
      selectedInstance: this.selectedInstanceForQR.instanceName,
      previousStatus: previousInstance?.status,
      currentStatus: currentInstance?.status,
      foundPrevious: !!previousInstance,
      foundCurrent: !!currentInstance,
    })
    if (!previousInstance || !currentInstance) {
      console.log(
        'Missing instance data, exiting checkForQRConnectionSuccess'
      )
      return
    }
    if (
      previousInstance.status !== InstanceStatus.OPEN &&
      currentInstance.status === InstanceStatus.OPEN
    ) {
      console.log(
        `✅ Instance ${currentInstance.instanceName} connected successfully via QR`
      )
      this.toastr.success(
        `Instancia ${currentInstance.instanceName} conectada exitosamente`,
        'Conexión Exitosa',
        { timeOut: 3000 }
      )
      setTimeout(() => {
        this.closeQRModal()
      }, 3000)
      this.stopStatusPolling()
      return
    }
    if (
      (previousInstance.status === InstanceStatus.CONNECTING ||
        previousInstance.status === InstanceStatus.CLOSE) &&
      currentInstance.status === InstanceStatus.DISCONNECTED
    ) {
      console.log(
        `⚠️ Instance ${currentInstance.instanceName} failed to connect or QR expired (${previousInstance.status} → ${currentInstance.status})`
      )
      this.toastr.warning(
        `La conexión falló o el código QR expiró. Intente generar un nuevo código.`,
        'Conexión Fallida',
        { timeOut: 5000 }
      )
      setTimeout(() => {
        this.closeQRModal()
      }, 2000)
      return
    }
    if (
      currentInstance.status === InstanceStatus.DISCONNECTED &&
      this.selectedQRCode
    ) {
      console.log(
        `🚨 FORCE CLOSE: Instance ${currentInstance.instanceName} is disconnected with QR modal open`
      )
      this.toastr.warning(
        `La instancia se desconectó. Cerrando el código QR.`,
        'Instancia Desconectada',
        { timeOut: 3000 }
      )
      setTimeout(() => {
        this.closeQRModal()
      }, 1500)
      return
    }
    if (
      previousInstance.status === InstanceStatus.CONNECTING &&
      currentInstance.status !== InstanceStatus.CONNECTING &&
      currentInstance.status !== InstanceStatus.OPEN
    ) {
      console.log(
        `ℹ️ Instance ${currentInstance.instanceName} status changed to ${currentInstance.status}, closing QR modal`
      )
      this.toastr.info(
        `El estado de la instancia cambió. El código QR ya no es necesario.`,
        'Estado Actualizado'
      )
      setTimeout(() => {
        this.closeQRModal()
      }, 2000)
    } else {
      console.log('⏸️ No action needed for status change:', {
        previous: previousInstance.status,
        current: currentInstance.status,
      })
    }
  }
  public toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm
    if (!this.showCreateForm) {
      this.createInstanceForm.reset()
    }
  }
  public onCreateInstance(): void {
    if (this.createInstanceForm.invalid) {
      this.createInstanceForm.markAllAsTouched()
      return
    }
    this.isCreating = true
    const formData = this.createInstanceForm.value
    this.whatsappService
      .createInstance(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.toastr.success('Instancia creada exitosamente', 'Éxito')
          this.loadInstances()
          this.toggleCreateForm()
          this.isCreating = false
        },
        error: (error) => {
          console.error('Error creating instance:', error)
          this.toastr.error('Error al crear la instancia', 'Error')
          this.isCreating = false
        },
      })
  }
  public showQRCode(instance: WhatsAppInstance): void {
    if (!instance.id || typeof instance.id !== 'number') {
      this.toastr.error('ID de instancia inválido', 'Error')
      console.error(
        'Invalid instance ID:',
        instance.id,
        'Full instance:',
        instance
      )
      return
    }
    this.qrCodeLoading = true
    this.selectedQRCode = null
    this.selectedInstanceForQR = instance
    this.whatsappService
      .getQRCode(instance.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data.qrCode) {
            this.selectedQRCode = response.data.qrCode
            this.startStatusPolling()
          } else {
            this.toastr.warning(
              'No se pudo obtener el código QR',
              'Advertencia'
            )
            this.selectedInstanceForQR = null
          }
          this.qrCodeLoading = false
        },
        error: (error) => {
          console.error('Error getting QR code:', error)
          this.toastr.error('Error al obtener el código QR', 'Error')
          this.qrCodeLoading = false
          this.selectedInstanceForQR = null
        },
      })
  }
  public setPrimaryInstance(instance: WhatsAppInstance): void {
    if (!instance) {
      this.toastr.error('Instancia no válida', 'Error')
      console.error('Invalid instance object:', instance)
      return
    }
    if (instance.isPrimary) {
      this.toastr.info('Esta instancia ya es la principal', 'Información')
      return
    }
    if (!instance.id || typeof instance.id !== 'number' || instance.id <= 0) {
      this.toastr.error('ID de instancia inválido', 'Error')
      console.error(
        'Invalid instance ID:',
        instance.id,
        'Full instance:',
        instance
      )
      return
    }
    if (instance.status !== InstanceStatus.OPEN) {
      this.toastr.warning(
        `No se puede establecer como principal. La instancia debe estar conectada. Estado actual: ${this.getStatusText(instance.status)}`,
        'Instancia No Conectada'
      )
      return
    }
    const currentPrimary = this.instances.find((inst) => inst.isPrimary)
    const confirmMessage = currentPrimary
      ? `¿Estás seguro de cambiar la instancia principal de "${currentPrimary.instanceName}" a "${instance.instanceName}"?\n\nEsto quitará automáticamente el estado primario de la instancia actual.`
      : `¿Estás seguro de establecer "${instance.instanceName}" como instancia principal?`
    if (confirm(confirmMessage)) {
      this.whatsappService
        .setPrimaryInstance(instance.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.toastr.success(
              `"${instance.instanceName}" establecida como instancia principal`,
              'Éxito'
            )
            this.loadInstances()
          },
          error: (error) => {
            console.error('Error setting primary instance:', error)
            let errorMessage = 'Error al establecer instancia principal'
            if (error.error?.message) {
              errorMessage = error.error.message
            } else if (error.message) {
              errorMessage = error.message
            }
            this.toastr.error(errorMessage, 'Error')
          },
        })
    }
  }
  public deleteInstance(instance: WhatsAppInstance): void {
    if (!instance.id || typeof instance.id !== 'number') {
      this.toastr.error('ID de instancia inválido', 'Error')
      console.error(
        'Invalid instance ID:',
        instance.id,
        'Full instance:',
        instance
      )
      return
    }
    let confirmMessage = `¿Estás seguro de eliminar la instancia "${instance.instanceName}"?`
    if (instance.isPrimary) {
      confirmMessage += `\n\n⚠️ ATENCIÓN: Esta es tu instancia PRINCIPAL de WhatsApp.\nSi la eliminas, no podrás enviar mensajes hasta que configures otra instancia como principal.\n\n¿Estás COMPLETAMENTE SEGURO de continuar?`
    }
    if (confirm(confirmMessage)) {
      this.whatsappService
        .deleteInstance(instance.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            if (instance.isPrimary) {
              this.toastr.warning(
                'Instancia principal eliminada. Configura otra instancia como principal para enviar mensajes.',
                'Instancia Eliminada'
              )
            } else {
              this.toastr.success('Instancia eliminada exitosamente', 'Éxito')
            }
            this.loadInstances()
          },
          error: (error: any) => {
            console.error('Error deleting instance:', error)
            this.toastr.error('Error al eliminar la instancia', 'Error')
          },
        })
    }
  }
  public getStatusClass(status: InstanceStatus): string {
    switch (status) {
      case InstanceStatus.OPEN:
        return 'badge bg-success'
      case InstanceStatus.CONNECTING:
        return 'badge bg-warning text-dark'
      case InstanceStatus.CONNECTED:
        return 'badge bg-info'
      case InstanceStatus.CLOSE:
        return 'badge bg-danger'
      case InstanceStatus.DISCONNECTED:
      default:
        return 'badge bg-secondary'
    }
  }
  public getStatusText(status: InstanceStatus): string {
    switch (status) {
      case InstanceStatus.OPEN:
        return 'Conectado'
      case InstanceStatus.CONNECTING:
        return 'Conectando'
      case InstanceStatus.CONNECTED:
        return 'Conectado'
      case InstanceStatus.CLOSE:
        return 'Desconectado'
      case InstanceStatus.DISCONNECTED:
      default:
        return 'Desconectado'
    }
  }
  public canShowQR(instance: WhatsAppInstance): boolean {
    return (
      instance.status === InstanceStatus.CONNECTING ||
      instance.status === InstanceStatus.DISCONNECTED
    )
  }
  public isFieldInvalid(fieldName: string): boolean {
    const field = this.createInstanceForm.get(fieldName)
    return !!(field && field.invalid && (field.dirty || field.touched))
  }
  public getFieldError(fieldName: string): string {
    const field = this.createInstanceForm.get(fieldName)
    if (field?.errors) {
      if (field.errors['required']) return 'Este campo es requerido'
      if (field.errors['minlength'])
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`
      if (field.errors['pattern']) {
        if (fieldName === 'instanceName')
          return 'Solo letras, números, guiones y guiones bajos'
        if (fieldName === 'phoneNumber') return 'Formato de teléfono inválido'
      }
    }
    return ''
  }
  public closeQRModal(): void {
    this.selectedQRCode = null
    this.selectedInstanceForQR = null
    this.startStatusPolling()
  }
  public refreshInstances(): void {
    this.loadInstances()
  }
  public syncInstanceStatuses(): void {
    if (this.isLoading) {
      return 
    }
    this.isLoading = true
    console.log('Starting instance status synchronization...')
    this.whatsappService
      .refreshInstanceStatuses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Sync response received:', response)
          if (response.success) {
            const result = response.data
            if (result.updated > 0) {
              this.toastr.success(
                `${result.updated} instancia(s) actualizada(s)`,
                'Estados Sincronizados'
              )
              console.log(`${result.updated} instances updated successfully`)
            } else {
              this.toastr.info(
                'Todos los estados están actualizados',
                'Sincronización Completa'
              )
              console.log('All instances are up to date')
            }
            if (result.errors && result.errors.length > 0) {
              this.toastr.warning(
                `${result.errors.length} instancia(s) con errores`,
                'Advertencia'
              )
              console.warn('Sync errors:', result.errors)
            }
            this.loadInstances()
            if (this.selectedInstanceForQR) {
              console.log('Checking QR instance status after sync...')
            }
          } else {
            console.error('Sync failed:', response.message)
            this.toastr.error(
              response.message || 'Error en la sincronización',
              'Error'
            )
          }
          this.isLoading = false
        },
        error: (error) => {
          console.error('Error syncing instance statuses:', error)
          this.toastr.error(
            'Error al sincronizar estados de instancias',
            'Error de Conexión'
          )
          this.isLoading = false
        },
      })
  }
  public trackByInstanceId(index: number, instance: WhatsAppInstance): number {
    return instance.id
  }
  public hasPrimaryInstance(): boolean {
    return this.instances.some((instance) => instance.isPrimary)
  }
  public getPrimaryInstanceName(): string {
    const primary = this.instances.find((instance) => instance.isPrimary)
    return primary ? primary.instanceName : ''
  }
}
