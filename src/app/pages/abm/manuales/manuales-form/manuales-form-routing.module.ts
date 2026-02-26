import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManualesFormPage } from './manuales-form.page';

const routes: Routes = [
  {
    path: '',
    component: ManualesFormPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManualesFormPageRoutingModule {}
