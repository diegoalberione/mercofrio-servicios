import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MarcasFormPageRoutingModule } from './marcas-form-routing.module';

import { MarcasFormPage } from './marcas-form.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MarcasFormPageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [MarcasFormPage]
})
export class MarcasFormPageModule {}
