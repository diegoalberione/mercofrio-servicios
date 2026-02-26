import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClientesListarPage } from './clientes-listar.page';

const routes: Routes = [
  {
    path: '',
    component: ClientesListarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientesListarPageRoutingModule {}
