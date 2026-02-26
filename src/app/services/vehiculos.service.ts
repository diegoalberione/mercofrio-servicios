import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { GlobalService } from './global.service';
import { OfflineService } from './offline.service';

@Injectable({
  providedIn: 'root'
})
export class VehiculosService {

  urlAPI;

  constructor(
    private http: HttpClient,
    private globalService: GlobalService,
    private offlineService: OfflineService,
  ) {
    this.urlAPI = this.globalService.getUrlApi() + '/vehiculos';
  }
  
  listar(): Observable<any> {
    return this.http.get<any>(this.urlAPI + '/listar');
  }

  listarId(id): Observable<any> {
    return this.http.get<any>(this.urlAPI + `/listar?id=${id}`);
  }

  guardar(data): Observable<any> {
    return this.http.post<any>(this.urlAPI + '/guardar', JSON.stringify(data));
  }

  async listarLocal() {
    let aux = await this.offlineService.leerDatos('vehiculos.json');
    return aux;
  }

  importar(file): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(this.urlAPI +'/importar', formData, {  });
  }
}
