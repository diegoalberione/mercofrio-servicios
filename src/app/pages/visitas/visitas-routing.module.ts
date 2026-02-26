import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VisitasPage } from './visitas.page';

const routes: Routes = [
  {
    path: '',
    component: VisitasPage
  },
  {
    path: 'form-visita',
    loadChildren: () => import('./form-visita/form-visita.module').then( m => m.FormVisitaPageModule)
  },
  {
    path: 'visitas-listar',
    loadChildren: () => import('./visitas-listar/visitas-listar.module').then( m => m.VisitasListarPageModule)
  },
  {
    path: 'visita-info',
    loadChildren: () => import('./visita-info/visita-info.module').then( m => m.VisitaInfoPageModule)
  },
  {
    path: 'visita-detalle',
    loadChildren: () => import('./visita-detalle/visita-detalle.module').then( m => m.VisitaDetallePageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VisitasPageRoutingModule {}
