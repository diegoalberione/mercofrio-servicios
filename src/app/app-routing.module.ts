import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () =>
      import('./pages/home/home.module').then((m) => m.HomePageModule),
  },
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'servicios',
    loadChildren: () =>
      import('./pages/servicios/servicios.module').then(
        (m) => m.ServiciosPageModule
      ),
  },
  {
    path: 'visitas',
    loadChildren: () =>
      import('./pages/visitas/visitas.module').then((m) => m.VisitasPageModule),
  },
  {
    path: 'consulta-tecnica',
    loadChildren: () =>
      import('./pages/consulta-tecnica/consulta-tecnica.module').then(
        (m) => m.ConsultaTecnicaPageModule
      ),
  },
  {
    path: 'visitas-listar',
    loadChildren: () =>
      import('./pages/visitas/visitas-listar/visitas-listar.module').then(
        (m) => m.VisitasListarPageModule
      ),
  },
  {
    path: 'form-visita',
    loadChildren: () =>
      import('./pages/visitas/form-visita/form-visita.module').then(
        (m) => m.FormVisitaPageModule
      ),
  },
  {
    path: 'splash',
    loadChildren: () =>
      import('./pages/splash/splash.module').then((m) => m.SplashPageModule),
  },
  {
    path: 'alertas',
    loadChildren: () =>
      import('./pages/alertas/alertas.module').then((m) => m.AlertasPageModule),
  },
  {
    path: 'alertas-form',
    loadChildren: () =>
      import('./pages/alertas/alertas-form/alertas-form.module').then((m) => m.AlertasFormPageModule),
  },
  {
    path: 'abm',
    loadChildren: () =>
      import('./pages/abm/abm.module').then((m) => m.AbmPageModule),
  },
  {
    path: 'vehiculos-listar',
    loadChildren: () =>
      import(
        './pages/abm/vehiculos/vehiculos-listar/vehiculos-listar.module'
      ).then((m) => m.VehiculosListarPageModule),
  },
  {
    path: 'vehiculos-form',
    loadChildren: () =>
      import('./pages/abm/vehiculos/vehiculos-form/vehiculos-form.module').then(
        (m) => m.VehiculosFormPageModule
      ),
  },
  {
    path: 'clientes-listar',
    loadChildren: () =>
      import(
        './pages/abm/clientes/clientes-listar/clientes-listar.module'
      ).then((m) => m.ClientesListarPageModule),
  },
  {
    path: 'clientes-form',
    loadChildren: () =>
      import('./pages/abm/clientes/clientes-form/clientes-form.module').then(
        (m) => m.ClientesFormPageModule
      ),
  },
  {
    path: 'usuarios-form',
    loadChildren: () =>
      import('./pages/abm/usuarios/usuarios-form/usuarios-form.module').then(
        (m) => m.UsuariosFormPageModule
      ),
  },
  {
    path: 'marcas-form',
    loadChildren: () =>
      import('./pages/abm/marcas/marcas-form/marcas-form.module').then(
        (m) => m.MarcasFormPageModule
      ),
  },
  {
    path: 'marcas-listar',
    loadChildren: () =>
      import('./pages/abm/marcas/marcas-listar/marcas-listar.module').then(
        (m) => m.MarcasListarPageModule
      ),
  },
  {
    path: 'lineas-form',
    loadChildren: () =>
      import('./pages/abm/lineas/lineas-form/lineas-form.module').then(
        (m) => m.LineasFormPageModule
      ),
  },
  {
    path: 'lineas-listar',
    loadChildren: () =>
      import('./pages/abm/lineas/lineas-listar/lineas-listar.module').then(
        (m) => m.LineasListarPageModule
      ),
  },
  {
    path: 'modelos-form',
    loadChildren: () =>
      import('./pages/abm/modelos/modelos-form/modelos-form.module').then(
        (m) => m.ModelosFormPageModule
      ),
  },
  {
    path: 'modelos-listar',
    loadChildren: () =>
      import('./pages/abm/modelos/modelos-listar/modelos-listar.module').then(
        (m) => m.ModelosListarPageModule
      ),
  },
  {
    path: 'equipos-form',
    loadChildren: () => import('./pages/abm/equipos/equipos-form/equipos-form.module').then( m => m.ArticulosFormPageModule)
  },

  ////// Rutas con parametros
  {
    path: 'visita-info/:pData',
    loadChildren: () =>
      import('./pages/visitas/visita-info/visita-info.module').then(
        (m) => m.VisitaInfoPageModule
      ),
  },
  {
    path: 'form-visita/:pData',
    loadChildren: () =>
      import('./pages/visitas/form-visita/form-visita.module').then(
        (m) => m.FormVisitaPageModule
      ),
  },
  {
    path: 'vehiculos-form/:pData',
    loadChildren: () =>
      import('./pages/abm/vehiculos/vehiculos-form/vehiculos-form.module').then(
        (m) => m.VehiculosFormPageModule
      ),
  },
  {
    path: 'clientes-form/:pData',
    loadChildren: () =>
      import('./pages/abm/clientes/clientes-form/clientes-form.module').then(
        (m) => m.ClientesFormPageModule
      ),
  },
  {
    path: 'usuarios-form/:pData',
    loadChildren: () =>
      import('./pages/abm/usuarios/usuarios-form/usuarios-form.module').then(
        (m) => m.UsuariosFormPageModule
      ),
  },
  {
    path: 'marcas-form/:pData',
    loadChildren: () =>
      import('./pages/abm/marcas/marcas-form/marcas-form.module').then(
        (m) => m.MarcasFormPageModule
      ),
  },
  {
    path: 'lineas-form/:pData',
    loadChildren: () =>
      import('./pages/abm/marcas/marcas-form/marcas-form.module').then(
        (m) => m.MarcasFormPageModule
      ),
  },
  {
    path: 'modelos-form/:pData',
    loadChildren: () =>
      import('./pages/abm/modelos/modelos-form/modelos-form.module').then(
        (m) => m.ModelosFormPageModule
      ),
  },
  {
    path: 'visita-firmar',
    loadChildren: () =>
      import('./pages/visitas/visita-firmar/visita-firmar.module').then(
        (m) => m.VisitaFirmarPageModule
      ),
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
