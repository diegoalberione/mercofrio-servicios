import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VisitaDetallePage } from './visita-detalle.page';

const routes: Routes = [
  {
    path: '',
    component: VisitaDetallePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VisitaDetallePageRoutingModule {}

