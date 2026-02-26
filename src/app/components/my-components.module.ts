import { ListResponsiveSimpleComponent } from './list-responsive-simple/list-responsive-simple.component';
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { FocusNextDirective } from '../directives/focus-next.directive';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule
  ],
  declarations: [ListResponsiveSimpleComponent, FocusNextDirective],
  exports: [ListResponsiveSimpleComponent, FocusNextDirective]
})
export class MyComponentsModule {}