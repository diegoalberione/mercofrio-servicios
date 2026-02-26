import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClientesFormPageRoutingModule } from './clientes-form-routing.module';

import { ClientesFormPage } from './clientes-form.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClientesFormPageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [ClientesFormPage]
})
export class ClientesFormPageModule {}
