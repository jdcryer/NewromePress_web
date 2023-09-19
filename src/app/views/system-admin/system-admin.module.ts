import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SystemAdminRoutingModule } from './system-admin-routing.module';
import { SystemAdminComponent } from './system-admin.component';
import { AdminViewsComponent } from 'src/app/components/admin-views/admin-views.component';
import { AdminLookupsComponent } from 'src/app/components/admin-lookups/admin-lookups.component';
import { FormsModule } from '@angular/forms';
import { GridModule } from 'smart-webcomponents-angular/grid';
import { TabsModule } from 'smart-webcomponents-angular/tabs';
import { SmartViewEditorModule } from 'src/app/components/smart-view-editor/smart-view-editor.module';
import { ModalSelectGenericComponent } from 'src/app/components/modal-select-generic/modal-select-generic.component';
import { TranslateModule } from '@ngx-translate/core';
import { AdminTabsComponent } from '../../components/admin-tabs/admin-tabs.component';
import { SmartTabsEditorModule } from 'src/app/components/smart-tabs-editor/smart-tabs-editor.module';
import { AdminSchedulerComponent } from '../../components/admin-scheduler/admin-scheduler.component';
import { AdminSchedulerDayButtonComponent } from '../../components/admin-scheduler-day-button/admin-scheduler-day-button.component';
import { AdminSchedulerParameterComponent } from '../../components/admin-scheduler-parameter/admin-scheduler-parameter.component';
import { MenuModule } from 'smart-webcomponents-angular/menu';

@NgModule({
  declarations: [
    SystemAdminComponent,
    AdminViewsComponent,
    AdminLookupsComponent,
    ModalSelectGenericComponent,
    AdminTabsComponent,
    AdminSchedulerComponent,
    AdminSchedulerDayButtonComponent,
    AdminSchedulerParameterComponent,
  ],
  imports: [
    CommonModule,
    SystemAdminRoutingModule,
    FormsModule,
    GridModule,
    TabsModule,
    MenuModule,
    SmartViewEditorModule,
    SmartTabsEditorModule,
    TranslateModule
  ]
})
export class SystemAdminModule { }
