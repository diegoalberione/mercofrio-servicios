import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GlobalService } from './global.service';
import { OfflineService } from './offline.service';

@Injectable({
  providedIn: 'root'
})
export class ZonasService {

  urlAPI;

  constructor(
    private http: HttpClient,
    private globalService: GlobalService,
    private offlineService: OfflineService,
  ) {
    this.urlAPI = this.globalService.getUrlApi() + '/zonas';
  }

  listar(): Observable<any> {
    let param = ''
    return this.http.get<any>(this.urlAPI + `/listar${param}`);
  }

  listarId(id): Observable<any> {
    return this.http.get<any>(this.urlAPI + `/listar?id=${id}`);
  }

  guardar(data): Observable<any> {
    return this.http.post<any>(this.urlAPI + '/guardar', JSON.stringify(data));
  }

  async listarLocal() {
    let aux = await this.offlineService.leerDatos('zonas.json');
    return aux;
  }
}
