import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridModule } from 'smart-webcomponents-angular/grid';
import { FormsModule } from '@angular/forms';
import { SmartTabsEditorComponent } from './smart-tabs-editor.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
	declarations: [
		SmartTabsEditorComponent
	],
	imports: [
		CommonModule,
		GridModule,
		FormsModule,
		TranslateModule,
  ],
  exports: [
		SmartTabsEditorComponent
	]
})
export class SmartTabsEditorModule { }