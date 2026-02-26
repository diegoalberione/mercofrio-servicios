import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { IonicSelectableComponent } from 'ionic-selectable';
import * as moment from 'moment';
import { AlertasService } from 'src/app/services/alertas.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { GlobalService } from 'src/app/services/global.service';
import { MarcasService } from 'src/app/services/marcas.service';

@Component({
  selector: 'app-alertas-form',
  templateUrl: './alertas-form.page.html',
  styleUrls: ['./alertas-form.page.scss'],
})
export class AlertasFormPage implements OnInit {

  clientesCargados;

  marcasCargadas;
  marcasSeleccionado;

  clientesDisponibles;

  clienteSeleccionado;
  sinResultados;
  formAlerta: boolean;

  alerta = {
    id: '',
    cliente_usuario_id: '',
    planta: '',
    equipostipo_id: '',
    marca_id: '',
    modelo_nombre: '',
    equipo_nro: '',
    fecha: '',
    descripcion: '',
    alarmasestado_id: '1'
  }

  constructor(
    private router: Router,
    public globalService: GlobalService,
    private alertController: AlertController,
    private alertasService: AlertasService,
    private clientesService: ClientesService,
    private marcasService: MarcasService,
  ){ }

  async ngOnInit() {
    await this.cargarSelectables();
  }
  async cargarSelectables(){
    this.clientesCargados = await this.clientesService.listarLocal();
    this.marcasCargadas = await this.marcasService.listarLocal();
  }

  seleccionarMarca(event: {
    component: IonicSelectableComponent;
    item: any;
    isSelected: boolean;
  }) {
    this.alerta.marca_id = event.item.id;
  }

  calcularFecha(ev){
    let hoy = new Date();
    let aux;
    if(ev.detail.value === "1"){
      aux = moment(hoy).add(1, 'months').format();
    }
    if(ev.detail.value === "2"){
      aux = moment(hoy).add(6, 'months').format();
    }
    if(ev.detail.value === "3"){
      aux = moment(hoy).add(1, 'years').format();
    }
    if(ev.detail.value === "4"){
      aux = moment(hoy).add(2, 'years').format();
    }
    if(ev.detail.value === "5"){
      aux = moment(hoy).add(3, 'years').format();
    }
    if(ev.detail.value === "6"){
      aux = moment(hoy).add(5, 'years').format();
    }

    this.alerta.fecha = aux;
  }

  async buscarLocalSelectable(event: { component: IonicSelectableComponent; text: string }) {
    const text = !!event.text ? event.text.trim() : null;
    if (!!text && text !== '') {
      event.component.startSearch();
      event.component.items = await this.globalService.busquedaLocalTratada(this.clientesCargados, ['nombres','apellido'], text);
      event.component.endSearch();
    } else {
      event.component.items = [];
      event.component.endSearch();
    }
  }

  reinicializar(){
    if(!!this.alerta.id) this.alerta.id = ''
    this.alerta.cliente_usuario_id = '';
    this.alerta.planta = '';
    this.alerta.equipostipo_id = '';
    this.alerta.marca_id = '';
    this.alerta.modelo_nombre = '';
    this.alerta.equipo_nro = '';
    this.alerta.fecha = '';
    this.alerta.descripcion = '';
    this.alerta.alarmasestado_id = '';
    this.formAlerta = false;
    this.marcasSeleccionado = '';
    this.clienteSeleccionado = '';
  }

  crearAlerta(){
    if(!!this.alerta.id === false) {
      delete this.alerta.id
    }else{
      console.log("EDITANDO");
    }

    if(
      !!this.clienteSeleccionado
      ){
      this.alerta.cliente_usuario_id = this.clienteSeleccionado.id;
      this.postAlerta()
    } else{
      this.globalService.showAlert('Formulario incompleto', 'Para poder guardar una nueva alerta se requieren obligatoriamente: modelo y cliente')
    }
  }

  async postAlerta(){
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Alerta',
      message: '¿Está seguro que desea crear la alerta?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        }, {
          text: 'Aceptar',
          handler: () => {
            this.globalService.showLoading();
            this.alertasService.postAlerta(this.alerta).subscribe( res => {
              this.globalService.stopLoading();
              this.reinicializar();
              this.globalService.showToast('Alerta creada con exito');
              this.router.navigate(['alertas'])
            })
          }
        }
      ]
    });
    await alert.present();
  }

  estadoAlerta(ev){
    this.alerta.alarmasestado_id = ev.detail.value;
  }

  nombreEstado(alarmasestado_id){
    let aux: string;
    aux = 'Sin estado';
    switch (alarmasestado_id) {

      case 1:
        aux = 'Pendiente'
        break;
      case 2:
        aux = 'Avisado'
        break;
      case 3:
        aux = 'Programado'
        break;
      case 4:
        aux = 'Rechazado'
        break;
      case 5:
        aux = 'Realizado'
        break;

      default:
        break;

    }
    return aux;
  }

}
