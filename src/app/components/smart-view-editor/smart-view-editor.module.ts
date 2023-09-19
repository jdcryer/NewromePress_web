import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmartViewEditorComponent } from './smart-view-editor.component';
import { SmartViewEditorColumnComponent } from '../smart-view-editor-column/smart-view-editor-column.component';
import { GridModule } from 'smart-webcomponents-angular/grid';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select'
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    SmartViewEditorComponent,
    SmartViewEditorColumnComponent
  ],
  imports: [
    CommonModule,
    GridModule,
    FormsModule,
    NgSelectModule,
    TranslateModule
  ],
  exports: [
    SmartViewEditorComponent
  ]
})
export class SmartViewEditorModule { }
