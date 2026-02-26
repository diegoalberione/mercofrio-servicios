import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EliminarService } from '../../../../services/eliminar.service';
import { GlobalService } from '../../../../services/global.service';
import { ManualesService } from '../../../../services/manuales.service';
import { MultimediasService } from '../../../../services/multimedias.service';

@Component({
  selector: 'app-manuales-listar',
  templateUrl: './manuales-listar.page.html',
  styleUrls: ['./manuales-listar.page.scss'],
})
export class ManualesListarPage implements OnInit {
  constructor(
    private globalService: GlobalService,
    private router: Router,
    public datepipe: DatePipe,
    private manualesService: ManualesService,
    private multimediasService: MultimediasService
  ) {}

  ngOnInit() {}

  ionViewDidEnter() {
    this.inicializarItems();
  }

  inicializarItems() {
      this.globalService.showLoading();
      this.getItems();
  }

  banCargando = false;
  multimedias = [];
  total;
  getItems($event?) {
    this.manualesService.listar().subscribe({
      next: (res) => {
        console.log(res);
        this.total = res.multimedias.length;
        if(!!res.multimedias){
          this.multimedias = res.multimedias;
        }
        this.globalService.stopLoading();
        
        // Completar el infinite scroll si existe
        if ($event && $event.target) {
          $event.target.complete();
          
          // Si no hay más datos, deshabilitar el infinite scroll
          if (this.multimedias.length >= this.total) {
            $event.target.disabled = true;
          }
        }
      },
      error: (error) => {
        console.error('Error cargando manuales:', error);
        this.globalService.stopLoading();
        
        // Completar el infinite scroll en caso de error
        if ($event && $event.target) {
          $event.target.complete();
        }
      }
    });
  }

  deleteItem(itemId) {
    this.multimediasService.eliminar(itemId).subscribe((resp) => {
      this.inicializarItems();
      this.globalService.showToast(`Elemento eliminado!`);
    });
  }

  editItem(data) {
    let aux = { ...data };
    this.router.navigate(['abm/manuales-form/', aux]);
  }
  nuevoItem() {
    this.router.navigate(['abm/manuales-form']);
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
