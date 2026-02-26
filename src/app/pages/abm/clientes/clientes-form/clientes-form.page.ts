import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientesService } from 'src/app/services/clientes.service';

@Component({
  selector: 'app-clientes-form',
  templateUrl: './clientes-form.page.html',
  styleUrls: ['./clientes-form.page.scss'],
})
export class ClientesFormPage implements OnInit {

  dataEditar;

  //Formulario
  clienteForm = this.formBuilder.group({
    id: [''],
    usuariosgrupo_id: ['3'],
    nombres: ['', [ Validators.required, Validators.maxLength(100)]],
    apellido:['', [ Validators.required, Validators.maxLength(100)]],
    cuit:['', [ Validators.required, Validators.maxLength(100)]],
    email:['', [ Validators.required, Validators.maxLength(100)]],
    direccion:['', [ Validators.required, Validators.maxLength(100)]],
    localidad:['', [ Validators.required, Validators.maxLength(100)]],
  })

  //Getters  
  get nombres() {
    return this.clienteForm.get("nombres");
  }
  get apellido() {
    return this.clienteForm.get("apellido");
  }
  get cuit() {
    return this.clienteForm.get("cuit");
  }
  get email() {
    return this.clienteForm.get("email");
  }
  get direccion() {
    return this.clienteForm.get("direccion");
  }
  get localidad() {
    return this.clienteForm.get("localidad");
  }

  //Mensajes de error
  errorMessages = {
    nombres: [{ type: 'required', message: 'Se requiere un nombres' }],
    apellido: [{ type: 'required', message: 'Se requiere un apellido' }],
    cuit: [{ type: 'required', message: 'Se requiere un cuit' }],
    email: [{ type: 'required', message: 'Se requiere un email' }],
    direccion: [{ type: 'required', message: 'Se requiere una calle' }],
    localidad: [{ type: 'required', message: 'Se requiere una localidad' }],
  }

  constructor(
    private formBuilder: FormBuilder,
    private clientesService: ClientesService,
    private activatedRoute: ActivatedRoute,
    private router: Router,

  ) {
    this.clienteForm.get('id').disable();
    this.activatedRoute.params.subscribe((params: any) => {
      if (Object.entries(params).length !== 0) {
        this.dataEditar = params;
        this.clienteForm.get('id').enable();
        this.cargarForm();
      }
    });
  }

  ngOnInit() {
  }

  cargarForm(){
    this.clienteForm.patchValue({
      id: this.dataEditar.id,
      nombres: this.dataEditar.nombres,
      apellido: this.dataEditar.apellido,
      cuit: this.dataEditar.cuit,
      email: this.dataEditar.email,
      direccion: this.dataEditar.direccion,
      localidad: this.dataEditar.localidad,
    })
  }

  submit(){
    this.clientesService.guardar(this.clienteForm.value).subscribe( res => {
      if(res.mensaje.tipo = 'success'){
        this.router.navigate(['clientes-listar'])
      }
    })
  }

}