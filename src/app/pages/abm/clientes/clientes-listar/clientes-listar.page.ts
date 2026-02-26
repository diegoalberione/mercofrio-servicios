import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ClientesService } from 'src/app/services/clientes.service';
import { EliminarService } from 'src/app/services/eliminar.service';
import { GlobalService } from 'src/app/services/global.service';

@Component({
  selector: 'app-clientes-listar',
  templateUrl: './clientes-listar.page.html',
  styleUrls: ['./clientes-listar.page.scss'],
})
export class ClientesListarPage implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  constructor(
    private globalService: GlobalService,
    private router: Router,
    public datepipe: DatePipe,
    private clientesService: ClientesService,
    private eliminarService: EliminarService
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
  clientes = [];
  total;
  getItems($event?) {
    this.clientesService.listarClientes().subscribe((res) => {
      this.total = res.usuarios.length;
      this.clientes = res.usuarios;
      this.globalService.stopLoading();
    });
  }

  deleteItem(itemId) {
    this.eliminarService.eliminar('usuarios', itemId).subscribe((resp) => {
      this.inicializarItems();
      this.globalService.showToast(`Elemento eliminado!`);
    });
  }

  editItem(data) {
    this.router.navigate(['clientes-form/', data]);
  }
  nuevoItem() {
    this.router.navigate(['clientes-form']);
  }

  armarColumnas(pItem) {
    let cols = [];
    cols.push({ text: pItem.nombres });

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

  searchUsers(event) {
    this.globalService.showLoading();
    console.log(event.target.value, event.detail.value);
    this.clientesService
      .buscarClientes(event.target.value)
      .subscribe((res: any) => {
        console.log(res);
        this.clientes = res.usuarios;
        this.total = res.usuarios.length;
      });
    this.globalService.stopLoading();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      this.globalService.showToast(
        'Importando datos...'
      );

      this.clientesService.importar(file).subscribe((res: any) => {
        //console.log(res);
        this.globalService.showToast(res.mensaje.texto);
        this.fileInput.nativeElement.value = '';
      });
    }
  }

  descargarTemplateImportar() {
    const url = 'https://qapp.com.ar/mercofrio/files/template_importar/formato_clientes.csv';
    window.open(url, '_blank');
  }

}