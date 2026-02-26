import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicSelectableComponent } from 'ionic-selectable';
import { ClientesService } from 'src/app/services/clientes.service';
import { GlobalService } from 'src/app/services/global.service';
import { VisitasService } from 'src/app/services/visitas.service';

@Component({
  selector: 'app-visitas-listar',
  templateUrl: './visitas-listar.page.html',
  styleUrls: ['./visitas-listar.page.scss'],
})

export class VisitasListarPage implements OnInit {

  clientesSubscription;
  visitas;
  clientesDisponibles;
  clienteSeleccionado;
  sinResultados = false;
  cargando = false;

  constructor(
    private visitasService: VisitasService,
    private clientesService: ClientesService,
    private globalService: GlobalService,
    private router: Router,
    
  ) { }

  ngOnInit() {
    this.clientesSubscription = this.clientesService.listarClientesComprimido().subscribe( (data) => {
      this.clientesDisponibles = data.usuarios;
    });
    this.cargarVisitas();
  }

  ionViewDidEnter() {
    this.cargarVisitas();
  }

  cargarVisitas() {
    this.cargando = true;
    this.visitasService.listarVisitasFiltro({banCompleto: 1, limit: 50}).subscribe( (data) => {
      this.visitas = data.visitas;
      this.visitas.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      this.sinResultados = data.visitas.length === 0;
      this.cargando = false;
    });
  }

  clienteChange(ev){
    this.clienteSeleccionado = ev.value;
    this.cargando = true;
    this.visitasService.listarVisitasCompletas(this.clienteSeleccionado.id).subscribe( (data) => {
      this.visitas = data.visitas;
      if(data.visitas.length === 0){
        this.sinResultados = true;
      }else{
        this.sinResultados = false;
      }
      this.cargando = false;
    });
  }

  goVisita(visitaId?){
    this.router.navigate(['/visita-info', JSON.stringify(visitaId)]);
  }

  searchUsers(event: { component: IonicSelectableComponent; text: string }) {
    if (!!this.clientesSubscription) {
      this.clientesSubscription.unsubscribe();
    }
    const text = !!event.text ? event.text.trim() : null;
    if (!!text && text !== '') {
      event.component.startSearch();
      this.clientesSubscription = this.clientesService
        .buscarClientes(text)
        .subscribe((resp: any) => {
          event.component.items = resp.usuarios;
          event.component.endSearch();
        });
    } else {
      event.component.items = [];
      event.component.endSearch();
    }
  }

  
  tipoServicio(id) {
    let aux;
    switch (id) {
      case 1:
        aux = 'Reparación de tornillo';
        break;
      case 2:
        aux = 'Reparación de alternativo';
        break;
      case 3:
        aux = 'Reparación de bomba de Aceite';
        break;
      case 4:
        aux = 'Reparación de bomba de NH3';
        break;
      case 5:
        aux = 'Instalación / Montaje';
        break;
      case 6:
        aux = 'Escamadora / Rolitera';
        break;
      case 7:
        aux = 'Intercambiador a placas';
        break;
      case 8:
        aux = 'Automatismo'
        break;
      case 9:
        aux = 'Otro';
        break;
    }
    return aux;
  }

  getNombreEstado(estado_id: number): string {
    switch (estado_id) {
      case 0:
        return 'En proceso';
      case 1:
        return 'Finalizada';
      case 2:
        return 'Notificada';
      default:
        return '';
    }
  }
}
