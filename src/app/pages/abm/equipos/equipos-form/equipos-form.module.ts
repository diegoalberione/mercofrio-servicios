import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EquiposFormPageRoutingModule } from './equipos-form-routing.module';

import { EquiposFormPage } from './equipos-form.page';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EquiposFormPageRoutingModule,
    ReactiveFormsModule,
    IonicSelectableModule
  ],
  declarations: [EquiposFormPage]
})
export class ArticulosFormPageModule {}
