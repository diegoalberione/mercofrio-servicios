import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { GlobalService } from './global.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class VisitasService {
  urlAPI;

  constructor(private http: HttpClient, private globalService: GlobalService) {
    this.urlAPI = this.globalService.getUrlApi() + '/visitas';
  }

  listarVisitasFiltro(data?): Observable<any> {
    let params = new HttpParams();

    if (data) {
      Object.keys(data).forEach(key => {
        params = params.set(key, data[key]);
      });
    }

    return this.http.get<any>(this.urlAPI + `/listar`, { params });
  }

  listarVisitas(cliente?): Observable<any> {
    let params = '';
    if (cliente) {
      params += `cliente_usuario_id=${cliente}`;
    }
    return this.http.get<any>(this.urlAPI + `/listar?${params}`);
  }

  listarVisitaId(id): Observable<any> {
    let params = `id=${id}&&banCompleto=1`;
    return this.http.get<any>(this.urlAPI + `/listar?${params}`);
  }

  listarVisitasCompletas(cliente?): Observable<any> {
    let params = '';
    if (cliente) {
      params += `cliente_usuario_id=${cliente}&banCompleto=1`;
    }
    return this.http.get<any>(this.urlAPI + `/listar?${params}`);
  }

  enviarVisita(visita): Observable<any> {
    return this.http.post<any>(
      this.urlAPI + '/guardar/',
      JSON.stringify(visita)
    );
  }

  enviarVisitaV2(visita): Observable<any> {
    return this.http.post<any>(
      this.urlAPI + '/guardarV2/',
      JSON.stringify(visita)
    );
  }

  notificarVisita(visita): Observable<any> {
    return this.http.get<any>(this.urlAPI + '/notificar/' + visita.id, {});
  }

  eliminarVisita(id): Observable<any> {
    return this.http.delete<any>(this.urlAPI + '/eliminar/' + id);
  }
}
