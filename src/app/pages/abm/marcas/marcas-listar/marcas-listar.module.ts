import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MarcasListarPageRoutingModule } from './marcas-listar-routing.module';

import { MarcasListarPage } from './marcas-listar.page';
import { MyComponentsModule } from 'src/app/components/my-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MarcasListarPageRoutingModule,
    MyComponentsModule
  ],
  declarations: [MarcasListarPage]
})
export class MarcasListarPageModule {}
