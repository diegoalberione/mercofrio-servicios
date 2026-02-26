import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { GlobalService } from 'src/app/services/global.service';

@Component({
  selector: 'app-trabajos',
  templateUrl: './trabajos.page.html',
  styleUrls: ['./trabajos.page.scss'],
})
export class TrabajosPage implements OnInit {
  editarTrabajos;
  
  trabajo = {
    observacion: ""
  }

  trabajos = [];
  editandoIndex = -1;
  trabajoEditando = {
    observacion: ""
  };
  constructor(
    private modalController: ModalController,
    private globalService: GlobalService,
    private alertController: AlertController,
  ) { }

  ngOnInit() {
    if(this.editarTrabajos !== undefined){
      this.trabajos = this.editarTrabajos
    }
  }

  agregarTrabajo(){
    if (this.editandoIndex >= 0) {
      // Si estamos editando, actualizar el trabajo existente
      this.trabajos[this.editandoIndex] = { ...this.trabajo };
      this.globalService.showToast(`¡Trabajo actualizado! `);
      this.editandoIndex = -1;
    } else {
      // Si no estamos editando, agregar nuevo trabajo
      this.trabajos.push(this.trabajo);
      this.globalService.showToast(`¡Trabajo agregado! `);
    }
    
    this.trabajo = {
      observacion: ""
    }
  }

  editarTrabajo(index: number) {
    this.editandoIndex = index;
    this.trabajo = { ...this.trabajos[index] };
  }

  cancelarEdicion() {
    this.editandoIndex = -1;
    this.trabajo = {
      observacion: ""
    };
  }

  async eliminarServicio(i){
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Eliminar servicio',
      message:`
              Está seguro que desea eliminar el trabajo?<br/>`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        }, {
          text: 'Aceptar',
          handler: () => {
            this.trabajos.splice(i, 1);
            // Si eliminamos el trabajo que estábamos editando, cancelar la edición
            if (this.editandoIndex === i) {
              this.cancelarEdicion();
            } else if (this.editandoIndex > i) {
              // Ajustar el índice si eliminamos un trabajo anterior al que estamos editando
              this.editandoIndex--;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  salir(){
    if(!!this.trabajos){
      this.modalController.dismiss(this.trabajos);
    }else{
      this.modalController.dismiss();
    }
  }

  async atras(){
    const alert = await this.alertController.create({
      mode: "ios",
      header: 'Salir',
      message: 'Está seguro que desea salir? No se guardará la información ingresada',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        }, {
          text: 'Aceptar',
          handler: () => {
            this.modalController.dismiss();
          }
        }
      ]
    });
  
    await alert.present();
  }
}
