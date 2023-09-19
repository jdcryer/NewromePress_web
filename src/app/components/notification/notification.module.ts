import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationListComponent } from './notification-list/notification-list.component';
import { NotificationItemComponent } from './notification-item/notification-item.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [
    NotificationListComponent,
    NotificationItemComponent
  ],
  exports: [
    NotificationListComponent,
    NotificationItemComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule
  ]
})
export class NotificationModule { }
