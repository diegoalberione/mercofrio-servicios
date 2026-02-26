import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { GlobalService } from './global.service';
import { EliminarService } from './eliminar.service';

@Injectable({
  providedIn: 'root'
})
export class AlertasService {
  urlAPI;

  constructor(
    private http: HttpClient,
    private globalService: GlobalService,
    private eliminarService: EliminarService,
  ) {
    this.urlAPI = this.globalService.getUrlApi() + '/alarmas';
  }

  getAlertas(): Observable<any> {
    return this.http.get<any>(this.urlAPI + '/listar');
  }

  postAlerta(alerta): Observable<any> {
    return this.http.post<any>(this.urlAPI + '/guardar', JSON.stringify(alerta));
  }

  deleteAlerta(id){
    this.eliminarService.eliminar("alarmas", id);
  }

  descargarCsv(data: any) {
    this.http.post(this.urlAPI + '/descargarCsv', data, { responseType: 'blob' }).subscribe(
      (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'alarmas.csv';
        document.body.appendChild(a);
        a.click();
        //window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      (error) => {
        console.error('Error al descargar el CSV', error);
      }
    );
  }

}
