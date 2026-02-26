import { Component, OnInit } from '@angular/core';
import { UsuariosService } from '../../services/usuarios.service';
import { GlobalService } from '../../services/global.service';
import { Router } from '@angular/router';
import { SincronizarService } from 'src/app/services/sincronizar.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  empresa_id = 0;
  logo = 'assets/imgs/logo.png';
  usuario;

  constructor(
    private usuariosService: UsuariosService,
    private globalService: GlobalService,
    private sincronizarService: SincronizarService,
    private router: Router
  ) {}

  ngOnInit() {
    this.usuario = {
      email: '',
      password: '',
    };
  }

  login() {
    this.usuariosService.login(this.usuario).subscribe(
      (res) => {
        if (res.mensaje.tipo == 'error') {
          this.globalService.showToast(res.mensaje.texto);
        } else {
          this.usuariosService.guardarUsuarioLogueado(res.usuario, res.token);
          this.router.navigate(['/home']);
          this.globalService.showLoading();
          this.sincronizarService.sincronizarBasico();
        }
      },
      () => {
        this.globalService.showToast(
          'No se puede conectar al servidor, intentelo nuevamente.'
        );
      }
    );
  }
}
