import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VehiculosListarPageRoutingModule } from './vehiculos-listar-routing.module';

import { VehiculosListarPage } from './vehiculos-listar.page';
import { MyComponentsModule } from 'src/app/components/my-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VehiculosListarPageRoutingModule,
    MyComponentsModule,
  ],
  declarations: [VehiculosListarPage]
})
export class VehiculosListarPageModule {}
