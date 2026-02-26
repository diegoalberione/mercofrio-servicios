import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AbmPageRoutingModule } from './abm-routing.module';

import { AbmPage } from './abm.page';
import { ModalExampleComponent } from './usuarios/usuarios-listar/modal-example.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AbmPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [AbmPage,ModalExampleComponent]
})
export class AbmPageModule {}
