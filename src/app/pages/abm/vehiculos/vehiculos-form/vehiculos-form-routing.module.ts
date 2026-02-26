import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VehiculosFormPage } from './vehiculos-form.page';

const routes: Routes = [
  {
    path: '',
    component: VehiculosFormPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VehiculosFormPageRoutingModule {}
