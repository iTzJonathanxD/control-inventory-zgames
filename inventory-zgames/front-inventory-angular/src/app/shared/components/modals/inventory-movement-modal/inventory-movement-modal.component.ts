import { Component, OnInit, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import {
  MovementType,
  CreateMovementDto,
} from '@core/interfaces/api/movement.interface'
import { Product } from '@core/interfaces/api/product.interface'
import { MovementService } from '@core/services/api/movement.service'
import { ToastrNotificationService } from '@core/services/ui/notification.service'
interface InventoryMovementModalData {
  product: Product
  movementType: MovementType
  mode?: 'quick' | 'detailed'
}
@Component({
  selector: 'app-inventory-movement-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, NgbModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title" id="modal-title">
        <i
          class="fas fa-{{
            movementType === MovementType.ENTRY ? 'plus' : 'minus'
          }}-circle me-2"
        ></i>
        {{ getModalTitle() | translate }}
      </h4>
      <button
        type="button"
        class="btn-close"
        aria-label="Close"
        (click)="activeModal.dismiss()"
      ></button>
    </div>
    <div class="modal-body">
      <!-- Product Info -->
      <div class="row mb-3">
        <div class="col-12">
          <div class="card border-0 bg-light">
            <div class="card-body p-3">
              <div class="d-flex align-items-center">
                <div class="me-3">
                  <img
                    [src]="getProductImageUrl()"
                    [alt]="data.product.productName"
                    class="rounded"
                    style="width: 60px; height: 60px; object-fit: cover;"
                  />
                </div>
                <div class="flex-grow-1">
                  <h6 class="mb-1">{{ data.product.productName }}</h6>
                  <small class="text-muted">{{
                    data.product.codeName || 'Sin código'
                  }}</small>
                  <div class="mt-1">
                    <span class="badge" [ngClass]="getStockBadgeClass()">
                      {{
                        'INVENTORY.MESSAGES.GENERAL.CURRENT_STOCK'
                          | translate: { stock: data.product.stockCurrent }
                      }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Form -->
      <form [formGroup]="movementForm" (ngSubmit)="onSubmit()">
        <div class="row">
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">
                {{ 'INVENTORY.TABLE.QUANTITY' | translate }}
                <span class="text-danger">*</span>
              </label>
              <input
                type="number"
                class="form-control"
                formControlName="quantity"
                [placeholder]="
                  'INVENTORY.MESSAGES.GENERAL.QUANTITY_PROMPT' | translate
                "
                min="1"
                [max]="
                  movementType === MovementType.EXIT
                    ? data.product.stockCurrent
                    : undefined
                "
              />
              <div
                *ngIf="
                  movementForm.get('quantity')?.invalid &&
                  movementForm.get('quantity')?.touched
                "
                class="text-danger small mt-1"
              >
                <div *ngIf="movementForm.get('quantity')?.errors?.['required']">
                  Campo requerido
                </div>
                <div *ngIf="movementForm.get('quantity')?.errors?.['min']">
                  La cantidad debe ser mayor a 0
                </div>
                <div *ngIf="movementForm.get('quantity')?.errors?.['max']">
                  La cantidad no puede superar el stock actual ({{
                    data.product.stockCurrent
                  }})
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6" *ngIf="movementType === MovementType.ENTRY">
            <div class="mb-3">
              <label class="form-label">
                {{ 'INVENTORY.TABLE.UNIT_COST' | translate }}
              </label>
              <input
                type="number"
                class="form-control"
                formControlName="unitCost"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">
            {{ 'INVENTORY.TABLE.REASON' | translate }}
          </label>
          <textarea
            class="form-control"
            formControlName="reason"
            rows="3"
            [placeholder]="
              'INVENTORY.MESSAGES.GENERAL.REASON_PROMPT' | translate
            "
          >
          </textarea>
        </div>
        <div *ngIf="data.mode === 'detailed'" class="mb-3">
          <label class="form-label">
            {{ 'INVENTORY.TABLE.PROVIDER' | translate }}
          </label>
          <input
            type="text"
            class="form-control"
            formControlName="provider"
            placeholder="Ingrese el proveedor (opcional)"
          />
        </div>
        <!-- Summary -->
        <div class="row mt-4">
          <div class="col-12">
            <div class="card border-primary">
              <div class="card-header bg-primary text-white py-2">
                <small class="fw-bold">Resumen del Movimiento</small>
              </div>
              <div class="card-body p-3">
                <div class="row g-2 small">
                  <div class="col-6">
                    <strong>Tipo:</strong>
                    {{ getMovementTypeText() | translate }}
                  </div>
                  <div class="col-6">
                    <strong>Cantidad:</strong>
                    {{ movementForm.get('quantity')?.value || 0 }}
                  </div>
                  <div class="col-6">
                    <strong>Stock Actual:</strong>
                    {{ data.product.stockCurrent }}
                  </div>
                  <div class="col-6">
                    <strong>Nuevo Stock:</strong>
                    <span [ngClass]="getNewStockClass()">
                      {{ calculateNewStock() }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button
        type="button"
        class="btn btn-secondary"
        (click)="activeModal.dismiss()"
      >
        {{ 'COMMON.CANCEL' | translate }}
      </button>
      <button
        type="button"
        class="btn"
        [ngClass]="
          movementType === MovementType.ENTRY ? 'btn-success' : 'btn-warning'
        "
        [disabled]="!movementForm.valid || isLoading"
        (click)="onSubmit()"
      >
        <i *ngIf="isLoading" class="fas fa-spinner fa-spin me-2"></i>
        <i
          *ngIf="!isLoading"
          class="fas fa-{{
            movementType === MovementType.ENTRY ? 'plus' : 'minus'
          }} me-2"
        ></i>
        {{ getSubmitButtonText() | translate }}
      </button>
    </div>
  `,
  styles: [
    `
      .modal-header {
        border-bottom: 2px solid var(--bs-primary);
      }
      .badge.bg-success {
        background-color: #198754 !important;
      }
      .badge.bg-warning {
        background-color: #ffc107 !important;
        color: #000 !important;
      }
      .badge.bg-danger {
        background-color: #dc3545 !important;
      }
      .text-success {
        color: #198754 !important;
      }
      .text-warning {
        color: #ffc107 !important;
      }
      .text-danger {
        color: #dc3545 !important;
      }
    `,
  ],
})
export class InventoryMovementModalComponent implements OnInit {
  public movementForm!: FormGroup
  public isLoading = false
  public data!: InventoryMovementModalData
  public readonly MovementType = MovementType
  public readonly activeModal = inject(NgbActiveModal)
  private readonly fb = inject(FormBuilder)
  private readonly movementService = inject(MovementService)
  private readonly notificationService = inject(ToastrNotificationService)
  private readonly translateService = inject(TranslateService)
  get movementType(): MovementType {
    return this.data.movementType
  }
  ngOnInit(): void {
    this.initializeForm()
  }
  private initializeForm(): void {
    const maxQuantity =
      this.movementType === MovementType.EXIT
        ? this.data.product.stockCurrent
        : 999999
    this.movementForm = this.fb.group({
      quantity: [
        1,
        [
          Validators.required,
          Validators.min(1),
          ...(this.movementType === MovementType.EXIT
            ? [Validators.max(maxQuantity)]
            : []),
        ],
      ],
      reason: [this.getDefaultReason()],
      unitCost: [
        this.movementType === MovementType.ENTRY
          ? this.data.product.unitPrice
          : null,
      ],
      provider: [''],
    })
    if (this.movementType === MovementType.EXIT) {
      this.movementForm.get('quantity')?.valueChanges.subscribe((value) => {
        if (value > this.data.product.stockCurrent) {
          this.movementForm.get('quantity')?.setErrors({ max: true })
        }
      })
    }
  }
  private getDefaultReason(): string {
    const baseReason =
      this.movementType === MovementType.ENTRY
        ? 'Entrada manual desde lista de productos'
        : 'Salida manual desde lista de productos'
    return `${baseReason} - ${this.data.product.productName}`
  }
  public getModalTitle(): string {
    return this.movementType === MovementType.ENTRY
      ? 'INVENTORY.MODAL.CREATE_ENTRY_TITLE'
      : 'INVENTORY.MODAL.CREATE_EXIT_TITLE'
  }
  public getSubmitButtonText(): string {
    return this.movementType === MovementType.ENTRY
      ? 'INVENTORY.BUTTONS.ADD_ENTRY'
      : 'INVENTORY.BUTTONS.ADD_EXIT'
  }
  public getMovementTypeText(): string {
    return this.movementType === MovementType.ENTRY
      ? 'INVENTORY.MOVEMENT_TYPE.ENTRY'
      : 'INVENTORY.MOVEMENT_TYPE.EXIT'
  }
  public getProductImageUrl(): string {
    return this.data.product.image || 'assets/images/default-product.png'
  }
  public getStockBadgeClass(): string {
    const stock = this.data.product.stockCurrent
    if (stock === 0) return 'badge bg-danger'
    if (stock <= 5) return 'badge bg-warning'
    return 'badge bg-success'
  }
  public calculateNewStock(): number {
    const currentStock = this.data.product.stockCurrent
    const quantity = this.movementForm.get('quantity')?.value || 0
    if (this.movementType === MovementType.ENTRY) {
      return currentStock + quantity
    } else {
      return Math.max(0, currentStock - quantity)
    }
  }
  public getNewStockClass(): string {
    const newStock = this.calculateNewStock()
    if (newStock === 0) return 'text-danger fw-bold'
    if (newStock <= 5) return 'text-warning fw-bold'
    return 'text-success fw-bold'
  }
  public onSubmit(): void {
    if (this.movementForm.invalid) {
      this.movementForm.markAllAsTouched()
      return
    }
    const formValue = this.movementForm.value
    if (
      this.movementType === MovementType.EXIT &&
      formValue.quantity > this.data.product.stockCurrent
    ) {
      this.notificationService.showError(
        this.translateService.instant(
          'INVENTORY.MESSAGES.EXIT.QUANTITY_EXCEEDS_STOCK',
          {
            quantity: formValue.quantity,
            stock: this.data.product.stockCurrent,
          }
        ),
        this.translateService.instant(
          'INVENTORY.MESSAGES.EXIT.INVALID_QUANTITY_TITLE'
        )
      )
      return
    }
    const movementData: CreateMovementDto = {
      movementType: this.movementType,
      quantity: formValue.quantity,
      productId: this.data.product.id!,
      reason: formValue.reason || this.getDefaultReason(),
      unitCost: formValue.unitCost || undefined,
      provider: formValue.provider || undefined,
    }
    this.isLoading = true
    this.movementService.createMovement(movementData).subscribe({
      next: (response) => {
        this.isLoading = false
        if (response.success === true) {
          const messageKey =
            this.movementType === MovementType.ENTRY
              ? 'INVENTORY.MESSAGES.ENTRY.SUCCESS_MESSAGE'
              : 'INVENTORY.MESSAGES.EXIT.SUCCESS_MESSAGE'
          const titleKey =
            this.movementType === MovementType.ENTRY
              ? 'INVENTORY.MESSAGES.ENTRY.SUCCESS_TITLE'
              : 'INVENTORY.MESSAGES.EXIT.SUCCESS_TITLE'
          this.notificationService.showSuccess(
            this.translateService.instant(messageKey),
            this.translateService.instant(titleKey)
          )
          this.activeModal.close(true) // Return true to indicate success
        } else {
          this.handleError('Unexpected response status')
        }
      },
      error: (error) => {
        this.isLoading = false
        this.handleError(error)
      },
    })
  }
  private handleError(error: any): void {
    console.error('Error creating movement:', error)
    const messageKey =
      this.movementType === MovementType.ENTRY
        ? 'INVENTORY.MESSAGES.ENTRY.ERROR_MESSAGE'
        : 'INVENTORY.MESSAGES.EXIT.ERROR_MESSAGE'
    const titleKey =
      this.movementType === MovementType.ENTRY
        ? 'INVENTORY.MESSAGES.ENTRY.ERROR_TITLE'
        : 'INVENTORY.MESSAGES.EXIT.ERROR_TITLE'
    const errorMessage =
      error?.error?.message || this.translateService.instant(messageKey)
    this.notificationService.showError(
      errorMessage,
      this.translateService.instant(titleKey)
    )
  }
  public setData(data: InventoryMovementModalData): void {
    this.data = data
  }
}
