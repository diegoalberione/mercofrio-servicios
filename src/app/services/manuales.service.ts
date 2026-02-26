import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GlobalService } from './global.service';
import { OfflineService } from './offline.service';

@Injectable({
  providedIn: 'root'
})
export class ManualesService {

  urlAPI;

  constructor(
    private http: HttpClient,
    private globalService: GlobalService,
    private offlineService: OfflineService,
    private httpClient: HttpClient
  ) {
    this.urlAPI = this.globalService.getUrlApi() + '/multimedias';
  }

  listar(): Observable<any> {
    return this.http.get<any>(this.urlAPI + '/listar?tipo=20');
  }

  listarId(id): Observable<any> {
    return this.http.get<any>(this.urlAPI + `/listar?id=${id}`);
  }

  async guardar(pdf, form){
    let formData = new FormData();

    console.log(form);

    const base64Response = await fetch(`data:application/pdf;base64,${pdf}`);
    const blob = await base64Response.blob();

    formData.append('nombre', form.nombre);
    formData.append('descripcion', form.descripcion);
    formData.append('tipo', '20');
    formData.append('file', blob,`${form.nombre}.pdf`)


    return this.httpClient.post<any>(this.urlAPI+ '/guardar', formData);
  }

  async actualizar(form, pdf = null){
    let formData = new FormData();

    console.log('Actualizando manual:', form);

    formData.append('id', form.id);
    formData.append('nombre', form.nombre);
    formData.append('descripcion', form.descripcion);
    formData.append('tipo', '20');

    // Si se proporciona un nuevo PDF, procesarlo
    if (pdf) {
      const base64Response = await fetch(`data:application/pdf;base64,${pdf}`);
      const blob = await base64Response.blob();
      formData.append('file', blob, `${form.nombre}.pdf`);
    }

    return this.httpClient.post<any>(this.urlAPI + '/guardar', formData);
  }

  dataURLtoFile(dataurl, filename) {

    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);

    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, {type:mime});
}

}
