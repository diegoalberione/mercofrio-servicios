import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AbmPage } from './abm.page';

const routes: Routes = [
  {
    path: '',
    component: AbmPage
  },
  {
    path: 'clientes-listar',
    loadChildren: () => import('./clientes/clientes-listar/clientes-listar.module').then( m => m.ClientesListarPageModule)
  },
  {
    path: 'clientes-form',
    loadChildren: () => import('./clientes/clientes-form/clientes-form.module').then( m => m.ClientesFormPageModule)
  },
  {
    path: 'lineas-listar',
    loadChildren: () => import('./lineas/lineas-listar/lineas-listar.module').then( m => m.LineasListarPageModule)
  },
  {
    path: 'lineas-form',
    loadChildren: () => import('./lineas/lineas-form/lineas-form.module').then( m => m.LineasFormPageModule)
  },
  {
    path: 'modelos-listar',
    loadChildren: () => import('./modelos/modelos-listar/modelos-listar.module').then( m => m.ModelosListarPageModule)
  },
  {
    path: 'modelos-form',
    loadChildren: () => import('./modelos/modelos-form/modelos-form.module').then( m => m.ModelosFormPageModule)
  },
  {
    path: 'marcas-listar',
    loadChildren: () => import('./marcas/marcas-listar/marcas-listar.module').then( m => m.MarcasListarPageModule)
  },
  {
    path: 'marcas-form',
    loadChildren: () => import('./marcas/marcas-form/marcas-form.module').then( m => m.MarcasFormPageModule)
  },
  {
    path: 'usuarios-listar',
    loadChildren: () => import('./usuarios/usuarios-listar/usuarios-listar.module').then( m => m.UsuariosListarPageModule)
  },
  {
    path: 'usuarios-form',
    loadChildren: () => import('./usuarios/usuarios-form/usuarios-form.module').then( m => m.UsuariosFormPageModule)
  },
  {
    path: 'manuales-listar',
    loadChildren: () => import('./manuales/manuales-listar/manuales-listar.module').then( m => m.ManualesListarPageModule)
  },
  {
    path: 'manuales-form',
    loadChildren: () => import('./manuales/manuales-form/manuales-form.module').then( m => m.ManualesFormPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AbmPageRoutingModule {}
