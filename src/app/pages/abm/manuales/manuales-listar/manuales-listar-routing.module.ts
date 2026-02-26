import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManualesListarPage } from './manuales-listar.page';

const routes: Routes = [
  {
    path: '',
    component: ManualesListarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManualesListarPageRoutingModule {}
