import { LineasService } from 'src/app/services/lineas.service';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EliminarService } from 'src/app/services/eliminar.service';
import { GlobalService } from 'src/app/services/global.service';

@Component({
  selector: 'app-lineas-listar',
  templateUrl: './lineas-listar.page.html',
  styleUrls: ['./lineas-listar.page.scss'],
})
export class LineasListarPage implements OnInit {
  constructor(
    private GlobalService: GlobalService,
    private Router: Router,
    public DatePipe: DatePipe,
    private LineasService: LineasService,
    private EliminarService: EliminarService
  ) {}

  ngOnInit() {}

  ionViewDidEnter() {
    this.inicializarItems();
  }

  inicializarItems() {
      this.GlobalService.showLoading();
      this.getItems();
  }

  banCargando = false;
  lineas = [];
  total;
  getItems($event?, tipo?) {
    let filtrarPorTipo = 0
    if(!!tipo){
      filtrarPorTipo = tipo
      console.log("filtra por tipo");
    }
      this.LineasService.listar(filtrarPorTipo).subscribe((res) => {
        this.total = res.lineas.length;
        this.lineas = res.lineas;
        this.GlobalService.stopLoading();
      });
  }

  deleteItem(itemId) {
    this.EliminarService.eliminar('lineas', itemId).subscribe((resp) => {
      this.inicializarItems();
      this.GlobalService.showToast(`Elemento eliminado!`);
    });
  }

  filtrarPorTipo(ev){
    this.getItems('', ev.detail.value);
  }

  editItem(data) {
    let aux = { ...data };
    this.Router.navigate(['lineas-form/', aux]);
  }
  nuevoItem() {
    this.Router.navigate(['lineas-form']);
  }

  armarColumnas(pItem) {
    let cols = [];
    cols.push({ text: pItem.nombre });
    cols.push({ text: pItem.descripcion });

    return cols;
  }

  armarBotones(pItem) {
    let btns = [];
    btns.push({
      id: 1,
      icon: 'documents-outline',
      color: 'warning',
    });
    btns.push({
      id: 2,
      icon: 'document-text-outline',
      color: 'tertiary',
    });
    return btns;
  }
}
