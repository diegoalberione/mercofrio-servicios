import { OfflineService } from 'src/app/services/offline.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiciosPage } from './../../servicios/servicios.page';
import { VehiculosService } from './../../../services/vehiculos.service';
import { Component, OnInit } from '@angular/core';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { AlertController, ModalController } from '@ionic/angular';
import { GlobalService } from 'src/app/services/global.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { IonicSelectableComponent } from 'ionic-selectable';
import { VisitaFirmarPage } from '../visita-firmar/visita-firmar.page';
import { VisitasService } from 'src/app/services/visitas.service';
import { IVisita } from '../../../../interfaces/IVisita';

@Component({
  selector: 'app-form-visita',
  templateUrl: './form-visita.page.html',
  styleUrls: ['./form-visita.page.scss'],
})
export class FormVisitaPage implements OnInit {
  usuarioLogeado;
  vehiculosDisponibles;
  clientesDisponibles;
  vehiculosSeleccionados = [];
  clienteSeleccionado;
  tecnicosDisponibles;
  tecnicoSeleccionado;
  tecnicosAsistentesSeleccionados = [];
  servicios = [];

  clientesLocales;

  visita: any = {
    id: null,
    fecha: this.globalService.getFecha(),
    nro_visita: '',
    responsable_usuario_id: null,
    cliente: {},
    cliente_usuario_id: null,
    vehiculo: {},
    vehiculo_id: '',
    tecnico: {},
    tecnico_usuario_id: null,
    horas_viaje: '',
    localidad: '',
    domicilio: '',
    km_recorridos: '',
    horas_trabajadas: '',
    servicios: [],
    estado_id: 0,
    firma_multimedia: '',
    firma_aclaracion: '',
    zona_id: null,
    visitas_usuarios: [],
    visitas_vehiculos: [],
  };

  indiceEditar;

  constructor(
    private usuariosService: UsuariosService,
    private vehiculosService: VehiculosService,
    private modalController: ModalController,
    private router: Router,
    private offlineService: OfflineService,
    private alertController: AlertController,
    private activatedRoute: ActivatedRoute,
    public globalService: GlobalService,
    private clientesService: ClientesService,
    private visitasService: VisitasService
  ) {
    this.activatedRoute.params.subscribe((params: any) => {
      if (!!params.pData) {
        // Modo edición - cargar datos existentes desde params
        let dataEditar = JSON.parse(params.pData);
        this.cargarDatosVisita(dataEditar);
      }
    });
  }

  private cargarDatosVisita(dataEditar: any) {
    console.log('=== CARGANDO VISITA PARA EDICIÓN ===');
    console.log('Data completa:', dataEditar);
    console.log('Visita recibida:', dataEditar.visita);
    
    if (!dataEditar || !dataEditar.visita) {
      console.error('Error: datosVisita o visita es null/undefined');
      return;
    }
    
    this.indiceEditar = dataEditar.indice;
    this.visita = { ...dataEditar.visita }; // Hacer una copia para evitar referencias
    this.servicios = dataEditar.visita.servicios || [];
    this.clienteSeleccionado = dataEditar.visita.cliente;
    this.tecnicoSeleccionado = dataEditar.visita.responsable;
    
    // Inicializar arrays si no existen
    if (!this.visita.visitas_vehiculos) {
      this.visita.visitas_vehiculos = [];
    }
    if (!this.visita.visitas_usuarios) {
      this.visita.visitas_usuarios = [];
    }
    
    console.log('Visita después de asignar:', this.visita);
    console.log('Servicios:', this.servicios);
    console.log('Cliente seleccionado:', this.clienteSeleccionado);
    console.log('Técnico seleccionado:', this.tecnicoSeleccionado);
    console.log('visitas_vehiculos:', this.visita.visitas_vehiculos);
    console.log('visitas_usuarios:', this.visita.visitas_usuarios);
  }

  async ngOnInit() {
    this.globalService.showLoading();
    
    // Cargar datos locales primero (vehículos, clientes, técnicos)
    await this.cargarDatos();
    
    // Primero verificar si hay datos en params (edición normal)
    if (this.activatedRoute.snapshot.params.pData) {
      // Ya se cargó en el constructor, solo cargar vehículos y técnicos
      console.log('=== Datos cargados desde params ===');
    } else {
      // Verificar si hay datos en localStorage (desde visita-firmar)
      const tempData = localStorage.getItem('visita_editar_temp');
      if (tempData) {
        try {
          const datosVisita = JSON.parse(tempData);
          console.log('=== Datos encontrados en localStorage ===', datosVisita);
          this.cargarDatosVisita(datosVisita);
          // Limpiar el dato temporal después de leerlo
          localStorage.removeItem('visita_editar_temp');
        } catch (error) {
          console.error('Error parseando datos de localStorage:', error);
          localStorage.removeItem('visita_editar_temp');
        }
      } else {
        // Verificar si hay datos en el router navigation state (fallback)
        const navigation = this.router.getCurrentNavigation();
        if (navigation && navigation.extras && navigation.extras.state && navigation.extras.state.datosVisita) {
          console.log('=== Datos encontrados en router navigation state ===');
          this.cargarDatosVisita(navigation.extras.state.datosVisita);
        } else {
          // Verificar si hay datos en el history state (fallback)
          const state = history.state;
          if (state && state.datosVisita) {
            console.log('=== Datos encontrados en history state ===');
            this.cargarDatosVisita(state.datosVisita);
          } else if (!this.visita.id) {
            // Solo limpiar si no hay datos y no es una edición
            console.log('=== No hay datos, limpiando formulario ===');
            this.limpiarFormulario();
          }
        }
      }
    }

    console.log('=== ngOnInit - Verificando arrays para cargar ===');
    console.log('visitas_vehiculos:', this.visita.visitas_vehiculos);
    console.log('visitas_usuarios:', this.visita.visitas_usuarios);
    console.log('vehiculosDisponibles cargados:', this.vehiculosDisponibles?.length);
    console.log('tecnicosDisponibles cargados:', this.tecnicosDisponibles?.length);

    // Si hay visitas_vehiculos para cargar (modo edición), cargar los vehículos
    if (Array.isArray(this.visita.visitas_vehiculos) && this.visita.visitas_vehiculos.length > 0) {
      console.log('Cargando vehículos con IDs:', this.visita.visitas_vehiculos);
      await this.cargarVehiculosAsistentes(this.visita.visitas_vehiculos);
    } else {
      console.log('No hay vehículos para cargar o el array está vacío');
      this.vehiculosSeleccionados = [];
    }

    // Si hay visitas_usuarios para cargar (modo edición), cargar los técnicos
    if (Array.isArray(this.visita.visitas_usuarios) && this.visita.visitas_usuarios.length > 0) {
      console.log('Cargando técnicos con IDs:', this.visita.visitas_usuarios);
      await this.cargarTecnicosAsistentes(this.visita.visitas_usuarios);
    } else {
      console.log('No hay técnicos para cargar o el array está vacío');
      this.tecnicosAsistentesSeleccionados = [];
    }

    this.usuariosService.getUsuarioLogueado().subscribe((user) => {
      this.usuarioLogeado = user;
      
      // Si es nueva visita (sin id), asignar zona del usuario logueado
      if (!this.visita.id) {
        this.visita.zona_id = this.usuarioLogeado.zona_id;
      } else {
        // Si es edición y la zona es null, asignar la del usuario logueado
        if (this.visita.zona_id == null) {
          this.visita.zona_id = this.usuarioLogeado.zona_id;
        }
      }
      console.log('VISITA con zona', this.visita);
    });

    this.globalService.stopLoading();
    console.log('=== ngOnInit completado ===');
    console.log('Visita final:', this.visita);
    console.log('Servicios:', this.servicios);
    console.log('Cliente:', this.clienteSeleccionado);
    console.log('Técnico:', this.tecnicoSeleccionado);
    console.log('Vehículos seleccionados:', this.vehiculosSeleccionados);
    console.log('Técnicos asistentes seleccionados:', this.tecnicosAsistentesSeleccionados);
  }

  limpiarFormulario() {
    // Resetear índice de edición
    this.indiceEditar = null;
    
    // Limpiar servicios
    this.servicios = [];
    
    // Limpiar selecciones
    this.clienteSeleccionado = null;
    this.vehiculosSeleccionados = [];
    this.tecnicoSeleccionado = null;
    this.tecnicosAsistentesSeleccionados = [];
    
    // Resetear objeto visita a valores por defecto
    this.visita = {
      id: null,
      fecha: this.globalService.getFecha(),
      nro_visita: '',
      responsable_usuario_id: null,
      cliente: {},
      cliente_usuario_id: null,
      vehiculo: {},
      vehiculo_id: '',
      tecnico: {},
      tecnico_usuario_id: null,
      horas_viaje: '',
      localidad: '',
      domicilio: '',
      km_recorridos: '',
      horas_trabajadas: '',
      servicios: [],
      estado_id: 0,
      firma_multimedia: '',
      firma_aclaracion: '',
      zona_id: null,
      visitas_usuarios: [],
      visitas_vehiculos: [],
    };
    
    console.log('Formulario limpiado para nueva visita');
  }

  ionViewDidEnter() {
    // No hacer nada aquí para evitar limpiar datos cargados desde localStorage
    // Los datos ya se cargaron en ngOnInit
  }

  async cargarDatos() {
    const vehiculos = await this.vehiculosService.listarLocal();
    this.vehiculosDisponibles = vehiculos.map((vehiculo) => ({
      ...vehiculo,
      vehiculoDisplay: `${vehiculo.patente || ''} ${vehiculo.nombre || ''}`.trim()
    }));
    this.clientesDisponibles = await this.clientesService.listarLocal();
    const tecnicos = await this.clientesService.listarLocalTecnicos();
    this.tecnicosDisponibles = tecnicos
      .map((tecnico) => ({
        ...tecnico,
        nombreCompleto: `${tecnico.nombres || ''} ${tecnico.apellido || ''}`.trim()
      }))
      .sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));
    console.log('tecnicos', this.tecnicosDisponibles);
  }

  async cargarTecnicosAsistentes(idsUsuarios: number[]) {
    console.log('=== cargarTecnicosAsistentes ===');
    console.log('IDs recibidos:', idsUsuarios);
    
    // Asegurarse de que tecnicosDisponibles esté cargado
    if (!this.tecnicosDisponibles || this.tecnicosDisponibles.length === 0) {
      console.log('Técnicos no cargados, cargando ahora...');
      await this.cargarDatos();
    }
    
    console.log('Técnicos disponibles:', this.tecnicosDisponibles?.length);
    
    // Convertir IDs a números si vienen como strings
    const idsNumericos = idsUsuarios.map(id => typeof id === 'string' ? parseInt(id) : id);
    console.log('IDs numéricos:', idsNumericos);
    
    // Buscar los técnicos completos usando los IDs
    this.tecnicosAsistentesSeleccionados = this.tecnicosDisponibles.filter(
      tecnico => idsNumericos.includes(tecnico.id)
    );
    console.log('Técnicos asistentes encontrados y cargados:', this.tecnicosAsistentesSeleccionados.length);
    console.log('Técnicos asistentes:', this.tecnicosAsistentesSeleccionados);
  }

  async cargarVehiculosAsistentes(idsVehiculos: number[]) {
    console.log('=== cargarVehiculosAsistentes ===');
    console.log('IDs recibidos:', idsVehiculos);
    
    // Asegurarse de que vehiculosDisponibles esté cargado
    if (!this.vehiculosDisponibles || this.vehiculosDisponibles.length === 0) {
      console.log('Vehículos no cargados, cargando ahora...');
      await this.cargarDatos();
    }
    
    console.log('Vehículos disponibles:', this.vehiculosDisponibles?.length);
    
    // Convertir IDs a números si vienen como strings
    const idsNumericos = idsVehiculos.map(id => typeof id === 'string' ? parseInt(id) : id);
    console.log('IDs numéricos:', idsNumericos);
    
    // Buscar los vehículos completos usando los IDs
    this.vehiculosSeleccionados = this.vehiculosDisponibles.filter(
      vehiculo => idsNumericos.includes(vehiculo.id)
    );
    console.log('Vehículos encontrados y cargados:', this.vehiculosSeleccionados.length);
    console.log('Vehículos:', this.vehiculosSeleccionados);
  }

  async modalEditarService(dataServicio, indice) {
    const modal = await this.modalController.create({
      component: ServiciosPage,
      componentProps: {
        editarServicio: dataServicio,
      },
    });

    let auxData = dataServicio;

    modal.onWillDismiss().then((data) => {
      console.log('DATA SERVICIOS DISMISS', data.data);
      if (!!data.data) {
        this.servicios.push(data.data);
      } else {
        this.servicios.push(auxData);
      }
    });

    setTimeout(() => {
      this.servicios.splice(indice, 1);
    }, 1500);
    return await modal.present();
  }

  async modalNuevoServicio() {
    const modal = await this.modalController.create({
      component: ServiciosPage,
    });

    modal.onWillDismiss().then((data) => {
      console.log('DATA SERVICIOS DISMISS', data.data);
      if (!!data.data) {
        this.servicios.push(data.data);
      }
    });

    return await modal.present();
  }

  async guardarLocal() {
    console.log('=== INICIANDO GUARDADO DE VISITA ===');
    console.log('Usuario logueado:', this.usuarioLogeado);
    
    try {
      this.globalService.showLoading('Guardando visita...');
      
      this.visita.responsable_usuario_id = this.usuarioLogeado.id;
      console.log('Responsable asignado:', this.visita.responsable_usuario_id);

      this.visita.servicios = [...this.servicios];
      console.log('Servicios asignados:', this.visita.servicios.length);

      //NUEVO
      if (!!this.clienteSeleccionado) {
        this.visita.cliente = this.clienteSeleccionado;
        this.visita.cliente_usuario_id = this.clienteSeleccionado.id;
        console.log('Cliente asignado:', this.clienteSeleccionado);
      } else {
        console.log('ERROR: Falta cliente');
        this.globalService.showAlert("Campo incompleto", "Falta el campo 'Cliente'")
        return
      }

      // Asignar vehículos (puede estar vacío)
      if (this.vehiculosSeleccionados && this.vehiculosSeleccionados.length > 0) {
        this.visita.visitas_vehiculos = this.vehiculosSeleccionados.map(vehiculo => vehiculo.id);
        console.log('Vehículos asignados:', this.visita.visitas_vehiculos);
      } else {
        this.visita.visitas_vehiculos = [];
        console.log('No hay vehículos seleccionados');
      }

      if (!!this.tecnicoSeleccionado) {
        this.visita.responsable = this.tecnicoSeleccionado;
        this.visita.responsable_usuario_id = this.tecnicoSeleccionado.id;
        console.log('Técnico asignado:', this.tecnicoSeleccionado);
      } else {
        console.log('ERROR: Falta técnico');
        this.globalService.showAlert("Campo incompleto", "Falta el campo 'Técnico'")
        return
      }

      // Asignar técnicos asistentes (puede estar vacío)
      if (this.tecnicosAsistentesSeleccionados && this.tecnicosAsistentesSeleccionados.length > 0) {
        this.visita.visitas_usuarios = this.tecnicosAsistentesSeleccionados.map(tecnico => tecnico.id);
        console.log('Técnicos asistentes asignados:', this.visita.visitas_usuarios);
      } else {
        this.visita.visitas_usuarios = [];
        console.log('No hay técnicos asistentes seleccionados');
      }

      if (this.visita.horas_trabajadas == '') {
        console.log('ERROR: Falta horas trabajadas');
        this.globalService.showAlert("Campo incompleto", "Falta el campo 'Horas trabajadas'")
        return
      }

      if (this.visita.km_recorridos == '') {
        console.log('ERROR: Falta km recorridos');
        this.globalService.showAlert("Campo incompleto", "Falta el campo 'Km recorridos'")
        return
      }

      if (this.visita.horas_viaje == '') {
        console.log('ERROR: Falta horas viaje');
        this.globalService.showAlert("Campo incompleto", "Falta el campo 'Horas viaje'")
        return
      }

      if (this.visita.localidad == '') {
        console.log('ERROR: Falta localidad');
        this.globalService.showAlert("Campo incompleto", "Falta el campo 'Localidad'")
        return
      }
      
      if (this.visita.servicios.length == 0) {
        console.log('ERROR: Falta servicios');
        this.globalService.showAlert("Campo incompleto", "Falta cargar al menos un 'Servicio'")
        return
      }
      
      console.log('=== TODAS LAS VALIDACIONES PASARON ===');
      console.log('Visita completa:', this.visita);
      console.log('Índice de edición:', this.indiceEditar);

      console.log('=== LEYENDO ARCHIVO VISITAS.JSON ===');
      let JSONvisitas = await this.offlineService.leerDatos('visitas.json');
      console.log('Datos leídos del archivo:', JSONvisitas);
      
      if (!JSONvisitas || !JSONvisitas.visitas) {
        console.log('Archivo no existe o está mal formateado, inicializando...');
        JSONvisitas = { visitas: [] };
      }

      if (this.indiceEditar !== null && this.indiceEditar >= 0) {
        console.log('=== MODO EDICIÓN ===');
        JSONvisitas.visitas[this.indiceEditar] = this.visita;
        console.log('Visita actualizada en índice:', this.indiceEditar);
      } else {
        console.log('=== MODO NUEVA VISITA ===');
        JSONvisitas.visitas.push(this.visita);
        console.log('Nueva visita agregada. Total visitas:', JSONvisitas.visitas.length);
      }
      
      console.log('=== ESCRIBIENDO ARCHIVO ===');
      console.log('Datos a escribir:', JSONvisitas);
      
      this.globalService.showLoading('Guardando datos...');
      await this.offlineService.escribirDatos('visitas.json', JSONvisitas);
      this.globalService.stopLoading();
      
      console.log('=== ARCHIVO ESCRITO EXITOSAMENTE ===');
      
      this.globalService.showToast('Visita guardada correctamente', 'success');
      
      console.log('=== NAVEGANDO A VISITAS ===');
      this.router.navigate(['/visitas']);
      
    } catch (error: any) {
      this.globalService.stopLoading();
      console.error('=== ERROR EN GUARDADO ===', error);
      this.globalService.showAlert("Error", "Error al guardar la visita: " + (error.message || 'Error desconocido'));
    }
  }

  async cancelarVisita() {
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Cancelar nueva visita!',
      message: 'Si cancela, se perderan todos los datos ingresados',
      buttons: [
        {
          text: 'Atrás',
          role: 'cancel',
        },
        {
          text: 'Aceptar',
          handler: () => {
            this.router.navigate(['/visitas']);
          },
        },
      ],
    });
    alert.present();
  }

  async eliminarServicio(i) {
    let auxItem = this.servicios[i];
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Eliminar servicio',
      message: `
              Está seguro que desea eliminar el servicio:<br/>
              <b>${this.tipoServicio(auxItem.tipo_servicio)} - ${auxItem.equipo
        }</b> !!!`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Aceptar',
          handler: () => {
            this.servicios.splice(i, 1);
          },
        },
      ],
    });

    await alert.present();
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

  // tiposServicios = [
  //   { id: 1, nombre: 'Reparación de tornillo' },
  //   { id: 2, nombre: 'Reparación de alternativo' },
  //   { id: 3, nombre: 'Reparación de bomba de Aceite' },
  //   { id: 4, nombre: 'Reparación de bomba de NH3' },
  //   { id: 5, nombre: 'Instalación / Montaje' },
  //   { id: 6, nombre: 'Escamadora / Rolitera' },
  //   { id: 7, nombre: 'Intercambiador a placas' },
  //   { id: 8, nombre: 'Automatismo' },
  // ];

  async buscarLocalSelectable(event: {
    component: IonicSelectableComponent;
    text: string;
  }) {
    console.log(event)
    const text = !!event.text ? event.text.toString().trim() : null;
    console.log('TEXT', text)
    
    // Solo buscar si hay texto y tiene al menos 3 caracteres
    if (!!text && text.length >= 3) {
      event.component.startSearch();
      event.component.items = await this.globalService.busquedaLocalTratada(
        await this.clientesService.listarLocal(),
        ['nombres', 'apellido'],
        text
      );
      event.component.endSearch();
    } else {
      // Cuando no hay texto o tiene menos de 3 caracteres, mostrar los primeros 50 clientes
      event.component.startSearch();
      const todosLosClientes = await this.clientesService.listarLocal();
      event.component.items = todosLosClientes.slice(0, 50); // Primeros 50 clientes
      event.component.endSearch();
    }
  }

  async finalizarVisita() {
    const modal = await this.modalController.create({
      component: VisitaFirmarPage,
      componentProps: {
        visita: this.visita,
      },
    });

    modal.onWillDismiss().then((res: any) => {
      if (res) {
        this.visita.firma_multimedia = res.data.firma_multimedia;
        this.visita.firma_aclaracion = res.data.firma_aclaracion;
        this.visita.estado_id = 1;
        this.guardarLocal();
      }
    });

    return await modal.present();
  }
}
