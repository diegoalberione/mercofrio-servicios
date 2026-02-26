import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VisitaFirmarPageRoutingModule } from './visita-firmar-routing.module';

import { VisitaFirmarPage } from './visita-firmar.page';
import { SignaturePadModule } from 'angular2-signaturepad';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VisitaFirmarPageRoutingModule,
    SignaturePadModule,
  ],
  declarations: [VisitaFirmarPage],
})
export class VisitaFirmarPageModule {}
