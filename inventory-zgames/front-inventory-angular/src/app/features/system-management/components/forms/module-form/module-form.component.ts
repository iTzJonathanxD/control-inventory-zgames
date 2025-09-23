import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, OnDestroy } from '@angular/core'
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms'
import { ModuleService } from '@core/services/api/module.service'
import { RoleService } from '@core/services/api/role.service'
import { BootstrapModalService } from '@core/services/ui/bootstrap-modal.service'
import { ToastrNotificationService } from '@core/services/ui/notification.service'
import { TranslatePipe } from '@ngx-translate/core'
import { Subscription } from 'rxjs'
@Component({
  selector: 'module-form',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, TranslatePipe],
  templateUrl: './module-form.component.html',
  styleUrl: './module-form.component.scss',
})
export class ModuleFormComponent implements OnInit, OnDestroy {
  moduleForm!: UntypedFormGroup
  isEditMode: boolean = false
  moduleId: number | null = null
  private modalData!: Subscription
  public isLoading: boolean = false
  public isLoadingButton: boolean = false
  private formBuilder = inject(UntypedFormBuilder)
  private _bsModalService = inject(BootstrapModalService)
  private _moduleService = inject(ModuleService)
  private _notificationService = inject(ToastrNotificationService)
  ngOnInit(): void {
    this.getConfigForm()
    this.getModuleData()
  }
  getConfigForm() {
    this.moduleForm = this.formBuilder.group({
      moduleName: ['', [Validators.required]],
      description: ['', [Validators.required]],
    })
  }
  getModuleData() {
    this.modalData = this._bsModalService.getDataIssued().subscribe((data) => {
      if (data?.moduleId) {
        this.moduleId = data.moduleId
        this.isEditMode = true
        this.isLoading = true
        this.loadModuleData()
      } else {
        this.isEditMode = false
        this.isLoading = false
      }
    })
  }
  private loadModuleData() {
    if (!this.moduleId) return
    this._moduleService.getModuleById(this.moduleId).subscribe({
      next: (res) => {
        const moduleData = res.data.result
        if (moduleData) {
          this.moduleForm.patchValue({
            moduleName: moduleData.moduleName,
            description: moduleData.description,
          })
        }
        this.isLoading = false
      },
      error: (error) => {
        console.error('Error loading module data:', error)
        this.isLoading = false
        this._notificationService.showNotification({
          type: 'error',
          title: 'Error',
          message: 'Error al cargar los datos del módulo',
        })
      },
    })
  }
  onSubmit() {
    if (!this.moduleForm.valid) {
      Object.keys(this.moduleForm.controls).forEach((key) => {
        this.moduleForm.get(key)?.markAsTouched()
      })
      return
    }
    const formValues = this.moduleForm.value
    if (!formValues.moduleName?.trim() || !formValues.description?.trim()) {
      this._notificationService.showNotification({
        type: 'error',
        title: 'Error',
        message: 'Por favor complete todos los campos requeridos',
      })
      return
    }
    if (this.isEditMode && this.moduleId) {
      this.editModule()
    } else {
      this.createModule()
    }
  }
  private createModule(): void {
    this.isLoadingButton = true
    const moduleData = {
      moduleName: this.moduleForm.get('moduleName')?.value?.trim(),
      description: this.moduleForm.get('description')?.value?.trim(),
    }
    this._moduleService.createModule(moduleData).subscribe({
      next: (res) => {
        const message = res.message
        this._notificationService.showNotification({
          type: 'success',
          title: 'ROLES.MODULE_SIDEBAR.TITLE',
          message,
        })
        this.isLoadingButton = false
        this.afterSubmitForm()
      },
      error: (error) => {
        console.error('Error creating module:', error)
        this.isLoadingButton = false
        this._notificationService.showNotification({
          type: 'error',
          title: 'Error',
          message: 'Error al crear el módulo',
        })
      },
    })
  }
  private editModule(): void {
    this.isLoadingButton = true
    const moduleData = {
      moduleName: this.moduleForm.get('moduleName')?.value?.trim(),
      description: this.moduleForm.get('description')?.value?.trim(),
    }
    this._moduleService.updateModule(this.moduleId!, moduleData).subscribe({
      next: (res) => {
        this._notificationService.showNotification({
          type: 'success',
          title: 'ROLES.MODULE_SIDEBAR.TITLE',
          message: res.message,
        })
        this.isLoadingButton = false
        this.afterSubmitForm()
      },
      error: (error) => {
        console.error('Error updating module:', error)
        this.isLoadingButton = false
        this._notificationService.showNotification({
          type: 'error',
          title: 'Error',
          message: 'Error al actualizar el módulo',
        })
      },
    })
  }
  private afterSubmitForm(): void {
    this.closeModal()
  }
  public closeModal(): void {
    this._bsModalService.closeModal()
  }
  ngOnDestroy(): void {
    if (this.modalData) {
      this.modalData.unsubscribe()
    }
  }
}
