import { OfflineService } from 'src/app/services/offline.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobalService } from './global.service';
@Injectable({
  providedIn: 'root'
})
export class ModelosService {

  urlAPI;

  constructor(
    private http: HttpClient,
    private globalService: GlobalService,
    private offlineService: OfflineService,
  ) {
    this.urlAPI = this.globalService.getUrlApi() + '/modelos';
  }

  listar(tipo?): Observable<any> {
    let param = ''
    if(!!tipo){
      param = `?equipostipo_id=${tipo}`
    }
    return this.http.get<any>(this.urlAPI + `/listar${param}`);
  }
  listarId(id): Observable<any> {
    return this.http.get<any>(this.urlAPI + `/listar?id=${id}`);
  }

  guardar(data): Observable<any> {
    return this.http.post<any>(this.urlAPI + '/guardar', JSON.stringify(data));
  }

  async listarLocal() {
    let aux = await this.offlineService.leerDatos('modelos.json');
    return aux;
  }
}
