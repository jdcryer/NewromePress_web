import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { createAgeString } from 'src/app/generic-functions';
import { INotification } from 'src/app/interfaces/table-definitions';
import { DataService } from 'src/app/services/data.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-notification-item',
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss']
})
export class NotificationItemComponent implements OnInit {

  @Input() notificationData: INotification;
	@Input() myIndex: number;
	@Output() delete = new EventEmitter();
	@Output() stateChange = new EventEmitter();

	public notiAge: string = '';
	public wrapperClass: string = 'notificationWrapper ';
    public markAsReadTooltip: string = 'Mark as Read';
    public markAsReadIcon: string = 'fa fa-check';
	public iconClass: string = 'fa fa-bug fa-lg';

	constructor(private dataService: DataService, private router: Router) { }

	ngOnInit() {
		this.calcClasses();
    this.update();
	}

	ngAfterViewInit(): void {
		$(`#delete${this.myIndex}`).tooltip();
		$(`#markAs${this.myIndex}`).tooltip();
	}

	postMarkAsRead(): void {
		const postData = {
			id: this.notificationData.id,
			read: !this.notificationData.read
		};
		this.dataService.postData('notification', postData, (response) => {
			this.notificationData.read = !this.notificationData.read;
			this.calcClasses();
			this.stateChange.emit();
		});
	}

	notificationClick(event: any): void {
		event.stopPropagation();

		let externalLink = false;
		let target = '';
		switch(this.notificationData.type) {
			case 'changeNew' :
      case 'changeUpdate' : {
          target = 'change/change-detail';
          break;
      }
      case 'ticketNew' :
      case 'ticketUpdate' : {
          target = 'ticket/ticket-detail';
          break;
      }
			case 'exportview': {
				target = `${environment.baseUrlTemp}reports/${this.notificationData.detail.filename}`;
				externalLink = true;
				break;
			};
		}
		if(!this.notificationData.read) this.postMarkAsRead();
		if(externalLink) {
			window.open(target);
		}else {
			this.router.navigate( [ `${target}/${this.notificationData.fk_record}` ] );
		}
	}

	markAsRead(event: any){
		event.stopPropagation();
		this.postMarkAsRead();
	}

	deleteThis(event: any) {
		event.stopPropagation();
	};

	calcClasses(){
		let a = this.myIndex / 2;
		let b = Math.round(this.myIndex / 2);
		this.wrapperClass += (a != b) ? 'notiWrapperGray ' : 'notiWrapperWhite ';
		this.wrapperClass += (this.notificationData.read) ? 'notiWrapperRead' : 'notiWrapperUnread';

		this.markAsReadIcon = (this.notificationData.read) ? 'fa fa-flag' : 'fa fa-check';
		this.markAsReadTooltip = (this.notificationData.read) ? 'Mark as Unread' : 'Mark as Read';
		switch(this.notificationData.type) {
			case 'exportview': {
				this.iconClass = 'fa fa-file-alt fa-lg';
				break;
			}
			case 'shopifyimport': {
				this.iconClass = 'fa fa-boxes-alt fa-lg';
				break;
			}
			case 'docupdate': {
				this.iconClass = 'fa fa-certificate fa-lg';
				break;
			}
		}
	}

	public update(){
    let obj = createAgeString(new Date(this.notificationData.createdTS));
    // if more than approx 2 days old show date string, else, age
    this.notiAge = (obj["num"] > 170550638) ? new Date(this.notificationData.createdTS).toLocaleDateString() : `${obj["string"]} ago`;
  }

}
