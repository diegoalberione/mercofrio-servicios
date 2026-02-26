import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientesService } from 'src/app/services/clientes.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { ZonasService } from 'src/app/services/zonas.service';

@Component({
  selector: 'app-usuarios-form',
  templateUrl: './usuarios-form.page.html',
  styleUrls: ['./usuarios-form.page.scss'],
})
export class UsuariosFormPage implements OnInit {

  dataEditar;

  //Formulario
  clienteForm = this.FormBuilder.group({
    id: [''],
    usuariosgrupo_id: [''],
    zona_id: [''],
    nombres: ['', [ Validators.required, Validators.maxLength(100)]],
    apellido:['', [ Validators.required, Validators.maxLength(100)]],
    cuit:['', [ Validators.required, Validators.maxLength(100)]],
    email:['', [ Validators.required, Validators.maxLength(100)]],
    password:['', [ Validators.required, Validators.maxLength(100)]],
    direccion:['', [ Validators.required, Validators.maxLength(100)]],
    localidad:['', [ Validators.required, Validators.maxLength(100)]],
  })

  esAdmin = false;
  formTecnico;
  zonasDisponibles;
  zonaSeleccionada;

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
  get password() {
    return this.clienteForm.get("password");
  }
  get direccion() {
    return this.clienteForm.get("direccion");
  }
  get localidad() {
    return this.clienteForm.get("localidad");
  }

  //Mensajes de error
  errorMessages = {
    nombres: [{ type: 'required', message: 'Se requiere un nombre' }],
    apellido: [{ type: 'required', message: 'Se requiere un apellido' }],
    cuit: [{ type: 'required', message: 'Se requiere un cuit' }],
    email: [{ type: 'required', message: 'Se requiere un email' }],
    password: [{ type: 'required', message: 'Se requiere una password' }],
    direccion: [{ type: 'required', message: 'Se requiere una calle' }],
    localidad: [{ type: 'required', message: 'Se requiere una localidad' }],
  }

  constructor(
    private FormBuilder: FormBuilder,
    private UsuariosService: UsuariosService,
    private ActivatedRoute: ActivatedRoute,
    private ZonasService: ZonasService,
    private Router: Router,

  ) {
    this.clienteForm.get('id').disable();
    this.ActivatedRoute.params.subscribe((params: any) => {
      if (Object.entries(params).length !== 0) {
        this.dataEditar = params;
        this.clienteForm.get('id').enable();
        this.cargarForm();
      }
    });
  }

  ngOnInit() {
    this.getZonas()
  }

  getZonas(){
    this.ZonasService.listar().subscribe( res => {
      this.zonasDisponibles = res.zonas;
    })
  }

  cargarForm(){
    this.ZonasService.listarId(this.dataEditar.zona_id).subscribe( res => {
      this.zonaSeleccionada = res.zonas[0];
    })
    
    console.log('CARGANDO FORM', this.dataEditar)
    this.clienteForm.patchValue({
      id: this.dataEditar.id,
      nombres: this.dataEditar.nombres,
      apellido: this.dataEditar.apellido,
      cuit: this.dataEditar.cuit,
      email: this.dataEditar.email,
      password: this.dataEditar.password,
      direccion: this.dataEditar.direccion,
      localidad: this.dataEditar.localidad,
      usuariosgrupo_id: this.dataEditar.usuariosgrupo_id,
    })

    console.log('FORM:', this.clienteForm.value)

    if(this.dataEditar.usuariosgrupo_id === "1"){
      this.esAdmin = true
    }

  }

  submit(){
    
    this.clienteForm.patchValue({'zona_id': this.zonaSeleccionada.id})
    
    if(!!this.esAdmin){
      this.clienteForm.patchValue({'usuariosgrupo_id': '1'})
    }else{
      this.clienteForm.patchValue({'usuariosgrupo_id': '4'})
    }

    this.UsuariosService.guardarNuevoUsuario(this.clienteForm.value).subscribe( res => {
      if(res.mensaje.tipo = 'success'){
        this.Router.navigate(['abm/usuarios-listar'])
      }
    })
  }

}
