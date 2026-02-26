import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AlertasFormPageRoutingModule } from './alertas-form-routing.module';

import { AlertasFormPage } from './alertas-form.page';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AlertasFormPageRoutingModule,
    IonicSelectableModule
  ],
  declarations: [AlertasFormPage]
})
export class AlertasFormPageModule {}
