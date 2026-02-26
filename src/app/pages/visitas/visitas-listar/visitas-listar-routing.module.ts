import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VisitasListarPage } from './visitas-listar.page';

const routes: Routes = [
  {
    path: '',
    component: VisitasListarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VisitasListarPageRoutingModule {}
