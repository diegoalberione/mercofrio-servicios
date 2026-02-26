import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConsultaTecnicaPage } from './consulta-tecnica.page';

const routes: Routes = [
  {
    path: '',
    component: ConsultaTecnicaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsultaTecnicaPageRoutingModule {}
