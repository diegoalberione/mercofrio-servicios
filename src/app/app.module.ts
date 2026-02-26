import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { AuthenticationInterceptor } from './services/authentication.interceptor';
import { MyComponentsModule } from './components/my-components.module';
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { DatePipe } from '@angular/common';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { IonicSelectableModule } from 'ionic-selectable';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { SignaturePadModule } from 'angular2-signaturepad';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

registerLocaleData(localeEsAr);

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot({ mode: 'md' }),
    AppRoutingModule,
    MyComponentsModule,
    IonicSelectableModule,
    SignaturePadModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    DatePipe,
    PhotoViewer,
    AuthenticationInterceptor,
    { provide: LOCALE_ID, useValue: 'es-Ar' },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthenticationInterceptor,
      multi: true,
    },
    { provide: 'AUTH_STORE', useValue: 'mercofrio.auth' },
    { provide: 'URL_API', useValue: 'https://www.qapp.com.ar/mercofrio/api2' },
    {
      provide: 'URL_FILES',
      useValue: 'https://www.qapp.com.ar/mercofrio/files',
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
