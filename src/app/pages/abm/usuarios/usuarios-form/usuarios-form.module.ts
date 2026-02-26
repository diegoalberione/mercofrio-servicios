import { NgModule } from '@angular/core';
import { IonicSelectableModule } from 'ionic-selectable';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UsuariosFormPageRoutingModule } from './usuarios-form-routing.module';

import { UsuariosFormPage } from './usuarios-form.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UsuariosFormPageRoutingModule,
    ReactiveFormsModule,
    IonicSelectableModule
  ],
  declarations: [UsuariosFormPage]
})
export class UsuariosFormPageModule {}
