import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Observable, EMPTY, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { mergeMap, take } from 'rxjs/operators';
import { Router, Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { IUserSettings } from '../interfaces/smart-data-list';

@Injectable({
  providedIn: 'root',
})
export class ClientUserResolverService implements Resolve<any> {
	constructor(private dataService: DataService) {}
	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Observable<never> {
		let userSettings: IUserSettings = this.dataService.getStoredData('userSettings');

		let url = `${environment.apiSettings.endpoint}user?fk_record=${userSettings.fk_client}&tableId=1`;

		return this.dataService.httpGET(url).pipe(
      take(1),
      mergeMap((data) => {
        if (data) {
          return of(data);
        } else {
          return EMPTY;
        }
      })
    );
	}
}
