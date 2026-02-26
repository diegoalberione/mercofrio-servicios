import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LineasListarPageRoutingModule } from './lineas-listar-routing.module';

import { LineasListarPage } from './lineas-listar.page';
import { MyComponentsModule } from 'src/app/components/my-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LineasListarPageRoutingModule,
    MyComponentsModule
  ],
  declarations: [LineasListarPage]
})
export class LineasListarPageModule {}
