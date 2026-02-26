import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AlertasFormPage } from './alertas-form.page';

const routes: Routes = [
  {
    path: '',
    component: AlertasFormPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AlertasFormPageRoutingModule {}
