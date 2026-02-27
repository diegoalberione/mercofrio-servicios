import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicSelectableComponent } from 'ionic-selectable';
import { ClientesService } from 'src/app/services/clientes.service';
import { GlobalService } from 'src/app/services/global.service';
import { VisitasService } from 'src/app/services/visitas.service';
import { ZonasService } from 'src/app/services/zonas.service';

@Component({
  selector: 'app-visitas-listar',
  templateUrl: './visitas-listar.page.html',
  styleUrls: ['./visitas-listar.page.scss'],
})

export class VisitasListarPage implements OnInit {

  clientesSubscription;
  visitas;
  visitasCompletas;
  clientesDisponibles;
  clienteSeleccionado;
  zonasDisponibles;
  zonaSeleccionada;
  sinResultados = false;
  cargando = false;

  constructor(
    private visitasService: VisitasService,
    private clientesService: ClientesService,
    private zonasService: ZonasService,
    private globalService: GlobalService,
    private router: Router,
    
  ) { }

  ngOnInit() {
    this.clientesSubscription = this.clientesService.listarClientesComprimido().subscribe( (data) => {
      this.clientesDisponibles = data.usuarios;
    });
    this.zonasService.listar().subscribe((res) => {
      this.zonasDisponibles = res.zonas || [];
    });
    this.cargarVisitas();
  }

  ionViewDidEnter() {
    this.cargarVisitas();
  }

  cargarVisitas() {
    this.cargando = true;
    const params: any = { banCompleto: 1, limit: 50 };
    if (this.zonaSeleccionada && this.zonaSeleccionada.id) {
      params.zona_id = this.zonaSeleccionada.id;
    }
    this.visitasService.listarVisitasFiltro(params).subscribe( (data) => {
      this.visitasCompletas = data.visitas || [];
      this.visitasCompletas.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      this.visitas = this.visitasCompletas;
      this.sinResultados = this.visitas.length === 0;
      this.cargando = false;
    });
  }

  clienteChange(ev){
    this.clienteSeleccionado = ev.value;
    this.cargando = true;
    this.visitasService.listarVisitasCompletas(this.clienteSeleccionado.id).subscribe( (data) => {
      this.visitasCompletas = data.visitas || [];
      this.visitasCompletas.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      this.aplicarFiltroZona();
      this.sinResultados = this.visitas.length === 0;
      this.cargando = false;
    });
  }

  zonaChange(ev) {
    this.zonaSeleccionada = ev.value;
    if (this.clienteSeleccionado) {
      this.aplicarFiltroZona();
      this.sinResultados = this.visitas.length === 0;
    } else {
      this.cargarVisitas();
    }
  }

  private aplicarFiltroZona() {
    if (!this.visitasCompletas) {
      this.visitas = [];
      return;
    }
    if (this.zonaSeleccionada && this.zonaSeleccionada.id != null) {
      this.visitas = this.visitasCompletas.filter(
        (v) => v.zona_id === this.zonaSeleccionada.id
      );
    } else {
      this.visitas = this.visitasCompletas;
    }
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
