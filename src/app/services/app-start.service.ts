import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { map, catchError } from 'rxjs/operators';
import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { DataService } from './data.service';
import { IUserSettings } from '../interfaces/smart-data-list';

@Injectable({
	providedIn: 'root'
})
export class AppStartService {
	constructor(private translate: TranslateService, private http: HttpClient, private dataService: DataService) {}

	getUserSettings(): Promise<any> {
		if(document.baseURI != "http://localhost:4200/") {
			environment.apiSettings.endpoint = document.baseURI.replace('dist', 'app');
			environment.baseUrlTemp = document.baseURI.replace('dist/', '');
		}
		const url = `${environment.apiSettings.endpoint}currentUser`;
		return this.http.get<IUserSettings>(url).pipe(map(response => {
			if(response.prefs){
				this.dataService.setStoredData('userSettings', response);
				this.dataService.setStoredData('loggedIn', true);
				if(response.prefs.lang){
					this.translate.use(response.prefs.lang);
				}
			}else{
				this.dataService.setStoredData('loggedIn', false);
			}
		})).toPromise();
	}


}
