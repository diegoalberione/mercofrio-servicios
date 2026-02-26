import { Observable } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { GlobalService } from './global.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class EliminarService {

  urlAPI;

  constructor(public http: HttpClient, private globalService: GlobalService, private alertController: AlertController) {
    this.urlAPI = this.globalService.getUrlApi();
  }

  eliminar(endpoint:any, id:number): Observable<any> {
    return this.http.delete<any>(`${this.urlAPI}/${endpoint}/eliminar/${id}`);
  }
}
