import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { GlobalService } from './global.service';
import { OfflineService } from './offline.service';


@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  urlAPI;
  constructor(
    private http: HttpClient,
    private globalService: GlobalService,
    private offlineService: OfflineService,
  ) {
    this.urlAPI = this.globalService.getUrlApi();
  }

  listarClientes(): Observable<any> {
    return this.http.get<any>(this.urlAPI + '/usuarios/listar?usuariosgrupo_id=3');
  }

  listarTecnicos(): Observable<any> {
    return this.http.get<any>(this.urlAPI + '/usuarios/listar?usuariosgrupo_id=4');
  }

  listarClientesComprimido(): Observable<any> {
    return this.http.get<any>(this.urlAPI + '/usuarios/listar?usuariosgrupo_id=3&banComprimido=1&limit=3000');
  }

  listarClientesID(id): Observable<any> {
    return this.http.get<any>(this.urlAPI + '/usuarios/listar?id=' + id);
  }

  buscarClientes(data: string): Observable<any> {
    return this.http.get<any>(this.urlAPI + '/usuarios/listar?busqueda_general=' + data);
  }

  guardar(data): Observable<any> {
    return this.http.post<any>(this.urlAPI + '/usuarios/guardar', JSON.stringify(data));
  }

  async listarLocal() {
    let aux = await this.offlineService.leerDatos('clientes.json');
    return aux;
  }

  async listarLocalTecnicos() {
    let aux = await this.offlineService.leerDatos('tecnicos.json');
    return aux;
  }

  importar(file): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(this.urlAPI +'/usuarios/importar_clientes', formData, {  });
  }
}
