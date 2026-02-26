import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { GlobalService } from './global.service';
import { OfflineService } from './offline.service';


@Injectable({
  providedIn: 'root'
})
export class EquioposService {

  urlAPI;
  constructor(
    private http: HttpClient,
    private globalService: GlobalService,
    private offlineService: OfflineService,
  ) {
    this.urlAPI = this.globalService.getUrlApi();
  }

  listarEquipos(): Observable<any> {
    return this.http.get<any>(this.urlAPI + '/equipostipos/listar');
  }  
  
  listarMedidascategoriasPorEquipotipo(equipostipo_id,nombre): Observable<any> {
    return this.http.get<any>(this.urlAPI + '/medidascategorias/listar?equipostipo_id=' +equipostipo_id+'&nombre='+nombre+'&limit=1000');
  }    
  
  guardarMedidascategoria(data): Observable<any> {
    return this.http.post<any>(this.urlAPI + '/medidascategorias/guardar', JSON.stringify(data));
  }
  
  guardarRetrabajoscategoria(data): Observable<any> {
    return this.http.post<any>(this.urlAPI + '/retrabajostipos/guardar', JSON.stringify(data));
  }
  
  listarMedidasnominalesId(id): Observable<any> {
    return this.http.get<any>(this.urlAPI + '/medidasnominales/listar?medidascategoria_id=' +id+'&limit=1000');
  }  
  
  listarRetrabajos(nombre): Observable<any> {
    return this.http.get<any>(this.urlAPI + '/retrabajostipos/listar?nombre='+nombre);
  }  

  guardarMedidasNomicalesId(data): Observable<any>{
    return this.http.post<any>(this.urlAPI+'/medidasnominales/guardar', JSON.stringify(data));
  }
}
