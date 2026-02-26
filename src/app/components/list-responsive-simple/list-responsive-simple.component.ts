import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IonItemSliding } from '@ionic/angular/directives/proxies';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'list-responsive-simple',
  templateUrl: './list-responsive-simple.component.html',  
  styleUrls: ['./list-responsive-simple.component.scss'],
})
export class ListResponsiveSimpleComponent implements OnInit {
  @Input('cols') cols = [];
  @Input('index') index : number;
  @Input('classGrid') classGrid : string;
  @Output('deleteClick') deleteClick : EventEmitter<any> = new EventEmitter();
  @Output('resetClick') resetClick : EventEmitter<any> = new EventEmitter();
  @Output('editClick') editClick : EventEmitter<any>= new EventEmitter();
  @Input('customsbtns') btns = [];
  @Output('customClick1') customClick1 : EventEmitter<any> = new EventEmitter();
  @Output('customClick2') customClick2 : EventEmitter<any> = new EventEmitter();
  @Output('customClick3') customClick3 : EventEmitter<any> = new EventEmitter();
  @Output('customClick4') customClick4 : EventEmitter<any> = new EventEmitter();
  @Output('customClick5') customClick5 : EventEmitter<any> = new EventEmitter();
  customsClick = [];
  banEditBtn = true;
  banDeleteBtn = true;
  banResertPassBtn = true;
  countBtn = 2;
  constructor(
    private alertController: AlertController
  ) { 
    this.customsClick.push(this.customClick1);
    this.customsClick.push(this.customClick2);
    this.customsClick.push(this.customClick3);
    this.customsClick.push(this.customClick4);
    this.customsClick.push(this.customClick5);
  }

  ngOnInit() {
    // si no manda evento, lo ocultamos
    if(this.editClick.observers.length == 0){
      this.banEditBtn = false;
      this.countBtn--;
    }
    if(this.deleteClick.observers.length == 0){
      this.banDeleteBtn = false;
      this.countBtn--;
    }
    if(this.resetClick.observers.length == 0){
      this.banResertPassBtn = false;
      this.countBtn--;
    }
    // recorremos para saber si hay botones, sino ocultamos esa columna por completo
    this.customsClick.forEach((value) => {
      if(value.observers.length > 0){
        this.countBtn++;
      }
    });
  }

  deleteItem(){
    this.confirmDelete();
  }

  customAction(pIndex){
    this.customsClick[pIndex].emit();
  }

  async confirmDelete() {
    const alert = await this.alertController.create({
      header: 'Atención!',
      message: '¿Seguro que desea eliminar el item "'+this.cols[0].text+'"?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        }, {
          text: 'Eliminar',          
          handler: () => {
              this.deleteClick.emit();
          }
        }]
    });

    await alert.present();
  }

  editItem(){
    this.editClick.emit();
  }
  
  resetPass(){
    this.resetClick.emit();
  }

}
