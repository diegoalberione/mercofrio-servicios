import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModelosFormPage } from './modelos-form.page';

const routes: Routes = [
  {
    path: '',
    component: ModelosFormPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModelosFormPageRoutingModule {}
