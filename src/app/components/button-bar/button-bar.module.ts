import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonBarComponent } from './button-bar.component';
import { PositionFilterPipe } from 'src/app/pipes/position-filter-pipe.pipe';

@NgModule({
  declarations: [
    ButtonBarComponent,
    PositionFilterPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ButtonBarComponent
  ]
})
export class ButtonBarModule { }
