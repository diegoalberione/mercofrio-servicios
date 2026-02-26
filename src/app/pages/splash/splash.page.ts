import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { SincronizarService } from 'src/app/services/sincronizar.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { GlobalService } from 'src/app/services/global.service';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
})
export class SplashPage implements OnInit {

  constructor(
    private usuariosService: UsuariosService,
    private sincronizarService: SincronizarService,
    private router: Router,
    private globalService: GlobalService,
  ){
  }

  ngOnInit() {
    this.sync();
  }


  sync(){
    this.globalService.showLoading();
    this.sincronizarService.sincronizarBasico();
    this.usuariosService.getUsuarioLogueado().subscribe( usuario => {
      if(!!usuario.id){
        this.router.navigate(['/home'])
      }else{
        this.router.navigate(['/login'])
      }
      
    });
  }

}
