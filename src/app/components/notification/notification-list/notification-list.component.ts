import { Component, EventEmitter, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { NotificationItemComponent } from '../notification-item/notification-item.component';
import { environment } from 'src/environments/environment';
import { IUserSettings } from 'src/app/interfaces/smart-data-list';
import { INotification } from 'src/app/interfaces/table-definitions';
import { DataService } from 'src/app/services/data.service';
import { MessageBoxService } from 'src/app/services/message-box.service';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements OnInit {

  @Output() countUpdate = new EventEmitter();
  @ViewChildren(NotificationItemComponent) qlNotificationItems !: QueryList<NotificationItemComponent>;

  public notifications: INotification[] = [];
  public bMoreItems: boolean = true;
  public smartTheme = environment.smartTheme;
	public selectOption: string = 'All';

  private updateTimestamp: string;
  private pageNum: number = 1;
  private pageSize: number = 20;
  private selectToken: string = '';
	private userSettings: IUserSettings;


  constructor(private dataService: DataService, private messageBox: MessageBoxService) { }

  ngOnInit() {
		this.updateTimestamp = new Date().toISOString();
		this.userSettings = this.dataService.getStoredData('userSettings');
		this.getNotificationCount();
		this.getSelectToken();
		setInterval(this.update, 60000);
	};

  getSelectToken(): void {
		this.notifications = [];

		let queryString = 'order_by=createdTS;<';
		if(this.selectOption === 'Read') queryString += '&read=true';
		if(this.selectOption === 'Unread') queryString += '&read=false';
		
		this.dataService.getData('notification', queryString, (response) => {
			this.selectToken = response.selectToken;
			this.getNotifications();
		}, null, null, true);
	};

  getNotificationCount(): void {
		this.dataService.getData('notification/count', 'read=false', (response) => {
			this.countUpdate.emit(response.count);
		});
	};

  getNotifications(): void {
		const queryString = `page=${this.pageNum}&pagesize=${this.pageSize}&selectToken=${this.selectToken}`;
		this.dataService.getData('notification', queryString, (response) => {
			if(response.response.notification) {
				this.notifications = this.notifications.concat(response.response.notification);
				this.bMoreItems = (response.response.notification.length === 20);
			}else {
        this.bMoreItems = false;
      };
		});
	};

  getNewNotification(): void {
		const queryData = { targetResource: 'notification', query: [ { field: 'createdTS', operator: '>', value: this.updateTimestamp } ] };
		this.dataService.getData('notification', 'order_by=createdTS;<', (response) => {
			if(response.response.notification) {
				this.notifications.unshift(...response.response.notification);
				this.updateTimestamp = new Date().toISOString();
			}
		}, null, queryData);
	};

  selectChange(event: any): void {
		this.pageNum = 1;
		this.getSelectToken();
	};

	buttonLoadMoreClick(): void {
		this.pageNum++;
		this.getNotifications();
	};

	itemStateChange(event: any){
    this.update();
	};
	
	itemDeleted(index: any){
    this.notifications.splice(index, 1);
  };

	buttonMarkAllClick(): void {
		const postData = { userId: this.userSettings.id };
		this.dataService.postData('notificationAllRead', postData, (response) => {
			this.getSelectToken();
			this.getNotificationCount();
		});
	};

  update = () => {
    if(this.qlNotificationItems != undefined){
      let arItems = this.qlNotificationItems.toArray();
       arItems.forEach(element => { element.update(); });
    }
    this.getNewNotification();
    this.getNotificationCount();
  };
}
