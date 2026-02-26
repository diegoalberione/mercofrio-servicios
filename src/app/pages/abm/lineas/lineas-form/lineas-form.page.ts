import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';
import { LineasService } from 'src/app/services/lineas.service';
import { MarcasService } from 'src/app/services/marcas.service';
@Component({
  selector: 'app-lineas-form',
  templateUrl: './lineas-form.page.html',
  styleUrls: ['./lineas-form.page.scss'],
})
export class LineasFormPage implements OnInit {
  dataEditar;

  marcasDisponibles;
  marcaSeleccionada;

  //Formulario
  form = this.FormBuilder.group({
    id: [''],
    nombre: ['', [ Validators.required, Validators.maxLength(100)]],
    marca_id:['', [ Validators.required, Validators.maxLength(100)]],
    descripcion:['', [ Validators.required, Validators.maxLength(100)]],
  })

  //Getters  
  get nombre() {
    return this.form.get("nombre");
  }
  get marca_id() {
    return this.form.get("marca_id");
  }
  get descripcion() {
    return this.form.get("descripcion");
  }

  //Mensajes de error
  errorMessages = {
    nombre: [{ type: 'required', message: 'Se requiere un nombre' }],
    marca_id: [{ type: 'required', message: 'Se requiere una marca' }],
    descripcion: [{ type: 'required', message: 'Se requiere una descripcion' }],
  }

  constructor(
    private GlobalService: GlobalService,
    private FormBuilder: FormBuilder,
    private MarcasService: MarcasService,
    private LineasService: LineasService,
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
    this.getMarcas()
  }

  getMarcas(){
    this.MarcasService.listar().subscribe( res => {
      this.marcasDisponibles = res.marcas;
    })
  }

  cargarForm(){

    this.MarcasService.listarId(this.dataEditar.marca_id).subscribe( res => {
      this.marcaSeleccionada = res.marcas[0];
    })


    this.form.patchValue({
      id: this.dataEditar.id,
      marca_id: this.dataEditar.marca_id,
      nombre: this.dataEditar.nombre,
      descripcion: this.dataEditar.descripcion,
    })
  }

  submit(){
    this.form.patchValue({marca_id: this.marcaSeleccionada.id});
    this.LineasService.guardar(this.form.value).subscribe( res => {
      if(res.mensaje.tipo = 'success'){
        this.GlobalService.showToast("Entrada creada con éxito");
        this.Router.navigate(['lineas-listar'])
      }
    })
  }
}
