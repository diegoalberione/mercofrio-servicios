import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MarcasFormPage } from './marcas-form.page';

const routes: Routes = [
  {
    path: '',
    component: MarcasFormPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MarcasFormPageRoutingModule {}
