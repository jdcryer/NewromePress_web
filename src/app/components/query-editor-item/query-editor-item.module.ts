import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { QueryEditorItemComponent } from './query-editor-item.component';

@NgModule({
  declarations: [ QueryEditorItemComponent ],
  exports: [ QueryEditorItemComponent ],
  imports: [
    FormsModule,
    CommonModule
  ]
})
export class QueryEditorItemModule { }
