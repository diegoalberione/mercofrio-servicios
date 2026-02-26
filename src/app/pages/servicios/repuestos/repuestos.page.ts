import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { GlobalService } from 'src/app/services/global.service';

@Component({
  selector: 'app-repuestos',
  templateUrl: './repuestos.page.html',
  styleUrls: ['./repuestos.page.scss'],
})
export class RepuestosPage implements OnInit {

  editarRepuestos;
  
  repuesto = {
    nombre: "",
    cantidad: "",
    observacion: ""
  }

  repuestos = [];

  constructor(
    private modalController: ModalController,
    private globalService: GlobalService,
    private alertController: AlertController,
  ){

  }

  ngOnInit() {
    if(this.editarRepuestos !== undefined){
      this.repuestos = this.editarRepuestos
    }
  }

  agregarRepuesto(){
      this.repuestos.push(this.repuesto);
      this.globalService.showToast(`¡Repuesto ${this.repuesto.nombre} agregado! ` );
      this.repuesto = {
        nombre: "",
        cantidad: "",
        observacion: ""
      }
  }

  async eliminarServicio(i){
    let auxItem = this.repuestos[i];
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Eliminar servicio',
      message:`
              Está seguro que desea eliminar el repuesto:<br/> 
              <b>${auxItem.nombre}</b> !!!`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        }, {
          text: 'Aceptar',
          handler: () => {
            this.repuestos.splice(i, 1);
          }
        }
      ]
    });

    await alert.present();
  }

  guardar(){

  }

  salir(){
    if(this.repuestos.length !== 0){
      this.modalController.dismiss(this.repuestos);
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
