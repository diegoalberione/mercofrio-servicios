import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-example',
  templateUrl: 'modal-example.component.html',
})
export class ModalExampleComponent {
  constructor(
    private modalCtrl: ModalController,
    private FormBuilder: FormBuilder,
    private alertCtrl: AlertController
  ) {}

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  async confirm() {
    if(this.clienteForm.value.password == this.clienteForm.value.repassword){
      return this.modalCtrl.dismiss(this.clienteForm.value, 'confirm');
    }else{
      let alert = await this.alertCtrl.create({
        header:'Contraseña Incorrecta',
        message:'Las constraseñas son distintas',
        buttons: ['OK'],
      });
      await alert.present();
    }
    
  }

  clienteForm = this.FormBuilder.group({
    password: ['', [ Validators.required]],
    repassword: ['', [ Validators.required]],
  });

  errorMessages = {
    password: [{ type: 'required', message: 'Se requiere un password' }],
    repassword: [{ type: 'required', message: 'Se requiere un password' }],    
  }

  get password() {
    return this.clienteForm.get("password");
  }
  get repassword() {
    return this.clienteForm.get("repassword");
  }
}