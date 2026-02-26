import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { EliminarService } from 'src/app/services/eliminar.service';
import { GlobalService } from 'src/app/services/global.service';
import { VehiculosService } from 'src/app/services/vehiculos.service';

@Component({
  selector: 'app-vehiculos-listar',
  templateUrl: './vehiculos-listar.page.html',
  styleUrls: ['./vehiculos-listar.page.scss'],
})
export class VehiculosListarPage implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  constructor(
    private globalService: GlobalService,
    private router: Router,
    public datepipe: DatePipe,
    private vehiculosService: VehiculosService,
    private eliminarService: EliminarService
  ) {}

  ngOnInit() {}

  ionViewDidEnter() {
    this.inicializarItems();
  }

  inicializarItems() {
    // if (!this.banCargando) {
      this.globalService.showLoading();
      this.getItems();
    // }
  }

  banCargando = false;
  vehiculos = [];
  total;
  getItems($event?) {
      this.vehiculosService.listar().subscribe((res) => {
        this.total = res.vehiculos.length;
        this.vehiculos = res.vehiculos;
        this.globalService.stopLoading();
      });
  }

  deleteItem(itemId) {
    this.eliminarService.eliminar('vehiculos', itemId).subscribe((resp) => {
      this.inicializarItems();
      this.globalService.showToast(`Elemento eliminado!`);
    });
  }

  editItem(data) {
    let aux = { ...data };
    this.router.navigate(['vehiculos-form/', aux]);
  }
  nuevoItem() {
    this.router.navigate(['vehiculos-form']);
  }

  armarColumnas(pItem) {
    // Nombre
    let cols = [];
    cols.push({ text: pItem.modelo });
    cols.push({ text: pItem.patente });

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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.vehiculosService.importar(file).subscribe((res: any) => {
        //console.log(res);
        this.globalService.showToast(res.mensaje.texto);
        this.fileInput.nativeElement.value = '';
      });
    }
  }

  descargarTemplateImportar() {
    const url = 'https://qapp.com.ar/mercofrio/files/template_importar/formato_vehiculos.csv';
    window.open(url, '_blank');
  }
}
