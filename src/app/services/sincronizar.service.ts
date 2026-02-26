
import { GlobalService } from 'src/app/services/global.service';
import { VehiculosService } from './vehiculos.service';
import { Injectable } from '@angular/core';
import { OfflineService } from './offline.service';
import { UsuariosService } from './usuarios.service';
import { ClientesService } from './clientes.service';
import { MarcasService } from './marcas.service';
import { LineasService } from './lineas.service';
import { ModelosService } from './modelos.service';

@Injectable({
  providedIn: 'root'
})
export class SincronizarService {

  urlMultimedia;

  constructor(
    private vehiculosService: VehiculosService,
    private globalService: GlobalService,
    private offlineService: OfflineService,
    private clienterService: ClientesService,
    private marcasService: MarcasService,
    private lineasService: LineasService,
    private modelosService: ModelosService,
    private usuariosService: UsuariosService

  ) {
    this.urlMultimedia = this.globalService.getUrlApi() + '/multimedias/guardar';
  }

  sincronizarBasico() {
    this.vehiculosService.listar().subscribe(data => {
      this.offlineService.escribirDatos('vehiculos.json', data.vehiculos)
    });
    this.clienterService.listarClientesComprimido().subscribe(data => {
      this.offlineService.escribirDatos('clientes.json', data.usuarios)
    });
    this.marcasService.listar().subscribe(data => {
      this.offlineService.escribirDatos('marcas.json', data.marcas)
    });
    this.lineasService.listar().subscribe(data => {
      this.offlineService.escribirDatos('lineas.json', data.lineas)
    });
    this.modelosService.listar().subscribe(data => {
      this.offlineService.escribirDatos('modelos.json', data.modelos)
    });
    this.clienterService.listarTecnicos().subscribe(data => {
      this.offlineService.escribirDatos('tecnicos.json', data.usuarios)
    });
    this.usuariosService.listarEmpleados().subscribe(data => {
      this.offlineService.escribirDatos('empleados.json', data.usuarios)
    });
  }
}
