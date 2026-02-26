import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RepuestosPage } from './repuestos.page';

const routes: Routes = [
  {
    path: '',
    component: RepuestosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RepuestosPageRoutingModule {}
