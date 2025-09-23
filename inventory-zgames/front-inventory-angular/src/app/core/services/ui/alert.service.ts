import { Injectable } from '@angular/core'
import Swal from 'sweetalert2'
@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor() {}
  showInfoAlert(title: string, text: string, confirmButtonText = 'Cerrar') {
    return Swal.fire({
      title,
      text,
      icon: 'info',
      iconColor: '#044a7e',
      confirmButtonText,
      confirmButtonColor: '#044a7e',
    })
  }
  showHtmlAlert(title: string, html: string, confirmButtonText = 'Cerrar') {
    return Swal.fire({
      title,
      html,
      icon: 'info',
      iconColor: '#044a7e',
      confirmButtonText,
      confirmButtonColor: '#044a7e',
    })
  }
  showSuccessAlert(title: string, text: string, confirmButtonText = 'Ok') {
    return Swal.fire({
      title,
      text,
      icon: 'success',
      confirmButtonText,
      confirmButtonColor: '#044a7e',
    })
  }
  showErrorAlert(title: string, text: string, confirmButtonText = 'Cerrar') {
    return Swal.fire({
      title,
      text,
      icon: 'error',
      confirmButtonText,
      confirmButtonColor: '#044a7e',
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
    })
  }
  showConfirmAlert(
    title: string,
    text: string,
    confirmButtonText = 'Aprobar',
    cancelButtonText = 'Rechazar'
  ) {
    return Swal.fire({
      title,
      text,
      icon: 'question',
      iconColor: '#044a7e',
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText,
      confirmButtonColor: '#044a7e',
      cancelButtonColor: '#5A6268',
      reverseButtons: true,
    })
  }
  sentConfirmAlert(
    title: string,
    text: string,
    confirmButtonText = 'Enviar',
    cancelButtonText = 'No enviar'
  ) {
    return Swal.fire({
      title,
      text,
      icon: 'question',
      iconColor: '#044a7e',
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText,
      confirmButtonColor: '#044a7e',
      cancelButtonColor: '#5A6268',
      reverseButtons: true,
    })
  }
  showInputAlert(
    title: string,
    inputLabel: string,
    placeholder = 'Ingrese la razón del rechazo aquí...',
    confirmButtonText = 'Rechazar',
    cancelButtonText = 'Cancelar'
  ) {
    return Swal.fire({
      title,
      input: 'textarea',
      inputLabel,
      inputPlaceholder: placeholder,
      inputAttributes: {
        'aria-label': inputLabel,
      },
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText,
      confirmButtonColor: '#044a7e',
      cancelButtonColor: '#5A6268',
    })
  }
  showTextInputAlert(
    title: string,
    inputLabel: string,
    placeholder = 'Ingrese el texto aquí...',
    confirmButtonText = 'Aceptar',
    cancelButtonText = 'Cancelar'
  ) {
    return Swal.fire({
      title,
      input: 'text',
      inputLabel,
      inputPlaceholder: placeholder,
      inputAttributes: {
        'aria-label': inputLabel,
      },
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText,
      confirmButtonColor: '#044a7e',
      cancelButtonColor: '#5A6268',
    })
  }
}
