import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';
import { VehiculosService } from 'src/app/services/vehiculos.service';

@Component({
  selector: 'app-vehiculos-form',
  templateUrl: './vehiculos-form.page.html',
  styleUrls: ['./vehiculos-form.page.scss'],
})
export class VehiculosFormPage implements OnInit {

  dataEditar;

  //Formulario
  vehiculoForm = this.formBuilder.group({
    id: [''],
    nombre: ['', [ Validators.required, Validators.maxLength(100)]],
    marca:['', [ Validators.required, Validators.maxLength(100)]],
    modelo:['', [ Validators.required, Validators.maxLength(100)]],
    patente:['', [ Validators.required, Validators.maxLength(100)]],
  })

  //Getters  
  get nombre() {
    return this.vehiculoForm.get("nombre");
  }
  get marca() {
    return this.vehiculoForm.get("marca");
  }
  get modelo() {
    return this.vehiculoForm.get("modelo");
  }
  get patente() {
    return this.vehiculoForm.get("patente");
  }
  
  //Mensajes de error
  errorMessages = {
    nombre: [{ type: 'required', message: 'Se requiere un nombre' }],
    marca: [{ type: 'required', message: 'Se requiere una marca' }],
    modelo: [{ type: 'required', message: 'Se requiere un modelo' }],
    patente: [{ type: 'required', message: 'Se requiere una patente' }],
  }

  constructor(
    private globalService: GlobalService,
    private formBuilder: FormBuilder,
    private vehiculosService: VehiculosService,
    private activatedRoute: ActivatedRoute,
    private router: Router,

  ) {
    this.vehiculoForm.get('id').disable();
    this.activatedRoute.params.subscribe((params: any) => {
      if (Object.entries(params).length !== 0) {
        this.dataEditar = params;
        this.vehiculoForm.get('id').enable();
        this.cargarForm();
      }
    });
  }

  ngOnInit() {
  }

  cargarForm(){
    this.vehiculoForm.patchValue({
      id: this.dataEditar.id,
      nombre: this.dataEditar.nombre,
      marca: this.dataEditar.marca,
      modelo: this.dataEditar.modelo,
      patente: this.dataEditar.patente,
    })
  }

  submit(){
    this.vehiculosService.guardar(this.vehiculoForm.value).subscribe( res => {
      if(res.mensaje.tipo = 'success'){
        this.router.navigate(['vehiculos-listar'])
      }
    })
  }

}
