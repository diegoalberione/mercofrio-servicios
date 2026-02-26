import { VehiculosService } from 'src/app/services/vehiculos.service';
import { Component, OnInit } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';
import { Browser } from '@capacitor/browser';
import { ManualesService } from '../../services/manuales.service';


@Component({
  selector: 'app-consulta-tecnica',
  templateUrl: './consulta-tecnica.page.html',
  styleUrls: ['./consulta-tecnica.page.scss'],
})
export class ConsultaTecnicaPage implements OnInit {

  manualDisponibles;
  manualSeleccionado;


  constructor(
    private manualesService: ManualesService,
    private globalService: GlobalService,
  ) { }

  ngOnInit() {
    this.globalService.verificarInternet();
    if(!this.globalService.hayInternet){
      this.globalService.showAlert('No hay internet', 'Se require una conexión de internet estable para poder acceder a los manuales y consultas técnicas');
    }

    this.manualesService.listar().subscribe( res => {
      console.log(res);
      this.manualDisponibles = res.multimedias;
    });
  }

  async abrirDocumento(){
    console.log(this.manualSeleccionado.codigo);
    await Browser.open({ url: `https://www.qapp.com.ar/mercofrio/files/multimedias_v2/${this.manualSeleccionado.codigo}` });
  }

}
