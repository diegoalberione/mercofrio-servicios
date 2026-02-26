import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClientesListarPageRoutingModule } from './clientes-listar-routing.module';

import { ClientesListarPage } from './clientes-listar.page';
import { MyComponentsModule } from 'src/app/components/my-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClientesListarPageRoutingModule,
    MyComponentsModule,
  ],
  declarations: [ClientesListarPage]
})
export class ClientesListarPageModule {}
