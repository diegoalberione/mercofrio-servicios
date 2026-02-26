import { IonicSelectableModule } from 'ionic-selectable';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VisitaInfoPageRoutingModule } from './visita-info-routing.module';

import { VisitaInfoPage } from './visita-info.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VisitaInfoPageRoutingModule,
    IonicSelectableModule,
  ],
  declarations: [VisitaInfoPage]
})
export class VisitaInfoPageModule {}
