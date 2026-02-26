import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LineasListarPage } from './lineas-listar.page';

const routes: Routes = [
  {
    path: '',
    component: LineasListarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LineasListarPageRoutingModule {}
