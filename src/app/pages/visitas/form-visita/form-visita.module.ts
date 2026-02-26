import { IonicSelectableModule } from 'ionic-selectable';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FormVisitaPageRoutingModule } from './form-visita-routing.module';

import { FormVisitaPage } from './form-visita.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FormVisitaPageRoutingModule,
    IonicSelectableModule,
  ],
  declarations: [FormVisitaPage]
})
export class FormVisitaPageModule {}
