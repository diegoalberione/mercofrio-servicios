import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ClientesService } from 'src/app/services/clientes.service';
import { GlobalService } from 'src/app/services/global.service';
import { LineasService } from 'src/app/services/lineas.service';
import { MarcasService } from 'src/app/services/marcas.service';
import { ModelosService } from 'src/app/services/modelos.service';
import { OfflineService } from 'src/app/services/offline.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { VehiculosService } from 'src/app/services/vehiculos.service';
import { VisitasService } from 'src/app/services/visitas.service';
import { Browser } from '@capacitor/browser';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
@Component({
  selector: 'app-visita-info',
  templateUrl: './visita-info.page.html',
  styleUrls: ['./visita-info.page.scss'],
})
export class VisitaInfoPage implements OnInit {
  visitaID;
  esAdmin = false;
  visita: any = {
    //Tipado any para que no explote la build --prod
    id: '',
    vehiculo: {
      patente: 'Cargando...',
    },
    vehiculo_id: '',
    nro_visita: '',
    km_recorridos: '',
    horas_viaje: '',
    responsable_usuario_id: '',
    responsable: {
      nombres: 'Cargando...',
      apellido: '',
    },
    cliente: {
      nombres: 'Cargando...',
    },
    cliente_usuario_id: '',
    fecha: '',
    horas_trabajadas: '',
    servicios: [
      {
        marca: {
          id: '',
          nombre: '',
        },
        linea: {
          id: '',
          nombre: '',
          marca_id: '',
        },
        modelo: {
          id: '',
          nombre: '',
          linea_id: '',
        },
        marca_id: '',
        linea_id: '',
        modelo_id: '',
        servicio_nro: '',
        equipo_nro: '',
        titulo: '',
        descripcion: '',
        horas_marcha: '',
        en_garantia: '',
        multimedias: [],
        serviciostipo_id: '',
        fotos_pre: [],
        fotos_post: [],
        trabajos: [],
        repuestos: [],
      },
    ],
  };

  servicioMultimedias = [
    {
      fotos_pre: [],
      fotos_post: [],
    },
  ];

  constructor(
    public globalService: GlobalService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    private offlineService: OfflineService,
    private visitasService: VisitasService,
    private vehiculosService: VehiculosService,
    private clienteService: ClientesService,
    private marcasService: MarcasService,
    private lineasService: LineasService,
    private modelosService: ModelosService,
    private usuariosService: UsuariosService
  ) {
    this.activatedRoute.params.subscribe((params: any) => {
      if (!!params.pData) {
        this.visitaID = JSON.parse(params.pData);
        this.globalService.showLoading();
      }
    });
  }

  ngOnInit() {
    this.verificarAdmin();
    this.cargarVisita();
  }

  cargarVisita() {
    this.visitasService.listarVisitaId(this.visitaID).subscribe((res) => {
      this.visita = res.visitas[0];

      console.log(this.visita);

      // Cargar datos relacionados de forma asíncrona
      Promise.all([
        this.cargarResponsable(),
        this.cargarVehiculo(),
        this.cargarCliente()
      ]).then(() => {
        this.procesarMultimedias(res);
        this.globalService.stopLoading();
      }).catch(error => {
        console.error('Error cargando datos relacionados:', error);
        this.globalService.stopLoading();
      });
    });
  }

  private async cargarResponsable() {
    return new Promise((resolve, reject) => {
      this.usuariosService
        .listarID(this.visita.responsable_usuario_id)
        .subscribe({
          next: (res) => {
          this.visita.responsable = res.usuarios[0];
            resolve(res);
          },
          error: reject
        });
    });
  }

  private async cargarVehiculo() {
    return new Promise((resolve, reject) => {
      this.vehiculosService
        .listarId(this.visita.vehiculo_id)
        .subscribe({
          next: (res) => {
          this.visita.vehiculo = res.vehiculos[0];
            resolve(res);
          },
          error: reject
        });
    });
  }

  private async cargarCliente() {
    return new Promise((resolve, reject) => {
      this.clienteService
        .listarClientesID(this.visita.cliente_usuario_id)
        .subscribe({
          next: (res) => {
          this.visita.cliente = res.usuarios[0];
            resolve(res);
          },
          error: reject
        });
    });
  }

  private procesarMultimedias(res: any) {
    // Inicializar servicioMultimedias con un elemento por cada servicio
    this.servicioMultimedias = [];
    for (let i = 0; i < this.visita.servicios.length; i++) {
      this.servicioMultimedias.push({
        fotos_pre: [],
        fotos_post: []
        });
    }

      for (
        let servicioIndex = 0;
        servicioIndex < this.visita.servicios.length;
        servicioIndex++
      ) {
      // Verificar que el servicio tenga multimedias
      if (res.visitas[0].servicios[servicioIndex].multimedias && 
          res.visitas[0].servicios[servicioIndex].multimedias.length > 0) {
        
        for (
          let indexMultimedias = 0;
          indexMultimedias <
          res.visitas[0].servicios[servicioIndex].multimedias.length;
          indexMultimedias++
        ) {
          if (
            res.visitas[0].servicios[servicioIndex].multimedias[
              indexMultimedias
            ].tipo === 0
          ) {
            this.servicioMultimedias[servicioIndex].fotos_pre.push(
              res.visitas[0].servicios[servicioIndex].multimedias[
              indexMultimedias
              ]
            );
          } else {
            this.servicioMultimedias[servicioIndex].fotos_post.push(
              res.visitas[0].servicios[servicioIndex].multimedias[
              indexMultimedias
              ]
            );
          }
        }
      }
    }
  }

  async abrirImagen(img) {
    await Browser.open({
      url: `${this.globalService.url_multimedias}${img}`,
    });
  }

  async alertaEditarVisita() {
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Editar visita',
      message: '¿Está seguro que desea editar esta visita?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Aceptar',
          handler: async () => {
            await this.descargarVisita();
            this.alertaVisitaDescargada();
          },
        },
      ],
    });

    alert.present();
  }

  async descargarVisita() {
    let JSONvisitas = await this.offlineService.leerDatos('visitas.json');

    if (!JSONvisitas.visitas) {
      JSONvisitas = {
        visitas: []
      };
    }

    // Procesar multimedias de cada servicio antes de guardar
    if (this.visita.servicios && this.visita.servicios.length > 0) {
      for (let servicio of this.visita.servicios) {
        if (servicio.multimedias && servicio.multimedias.length > 0) {
          // Inicializar arrays de fotos
          servicio.fotos_pre = [];
          servicio.fotos_post = [];

          for (let multimedia of servicio.multimedias) {
            try {
              // Convertir multimedia a base64
              const base64 = await this.convertirMultimediaABase64(multimedia);
              
              if (base64) {
                const fotoObj = {
                  id: multimedia.id.toString(),
                  base64: base64
                };

                // Organizar por tipo
                if (multimedia.tipo === 0) {
                  servicio.fotos_pre.push(fotoObj);
                } else if (multimedia.tipo === 1) {
                  servicio.fotos_post.push(fotoObj);
                }
              }
            } catch (error) {
              console.error('Error convirtiendo multimedia:', error);
            }
          }
          servicio.multimedias = [];
        }
      }
    }

    // Verificar si la visita ya existe en JSONvisitas.visitas
    const visitaExiste = JSONvisitas.visitas.some((visita: any) => visita.id === this.visita.id);

    if (!visitaExiste) {
      JSONvisitas.visitas.push(this.visita);
      await this.offlineService.escribirDatos('visitas.json', JSONvisitas);
    } else {
      console.log(`La visita con id ${this.visita.id} ya existe en JSONvisitas.visitas, no la agrega.`);
    }
  }

  async convertirMultimediaABase64(multimedia: any): Promise<string> {
    try {
      // Construir la URL de la imagen
      const imageUrl = `${this.globalService.url_multimedias}${multimedia.codigo}`;
      
      // Hacer fetch de la imagen
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Convertir a blob
      const blob = await response.blob();
      
      // Convertir blob a base64
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
    } catch (error) {
      console.error('Error convirtiendo multimedia a base64:', error);
      return null;
    }
  }


  async alertaVisitaDescargada() {
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Visita descargada',
      message: `
        Ya puedes editar la visita.
      `,
      buttons: [
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

  getEstado(id) {
    switch (id) {
      case 0:
        return 'En proceso';
        break;
      case 1:
        return 'Finalizada';
        break;
      case 2:
        return 'Notificada';
        break;
      default:
        return 'No definido';
        break;
    }
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

  garantia(aux) {
    if (!aux) {
      return 'No';
    }
    return 'Si';
  }

  async notificarVisita() {
    const correosConfirmados = await this.solicitarCorreosNotificacion();
    if (!correosConfirmados) {
      return;
    }

    if (this.visita.id) {
      const alert = await this.alertController.create({
        mode: 'ios',
        header: 'Notificar visita',
        message: `Está seguro que desea notificar la visita?`,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
          },
          {
            text: 'Aceptar',
            handler: async () => {
              this.globalService.showLoading();
              await this.visitasService
                .notificarVisita(this.visita)
                .pipe(
                  catchError(async (error) => {
                    this.globalService.stopLoading();
                    if (error.status === 500) {
                      const errorAlert = await this.alertController.create({
                        mode: 'ios',
                        header: 'Error',
                        message:
                          'Ha ocurrido un error en el servidor. Por favor, inténtelo de nuevo.',
                        buttons: ['Aceptar'],
                      });
                      await errorAlert.present();
                    }
                    return of(null); // Manejar el error devolviendo un observable vacío
                  })
                )
                .subscribe(async (res) => {
                  this.globalService.stopLoading();
                  const alert2 = await this.alertController.create({
                    mode: 'ios',
                    header: 'Visita',
                    message: res.mensaje.texto,
                    buttons: [
                      {
                        text: 'Aceptar',
                        handler: () => {
                          this.globalService.showLoading();
                          this.cargarVisita();
                        },
                      },
                    ],
                  });

                  alert2.present();
                });
            },
          },
        ],
      });

      await alert.present();
    } else {
      const alert = await this.alertController.create({
        mode: 'ios',
        header: 'Guardar visita',
        message: `
          Primero debe guardar la visita.
        `,
        buttons: [
          {
            text: 'Aceptar',
            handler: () => { },
          },
        ],
      });

      alert.present();
    }
  }

  /**
   * Muestra un prompt con los correos actuales para que el usuario pueda revisarlos/editar.
   * Retorna true si el usuario confirma con correos válidos.
   */
  private async solicitarCorreosNotificacion(): Promise<boolean> {
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Correos a notificar',
      message: 'Revise o modifique los correos separados por coma antes de notificar.',
      inputs: [
        {
          name: 'emails',
          type: 'textarea',
          value: this.visita?.firma_emails_notificar || '',
          attributes: {
            rows: 4,
            autocapitalize: 'off'
          },
          placeholder: 'correo1@empresa.com, correo2@empresa.com'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Continuar',
          handler: (data) => {
            this.visita.firma_emails_notificar = (data?.emails || '').trim();
            return this.validarCorreosNotificacion();
          }
        }
      ]
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role !== 'cancel';
  }

  /**
   * Valida los correos cargados en firma_emails_notificar.
   * Permite múltiples correos separados por comas y limpia espacios extra.
   */
  private validarCorreosNotificacion(): boolean {
    const rawEmails = this.visita?.firma_emails_notificar;

    // Si no hay correos cargados no se valida (el backend usará valores por defecto)
    if (!rawEmails || rawEmails.trim() === '') {
      return true;
    }

    const cadenaLimpia = rawEmails.trim();

    if (/\r|\n/.test(cadenaLimpia)) {
      this.globalService.showAlert(
        'Correos inválidos',
        'No se permiten saltos de línea. Ingrese todos los correos en una sola línea separados por coma.'
      );
      return false;
    }
    const caracteresValidos = /^[A-Za-z0-9@._,+\- ]+$/;

    if (!caracteresValidos.test(cadenaLimpia)) {
      this.globalService.showAlert(
        'Correos inválidos',
        'Solo se permiten letras, números, @, puntos, guiones y comas para separar los correos.'
      );
      return false;
    }

    const correos = cadenaLimpia
      .split(',')
      .map((correo) => correo.trim())
      .filter((correo) => correo !== '');

    if (correos.length === 0) {
      this.globalService.showAlert(
        'Correos inválidos',
        'Debe ingresar correos válidos separados por coma.'
      );
      return false;
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const correoInvalido = correos.find((correo) => !emailRegex.test(correo));

    if (correoInvalido) {
      this.globalService.showAlert(
        'Correo inválido',
        `El correo "${correoInvalido}" no tiene un formato válido. Revíselo e intente nuevamente.`
      );
      return false;
    }

    // Normalizar cadena para enviar al backend
    this.visita.firma_emails_notificar = correos.join(', ');
    return true;
  }

  verificarAdmin() {
    const usuario = this.usuariosService.getUsuario();
    this.esAdmin = usuario && usuario.usuariosgrupo_id === 1;
  }

  async alertaEliminarVisita() {
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Eliminar visita',
      message: '¿Está seguro que desea eliminar esta visita? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          cssClass: 'danger',
          handler: async () => {
            await this.eliminarVisita();
          },
        },
      ],
    });

    alert.present();
  }

  async eliminarVisita() {
    this.globalService.showLoading();
    
    this.visitasService.eliminarVisita(this.visita.id).subscribe({
      next: async (res) => {
        this.globalService.stopLoading();
        const alert = await this.alertController.create({
          mode: 'ios',
          header: 'Visita eliminada',
          message: 'La visita ha sido eliminada correctamente.',
          buttons: [
            {
              text: 'Aceptar',
              handler: () => {
                this.router.navigate(['/visitas-listar']);
              },
            },
          ],
        });
        alert.present();
      },
      error: async (error) => {
        this.globalService.stopLoading();
        const errorAlert = await this.alertController.create({
          mode: 'ios',
          header: 'Error',
          message: 'Ha ocurrido un error al eliminar la visita. Por favor, inténtelo de nuevo.',
          buttons: ['Aceptar'],
        });
        errorAlert.present();
      }
    });
  }

  async descargarPDF() {
    if (!this.visita.id || !this.visita.cliente_usuario_id) {
      this.globalService.showAlert('Error', 'No se puede generar el PDF. Faltan datos de la visita.');
      return;
    }

    try {
      this.globalService.showLoading('Generando PDF...');
      
      // Construir la URL del PDF
      const pdfUrl = `https://qapp.com.ar/mercofrio/api2/visitas/pdf/${this.visita.id}/${this.visita.cliente_usuario_id}`;
      
      console.log('Descargando PDF desde:', pdfUrl);
      
      // Abrir el PDF en el navegador para descarga
      await Browser.open({ 
        url: pdfUrl,
        windowName: '_blank'
      });
      
      this.globalService.stopLoading();
      this.globalService.showToast('PDF generado correctamente', 'success');
      
    } catch (error) {
      this.globalService.stopLoading();
      console.error('Error al descargar PDF:', error);
      this.globalService.showAlert('Error', 'No se pudo generar el PDF. Por favor, inténtelo de nuevo.');
    }
  }
}