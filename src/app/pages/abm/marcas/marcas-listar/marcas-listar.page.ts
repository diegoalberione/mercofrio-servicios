import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EliminarService } from 'src/app/services/eliminar.service';
import { GlobalService } from 'src/app/services/global.service';
import { MarcasService } from 'src/app/services/marcas.service';
@Component({
  selector: 'app-marcas-listar',
  templateUrl: './marcas-listar.page.html',
  styleUrls: ['./marcas-listar.page.scss'],
})
export class MarcasListarPage implements OnInit {

  constructor(
    private GlobalService: GlobalService,
    private Router: Router,
    public DatePipe: DatePipe,
    private MarcasService: MarcasService,
    private EliminarService: EliminarService
  ) {}

  ngOnInit() {}

  ionViewDidEnter() {
    this.inicializarItems();
  }

  inicializarItems(tipo?) {
      this.GlobalService.showLoading();
      this.getItems('', tipo);
  }

  banCargando = false;
  marcas = [];
  total;
  filtroNombre = '';
  getItems($event?, tipo?) {
    let filters: any = {
      nombre: this.filtroNombre
    };
    // filters.tipo = 0
    // if(!!tipo){
    //   filters.tipo = tipo
    // }

    this.MarcasService.listar(filters).subscribe((res) => {
      this.total = res.marcas.length;
      this.marcas = res.marcas;
      this.GlobalService.stopLoading();
    });
  }

  deleteItem(itemId) {
    this.EliminarService.eliminar('marcas', itemId).subscribe((resp) => {
      this.inicializarItems();
      this.GlobalService.showToast(`Elemento eliminado!`);
    });
  }

  filtrar(ev){
    this.getItems('', ev.detail.value);
  }

  editItem(data) {
    let aux = { ...data };
    this.Router.navigate(['marcas-form/', aux]);
  }
  nuevoItem() {
    this.Router.navigate(['marcas-form']);
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
