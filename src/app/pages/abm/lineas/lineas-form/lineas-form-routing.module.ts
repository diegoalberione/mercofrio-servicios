import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LineasFormPage } from './lineas-form.page';

const routes: Routes = [
  {
    path: '',
    component: LineasFormPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LineasFormPageRoutingModule {}
