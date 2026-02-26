import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { DatePipe } from '@angular/common';
import Fuse from 'fuse.js';
import { Network } from '@capacitor/network';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  BASE_PROXY_URL = "/qapp";
  hayInternet;
  meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',];
  mesesShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Agos', 'Sep', 'Oct', 'Nov', 'Dic',];

  public url_api: string = "";
  public url_multimedias_chats: string = "";
  public url_multimedias: string = "";
  private empresaActiva = new BehaviorSubject<any>({});

  constructor(public http: HttpClient,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
    private datePipe: DatePipe,
    ) {
    this.url_api = '/api2';
    this.url_api = 'https://www.qapp.com.ar/mercofrio/api2';

    this.url_multimedias = 'https://www.qapp.com.ar/mercofrio/files/multimedias_v2/';



    Network.getStatus().then( res => {
      if(res.connected){
        this.hayInternet = true;
      }else{
        this.hayInternet = false;
      }
    })

    Network.addListener('networkStatusChange', (status) => {
      if(status.connected){
        this.hayInternet = true;
      }else{
        this.hayInternet = false;
      }
    });
  }

  setUrlApi(pUrl) {
    this.url_api = pUrl;
    localStorage.setItem("url_api", this.url_api);
  }

  getUrlApi() {
    return this.url_api;
  }

  empresa_activa = { id: 0 };
  getEmpresaActiva() {
    return this.empresaActiva.asObservable();
  }

  getEmpresaActivaId() {
    let emp = JSON.parse(localStorage.getItem("empresa_activa"));
    return emp.id;
  }

  getEmpresaActivaObjeto() {
    let emp = JSON.parse(localStorage.getItem("empresa_activa"));
    return emp;
  }

  setEmpresaActiva(pEmpresa) {
    localStorage.setItem("empresa_activa", JSON.stringify(pEmpresa));
    this.empresaActiva.next(pEmpresa);
  }

  getModuleAtt(nombreCompleto) {
    let nombres = nombreCompleto.split('.');
    let ret:any = null;
    let empresa = JSON.parse(localStorage.getItem("empresa_activa"));
    
    ret = empresa.modulos;
    if (!ret){ // si no existe devuelve
      return null
    }
    for (let i=0; i < nombres.length; i++){
      if (ret[nombres[i]]){
        ret = ret[nombres[i]];
      } else{ // si no existe devuelve
        return null;
      }
    }
    return ret;
  }

  verificarModuloActivo(idModulo) {
    let empresa = JSON.parse(localStorage.getItem("empresa_activa"));
    if (empresa.modulos) {
      for (let i=0; i < empresa.modulos.length; i++) {
        let modulo = empresa.modulos[i];
        if (modulo.modulo_id == idModulo) {
          return true;
        }
      };
    }
    return false;
  }

  /**
   * Verifica si la empresa tiene alguno de los IDs enviado
   * @param modulosIds array
   */
  verificarModulosActivo(modulosIds:any[]) {
    let empresa = JSON.parse(localStorage.getItem("empresa_activa"));
    if (empresa.modulos) {
      for (let i=0; i < empresa.modulos.length; i++) {
        let modulo = empresa.modulos[i];
        for (let k=0; k < modulosIds.length; k++) {
          let moduloIdParm = modulosIds[k];
          if (modulo.modulo_id == moduloIdParm) {
            return true;
          }
        }
      };
    }
    return false;
  }

  async showToast(pText, pColor?) {
    if(!pColor){
      pColor = "dark";
    }
    const toast = await this.toastController.create({
      message: pText,
      color: pColor,
      duration: 2000
    });
    toast.present();
  }

  loading;
  async showLoading(pText?) {
    if (!pText) {
      pText = "Por favor espere...";
    }
    this.loading = await this.loadingController.create({
      message: pText,
      duration: 2000
    });
    this.loading.present();
  }

  async updateLoadingMessage(pText: string) {
    if (this.loading) {
      this.loading.message = pText;
    }
  }

  stopLoading() {
    if (this.loading) {
      this.loading.dismiss();
    }
  }

  getDiaStringFromOrden(pOrden) {
    switch (pOrden) {
      case 0:
        return 'Feriados';
      case 1:
        return 'Domingo';
      case 2:
        return 'Lunes';
      case 3:
        return 'Martes';
      case 4:
        return 'Miércoles';
      case 5:
        return 'Jueves';
      case 6:
        return 'Viernes';
      case 7:
        return 'Sábado';
    }
  }

  async showAlert(header,message) {
    const alert = await this.alertController.create({
      mode: 'ios',
      header: header,
      message: message,
      buttons: ['Aceptar']
    });
  
    alert.present();
  }

  async verificarInternet(){
    Network.addListener('networkStatusChange', (status) => {
      if(!status.connected){
        this.hayInternet = false;
      }else{
        this.hayInternet = true;
      }
    });
  }

  getFecha(){
    let aux = new Date();
    return this.datePipe.transform(aux, 'yyyy-MM-dd');
  }

  async busquedaLocalTratada(lista, keys, parametro: string, buscaIds?){
    if (!lista || !Array.isArray(lista)) {
      console.warn("La lista proporcionada es nula o no es un array");
      this.showToast("No hay datos disponibles para buscar, sincronice los datos.", "warning");
      return [];
    }

    let options = {};

    console.log(lista, keys, parametro)
    if(buscaIds){
      options = {
        keys: keys,
        threshold: 0.3, 
      };
    }else{
      options = {
        keys: keys,
        threshold: 0.3,
        minMatchCharLength: 3,
      };
    }
    let fuse = new Fuse(lista, options);
    let resultadosRaw = fuse?.search(parametro, {limit: 100}) || [];
    
    if (!Array.isArray(resultadosRaw) || resultadosRaw.length === 0) {
      console.warn("La búsqueda no arrojó resultados.");
      this.showToast("No se encontraron resultados", "warning");
      return [];
    }
    
    console.log(resultadosRaw)
    let resultadosTratados = resultadosRaw.map(result => result.item).filter(item => item != null);

    if (resultadosTratados.length === 0) {
      this.showToast("No se encontraron resultados válidos", "warning");
    } else {
      this.showToast(`Se encontraron ${resultadosTratados.length} resultados`, "success");
    }

    console.log(resultadosTratados)
    return resultadosTratados;
  }

  async mostrarInfoVisita(visita: any) {
    const mensaje = `
      Cliente: ${visita.cliente.apellido}, ${visita.cliente.nombres}
      Fecha: ${visita.fecha}
      Vehículo: ${visita.vehiculo.marca} ${visita.vehiculo.modelo} (${visita.vehiculo.patente})
      Localidad: ${visita.localidad}
      Domicilio: ${visita.domicilio}
      Servicios: ${visita.servicios.length}
    `.trim();

    const toast = await this.toastController.create({
      message: mensaje,
      color: 'primary',
      duration: 5000,
      position: 'top',
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });

    toast.present();
  }

  async procesarVisitasJSON(jsonData: string) {
    try {
      const data = JSON.parse(jsonData);
      if (data.visitas && data.visitas.length > 0) {
        const visita = data.visitas[0]; // Tomamos la primera visita como ejemplo
        await this.mostrarInfoVisita(visita);
      } else {
        this.showToast("No hay visitas para mostrar", "warning");
      }
    } catch (error) {
      console.error("Error al procesar JSON:", error);
      this.showToast("Error al procesar los datos", "danger");
    }
  }

  async verificarActualizacionPWA() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          // Forzar la actualización del service worker
          await registration.update();
          
          // Verificar si hay una nueva versión disponible
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showToast("Nueva versión disponible. La aplicación se actualizará.", "primary");
                // Recargar la página para aplicar la actualización
                window.location.reload();
              }
            });
          });
        }
      } catch (error) {
        console.error('Error al verificar actualización:', error);
      }
    }
  }

  async limpiarCachePWA() {
    if ('caches' in window) {
      try {
        // Limpiar todas las cachés
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        
        // Forzar recarga de la página
        window.location.reload(true);
      } catch (error) {
        console.error('Error al limpiar caché:', error);
        this.showToast("Error al limpiar caché", "danger");
      }
    }
  }

  async forzarActualizacion() {
    await this.limpiarCachePWA();
    await this.verificarActualizacionPWA();
  }
}
