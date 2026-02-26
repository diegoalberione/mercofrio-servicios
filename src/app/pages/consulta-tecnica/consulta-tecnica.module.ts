import { IonicSelectableModule } from 'ionic-selectable';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConsultaTecnicaPageRoutingModule } from './consulta-tecnica-routing.module';

import { ConsultaTecnicaPage } from './consulta-tecnica.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConsultaTecnicaPageRoutingModule,
    IonicSelectableModule,
  ],
  declarations: [ConsultaTecnicaPage]
})
export class ConsultaTecnicaPageModule {}
