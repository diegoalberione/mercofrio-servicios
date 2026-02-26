import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AlertasService } from 'src/app/services/alertas.service';
import { GlobalService } from 'src/app/services/global.service';
import { EliminarService } from '../../services/eliminar.service';

@Component({
  selector: 'app-alertas',
  templateUrl: './alertas.page.html',
  styleUrls: ['./alertas.page.scss'],
})
export class AlertasPage implements OnInit {

  cargando;
  alertas;

  constructor(
    public globalService: GlobalService,
    private alertController: AlertController,
    private alertasService: AlertasService,
    private router: Router,
    private eliminarService: EliminarService,
  ){

  }

  ngOnInit() {
    this.getAlarmas();
  }

  atras(){
    this.router.navigate(['/home'])
  }

  getAlarmas(){
    this.alertasService.getAlertas().subscribe( res => {
      console.log(res);
      this.alertas = res.alarmas
    })
  }

  async deleteAlerta(item){
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Alerta',
      message: '¿Está seguro que desea eliminar la alerta?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        }, {
          text: 'Aceptar',
          handler: () => {
            this.globalService.showLoading();
            this.eliminarService.eliminar('alarmas', item.id).subscribe((resp) => {
              this.globalService.stopLoading();
              this.globalService.showToast(`Elemento eliminado!`);
            });
          }
        }
      ]
    });
    await alert.present();
  }

  editItem(data) {
    this.router.navigate(['alertas-form/', data]);
  }
  nuevoItem() {
    this.router.navigate(['alertas-form']);
  }

  descargarCsv(){
    this.alertasService.descargarCsv({});
  }

}
