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
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { WhatsAppService } from '../../../../core/services/api/whatsapp.service'
import { WhatsAppConfig } from '../../../../core/interfaces/api/whatsapp.interface'
@Component({
  selector: 'app-whatsapp-config',
  templateUrl: './whatsapp-config.component.html',
  styleUrls: ['./whatsapp-config.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslateModule],
})
export class WhatsAppConfigComponent implements OnInit, OnDestroy {
  public configForm!: FormGroup
  public isLoading = false
  public isSaving = false
  public hasExistingConfig = false
  public currentConfig?: WhatsAppConfig
  private destroy$ = new Subject<void>()
  private readonly fb = inject(FormBuilder)
  private readonly whatsappService = inject(WhatsAppService)
  private readonly toastr = inject(ToastrService)
  ngOnInit(): void {
    this.initForm()
    this.loadConfig()
  }
  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
  private initForm(): void {
    this.configForm = this.fb.group({
      debtMessageTemplate: [
        'Hola {firstName} {lastName},\n\nTe recordamos que tienes una deuda pendiente de {debtAmount}.\n\nPor favor, ponte en contacto con nosotros para regularizar tu situación.\n\nGracias.',
        [Validators.required, Validators.minLength(20)],
      ],
      sendDebtReminders: [true],
      debtReminderDays: [
        7,
        [Validators.required, Validators.min(1), Validators.max(30)],
      ],
    })
  }
  private loadConfig(): void {
    this.isLoading = true
    this.whatsappService
      .getConfig()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.currentConfig = response.data
            this.hasExistingConfig = true
            this.configForm.patchValue(response.data)
          }
          this.isLoading = false
        },
        error: (error) => {
          console.log('No existing config found or error:', error)
          this.isLoading = false
        },
      })
  }
  public onSubmit(): void {
    if (this.configForm.invalid) {
      this.configForm.markAllAsTouched()
      return
    }
    this.isSaving = true
    const formData = this.configForm.value
    const operation = this.hasExistingConfig
      ? this.whatsappService.updateConfig(formData)
      : this.whatsappService.createConfig(formData)
    operation.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.toastr.success(
          this.hasExistingConfig
            ? 'Configuración actualizada exitosamente'
            : 'Configuración creada exitosamente',
          'Éxito'
        )
        this.hasExistingConfig = true
        this.currentConfig = response.data
        this.isSaving = false
      },
      error: (error) => {
        console.error('Error saving config:', error)
        this.toastr.error('Error al guardar la configuración', 'Error')
        this.isSaving = false
      },
    })
  }
  public resetForm(): void {
    if (this.currentConfig) {
      this.configForm.patchValue(this.currentConfig)
    } else {
      this.configForm.reset()
      this.initForm()
    }
  }
  public isFieldInvalid(fieldName: string): boolean {
    const field = this.configForm.get(fieldName)
    return !!(field && field.invalid && (field.dirty || field.touched))
  }
  public getFieldError(fieldName: string): string {
    const field = this.configForm.get(fieldName)
    if (field?.errors) {
      if (field.errors['required']) return 'Este campo es requerido'
      if (field.errors['pattern']) return 'Formato de URL inválido'
      if (field.errors['minlength'])
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`
      if (field.errors['min']) return `Valor mínimo: ${field.errors['min'].min}`
      if (field.errors['max']) return `Valor máximo: ${field.errors['max'].max}`
    }
    return ''
  }
  public insertVariable(fieldName: string, variable: string): void {
    const field = this.configForm.get(fieldName)
    const textareaElement = document.getElementById(
      fieldName
    ) as HTMLTextAreaElement
    if (field && textareaElement) {
      const currentValue = field.value || ''
      const cursorPosition = textareaElement.selectionStart
      const textBefore = currentValue.substring(0, cursorPosition)
      const textAfter = currentValue.substring(textareaElement.selectionEnd)
      const newValue = textBefore + variable + textAfter
      field.setValue(newValue)
      setTimeout(() => {
        textareaElement.focus()
        textareaElement.setSelectionRange(
          cursorPosition + variable.length,
          cursorPosition + variable.length
        )
      }, 0)
    }
  }
  public get availableVariables(): string[] {
    return [
      '{firstName}',
      '{lastName}',
      '{username}',
      '{debtAmount}',
      '{phone}',
      '{email}',
      '{orderNumber}',
      '{totalAmount}',
    ]
  }
  public getMessagePreview(template: string): string {
    const sampleData = {
      '{firstName}': 'Jonathan',
      '{lastName}': 'Marin',
      '{username}': 'jMarin',
      '{debtAmount}': '$50,000',
      '{phone}': '+57 300 123 4567',
      '{email}': 'jonathan.marin@gmail.com',
      '{orderNumber}': '12345',
      '{totalAmount}': '$75,000',
    }
    let preview = template || ''
    Object.entries(sampleData).forEach(([variable, value]) => {
      preview = preview.replace(
        new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'),
        value
      )
    })
    return preview
  }
  public testMessage(): void {
    const debtTemplate = this.configForm.get('debtMessageTemplate')?.value
    if (!debtTemplate) {
      this.toastr.warning(
        'Por favor, ingresa un mensaje de deuda primero',
        'Advertencia'
      )
      return
    }
    const preview = this.getMessagePreview(debtTemplate)
    const modalContent = `
      <div style="max-width: 400px; white-space: pre-wrap; line-height: 1.5;">
        ${preview}
      </div>
    `
    this.toastr.info(preview, 'Vista Previa del Mensaje', {
      timeOut: 10000,
      enableHtml: true,
      tapToDismiss: true,
    })
  }
  public get predefinedTemplates(): { name: string; template: string }[] {
    return [
      {
        name: 'Formal',
        template:
          'Estimado/a {firstName} {lastName},\n\nEsperamos que se encuentre bien. Le recordamos que tiene una deuda pendiente de {debtAmount}.\n\nAgradeceremos pueda contactarnos para regularizar su situación.\n\nSaludos cordiales.',
      },
      {
        name: 'Amigable',
        template:
          'Hola {firstName}! 👋\n\nTe recordamos que tienes un saldo pendiente de {debtAmount}.\n\n¿Podrías ayudarnos regularizando esta situación? ¡Gracias! 😊',
      },
      {
        name: 'Urgente',
        template:
          '🔴 RECORDATORIO IMPORTANTE\n\nHola {firstName},\n\nTu deuda de {debtAmount} está vencida.\n\nPor favor, contacta con nosotros URGENTEMENTE.\n\nTel: +57 300 123 4567',
      },
      {
        name: 'Sencillo',
        template:
          'Hola {firstName}, tienes una deuda de {debtAmount}. Por favor comunícate con nosotros. Gracias.',
      },
    ]
  }
  public useTemplate(template: string): void {
    this.configForm.get('debtMessageTemplate')?.setValue(template)
    this.toastr.success('Plantilla aplicada correctamente', 'Éxito')
  }
}
