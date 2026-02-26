import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UsuariosService } from './usuarios.service';
import { GlobalService } from './global.service';

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {

    constructor(private usuariosService: UsuariosService,
        private globalService: GlobalService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const authToken = this.usuariosService.getToken();
        const usuario = this.usuariosService.getUsuario();

        const authReq = req.clone({ headers: req.headers.set('Authorization', 'Token ' + authToken) });

        return next.handle(authReq).pipe(
            map(resp => {
                if (resp instanceof HttpResponse) {
                    if (resp.body.token) {
                        if (this.usuariosService.getUsuario()) {
                            this.usuariosService.setToken(resp.body.token);
                        }
                    }
                    return resp;
                }
            })
        );
    }
}