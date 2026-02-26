import { GlobalService } from 'src/app/services/global.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EliminarService } from 'src/app/services/eliminar.service';
import { ModalController } from '@ionic/angular';
import { ModalExampleComponent } from './modal-example.component';
import { takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-usuarios-listar',
  templateUrl: './usuarios-listar.page.html',
  styleUrls: ['./usuarios-listar.page.scss'],
})
export class UsuariosListarPage implements OnInit {

  banCargando = false;
  usuarios = [];
  total;
  esTecnico: boolean = false;
  filtro: string = '';
  usuariosOriginal = [];

  constructor(
    private GlobalService: GlobalService,
    private Router: Router,
    public Datepipe: DatePipe,
    private UsuariosService: UsuariosService,
    private EliminarService: EliminarService,
    private modalCtrl: ModalController,
    private globalService: GlobalService
  ) { }

  private readonly _unsubscribe$ = new Subject<any>();
  wait = false;

  ngOnInit() { }

  ionViewDidEnter() {
    this.inicializarItems();
  }

  inicializarItems() {
    this.GlobalService.showLoading();
    this.getItems();
  }

  getItems($event?) {
    this.UsuariosService.listarEmpleadosConEliminados().subscribe((res) => {
      console.log('USUARIOS', res)
      this.total = res.usuarios.length;
      this.usuarios = res.usuarios;
      this.usuariosOriginal = res.usuarios;
      this.GlobalService.stopLoading();
    });
  }

  filtrarUsuarios() {
    const filtroLower = this.filtro.trim();
    if (filtroLower.length < 2) {// Si el filtro es muy corto, puedes volver a cargar todos o limpiar la lista
      this.getItems();
      return;
    } else {
      this.UsuariosService.listarEmpleadosConEliminados(filtroLower).subscribe((res) => {
        this.usuarios = res.usuarios;
        this.total = res.usuarios.length;
      });
    }
  }

  deleteItem(itemId) {
    this.UsuariosService.eliminar(itemId).subscribe((resp) => {
      this.inicializarItems();
      this.GlobalService.showToast(`Elemento eliminado!`);
    });
  }

  editItem(data) {
    let aux = { ...data };
    this.Router.navigate(['usuarios-form/', aux]);
  }

  nuevoItem() {
    this.Router.navigate(['/abm/usuarios-form']);
  }

  armarColumnas(pItem) {
    let cols = [];
    
    // Nombre con indicador de eliminado
    let nombreCompleto = pItem.nombres + ' ' + pItem.apellido;
    if (pItem.eliminado !== null && pItem.eliminado !== undefined) {
      nombreCompleto += ' 🗑️ ELIMINADO';
    }
    cols.push({ text: nombreCompleto });
    
    // Información adicional
    let zona = '';
    if (pItem.zona && pItem.zona.nombre) {
      zona = pItem.zona.nombre;
    }
    cols.push({ text: pItem.usuariosgrupo.nombre + ' | ' + zona });

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

  message = 'This modal example uses the modalController to present and dismiss modals.';

  async openModal(itemId) {
    const modal = await this.modalCtrl.create({
      component: ModalExampleComponent,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();
    const dataValues = {
      password: data.password,
      id: itemId
    };
    if (role === 'confirm') {
      console.log(itemId);
      this.wait = true;
      this.UsuariosService.guardarNuevoUsuario(dataValues).pipe(takeUntil(this._unsubscribe$)).subscribe({
        next: async (resp: any) => {
          await this.globalService.showToast(
            `Contraseña guardada correctamente.`,
            'success'
          );
          this.wait = false;
        },
        error: async (res: any) => {
          await this.globalService.showToast(
            `La contraseña no se pudo guardar. ${res.error.message || ''}`,
            'danger'
          );
          this.wait = false;
        },
      });
    }
  }
}
