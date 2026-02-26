
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModelosListarPageRoutingModule } from './modelos-listar-routing.module';

import { ModelosListarPage } from './modelos-listar.page';
import { MyComponentsModule } from 'src/app/components/my-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModelosListarPageRoutingModule,
    MyComponentsModule
  ],
  declarations: [ModelosListarPage]
})
export class ModelosListarPageModule {}
