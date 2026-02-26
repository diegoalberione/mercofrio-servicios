import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { GlobalService } from './global.service';
import {Md5} from 'ts-md5/dist/md5';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  public token: string;
  private usuarioLogueado = new BehaviorSubject<any>({});
  private urlAPI: string;
  httpHeader = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    @Inject('AUTH_STORE') private authStore: string,
    private http: HttpClient,
    private globalService: GlobalService,
  ) {
    this.urlAPI = this.globalService.getUrlApi();
    // set token if saved in local storage
    var auth: any = JSON.parse(localStorage.getItem(this.authStore));
    this.token = auth && auth.token;

    if (localStorage.getItem(this.authStore)) {
      this.setUsuarioLogueado(this.getUsuario());
    } else {
      this.setUsuarioLogueado({nombres: "..."});
    }
  }

  listar(): Observable<any> {
    return this.http.get<any>(this.urlAPI + '/usuarios/listar');
  }

  listarTecnicos(): Observable<any> {
    return this.http.get<any>(this.urlAPI + '/usuarios/listar?usuariosgrupo_id=4');
  }

  listarEmpleados(pFilter: string = ''): Observable<any> {
    return this.http.get<any>(this.urlAPI + '/usuarios/listar?soloEmpleados=1&limit=1000&busqueda_general='+pFilter);
  }

  listarEmpleadosConEliminados(pFilter: string = ''): Observable<any> {
    return this.http.get<any>(this.urlAPI + '/usuarios/listar?soloEmpleados=1&limit=1000&busqueda_general='+pFilter+'&incluirEliminados=1');
  }

  listarID(id): Observable<any> {
    return this.http.get<any>(this.urlAPI + `/usuarios/listar?id=${id}`);
  }

  login(pParametros): Observable<any> {
    var params = {
      email: pParametros.email,
      password: pParametros.password //Md5.hashStr(pParametros.password)
    }
    return this.http.post<any>(
      this.urlAPI + '/autenticacion/login',
      JSON.stringify(params),
      this.httpHeader
    );
  }

  eliminar(pId) {
    return this.http.delete<any>(
      this.urlAPI + '/usuarios/eliminar/'+pId
    );
  }

  guardarNuevoUsuario(pUsuario) {

    return this.http.post<any>(
      this.urlAPI + '/usuarios/guardar',
      JSON.stringify(pUsuario)
    );
  }

  // guardar(pUsuario) {
  //   if(pUsuario.password){
  //     pUsuario.password = Md5.hashStr(pUsuario.password);
  //   }
  //   return this.http.post<any>(
  //     this.urlAPI + '/usuarios/guardar',
  //     JSON.stringify(pUsuario)
  //   );
  // }

  guardar_ingreso(pUsuario) {
    return this.http.post<any>(
      this.urlAPI + '/usuarios/guardar_ingreso',
      JSON.stringify(pUsuario)
    );
  }

  nuevo(pUsuario) {
    return this.http.post<any>(
      this.urlAPI + '/usuarios/nuevo',
      JSON.stringify(pUsuario)
    );
  }

  logout(): void {
    // clear token remove user from local storage to log user out
    this.token = null;
    this.usuarioLogueado.next({});
    localStorage.removeItem(this.authStore);
  }

  getToken() {
    let auth: any = JSON.parse(localStorage.getItem(this.authStore));
    return auth && auth.token;
  }

  setToken(pToken) {
    let auth: any = JSON.parse(localStorage.getItem(this.authStore));
    let pUsuario = auth && auth.usuario;
    localStorage.setItem(
      this.authStore,
      JSON.stringify({ usuario: pUsuario, token: pToken })
    );
  }

  getUsuario() {
    let auth: any = JSON.parse(localStorage.getItem(this.authStore));
    return auth && auth.usuario;
  }

  getUsuarioLogueado() {
    return this.usuarioLogueado.asObservable();
  }

  setUsuarioLogueado(u) {
    this.usuarioLogueado.next(u);
  }

  guardarUsuarioLogueado(pUsuario, pToken?) {
    if (!pToken) {
      var auth: any = JSON.parse(localStorage.getItem(this.authStore));
      pToken = auth && auth.token;
    }
    localStorage.setItem(
      this.authStore,
      JSON.stringify({ usuario: pUsuario, token: pToken })
    );
    this.setUsuarioLogueado(pUsuario);
  }

  labelAttribute = 'apellido';
  private usuarios:any[] = [];
  getResults(keyword:string):Observable<any[]> {
    let observable:Observable<any>;

    if (this.usuarios.length === 0) {
      observable = this.http.get(this.urlAPI + '/usuarios/listar?tipo=2&pageSize=70');
    } else {
      observable = of(this.usuarios);
    }

    return observable.pipe(
      map(
        (result) => {
          return result.data.filter(
            (item) => {
              return item.apellido.toLowerCase().startsWith(
                  keyword.toLowerCase()
              );
            }
          );
        }
      )
    );
 }


}
