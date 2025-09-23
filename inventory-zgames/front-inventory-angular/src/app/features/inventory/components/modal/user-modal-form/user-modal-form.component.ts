import { Component, inject, OnDestroy, OnInit } from '@angular/core'
import { FormBuilder, FormGroup } from '@angular/forms'
import { TranslatePipe } from '@ngx-translate/core'
@Component({
  selector: 'user-modal-form',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './user-modal-form.component.html',
})
export class UserModalFormComponent implements OnInit, OnDestroy {
  private _formBuilder = inject(FormBuilder)
  public userModalForm: FormGroup | undefined = undefined
  public titleModal: string = ''
  ngOnInit(): void {
    this.userModalForm = this.getConfigUserModalForm()
  }
  private getConfigUserModalForm(): FormGroup {
    return this._formBuilder.group({})
  }
  onSubmit(): void {}
  closeModal(): void {}
  ngOnDestroy(): void {}
}
