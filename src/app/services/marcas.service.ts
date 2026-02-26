import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobalService } from './global.service';
import { OfflineService } from './offline.service';

@Injectable({
  providedIn: 'root'
})
export class MarcasService {

  urlAPI;

  constructor(
    private http: HttpClient,
    private globalService: GlobalService,
    private offlineService: OfflineService
  ) {
    this.urlAPI = this.globalService.getUrlApi() + '/marcas';
  }

  listar(filters?): Observable<any> {
    let param = ''
    if(!!filters){
      param = "?1=1";
      if (filters.tipo){
        param += `&equipostipo_id=${filters.tipo}`;
      }
      if (filters.nombre){
        param += `&nombre=${filters.nombre}`;
      }
    }else{
      param = '?limit=1000'
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
    let aux = await this.offlineService.leerDatos('marcas.json');
    return aux;
  }
}
