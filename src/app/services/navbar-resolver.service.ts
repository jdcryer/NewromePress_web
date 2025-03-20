import { Injectable } from "@angular/core";
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataService } from './data.service';
import { IUserSettings, INavData } from "../interfaces/smart-data-list";
import { environment } from "src/environments/environment";


@Injectable({
	providedIn: 'root'
})
export class NavBarResolver implements Resolve<any> {
	constructor(private translate: TranslateService, private dataService: DataService) { }
	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Observable<never> {
		let userSettings: IUserSettings = this.dataService.getStoredData('userSettings');

		return this.translate.get('NAVBAR').pipe(map((data) => {
			let nav: INavData[] = [];

		if((userSettings.username == 'Designer') || (userSettings.username == 'Michael Monos')) {
			nav.push({ name: 'Dashboard', url: '/dashboard', icon: 'fa-light fa-clipboard-list' });
			console.log(userSettings);
		};
      	nav.push({ name: 'Tasks', url: '/task', icon: 'fa-light fa-clipboard-list' });

      	if(userSettings.username == 'Designer') {
        	nav.push({ name: 'Admin', url: '/system-admin', icon: 'fa-light fa-cogs' });
      	};

      	nav.push({ name: 'Logout', fullUrl: `${environment.baseUrlTemp}WEB_REDIRECT/LOGOUT`, icon: 'fa-light fa-caret-square-left' });

			return nav;
		}));
	}

}
