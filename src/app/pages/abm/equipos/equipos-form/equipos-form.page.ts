import { Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicSelectableComponent } from 'ionic-selectable';
import { EquioposService } from 'src/app/services/equiopos.service';
import { GlobalService } from 'src/app/services/global.service';

@Component({
  selector: 'app-equipos-form',
  templateUrl: './equipos-form.page.html',
  styleUrls: ['./equipos-form.page.scss'],
})
export class EquiposFormPage implements OnInit, OnDestroy {

  equipoForm: FormGroup = this.formBuilder.group({
    tipoEquipo: ['', [Validators.required]],
    tipoCaja: ['', [Validators.required]],
    medidasNominales: this.formBuilder.array([])
  })

  @ViewChild('medidascategoriasComponent') medidascategoriasComponent: IonicSelectableComponent;
  @ViewChildren('retrabajoscategoriasComponent') retrabajoscategoriasComponent: QueryList<IonicSelectableComponent>;
  medidascategoriasList: any[] = [];
  retrabajoscategoriasList: any[] = [];
  wait = false;

  private readonly _unsubscribe$ = new Subject<any>();
  private medidasNominalesList = this.equipoForm.get('medidasNominales') as FormArray;

  constructor(
    private formBuilder: FormBuilder,
    private equiposService: EquioposService,
    private globalService: GlobalService,
  ) { }

  private destroy$: Subject<boolean> = new Subject<boolean>();
  ngOnInit() {
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ionViewDidEnter() {
    this.inicializarItems();
  }

  inicializarItems() {
    this.globalService.showLoading();
    this.getItems();
  }

  tipoEquipos = [];
  getItems($event?) {
    this.equiposService.listarEquipos().pipe(takeUntil(this.destroy$), tap((res) => {
      this.tipoEquipos = res.equipostipos;
      this.globalService.stopLoading();
    })).subscribe();
  }

  cajas = [];
  listadoCajas(event: { component: IonicSelectableComponent; text: string },) {
    this.medidasNominalesList.clear();
    this.listadoMedidascategorias(event.text);
  }

  listadoMedidascategorias(nombre) {
    this.cajas = [];
    this.equiposService.listarMedidascategoriasPorEquipotipo(this.equipoForm.get("tipoEquipo").value, nombre).pipe(takeUntil(this.destroy$), tap((res) => {
      this.medidascategoriasComponent.items = res.medidascategorias;
      this.globalService.stopLoading();
    })).subscribe();
  }

  medidasnominales = [];  
  listarMedidasnominalesId($event?) {
    this.equiposService.listarMedidasnominalesId($event.value.id).pipe(takeUntil(this.destroy$), tap((res) => {
      this.medidasNominalesList.clear();      
      this.medidasnominales = res.medidasnominales.map((medida: any) => {
        let retrabajosObjetos = [];
        medida.retrabajostipos.map((retrabajo:any) => {
          this.retrabajoPorNombre(retrabajo.nombre).subscribe(data => {
            retrabajosObjetos.push(data.retrabajostipos[0]);
          })
        })
        this.medidasNominalesList.push(
          this.formBuilder.group({
            idTipo: medida.id,
            nombre: medida.nombre,
            medidaminimo: medida.min,
            medidamaximo: medida.max,
            tipoRetrabajo: [retrabajosObjetos]
          })
        )
        return medida;
      })
      this.globalService.stopLoading();
    })).subscribe();
  }

  retrabajoPorNombre(nombre){
    return this.equiposService.listarRetrabajos(nombre).pipe(takeUntil(this.destroy$), tap((res) => {
      res.retrabajostipos;
      this.globalService.stopLoading();
    }));    
  }

  retrabajostipos = [];
    listadoRetrabajo(event: { component: IonicSelectableComponent, text: string }, index: number) {
    this.equiposService.listarRetrabajos(event.text).pipe(takeUntil(this.destroy$), tap((res) => {
      const retrabajos = this.retrabajoscategoriasComponent.toArray();
      retrabajos[index].items = res.retrabajostipos;
      this.globalService.stopLoading();
    })).subscribe();
    return this.retrabajostipos;
  }

  nuevaPieza($event?) {
    this.medidasNominalesList.push(
      this.formBuilder.group({
        idTipo: "",
        nombre: "",
        medidaminimo: "",
        medidamaximo: "",
        retrabajostipos: [[]]
      })
    )
  }

  medidascategoriaForm = this.formBuilder.group({
    id: ['0', [Validators.required]],
    nombre: ['', Validators.required]
  });

  retrabajoscategoriaForm = this.formBuilder.group({
    id: [],
    nombre: ['', Validators.required]
  });

  //Mensajes de error
  errorMessages = {
    tipoEquipo: [{ type: 'required', message: 'Se requiere la selección de un Tipo de Equipo' }],
    tipoCaja: [{ type: 'required', message: 'Se requiere la selección de una Caja' }],
  }

  get tipoEquipo() {
    return this.equipoForm.get("tipoEquipo");
  }
  get tipoCaja() {
    return this.equipoForm.get("tipoCaja");
  }

  guardarMedidaNomila(medidas) {
    this.wait = true;
    medidas.forEach(medida => {
      const data = {
        min: medida.medidaminimo,
        max: medida.medidamaximo,
        id: medida.idTipo,
        nombre: medida.nombre,
        medidascategoria_id: this.equipoForm.get("tipoCaja").value.equipostipo_id,
        retrabajostipos:
          medida.tipoRetrabajo.map(({
            id
          }) => ({
            medidasnominal_id: medida.idTipo,
            retrabajostipo_id: id
          })
          )
      };
      this.equiposService.guardarMedidasNomicalesId(data)
        .pipe(takeUntil(this._unsubscribe$))
        .subscribe({
          next: async (resp: any) => {
            await this.globalService.showToast(
              `Medidas guardadas correctamente.`,
              'success'
            );
            this.wait = false;
          },
          error: async (res: any) => {
            await this.globalService.showToast(
              `Las medidas no se pudo guardar. ${res.error.message || ''}`,
              'danger'
            );
            this.wait = false;
          },
        });
    })
  }

  onSubmit() {
    this.guardarMedidaNomila(this.equipoForm.get("medidasNominales").value);
  }
  get idMedidascategoria() {
    return this.medidascategoriaForm.get('id');
  }
  get nombreMedidascategoria() {
    return this.medidascategoriaForm.get('nombre');
  }
  get idRetrabajoscategoria() {
    return this.retrabajoscategoriaForm.get('id');
  }
  get nombreRetrabajoscategoria() {
    return this.retrabajoscategoriaForm.get('nombre');
  }
  get tipoRetrabajo() {
    return this.medidascategoriaForm.get('tipoRetrabajo');
  }

  onSaveMedidascategorias(event: any) {
    if (event.item) {
      // Fill form.
      this.idMedidascategoria.setValue(event.item.id);
      this.nombreMedidascategoria.setValue(event.item.nombre);
    } else {
      this.medidascategoriaForm.reset();
    }
    // Show form.
    event.component.showAddItemTemplate();
  }

  onSaveRetrabajoscategorias(event: any, index: number) {
    console.log(event);
    if (event.item) {
      // Fill form.
      this.idRetrabajoscategoria.setValue(event.item.id);
      this.nombreRetrabajoscategoria.setValue(event.item.nombre);
    } else {
      this.retrabajoscategoriaForm.reset();
    }
    // Show form.
    event.component.showAddItemTemplate();
  }


  submitMedidascategoria() {
    if (this.medidascategoriaForm.valid) {
      this.wait = true;
      const data = {
        id: this.idMedidascategoria.value,
        nombre: this.nombreMedidascategoria.value,
        equipostipo_id: this.equipoForm.get("tipoEquipo").value
      };
      this.equiposService
        .guardarMedidascategoria({ ...data })
        .pipe(takeUntil(this._unsubscribe$))
        .subscribe({
          next: async (resp: any) => {

            this.listadoMedidascategorias(data.nombre);

            this.medidascategoriaForm.reset();
            this.medidascategoriasComponent.hideAddItemTemplate();
            await this.globalService.showToast(
              `Caja guardada correctamente.`,
              'success'
            );
            this.wait = false;
          },
          error: async (res: any) => {
            await this.globalService.showToast(
              `La caja no se pudo guardar. ${res.error.message || ''}`,
              'danger'
            );
            this.wait = false;
          },
        });
    }
  }

  submitRetrabajoscategoria(index: number) {
    if (this.retrabajoscategoriaForm.valid) {
      this.wait = true;
      const data = {
        id: this.idRetrabajoscategoria.value,
        nombre: this.nombreRetrabajoscategoria.value,
        equipostipo_id: this.equipoForm.get("tipoEquipo").value,
      };
      console.log(data);
      this.equiposService
        .guardarRetrabajoscategoria({ ...data })
        .pipe(takeUntil(this._unsubscribe$))
        .subscribe({
          next: async (resp: any) => {

            //this.listadoRetrabajo(data.nombre);

            this.retrabajoscategoriaForm.reset();
            this.retrabajoscategoriasComponent[index].hideAddItemTemplate();
            await this.globalService.showToast(
              `Retrabajo guardada correctamente.`,
              'success'
            );
            this.wait = false;
          },
          error: async (res: any) => {
            await this.globalService.showToast(
              `El retrabajo no se pudo guardar. ${res.error.message || ''}`,
              'danger'
            );
            this.wait = false;
          },
        });
    } else {
      console.log('sin datos');
    }
  }

  cancelMedidascategoria() {
    this.retrabajoscategoriaForm.reset();
    this.medidascategoriasComponent.hideAddItemTemplate();
  }
  cancelRetrabajoscategoria(index: number) {
    const retrabajos = this.retrabajoscategoriasComponent.toArray();
    this.medidascategoriaForm.reset();
    retrabajos[index].hideAddItemTemplate();
  }
}