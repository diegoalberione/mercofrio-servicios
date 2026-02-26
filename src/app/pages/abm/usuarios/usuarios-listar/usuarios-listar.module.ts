import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UsuariosListarPageRoutingModule } from './usuarios-listar-routing.module';

import { UsuariosListarPage } from './usuarios-listar.page';
import { MyComponentsModule } from 'src/app/components/my-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule.forRoot({}),
    UsuariosListarPageRoutingModule,
    MyComponentsModule,
  ],
  declarations: [UsuariosListarPage]
})
export class UsuariosListarPageModule {}
