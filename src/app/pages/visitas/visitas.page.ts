import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { GlobalService } from 'src/app/services/global.service';
import { MultimediasService } from 'src/app/services/multimedias.service';
import { OfflineService } from 'src/app/services/offline.service';
import { VisitasService } from 'src/app/services/visitas.service';

@Component({
  selector: 'app-visitas',
  templateUrl: './visitas.page.html',
  styleUrls: ['./visitas.page.scss'],
})
export class VisitasPage implements OnInit {
  visitas = [];
  enviandoVisitas = false;
  progresoEnvio = {
    visitaActual: 0,
    totalVisitas: 0,
    porcentaje: 0,
    mensaje: ''
  };

  constructor(
    private offlineService: OfflineService,
    private alertController: AlertController,
    private router: Router,
    private visitaService: VisitasService,
    private multimediasService: MultimediasService,
    private globalService: GlobalService
  ) {}

  ngOnInit() {
    this.leerVisitasJSON();
  }

  ionViewDidEnter() {
    this.leerVisitasJSON();
  }

  async leerVisitasJSON() {
    try {
    let JSONvisitas = await this.offlineService.leerDatos('visitas.json');
      console.log('Datos leídos del archivo:', JSONvisitas);
      
    if (!!JSONvisitas && !!JSONvisitas.visitas) {
      this.visitas = JSONvisitas.visitas;
        console.log('Visitas cargadas:', this.visitas.length);
    } else {
        console.log('No hay visitas en el archivo, inicializando array vacío');
      let AuxVisitas = {
        visitas: [],
      };
      this.visitas = AuxVisitas.visitas;
        await this.offlineService.escribirDatos('visitas.json', AuxVisitas);
    }
      console.log("VISITAS final:", this.visitas);
    } catch (error) {
      console.error('Error leyendo visitas JSON:', error);
      this.visitas = [];
    }
  }

  async eliminarVisita(indice, visita?) {
    console.log('Eliminando visita:', indice, visita);
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Eliminar visita',
      message: `¿Está seguro que desea eliminar la visita al cliente ${visita.cliente.nombres}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Aceptar',
          handler: async () => {
            try {
              // Eliminar del array local
            this.visitas.splice(indice, 1);
              
              // Guardar el array actualizado en el archivo
            let AuxVisitas = {
                visitas: this.visitas
            };
              
            await this.offlineService.escribirDatos('visitas.json', AuxVisitas);
              console.log('Visita eliminada correctamente del archivo JSON');
              
              // Mostrar mensaje de confirmación
              this.globalService.showToast('Visita eliminada correctamente', 'success');
            } catch (error) {
              console.error('Error al eliminar visita:', error);
              this.globalService.showToast('Error al eliminar la visita', 'danger');
            }
          },
        },
      ],
    });

    await alert.present();
  }

  editarVisita(item, indice) {
    let datosVisita = {
      visita: item,
      indice: indice,
    };
    console.log("Datos visita", datosVisita);
    this.router.navigate(['/form-visita', JSON.stringify(datosVisita)]);
  }

  async sincronizarVisitas() {
    if (this.enviandoVisitas) {
      return; // Prevenir múltiples ejecuciones
    }

    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Enviar visitas',
      message: `¿Desea enviar ${this.visitas.length} visita(s) registrada(s)?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Aceptar',
          handler: async () => {
            this.enviandoVisitas = true;
            this.progresoEnvio.totalVisitas = this.visitas.length;
            this.progresoEnvio.visitaActual = 0;
            this.progresoEnvio.porcentaje = 0;
            
            this.globalService.showLoading('Preparando envío...');

            try {
              const totalVisitasEnviadas = this.visitas.length; // Guardar el total antes de limpiar
              
              for (
                let indexVisita = 0;
                indexVisita < this.visitas.length;
                indexVisita++
              ) {
                const visita = this.visitas[indexVisita];
                this.progresoEnvio.visitaActual = indexVisita + 1;
                this.progresoEnvio.porcentaje = Math.round(((indexVisita + 1) / this.visitas.length) * 100);
                
                const nombreCliente = visita.cliente?.nombres || 'Cliente';
                const mensajeProgreso = `Enviando visita ${this.progresoEnvio.visitaActual} de ${this.progresoEnvio.totalVisitas} (${this.progresoEnvio.porcentaje}%)\nCliente: ${nombreCliente}`;
                
                this.globalService.updateLoadingMessage(mensajeProgreso);
                this.progresoEnvio.mensaje = mensajeProgreso;
                
                await this.enviarVisitaIndividual(visita);
              }

              // Limpiar visitas después de enviar todas
              this.globalService.updateLoadingMessage('Finalizando...');
              await this.limpiarVisitasEnviadas();
              
              this.globalService.stopLoading();
              this.globalService.showAlert('Visitas enviadas', `Todas las ${totalVisitasEnviadas} visita(s) se enviaron correctamente.`);
              this.router.navigate(['/home']);
              
            } catch (error) {
              this.globalService.stopLoading();
              this.globalService.showAlert('Error', `Error al enviar visita ${this.progresoEnvio.visitaActual}. Algo salió mal, vuelve a intentarlo más tarde.`);
              console.error('Error enviando visitas:', error);
            } finally {
              this.enviandoVisitas = false;
              this.progresoEnvio = {
                visitaActual: 0,
                totalVisitas: 0,
                porcentaje: 0,
                mensaje: ''
              };
            }
          },
        },
      ],
    });
    alert.present();
  }

  private async enviarVisitaIndividual(visita: any): Promise<void> {
    return new Promise((resolve, reject) => {
      // Usar el nuevo endpoint guardarV2 con mejoras
      this.visitaService.enviarVisitaV2(visita).subscribe({
        next: (res) => {
          if (res.mensaje && res.mensaje.tipo === 'success') {
            resolve(res);
          } else {
            reject(new Error(res.mensaje?.texto || 'Error enviando visita'));
          }
        },
        error: (error) => {
          console.error('Error enviando visita:', error);
          // Si falla el nuevo endpoint, intentar con el antiguo como fallback
          this.visitaService.enviarVisita(visita).subscribe({
            next: (res) => {
              if (res.mensaje && res.mensaje.tipo === 'success') {
                resolve(res);
              } else {
                reject(new Error(res.mensaje?.texto || 'Error enviando visita'));
              }
            },
            error: (fallbackError) => {
              reject(fallbackError);
            }
          });
        }
      });
    });
  }

  private async limpiarVisitasEnviadas() {
    const visitasVacias = {
      visitas: []
    };
    await this.offlineService.escribirDatos('visitas.json', visitasVacias);
    this.visitas = [];
  }
}
