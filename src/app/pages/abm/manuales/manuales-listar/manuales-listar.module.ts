import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManualesListarPageRoutingModule } from './manuales-listar-routing.module';

import { ManualesListarPage } from './manuales-listar.page';
import { MyComponentsModule } from '../../../../components/my-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ManualesListarPageRoutingModule,
    MyComponentsModule,
  ],
  declarations: [ManualesListarPage]
})
export class ManualesListarPageModule {}
