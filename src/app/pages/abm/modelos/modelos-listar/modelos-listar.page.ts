import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EliminarService } from 'src/app/services/eliminar.service';
import { GlobalService } from 'src/app/services/global.service';
import { ModelosService } from 'src/app/services/modelos.service';
@Component({
  selector: 'app-modelos-listar',
  templateUrl: './modelos-listar.page.html',
  styleUrls: ['./modelos-listar.page.scss'],
})
export class ModelosListarPage implements OnInit {
  constructor(
    private GlobalService: GlobalService,
    private Router: Router,
    public DatePipe: DatePipe,
    private ModelosService: ModelosService,
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
  modelos = [];
  total;
  getItems($event?, tipo?) {
    let filtrarPorTipo = 0
    if(!!tipo){
      filtrarPorTipo = tipo
      console.log("filtra por tipo");
    }
      this.ModelosService.listar(filtrarPorTipo).subscribe((res) => {
        this.total = res.modelos.length;
        this.modelos = res.modelos;
        this.GlobalService.stopLoading();
      });
  }

  deleteItem(itemId) {
    this.EliminarService.eliminar('modelos', itemId).subscribe((resp) => {
      this.inicializarItems();
      this.GlobalService.showToast(`Elemento eliminado!`);
    });
  }

  filtrarPorTipo(ev){
    this.getItems('', ev.detail.value);
  }

  editItem(data) {
    let aux = { ...data };
    this.Router.navigate(['modelos-form/', aux]);
  }
  nuevoItem() {
    this.Router.navigate(['modelos-form']);
  }

  armarColumnas(pItem) {
    // Nombre
    let cols = [];
    cols.push({ text: pItem.nombre });
    cols.push({ text: pItem.equipostipo_id });
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
