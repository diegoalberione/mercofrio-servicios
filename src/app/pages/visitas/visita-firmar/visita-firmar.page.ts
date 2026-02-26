import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Router, NavigationExtras } from '@angular/router';
import { SignaturePad } from 'angular2-signaturepad';

@Component({
  selector: 'app-visita-firmar',
  templateUrl: './visita-firmar.page.html',
  styleUrls: ['./visita-firmar.page.scss'],
})
export class VisitaFirmarPage implements OnInit {
  visita;
  banFirmado = false;

  @ViewChild(SignaturePad) signaturePad: SignaturePad;
  signatureImg: string;
  signaturePadOptions: Object = {
    minWidth: 5,
    canvasWidth: 500,
    canvasHeight: 300,
  };

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    //console.log(this.visita);
  }

  cerrar() {
    this.modalController.dismiss();
  }

  ngAfterViewInit() {
    // this.signaturePad is now available
    this.signaturePad.set('minWidth', 5); // set szimek/signature_pad options at runtime
    this.signaturePad.clear(); // invoke functions from szimek/signature_pad API
  }

  drawComplete() {
    // will be notified of szimek/signature_pad's onEnd event
    //console.log(this.signaturePad.toDataURL());
    this.banFirmado = true;
  }

  drawStart() {
    // will be notified of szimek/signature_pad's onBegin event
    //console.log('begin drawing');
  }

  clearPad() {
    this.banFirmado = false;
    this.signaturePad.clear();
  }

  async confirmar() {
    const correosValidos = await this.validarCorreosNotificacion();
    if (!correosValidos) {
      return;
    }

    this.signatureImg = this.signaturePad.toDataURL();

    this.modalController.dismiss({
      banFirmado: this.banFirmado,
      firma_multimedia: this.signaturePad.toDataURL(),
      firma_aclaracion: this.visita.firma_aclaracion,
    });
  }

  private async validarCorreosNotificacion(): Promise<boolean> {
    const rawEmails = this.visita?.firma_emails_notificar;

    // El correo es obligatorio
    if (!rawEmails || rawEmails.trim() === '') {
      await this.mostrarAlertaCorreos(
        'Debe ingresar al menos un correo electrónico para notificación. Este campo es obligatorio.'
      );
      return false;
    }

    const cadenaLimpia = rawEmails.trim();

    if (/\r|\n/.test(cadenaLimpia)) {
      await this.mostrarAlertaCorreos(
        'No se permiten saltos de línea. Ingrese todos los correos en una sola línea separados por coma.'
      );
      return false;
    }
    const caracteresValidos = /^[A-Za-z0-9@._,+\- ]+$/;

    if (!caracteresValidos.test(cadenaLimpia)) {
      await this.mostrarAlertaCorreos(
        'Solo se permiten letras, números, @, puntos, guiones y comas para separar los correos.'
      );
      return false;
    }

    const correos = cadenaLimpia
      .split(',')
      .map((correo) => correo.trim())
      .filter((correo) => correo !== '');

    if (correos.length === 0) {
      await this.mostrarAlertaCorreos(
        'Debe ingresar correos válidos separados por coma.'
      );
      return false;
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const correoInvalido = correos.find((correo) => !emailRegex.test(correo));

    if (correoInvalido) {
      await this.mostrarAlertaCorreos(
        `El correo "${correoInvalido}" no tiene un formato válido. Revíselo e intente nuevamente.`
      );
      return false;
    }

    this.visita.firma_emails_notificar = correos.join(', ');
    return true;
  }

  private async mostrarAlertaCorreos(message: string) {
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Correos inválidos',
      message,
      buttons: ['Aceptar'],
    });

    await alert.present();
  }

  verDetalle() {
    // Cerrar el modal primero
    this.modalController.dismiss();
    
    // Navegar a la página de detalle pasando los datos de la visita
    this.router.navigate(['/visitas/visita-detalle'], {
      queryParams: {
        visitaData: JSON.stringify(this.visita),
        volverAFirmar: 'true'
      }
    });
  }

  async editarVisita() {
    // Preparar datos para form-visita
    let datosVisita = {
      visita: this.visita,
      indice: null // No tenemos el índice desde aquí, pero form-visita lo manejará
    };
    
    // Guardar los datos en localStorage con una clave fija para que form-visita los pueda leer
    localStorage.setItem('visita_editar_temp', JSON.stringify(datosVisita));
    console.log('=== Datos guardados en localStorage ===', datosVisita);
    
    // Cerrar el modal primero
    await this.modalController.dismiss();
    
    // Navegar directamente a form-visita
    this.router.navigate(['/form-visita']);
  }
}
