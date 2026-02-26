import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';
import { LineasService } from 'src/app/services/lineas.service';
import { ModelosService } from 'src/app/services/modelos.service';

@Component({
  selector: 'app-modelos-form',
  templateUrl: './modelos-form.page.html',
  styleUrls: ['./modelos-form.page.scss'],
})
export class ModelosFormPage implements OnInit {
  dataEditar;
  lineasDisponibles;
  lineaSeleccionada;
  //Formulario
  form = this.FormBuilder.group({
    id: [''],
    nombre: ['', [ Validators.required, Validators.maxLength(100)]],
    linea_id:['', [ Validators.required, Validators.maxLength(100)]],
    equipostipo_id:['', [ Validators.required, Validators.maxLength(100)]],
    descripcion:['', [ Validators.required, Validators.maxLength(100)]],
  })

  //Getters  
  get nombre() {
    return this.form.get("nombre");
  }
  get equipostipo_id() {
    return this.form.get("equipostipo_id");
  }
  get descripcion() {
    return this.form.get("descripcion");
  }

  //Mensajes de error
  errorMessages = {
    nombre: [{ type: 'required', message: 'Se requiere un nombre' }],
    equipostipo_id: [{ type: 'required', message: 'Se requiere un equipos tipo' }],
    descripcion: [{ type: 'required', message: 'Se requiere una descripcion' }],
  }

  constructor(
    private GlobalService: GlobalService,
    private FormBuilder: FormBuilder,
    private LineasService: LineasService,
    private ModelosService: ModelosService,
    private ActivatedRoute: ActivatedRoute,
    private Router: Router,

  ) {
    this.form.get('id').disable();
    this.ActivatedRoute.params.subscribe((params: any) => {
      if (Object.entries(params).length !== 0) {
        this.dataEditar = params;
        this.form.get('id').enable();
        this.cargarForm();
      }
    });
  }

  ngOnInit() {
    this.getLineas()
  }

  getLineas(){
    this.LineasService.listar().subscribe( res => {
      this.lineasDisponibles = res.lineas;
    })
  }

  cargarForm(){

    this.LineasService.listarId(this.dataEditar.linea_id).subscribe( res => {
      this.lineaSeleccionada = res.lineas[0];
    })

    this.form.patchValue({
      id: this.dataEditar.id,
      nombre: this.dataEditar.nombre,
      linea_id: this.dataEditar.linea_id,
      equipostipo_id: this.dataEditar.equipostipo_id,
      descripcion: this.dataEditar.descripcion,
    })
  }

  submit(){
    this.form.patchValue({linea_id: this.lineaSeleccionada.id});
    this.ModelosService.guardar(this.form.value).subscribe( res => {
      if(res.mensaje.tipo = 'success'){
        this.GlobalService.showToast("Entrada creada con éxito");
        this.Router.navigate(['modelos-listar'])
      }
    })
  }
}
