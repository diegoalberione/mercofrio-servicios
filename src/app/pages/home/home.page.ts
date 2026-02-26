import { GlobalService } from 'src/app/services/global.service';
import { UsuariosService } from './../../services/usuarios.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SincronizarService } from 'src/app/services/sincronizar.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { version } from '../../../environments/version';
import { SwUpdate } from '@angular/service-worker';
import { AlertController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  version = version;
  usuarioLogeado;

  historialVisitas;
  visitaSeleccionada;
  consultasTecnicas;
  consultaSeleccionada;

  constructor(
    private router: Router,
    private usuariosService: UsuariosService,
    private syncService: SincronizarService,
    public globalService: GlobalService,
    private clientesService: ClientesService,
    private swUpdate: SwUpdate,
    private alertController: AlertController,
    private platform: Platform
  ) {}

  ngOnInit() {
    this.usuariosService.getUsuarioLogueado().subscribe((user) => {
      this.usuarioLogeado = user;
    });
  }

  ionViewDidEnter() {
    this.verificarVersion();
  }

  /**
   * Compara dos versiones y retorna true si version1 es mayor que version2
   * Formato: "2.9.11" o "2.11" (puede tener 2 o 3 partes)
   * Si una versión tiene menos partes, la parte faltante se trata como 0
   */
  private esVersionMayor(version1: string, version2: string): boolean {
    const partes1 = version1.split('.').map(p => parseInt(p, 10));
    const partes2 = version2.split('.').map(p => parseInt(p, 10));

    // Normalizar a 3 partes (si falta alguna, es 0)
    while (partes1.length < 3) partes1.push(0);
    while (partes2.length < 3) partes2.push(0);

    // Comparar parte por parte
    for (let i = 0; i < 3; i++) {
      if (partes1[i] > partes2[i]) {
        return true; // version1 es mayor
      } else if (partes1[i] < partes2[i]) {
        return false; // version2 es mayor
      }
      // Si son iguales, continuar con la siguiente parte
    }

    return false; // Son iguales
  }

  async verificarVersion() {
    try {
      // Verificar si hay conexión a internet
      if (!this.globalService.hayInternet) {
        console.log('Sin conexión a internet, omitiendo verificación de versión');
        return;
      }

      // Construir la URL del endpoint de versión
      const versionUrl = `${this.globalService.getUrlApi()}/autenticacion/version`;
      
      const response = await fetch(versionUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        console.log('No se pudo verificar la versión:', response.status);
        return;
      }

      const data = await response.json();
      console.log('Versión del servidor:', data);
      console.log('Versión local:', this.version);

      // Comparar versiones: solo mostrar alerta si la versión del servidor es MAYOR que la local
      if (data && data.number && this.version.number) {
        const servidorEsMayor = this.esVersionMayor(data.number, this.version.number);
        
        if (servidorEsMayor) {
          console.log('Nueva versión disponible:', data.number, data.build);
          await this.mostrarAlertaActualizacion(data);
        } else {
          console.log('La aplicación está actualizada o tiene una versión más reciente');
        }
      }
    } catch (error) {
      console.error('Error verificando versión:', error);
      // No mostrar error al usuario para no interrumpir la experiencia
    }
  }

  async mostrarAlertaActualizacion(version: any) {
    const alert = await this.alertController.create({
      mode: 'ios',
      header: `Nueva versión ${version.number} (${version.build})`,
      message: `Hay una nueva versión disponible<br>¿Deseas actualizar la aplicación ahora?`,
      buttons: [
        {
          text: 'Más tarde',
          role: 'cancel',
        },
        {
          text: 'Actualizar',
          handler: async () => {
            // Verificar si es Android
            if (this.platform.is('android')) {
              await this.globalService.showAlert(
                'Actualización requerida',
                'Debe solicitar el instalador de la nueva versión al administrador del sistema.'
              );
            } else {
              // Si no es Android, ejecutar la actualización automática
              await this.forzarActualizacion();
            }
          },
        },
      ],
    });

    await alert.present();
  }

  goFormVisita() {
    this.router.navigate(['/form-servicio']);
  }

  async syncBasico(){
    try {
      if (!this.globalService.hayInternet) {
        this.globalService.showToast('No se puede sincronizar al no tener conexión a internet');
        return;
      }
  
      this.globalService.showLoading();
  
      await this.syncService.sincronizarBasico();
  
      this.globalService.showToast('Estás al día con los últimos cambios!');
    } catch (error) {
      console.error('Error al sincronizar:', error);
      this.globalService.showToast('Ocurrió un error al sincronizar. Inténtalo nuevamente.');
    } finally {
      this.globalService.stopLoading();
    }
  }

  logOut(){
    this.usuariosService.logout();
    this.router.navigate(['/login']);
  }

  goABM(){
    this.globalService.showToast('Función no disponible aún')
  }

  async forzarActualizacion() {
    try {
      console.log('Service Worker enabled:', this.swUpdate.isEnabled);
      console.log('Service Worker available:', 'serviceWorker' in navigator);
      
      if ('serviceWorker' in navigator) {
        await this.globalService.showLoading('Actualizando aplicación...');
        
        // Intentar forzar la actualización del service worker
        try {
          await this.swUpdate.checkForUpdate();
          console.log('Checking for updates...');
        } catch (error) {
          console.log('Error checking for updates:', error);
        }
        
        // Limpiar caché
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          console.log('Clearing caches:', cacheNames);
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        }
        
        await this.globalService.stopLoading();
        await this.globalService.showToast('Aplicación actualizada. Recargando en 5 segundos...', 'success');
        
        // Recargar manteniendo la ruta actual después de 5 segundos
        const currentPath = window.location.pathname;
        setTimeout(() => {
          window.location.href = currentPath;
        }, 5000);
      } else {
        await this.globalService.showToast('Service Worker no disponible', 'warning');
      }
    } catch (error) {
      console.error('Error al actualizar:', error);
      await this.globalService.stopLoading();
      await this.globalService.showToast('Error al actualizar la aplicación', 'danger');
    }
  }
}
