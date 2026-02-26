import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManualesFormPageRoutingModule } from './manuales-form-routing.module';

import { ManualesFormPage } from './manuales-form.page';
import { FileUploadModule } from 'ng2-file-upload';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ManualesFormPageRoutingModule,
    ReactiveFormsModule,
    FileUploadModule,
  ],
  declarations: [ManualesFormPage]
})
export class ManualesFormPageModule {}
