import { IonicSelectableModule } from 'ionic-selectable';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LineasFormPageRoutingModule } from './lineas-form-routing.module';

import { LineasFormPage } from './lineas-form.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LineasFormPageRoutingModule,
    ReactiveFormsModule,
    IonicSelectableModule
  ],
  declarations: [LineasFormPage]
})
export class LineasFormPageModule {}
