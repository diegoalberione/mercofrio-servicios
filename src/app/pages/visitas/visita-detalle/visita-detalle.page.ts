import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { GlobalService } from 'src/app/services/global.service';
import { VisitasService } from 'src/app/services/visitas.service';
import { VisitaFirmarPage } from '../visita-firmar/visita-firmar.page';
import { ClientesService } from 'src/app/services/clientes.service';
import { VehiculosService } from 'src/app/services/vehiculos.service';

@Component({
  selector: 'app-visita-detalle',
  templateUrl: './visita-detalle.page.html',
  styleUrls: ['./visita-detalle.page.scss'],
})
export class VisitaDetallePage implements OnInit {
  visita: any = null;
  servicioMultimedias: any[] = [];
  volverAFirmar: boolean = false;
  tecnicosDisponibles: any[] = [];
  vehiculosDisponibles: any[] = [];

  constructor(
    public globalService: GlobalService,
    private activatedRoute: ActivatedRoute,
    private visitasService: VisitasService,
    private router: Router,
    private modalController: ModalController,
    private clientesService: ClientesService,
    private vehiculosService: VehiculosService
  ) {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.visitaId) {
        this.cargarVisita(params.visitaId);
      }
    });
    
    // También verificar queryParams
    this.activatedRoute.queryParams.subscribe((queryParams: any) => {
      if (queryParams.visitaData) {
        // Si viene como datos completos (desde modal)
        this.visita = JSON.parse(queryParams.visitaData);
        this.procesarMultimedias();
      }
      if (queryParams.volverAFirmar === 'true') {
        this.volverAFirmar = true;
      }
    });
  }

  async ngOnInit() {
    await this.cargarDatosLocales();
  }

  async cargarDatosLocales() {
    try {
      // Cargar técnicos desde datos locales
      const tecnicos = await this.clientesService.listarLocalTecnicos();
      this.tecnicosDisponibles = tecnicos || [];
      
      // Cargar vehículos desde datos locales
      const vehiculos = await this.vehiculosService.listarLocal();
      this.vehiculosDisponibles = vehiculos || [];
    } catch (error) {
      console.error('Error cargando datos locales:', error);
    }
  }

  cargarVisita(visitaId: number) {
    this.globalService.showLoading();
    this.visitasService.listarVisitaId(visitaId).subscribe({
      next: (res) => {
        this.visita = res.visitas[0];
        this.procesarMultimedias();
        this.globalService.stopLoading();
      },
      error: (error) => {
        console.error('Error cargando visita:', error);
        this.globalService.stopLoading();
        this.globalService.showToast('Error al cargar la visita', 'danger');
      }
    });
  }

  procesarMultimedias() {
    if (!this.visita || !this.visita.servicios) {
      return;
    }

    this.servicioMultimedias = [];
    
    for (let servicio of this.visita.servicios) {
      const multimedias = {
        fotos_pre: [],
        fotos_post: []
      };

      if (servicio.multimedias && servicio.multimedias.length > 0) {
        for (let multimedia of servicio.multimedias) {
          if (multimedia.tipo === 0) {
            multimedias.fotos_pre.push(multimedia);
          } else if (multimedia.tipo === 1) {
            multimedias.fotos_post.push(multimedia);
          }
        }
      }

      // Si tiene fotos_pre o fotos_post en el servicio (formato offline)
      if (servicio.fotos_pre && servicio.fotos_pre.length > 0) {
        multimedias.fotos_pre = servicio.fotos_pre;
      }
      if (servicio.fotos_post && servicio.fotos_post.length > 0) {
        multimedias.fotos_post = servicio.fotos_post;
      }

      this.servicioMultimedias.push(multimedias);
    }
  }

  getImagenSrc(foto: any): string {
    if (!foto) {
      return '';
    }
    
    // Prioridad 1: base64 (para preview inmediato)
    if (foto.base64 && foto.base64 !== '') {
      return 'data:image/jpeg;base64,' + foto.base64;
    }
    
    // Prioridad 2: webPath (para preview temporal)
    if (foto.webPath && foto.webPath !== '') {
      return foto.webPath;
    }
    
    // Prioridad 3: rutaArchivo (cargar desde archivo guardado)
    if (foto.rutaArchivo) {
      // En este caso, el base64 debería estar disponible
      // Si no está, podríamos cargarlo desde el archivo, pero por ahora usamos base64
      return '';
    }
    
    // Prioridad 4: código (foto del servidor)
    if (foto.codigo) {
      return `${this.globalService.url_multimedias}${foto.codigo}`;
    }
    
    return '';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR');
  }

  tieneVehiculo(): boolean {
    return this.visita?.vehiculo && 
           (this.visita.vehiculo.nombre || 
            this.visita.vehiculo.marca || 
            this.visita.vehiculo.modelo || 
            this.visita.vehiculo.patente);
  }

  tieneAcompanante(): boolean {
    return this.visita?.empleado_usuario_id && 
           this.visita.acompanante &&
           (this.visita.acompanante.nombres || this.visita.acompanante.apellido);
  }

  getLocalidad(): string {
    return this.visita?.localidad || 'S/D';
  }

  getTecnicoNombre(tecnicoId: number): string {
    // Convertir ID a número si viene como string
    const idNumerico = typeof tecnicoId === 'string' ? parseInt(tecnicoId) : tecnicoId;
    
    // Buscar en los técnicos disponibles (datos locales)
    const tecnico = this.tecnicosDisponibles.find((t: any) => t.id === idNumerico);
    if (tecnico) {
      return `${tecnico.nombres || ''} ${tecnico.apellido || ''}`.trim();
    }
    
    // Si los técnicos ya están cargados en la visita (desde servidor)
    if (this.visita.tecnicosAdicionales) {
      const tecnicoVisita = this.visita.tecnicosAdicionales.find((t: any) => t.id === idNumerico);
      if (tecnicoVisita) {
        return `${tecnicoVisita.nombres || ''} ${tecnicoVisita.apellido || ''}`.trim();
      }
    }
    
    return '';
  }

  getVehiculoNombre(vehiculoId: number): string {
    // Convertir ID a número si viene como string
    const idNumerico = typeof vehiculoId === 'string' ? parseInt(vehiculoId) : vehiculoId;
    
    // Buscar en los vehículos disponibles (datos locales)
    const vehiculo = this.vehiculosDisponibles.find((v: any) => v.id === idNumerico);
    if (vehiculo) {
      return `${vehiculo.nombre || ''} ${vehiculo.marca || ''} ${vehiculo.modelo || ''} - ${vehiculo.patente || ''}`.trim();
    }
    
    // Si los vehículos ya están cargados en la visita (desde servidor)
    if (this.visita.vehiculosAdicionales) {
      const vehiculoVisita = this.visita.vehiculosAdicionales.find((v: any) => v.id === idNumerico);
      if (vehiculoVisita) {
        return `${vehiculoVisita.nombre || ''} ${vehiculoVisita.marca || ''} ${vehiculoVisita.modelo || ''} - ${vehiculoVisita.patente || ''}`.trim();
      }
    }
    
    return '';
  }

  async volver() {
    if (this.volverAFirmar) {
      // Abrir el modal de firmar de nuevo
      const modal = await this.modalController.create({
        component: VisitaFirmarPage,
        componentProps: {
          visita: this.visita,
        },
      });
      await modal.present();
    } else {
      // Volver a la página anterior
      this.router.navigate(['/visitas']);
    }
  }
}

