import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskRoutingModule } from './task-routing.module';
import { TaskListingComponent } from './task-listing/task-listing.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { FormsModule } from '@angular/forms';
import { SmartDataListModule } from 'src/app/components/smart-data-list/smart-data-list.module';
import { ButtonBarModule } from 'src/app/components/button-bar/button-bar.module';
import { TranslateModule } from '@ngx-translate/core';
import { GridModule } from 'smart-webcomponents-angular/grid';
import { TabsModule } from 'smart-webcomponents-angular/tabs';
import { FileUploadModule } from 'smart-webcomponents-angular/fileupload';
import { SafePipeModule } from 'safe-pipe';

@NgModule({
  declarations: [
    TaskListingComponent,
    TaskDetailComponent
  ],
  imports: [
    CommonModule,
    TaskRoutingModule,
    FormsModule,
    SmartDataListModule,
    ButtonBarModule,
    TranslateModule,
    GridModule,
    TabsModule,
    FileUploadModule,
    SafePipeModule,
  ]
})
export class TaskModule { }
