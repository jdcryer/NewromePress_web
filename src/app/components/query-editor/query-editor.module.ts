import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { QueryEditorComponent } from './query-editor.component';
import { QueryEditorItemModule } from '../query-editor-item/query-editor-item.module';
import { MenuModule } from 'smart-webcomponents-angular/menu';

@NgModule({
  declarations: [ QueryEditorComponent ],
  exports: [ QueryEditorComponent ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    QueryEditorItemModule,
    MenuModule
  ]
})
export class QueryEditorModule { }
