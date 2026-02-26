import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UsuariosFormPage } from './usuarios-form.page';

const routes: Routes = [
  {
    path: '',
    component: UsuariosFormPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsuariosFormPageRoutingModule {}
