import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VehiculosListarPage } from './vehiculos-listar.page';

const routes: Routes = [
  {
    path: '',
    component: VehiculosListarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VehiculosListarPageRoutingModule {}
