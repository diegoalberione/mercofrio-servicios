import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OfflineService {

  hayInternet;
  private readonly MAX_JSON_SIZE = 50 * 1024 * 1024; // 50MB máximo

  constructor() {
    Filesystem.requestPermissions()
    this.solicitarPermisos();
  }

  async solicitarPermisos() {
    const status = await Filesystem.checkPermissions();
    if (status.publicStorage !== 'granted') {
      const response = await Filesystem.requestPermissions();
      if (response.publicStorage !== 'granted') {
        throw new Error("Permiso denegado para el almacenamiento");
      }
    }
  }

  /**
   * Estima el tamaño del JSON sin stringificar completamente
   */
  private estimarTamañoJSON(data: any): number {
    try {
      // Usar una muestra pequeña para estimar
      const muestra = JSON.stringify(data).substring(0, 1000);
      const tamañoMuestra = new Blob([muestra]).size;
      // Estimación aproximada (puede variar pero es útil para detectar problemas grandes)
      return tamañoMuestra * 100; // Estimación conservadora
    } catch (e) {
      return 0;
    }
  }

  async escribirDatos(pFile, pData){
    console.log(`=== ESCRIBIENDO ARCHIVO ${pFile} ===`);
    console.log('Datos a escribir:', pData);
    
    let pData_JSON: string;
    
    try {
      // Validar tamaño estimado antes de stringify
      const tamañoEstimado = this.estimarTamañoJSON(pData);
      if (tamañoEstimado > this.MAX_JSON_SIZE) {
        throw new Error(`Los datos son demasiado grandes (estimado: ${Math.round(tamañoEstimado / 1024 / 1024)}MB). Máximo permitido: ${this.MAX_JSON_SIZE / 1024 / 1024}MB`);
      }

      // Intentar stringify con manejo de errores
      try {
        pData_JSON = JSON.stringify(pData);
      } catch (stringifyError: any) {
        if (stringifyError.message && stringifyError.message.includes('circular')) {
          throw new Error('Error: Los datos contienen referencias circulares que no se pueden serializar');
        } else if (stringifyError.message && stringifyError.message.includes('memory')) {
          throw new Error('Error: No hay suficiente memoria para procesar los datos. Intente con menos imágenes.');
        } else {
          throw new Error(`Error al convertir datos a JSON: ${stringifyError.message || 'Error desconocido'}`);
        }
      }

      // Validar tamaño real después de stringify
      const tamañoReal = new Blob([pData_JSON]).size;
      if (tamañoReal > this.MAX_JSON_SIZE) {
        throw new Error(`Los datos son demasiado grandes (${Math.round(tamañoReal / 1024 / 1024)}MB). Máximo permitido: ${this.MAX_JSON_SIZE / 1024 / 1024}MB`);
      }

      console.log(`Tamaño del JSON: ${Math.round(tamañoReal / 1024)}KB`);
      
      const result = await Filesystem.writeFile({
        path: pFile,
        data: pData_JSON,
        directory: Directory.Data,
        encoding: Encoding.UTF8
      })
      console.log('Archivo escrito exitosamente:', result);
      return result;
    } catch(e: any) {
      console.error('Error escribiendo archivo:', e);
      // Mejorar mensaje de error para el usuario
      if (e.message) {
        throw new Error(e.message);
      } else {
        throw new Error(`Error al guardar: ${e.toString()}`);
      }
    }
  }

  /**
   * Guarda una imagen como archivo separado y retorna la referencia
   */
  async guardarImagen(base64Data: string, nombreArchivo: string): Promise<string> {
    try {
      // Crear directorio de imágenes si no existe
      const imagenesDir = 'imagenes_servicios';
      try {
        await Filesystem.mkdir({
          path: imagenesDir,
          directory: Directory.Data,
          recursive: true
        });
      } catch (e) {
        // El directorio ya existe, continuar
      }

      // Guardar imagen
      const rutaArchivo = `${imagenesDir}/${nombreArchivo}.jpeg`;
      await Filesystem.writeFile({
        path: rutaArchivo,
        data: base64Data,
        directory: Directory.Data,
        encoding: Encoding.UTF8
      });

      return rutaArchivo;
    } catch (error: any) {
      console.error('Error guardando imagen:', error);
      throw new Error(`Error al guardar imagen: ${error.message || 'Error desconocido'}`);
    }
  }

  /**
   * Lee una imagen guardada como archivo
   */
  async leerImagen(rutaArchivo: string): Promise<string> {
    try {
      const contenido = await Filesystem.readFile({
        path: rutaArchivo,
        directory: Directory.Data,
        encoding: Encoding.UTF8
      });
      return contenido.data as string;
    } catch (error: any) {
      console.error('Error leyendo imagen:', error);
      throw new Error(`Error al leer imagen: ${error.message || 'Error desconocido'}`);
    }
  }

  /**
   * Elimina una imagen guardada
   */
  async eliminarImagen(rutaArchivo: string): Promise<void> {
    try {
      await Filesystem.deleteFile({
        path: rutaArchivo,
        directory: Directory.Data
      });
    } catch (error: any) {
      console.error('Error eliminando imagen:', error);
      // No lanzar error si el archivo no existe
    }
  }

  async leerDatos(pFile) {
    console.log(`=== LEYENDO ARCHIVO ${pFile} ===`);
    try{
      let contents = await Filesystem.readFile({
        path: pFile,
        directory: Directory.Data,
        // directory: Directory.Documents,
        encoding: Encoding.UTF8
      });
      console.log('Contenido crudo del archivo:', contents.data);
      const parsedData = JSON.parse(contents.data);
      console.log('Datos parseados:', parsedData);
      return parsedData;
    }catch(e){
      console.log('Error leyendo archivo:', e);
      console.log('Inicializando archivo vacío...');
      const emptyData = { visitas: [] };
      await this.escribirDatos(pFile, emptyData);
      return emptyData;
    }
  }

}
