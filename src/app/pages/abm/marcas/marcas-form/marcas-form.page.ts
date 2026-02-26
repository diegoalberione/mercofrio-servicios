import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';
import { MarcasService } from 'src/app/services/marcas.service';

@Component({
  selector: 'app-marcas-form',
  templateUrl: './marcas-form.page.html',
  styleUrls: ['./marcas-form.page.scss'],
})
export class MarcasFormPage implements OnInit {

  dataEditar;

  //Formulario
  form = this.FormBuilder.group({
    id: [''],
    nombre: ['', [ Validators.required, Validators.maxLength(100)]],
    descripcion:['', [ Validators.required, Validators.maxLength(300)]],
  })

  //Getters  
  get nombre() {
    return this.form.get("nombre");
  }  
  get descripcion() {
    return this.form.get("descripcion");
  }
  
  //Mensajes de error
  errorMessages = {
    nombre: [{ type: 'required', message: 'Se requiere un nombre' }],
    descripcion: [{ type: 'required', message: 'Se requiere una marca' }],
  }

  constructor(
    private GlobalService: GlobalService,
    private FormBuilder: FormBuilder,
    private MarcasService: MarcasService,
    private ActivatedRoute: ActivatedRoute,
    private Router: Router,

  ) {
    this.form.get("id").disable();
    this.ActivatedRoute.params.subscribe((params: any) => {
      if (Object.entries(params).length !== 0) {
        this.dataEditar = params;
        this.form.get('id').enable();
        this.cargarForm();
      }
    });
  }

  ngOnInit() {
  }

  cargarForm(){
    this.form.patchValue({
      id: this.dataEditar.id,
      nombre: this.dataEditar.nombre,
      descripcion: this.dataEditar.descripcion,
    })
  }

  submit(){
    this.MarcasService.guardar(this.form.value).subscribe( res => {
      if(res.mensaje.tipo = "success"){
        this.GlobalService.showToast("Entrada creada con éxito");
        this.Router.navigate(['marcas-listar'])
      }
    })
  }
}