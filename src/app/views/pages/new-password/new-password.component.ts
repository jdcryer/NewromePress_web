import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { MessageBoxService } from 'src/app/services/message-box.service';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.scss']
})
export class NewPasswordComponent implements OnInit, OnDestroy {

  public bPasswordMatch = true;
	public bLinkValid = false;
	public bSubmitDisabled = true;

	public pass1: string = '';
	public pass2: string = '';

	private componentSubs = new Subscription();
	private resetId: string = '';

  constructor(private activatedRoute: ActivatedRoute, private dataService: DataService,
		private router: Router, private messageBox: MessageBoxService) { }

  ngOnInit(): void {
    this.componentSubs.add(this.activatedRoute.data.subscribe((data: any) => {
		if(data.data) {
			if(data.data.success) {
				this.bLinkValid = true;
			}
		}
	}));
	this.componentSubs.add(this.activatedRoute.queryParams.subscribe((queryParams) => {
		if(queryParams.v) this.resetId = queryParams.v;
	}));
  }

  ngOnDestroy(): void {
    this.componentSubs.unsubscribe();
  }

  inputPasswordChange(event: any): void {
		this.bPasswordMatch = (this.pass1 === this.pass2);
		this.bSubmitDisabled = !this.bPasswordMatch //Will have further checks on next pass
	}

	submit(): void {
		let postData = {
			resetUUID: this.resetId,
			password: this.pass1
		};
		this.dataService.postData('passwordUpdate', postData, (response) => {
			this.messageBox.showSuccess('Password Updated!');
			this.router.navigate([ 'login' ]);
		});
	}

}
