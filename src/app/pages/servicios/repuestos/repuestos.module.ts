import { IonicSelectableModule } from 'ionic-selectable';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RepuestosPageRoutingModule } from './repuestos-routing.module';

import { RepuestosPage } from './repuestos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RepuestosPageRoutingModule,
    IonicSelectableModule,
  ],
  declarations: [RepuestosPage]
})
export class RepuestosPageModule {}
