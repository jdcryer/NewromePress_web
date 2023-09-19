import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SmartDataListComponent } from './smart-data-list.component';
import { GridModule } from 'smart-webcomponents-angular/grid';
import { MenuModule } from 'smart-webcomponents-angular/menu';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { QueryEditorModule } from 'src/app/components/query-editor/query-editor.module';
import { SmartViewEditorModule } from 'src/app/components/smart-view-editor/smart-view-editor.module';
import { SmartTabsEditorModule } from 'src/app/components/smart-tabs-editor/smart-tabs-editor.module';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { GridDirective } from './grid-directive.directive';
import { GridWrapperModule } from 'src/app/components/grid-wrapper/grid-wrapper.module';

@NgModule({
  declarations: [
    SmartDataListComponent,
    GridDirective
  ],
  imports: [
    CommonModule,
    GridModule,
    MenuModule,
    FormsModule,
    TranslateModule,
    QueryEditorModule,
    SmartViewEditorModule,
    SmartTabsEditorModule,
    NgbNavModule,
    GridWrapperModule
  ],
  exports: [
    SmartDataListComponent
  ]
})
export class SmartDataListModule { }
