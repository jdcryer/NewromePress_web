import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { GridModule } from 'smart-webcomponents-angular/grid';
import { GridWrapperComponent } from './grid-wrapper.component';

@NgModule({
  declarations: [ GridWrapperComponent ],
  exports: [ GridWrapperComponent ],
  imports: [
    CommonModule,
    FormsModule,
    GridModule
  ]
})
export class GridWrapperModule { }
