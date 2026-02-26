import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from '../../../../services/global.service';
import { ManualesService } from '../../../../services/manuales.service';
import { FilePicker } from '@robingenz/capacitor-file-picker';

@Component({
  selector: 'app-manuales-form',
  templateUrl: './manuales-form.page.html',
  styleUrls: ['./manuales-form.page.scss'],
})
export class ManualesFormPage implements OnInit {

  dataEditar;
  pdf;

  //Formulario
  manualForm = this.formBuilder.group({
    id: [''],
    nombre: ['', [ Validators.required, Validators.maxLength(100)]],
    descripcion:['', [Validators.maxLength(100)]],
  })

  //Getters
  get nombre() {
    return this.manualForm.get("nombre");
  }
  get descripcion() {
    return this.manualForm.get("descripcion");
  }

  //Mensajes de error
  errorMessages = {
    nombre: [{ type: 'required', message: 'Se requiere un nombre' }],
    descripcion: [{ type: 'required', message: 'Se requiere una descripcion' }],
  }

  constructor(
    private globalService: GlobalService,
    private formBuilder: FormBuilder,
    private manualesService: ManualesService,
    private activatedRoute: ActivatedRoute,
    private router: Router,

  ) {
    this.manualForm.get('id').disable();
    this.activatedRoute.params.subscribe((params: any) => {
      if (Object.entries(params).length !== 0) {
        this.dataEditar = params;
        this.manualForm.get('id').enable();
        this.cargarForm();
      }
    });
  }

  ngOnInit() {
  }

  cargarForm(){
    this.manualForm.patchValue({
      id: this.dataEditar.id,
      nombre: this.dataEditar.nombre,
      descripcion: this.dataEditar.descripcion,
    })
  }

  async previewFile() {
    try {
      this.pdf = await FilePicker.pickFiles({
        types: ['application/pdf'],
        multiple: false,
        readData: true,
      });

      if (this.pdf && this.pdf.files && this.pdf.files.length > 0) {
        console.log('Archivo seleccionado:', this.pdf.files[0]);
        this.globalService.showToast('Archivo PDF seleccionado correctamente', 'success');
      }
    } catch (error) {
      console.error('Error seleccionando archivo:', error);
      this.globalService.showToast('Error al seleccionar el archivo', 'error');
    }
  }

  async submit(){
    try {
      this.globalService.showLoading();
      
      // Verificar si es crear o editar
      const esEdicion = this.dataEditar && this.dataEditar.id;
      
      // En creación, verificar que se haya seleccionado un archivo
      if (!esEdicion && (!this.pdf || !this.pdf.files || !this.pdf.files[0])) {
        this.globalService.showToast('Debe seleccionar un archivo PDF', 'error');
        this.globalService.stopLoading();
        return;
      }

      // Preparar los datos del formulario
      const formData = this.manualForm.value;
      if (esEdicion) {
        formData.id = this.dataEditar.id; // Asegurar que el ID esté incluido
      }

      let observable;
      
      if (esEdicion) {
        // Para edición, usar el archivo existente o el nuevo si se seleccionó
        const archivoData = this.pdf && this.pdf.files && this.pdf.files[0] 
          ? this.pdf.files[0].data 
          : null;
        
        observable = await this.manualesService.actualizar(formData, archivoData);
      } else {
        // Para creación, usar el archivo seleccionado
        observable = await this.manualesService.guardar(this.pdf.files[0].data, formData);
      }
      
      observable.subscribe({
        next: (response) => {
          if (response && response.mensaje && response.mensaje.tipo === 'success') {
            const mensaje = esEdicion ? 'Manual actualizado exitosamente!' : 'Manual guardado exitosamente!';
            this.globalService.showToast(mensaje, 'success');
            this.router.navigate(['/abm/manuales-listar']);
          } else {
            const mensaje = esEdicion ? 'Error al actualizar el manual' : 'Error al guardar el manual';
            this.globalService.showToast(mensaje, 'error');
          }
          this.globalService.stopLoading();
        },
        error: (error) => {
          console.error('Error guardando manual:', error);
          const mensaje = esEdicion ? 'Error al actualizar el manual' : 'Error al guardar el manual';
          this.globalService.showToast(mensaje, 'error');
          this.globalService.stopLoading();
        }
      });
    } catch (error) {
      console.error('Error preparando guardado:', error);
      this.globalService.showToast('Error al preparar el guardado', 'error');
      this.globalService.stopLoading();
    }
  }

}
