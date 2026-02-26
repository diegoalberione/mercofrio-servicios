import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EquiposFormPage } from './equipos-form.page';

const routes: Routes = [
  {
    path: '',
    component: EquiposFormPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EquiposFormPageRoutingModule {}
