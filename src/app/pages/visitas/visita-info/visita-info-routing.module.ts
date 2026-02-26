import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VisitaInfoPage } from './visita-info.page';

const routes: Routes = [
  {
    path: '',
    component: VisitaInfoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VisitaInfoPageRoutingModule {}
