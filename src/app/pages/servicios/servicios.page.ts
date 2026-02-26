import { RepuestosPage } from './repuestos/repuestos.page';
import { AlertController, ModalController } from '@ionic/angular';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';
import { OfflineService } from 'src/app/services/offline.service';
import { TrabajosPage } from './trabajos/trabajos.page';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { MarcasService } from 'src/app/services/marcas.service';
import { LineasService } from 'src/app/services/lineas.service';
import { ModelosService } from 'src/app/services/modelos.service';
import { IonicSelectableComponent } from 'ionic-selectable';
import { Capacitor } from '@capacitor/core';
import {
  Camera,
  CameraDirection,
  CameraResultType,
  CameraSource,
} from '@capacitor/camera';
import { Browser } from '@capacitor/browser';
import { Filesystem, Directory } from '@capacitor/filesystem';

@Component({
  selector: 'app-servicios',
  templateUrl: './servicios.page.html',
  styleUrls: ['./servicios.page.scss'],
})
export class ServiciosPage implements OnInit {
  marcasCargadas;
  marcasDisponibles;
  marcasSeleccionado;
  lineasDisponibles;
  lineasCargadas;
  lineasSeleccionado;
  modelosDisponibles;
  modelosCargados;
  modelosSeleccionado;

  equipoTipo;
  tiposServicios = [
    { id: 1, nombre: 'Reparación de tornillo' },
    { id: 2, nombre: 'Reparación de alternativo' },
    { id: 3, nombre: 'Reparación de bomba de Aceite' },
    { id: 4, nombre: 'Reparación de bomba de NH3' },
    { id: 5, nombre: 'Instalación / Montaje' },
    { id: 6, nombre: 'Escamadora / Rolitera' },
    { id: 7, nombre: 'Intercambiador a placas' },
    { id: 8, nombre: 'Automatismo' },
    { id: 9, nombre: 'Varios' },
  ];

  index = 0;
  tipoServicio;
  fotospre = [];
  fotospost = [];
  servicio = {
    marca: '',
    linea: '',
    modelo: '',
    marca_id: '',
    linea_id: '',
    modelo_id: '',
    modelo_nombre: '',
    servicio_nro: '',
    equipo_nro: '',
    titulo: '',
    descripcion: '',
    horas_marcha: '',
    en_garantia: false,
    serviciostipo_id: '',
    fotos_pre: [],
    fotos_post: [],
    multimedias: [],
    trabajos: [],
    repuestos: [],
    horas_limite: '',
    fecha_limite: '',
    orden_venta: '',
    nro_remito: '',
  };

  editarServicio;

  camposHabilitados = {
    equipo: false,
    marca: false,
    linea: false,
    modelo: false,
    mk: false,
    numero: false,
    horas: false,
    repuestos: false,
    trabajos: false,
    fotospre: false,
    fotospost: false,
    automatismo: false,
    titulo: false,
    descripcion: true,
  };

  automatizacion = {
    tablero_comando: {
      tablero: '',
      tablero_componentes: '',
      pt100: '',
      transductores: '',
      solenoides: '',
    },
    tablero_potencia: {
      tablero: '',
      cableado: '',
      emergencia: '',
      tierra: '',
      solenoides: '',
    },
    test: '',
  };

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    public globalService: GlobalService,
    private offlineService: OfflineService,
    private photoViewer: PhotoViewer,
    private marcasService: MarcasService,
    private lineasService: LineasService,
    private modelosService: ModelosService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if (!!this.editarServicio) {
      this.cargarDatosEditar();
    }
    this.cargarDatos();

    // Debug temporal
    setTimeout(() => {
      console.log('DEBUG - fotospre length:', this.fotospre.length);
      console.log('DEBUG - fotospre array:', this.fotospre);
      console.log('DEBUG - fotospost length:', this.fotospost.length);
      console.log('DEBUG - fotospost array:', this.fotospost);
      this.verificarFotos();
    }, 1000);
  }

  // Método de prueba para verificar el estado de las fotos
  verificarEstadoFotos() {
    console.log('=== ESTADO ACTUAL DE FOTOS ===');
    console.log('fotospre.length:', this.fotospre.length);
    console.log('fotospost.length:', this.fotospost.length);
    
    this.fotospre.forEach((foto, index) => {
      console.log(`fotospre[${index}]:`, foto);
      console.log(`getSrc(fotospre[${index}]):`, this.getSrc(foto));
    });
    
    this.fotospost.forEach((foto, index) => {
      console.log(`fotospost[${index}]:`, foto);
      console.log(`getSrc(fotospost[${index}]):`, this.getSrc(foto));
    });
    console.log('=== FIN ESTADO ===');
  }

  verificarFotos() {
    console.log('Verificando fotos...');
    console.log('fotospre length:', this.fotospre.length);
    console.log('fotospost length:', this.fotospost.length);

    // Forzar actualización de la vista
    this.cdr.detectChanges();

    // Si aún no se muestran, intentar con setTimeout
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  habilitarCampos(tipo?) {

    if (tipo.id != 9) {
      this.camposHabilitados.marca = true;
      this.camposHabilitados.linea = true;
      this.camposHabilitados.modelo = true;
      this.camposHabilitados.horas = true;
      this.camposHabilitados.mk = true;
      this.camposHabilitados.numero = true;
      this.camposHabilitados.trabajos = true;
      this.camposHabilitados.repuestos = true;
      this.camposHabilitados.fotospost = true;
      this.camposHabilitados.fotospre = true;


      this.camposHabilitados.descripcion = true;
    } else {
      // Deshabilitar todos los campos
      Object.keys(this.camposHabilitados).forEach(key => {
        this.camposHabilitados[key] = false;
      });
      this.camposHabilitados.descripcion = true;
      this.camposHabilitados.trabajos = true;
      this.camposHabilitados.repuestos = true;
      this.camposHabilitados.fotospost = true;
      this.camposHabilitados.fotospre = true;
    }
  }

  cargarDatosEditar() {
    console.log('=== INICIANDO cargarDatosEditar ===');
    console.log('editarServicio:', this.editarServicio);

    this.index++;
    this.seleccionTipoServicio(this.editarServicio);
    this.servicio = this.editarServicio;

    console.log('servicio.multimedias:', this.servicio.multimedias);
    console.log('servicio.fotos_pre:', this.servicio.fotos_pre);
    console.log('servicio.fotos_post:', this.servicio.fotos_post);

    if (!!this.servicio.multimedias && this.servicio.multimedias && this.servicio.multimedias.length > 0) {
      console.log('Cargando desde multimedias...');
      for (
        let indexMultimedias = 0;
        indexMultimedias < this.servicio.multimedias.length;
        indexMultimedias++
      ) {
        console.log('Multimedia item:', this.servicio.multimedias[indexMultimedias]);
        if (this.servicio.multimedias[indexMultimedias].tipo === 0) {
          this.fotospre.push(this.servicio.multimedias[indexMultimedias]);
          console.log('Agregada foto pre');
        } else {
          this.fotospost.push(this.servicio.multimedias[indexMultimedias]);
          console.log('Agregada foto post');
        }
      }
    } else {
      console.log('Cargando desde fotos_pre y fotos_post...');
      this.fotospre = this.servicio.fotos_pre || [];
      this.fotospost = this.servicio.fotos_post || [];
      console.log('fotospre después de asignar:', this.fotospre);
      console.log('fotospost después de asignar:', this.fotospost);
    }

    this.marcasSeleccionado = this.servicio.marca;
    this.lineasSeleccionado = this.servicio.linea;
    this.modelosSeleccionado = this.servicio.modelo;

    console.log('=== FINAL cargarDatosEditar ===');
    console.log('DATOS EDITAR ', this.servicio);
    console.log('FOTOS PRE', this.fotospre);
    console.log('FOTOS POST', this.fotospost);

    // Forzar detección de cambios
    this.cdr.detectChanges();
  }

  siguientePaso() {
    if (this.index == 0) {
      this.index++;
      this.servicio.serviciostipo_id = this.tipoServicio.id;
      console.log('PASO 1', this.tipoServicio.id)
      this.filtrarMarcasSegunServicio();
    }
  }

  anteriorPaso() {
    if (this.index == 0) {
      this.modalController.dismiss();
    } else {
      this.index--;
    }
  }

  async cargarDatos() {
    this.marcasCargadas = await this.marcasService.listarLocal();
    this.lineasCargadas = await this.lineasService.listarLocal();
    this.modelosCargados = await this.modelosService.listarLocal();

    if (!!this.editarServicio) {
      this.filtrarMarcasSegunServicio();
    }
  }

  filtrarLineas(event: {
    component: IonicSelectableComponent;
    item: any;
    isSelected: boolean;
  }) {
    this.lineasDisponibles = this.globalService.busquedaLocalTratada(
      this.lineasCargadas,
      ['marca_id'],
      event.item.id,
      true
    );
    console.log(this.lineasDisponibles);
  }

  filtrarModelos(event: {
    component: IonicSelectableComponent;
    item: any;
    isSelected: boolean;
  }) {
    this.modelosDisponibles = this.globalService.busquedaLocalTratada(
      this.modelosCargados,
      ['linea_id'],
      event.item.id,
      true
    );
  }

  async guardar() {
    try {
      console.log('GUARDAR', this.servicio);
      this.globalService.showLoading('Preparando servicio...');
      
      this.servicio.modelo_id = '1';
      
      // Preparar fotos: para guardado local solo guardamos referencias
      // Para envío al backend, cargaremos base64 desde archivos
      const fotosPreParaGuardar = this.fotospre.map(foto => ({
        id: foto.id,
        rutaArchivo: foto.rutaArchivo,
        base64: foto.base64, // Mantener base64 para envío inmediato al backend
        webPath: foto.webPath
      }));
      
      const fotosPostParaGuardar = this.fotospost.map(foto => ({
        id: foto.id,
        rutaArchivo: foto.rutaArchivo,
        base64: foto.base64, // Mantener base64 para envío inmediato al backend
        webPath: foto.webPath
      }));

      this.servicio.fotos_pre = fotosPreParaGuardar;
      this.servicio.fotos_post = fotosPostParaGuardar;
      
      if (this.servicio.serviciostipo_id != '9') {
        this.servicio.marca = this.marcasSeleccionado;
        this.servicio.marca_id = this.marcasSeleccionado.id;
      }
      
      this.globalService.stopLoading();
      await this.modalController.dismiss(this.servicio);
    } catch (error: any) {
      this.globalService.stopLoading();
      console.error('Error guardando servicio:', error);
      this.globalService.showToast('Error al guardar: ' + (error.message || 'Error desconocido'), 'danger');
    }
  }

  servicioCheck() {
    if (!!this.servicio.serviciostipo_id) {
      var error = false;
      if (this.servicio.serviciostipo_id != '9') {
        if (!this.marcasSeleccionado) {
          error = true;
        }
        if (this.servicio.modelo_nombre == '') {
          error = true;
        }
      }
      if (this.servicio.trabajos.length == 0) {
        error = true;
      }
      if (false) {
        // (this.servicio.servicio_nro == ''){
        error = true;
      }
      if (false) {
        // (this.servicio.horas_marcha == ''){
        error = true;
      }
      if (false) {
        // (this.servicio.horas_marcha == ''){
        error = true;
      }
      if (error) {
        this.globalService.showToast(
          '¡Para guardar un servicio debes completar los campos (*)'
        );
        return false;
      }
      this.guardar();
    } else {
      this.globalService.showToast(
        '¡Para guardar un servicio debes completar los campos!'
      );
    }
  }

  async tomarFoto(tipo) {
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Seleccionar fotos',
      message: '¿Cómo desea agregar las fotos?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Tomar foto',
          handler: () => {
            this.tomarFotoIndividual(tipo);
          },
        },
        {
          text: 'Seleccionar múltiples',
          handler: () => {
            this.seleccionarMultiplesFotos(tipo);
          },
        },
      ],
    });

    await alert.present();
  }

  async tomarFotoIndividual(tipo) {
    try {
      let opciones = {
        quality: 70,
        saveToGallery: true,
        allowEditing: Capacitor.getPlatform() === 'ios',
        correctOrientation: true,
        source: CameraSource.Camera,
        direction: CameraDirection.Rear,
        resultType: CameraResultType.Base64,
      };

      const image = await Camera.getPhoto(opciones);

      if (!image.base64String) {
        throw new Error('No se pudo obtener la imagen');
      }

      let nombreFoto = Date.now().toString();

      // Procesar y guardar imagen
      const fotoObj = await this.procesarYGuardarImagen(image.base64String, nombreFoto);
      fotoObj.webPath = image.webPath || '';

      console.log('Foto individual procesada y guardada:', fotoObj);

      if (tipo === 'pre') {
        this.fotospre.push(fotoObj);
        console.log('Agregada a fotospre. Total:', this.fotospre.length);
      }

      if (tipo === 'post') {
        this.fotospost.push(fotoObj);
        console.log('Agregada a fotospost. Total:', this.fotospost.length);
      }

      // Forzar detección de cambios
      this.cdr.detectChanges();
      
      // Verificar estado después de agregar foto
      setTimeout(() => {
        this.verificarEstadoFotos();
      }, 100);

      this.globalService.showToast('Foto guardada correctamente', 'success');
    } catch (error: any) {
      console.error('Error tomando foto:', error);
      this.globalService.showToast('Error al procesar la foto: ' + (error.message || 'Error desconocido'), 'danger');
    }
  }

  async seleccionarMultiplesFotos(tipo) {
    try {
      // Para selección múltiple desde galería
      const images = await Camera.pickImages({
        quality: 70,
        limit: 10, // Máximo 10 fotos
      });

      console.log('Imágenes seleccionadas:', images.photos);

      this.globalService.showLoading(`Procesando ${images.photos.length} imágenes...`);

      for (let i = 0; i < images.photos.length; i++) {
        const image = images.photos[i];
        
        let nombreFoto = Date.now().toString() + '_' + i;

        try {
          // Convertir la imagen a base64 usando fetch
          const response = await fetch(image.webPath!);
          const blob = await response.blob();
          const base64Data = await this.convertBlobToBase64(blob);
          
          // Procesar y guardar imagen
          const fotoObj = await this.procesarYGuardarImagen(base64Data, nombreFoto);
          fotoObj.webPath = image.webPath || '';
          fotoObj.path = image.path || '';

          console.log('Imagen procesada y guardada:', i + 1, 'de', images.photos.length);

          if (tipo === 'pre') {
            this.fotospre.push(fotoObj);
          }

          if (tipo === 'post') {
            this.fotospost.push(fotoObj);
          }
        } catch (error: any) {
          console.error(`Error procesando imagen ${i + 1}:`, error);
          // Continuar con las demás imágenes aunque falle una
        }
      }

      this.globalService.stopLoading();

      // Forzar detección de cambios
      this.cdr.detectChanges();
      
      // Verificar estado después de agregar fotos
      setTimeout(() => {
        this.verificarEstadoFotos();
      }, 100);
      
      this.globalService.showToast(`Se procesaron ${images.photos.length} fotos`, 'success');
      
    } catch (error: any) {
      this.globalService.stopLoading();
      console.error('Error seleccionando múltiples fotos:', error);
      this.globalService.showToast('Error al seleccionar las fotos: ' + (error.message || 'Error desconocido'), 'danger');
    }
  }

  /**
   * Comprime una imagen reduciendo su tamaño y calidad
   */
  private async comprimirImagen(base64Data: string, maxWidth: number = 1920, maxHeight: number = 1920, quality: number = 0.7): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        // Crear canvas para redimensionar
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('No se pudo obtener contexto del canvas'));
          return;
        }

        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir a base64 con calidad reducida
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        // Extraer solo la parte base64 (sin el prefijo)
        const base64Clean = compressedBase64.split(',')[1];
        resolve(base64Clean);
      };
      img.onerror = reject;
      img.src = 'data:image/jpeg;base64,' + base64Data;
    });
  }

  private convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Extraer solo la parte base64 (sin el prefijo data:image/...)
        const base64Clean = base64.split(',')[1];
        resolve(base64Clean);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Procesa y guarda una imagen: comprime y guarda como archivo
   */
  private async procesarYGuardarImagen(base64Data: string, nombreFoto: string): Promise<{ id: string; rutaArchivo: string; base64: string; webPath?: string; path?: string }> {
    try {
      // Comprimir imagen (sin mostrar loading para cada una, solo para múltiples)
      const base64Comprimido = await this.comprimirImagen(base64Data, 1920, 1920, 0.7);

      // Guardar como archivo
      const rutaArchivo = await this.offlineService.guardarImagen(base64Comprimido, nombreFoto);

      return {
        id: nombreFoto,
        rutaArchivo: rutaArchivo,
        base64: base64Comprimido // Mantener base64 para preview inmediato
      };
    } catch (error: any) {
      console.error('Error procesando imagen:', error);
      throw error;
    }
  }

  async removeImagen(tipo, indice, item) {
    console.log('REMOVE', item, tipo, indice)
    let preview;
    if (!!item.webPath) {
      preview = item.webPath;
    } else if (item.base64) {
      preview = 'data:image/jpeg;base64,' + item.base64;
    } else {
      preview = this.globalService.url_multimedias + item.id + '.jpeg';
    }
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Eliminar imagen',
      message: `
        ¿Está seguro que desea eliminar esta imagen?<br/>
        <img src="${preview}" class="ion-padding-top">
        `,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Aceptar',
          handler: async () => {
            try {
              console.log('TIPO', tipo, indice)
              
              // Eliminar archivo físico si existe
              if (item.rutaArchivo) {
                try {
                  await this.offlineService.eliminarImagen(item.rutaArchivo);
                } catch (error) {
                  console.error('Error eliminando archivo físico:', error);
                  // Continuar aunque falle la eliminación del archivo
                }
              }
              
              // Eliminar de la lista
              switch (tipo) {
                case 'pre':
                  this.fotospre.splice(indice, 1);
                  break;
                case 'post':
                  this.fotospost.splice(indice, 1);
                  break;
              }
              
              this.cdr.detectChanges();
            } catch (error) {
              console.error('Error eliminando imagen:', error);
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async modalRepuesto() {
    const modal = await this.modalController.create({
      component: RepuestosPage,
      componentProps: {
        editarRepuestos: this.servicio.repuestos,
      },
    });

    modal.onWillDismiss().then((data) => {
      if (!!data.data) {
        this.servicio.repuestos = data.data;
      }
    });

    return await modal.present();
  }

  async modalTrabajos() {
    const modal = await this.modalController.create({
      component: TrabajosPage,
      componentProps: {
        editarTrabajos: this.servicio.trabajos,
      },
    });

    modal.onWillDismiss().then((data) => {
      if (!!data.data) {
        this.servicio.trabajos = data.data;
      }
    });

    return await modal.present();
  }

  seleccionTipoServicio(tipo) {
    console.log('TIPO', tipo)
    this.tipoServicio = tipo;
    this.siguientePaso();
    this.habilitarCampos(tipo);
  }

  async abrirImagen(img) {
    if (!!img.path || !!img.webPath) {
      let imagenUrl = img;
      var options = {
        share: true, // default is false
        closeButton: true, // default is true
        copyToReference: true, // default is false
      };
      this.photoViewer.show(imagenUrl, '', options);
    } else {
      await Browser.open({
        url: `${this.globalService.url_multimedias}${img.id}.jpeg`,
      });
    }
  }

  filtrarMarcasSegunServicio() {
    this.marcasDisponibles = this.marcasCargadas;
    console.log('MARCA DISP', this.marcasDisponibles)
  }

  getSrc(item) {
    if (!item) {
      return '';
    }
    
    // Prioridad 1: base64 (para preview inmediato)
    if (item.base64 && item.base64 !== '') {
      return 'data:image/jpeg;base64,' + item.base64;
    }
    
    // Prioridad 2: webPath (para preview temporal)
    if (item.webPath && item.webPath !== '') {
      return item.webPath;
    }
    
    // Prioridad 3: rutaArchivo (cargar desde archivo guardado)
    if (item.rutaArchivo) {
      // En este caso, el base64 debería estar disponible
      // Si no está, podríamos cargarlo desde el archivo, pero por ahora usamos base64
      return '';
    }
    
    return '';
  }
}
