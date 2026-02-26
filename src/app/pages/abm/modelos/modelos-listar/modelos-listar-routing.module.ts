import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModelosListarPage } from './modelos-listar.page';

const routes: Routes = [
  {
    path: '',
    component: ModelosListarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModelosListarPageRoutingModule {}
