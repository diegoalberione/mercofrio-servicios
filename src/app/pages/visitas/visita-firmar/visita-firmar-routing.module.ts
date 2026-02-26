import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VisitaFirmarPage } from './visita-firmar.page';

const routes: Routes = [
  {
    path: '',
    component: VisitaFirmarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VisitaFirmarPageRoutingModule {}
