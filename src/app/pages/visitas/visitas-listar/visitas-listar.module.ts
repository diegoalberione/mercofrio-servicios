import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VisitasListarPageRoutingModule } from './visitas-listar-routing.module';

import { VisitasListarPage } from './visitas-listar.page';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VisitasListarPageRoutingModule,
    IonicSelectableModule
  ],
  declarations: [VisitasListarPage]
})
export class VisitasListarPageModule {}
