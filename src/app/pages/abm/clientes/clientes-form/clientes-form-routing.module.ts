import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClientesFormPage } from './clientes-form.page';

const routes: Routes = [
  {
    path: '',
    component: ClientesFormPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientesFormPageRoutingModule {}
