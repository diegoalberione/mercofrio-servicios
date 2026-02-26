import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VisitaDetallePageRoutingModule } from './visita-detalle-routing.module';

import { VisitaDetallePage } from './visita-detalle.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VisitaDetallePageRoutingModule,
  ],
  declarations: [VisitaDetallePage]
})
export class VisitaDetallePageModule {}

