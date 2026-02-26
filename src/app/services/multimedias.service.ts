import { GlobalService } from './global.service';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MultimediasService {

  private urlAPI: string;

  constructor(public httpClient: HttpClient, public globalService: GlobalService) {
    this.urlAPI = this.globalService.getUrlApi();
  }

  guardar(params): Observable<any> {
    const formData: FormData = new FormData();
    if (params.uploadfile) {
      formData.append('archivo', params.uploadfile, params.uploadfile.name);
    }
    return this.httpClient.post<any>(this.urlAPI + '/multimedias/guardar', formData, { params });
  }

  eliminar(id): Observable<any> {
    return this.httpClient.delete<any>(this.urlAPI + `/multimedias/eliminar?id=${id}`,);
  }

  /**
   *
   * @param img
   * @param servicioId
   * @param tipo
   * @returns postea multimedia api
   */
  async sincronizarMultimedias(img, servicioId, tipo) {
    let formData = new FormData();

    if (img.webPath) {
      let blob = await fetch(img.webPath, {
        mode: 'no-cors',
      }).then(r => r.blob());
      formData.append('file', blob, `${servicioId}.jpeg`);
    } else if (img.base64) {
      formData.append('img_enc64', img.base64, `${servicioId}.jpeg`);
    }
    formData.append('servicio_id', servicioId);
    formData.append('tipo', tipo);

    return this.httpClient.post<any>(this.urlAPI + '/multimedias/guardar', formData);
  }
}
