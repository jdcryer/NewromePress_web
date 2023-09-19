import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { DataService } from 'src/app/services/data.service';


@Component({
  templateUrl: './login.component.html',
  styleUrls: [ './login.component.scss' ]
})
export class LoginComponent implements OnInit {
	public bLoginFailed: boolean = false;

	constructor( private route: Router, private dataService: DataService,
		private translate: TranslateService){ }

	ngOnInit(): void {}

	login(user: string, pass: string){
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Basic ${btoa(`${user}:${pass}`)}`
      })
		};
		this.dataService.getData('login', '', (response) => {
			if(response.response === 'OK'){
				this.dataService.getData('currentUser', '', (response) => {
					if((response.noCookie) && (environment.production))  {
						this.route.navigate([ 'nocookie' ]);
					}else {
						if(response.prefs){
							this.dataService.setStoredData('userSettings', response);
							this.dataService.setStoredData('loggedIn', true);
							if(response.prefs.lang){
								this.translate.use(response.prefs.lang);
							}
							this.route.navigate([ 'dashboard' ]);
						}
					}
				}, null, null, false, httpOptions);
		
			}else{
				//Alert toaster
				this.bLoginFailed = true;
			}
		}, null, null, false, httpOptions);
	}
}

