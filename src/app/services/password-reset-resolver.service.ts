import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Router, Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, EMPTY, of } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  	providedIn: 'root'
})
export class PasswordResetResolver implements Resolve<any> {

  	constructor(private dataService: DataService, private router: Router) { }

  	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Observable<never> {
			if(route.queryParams.v){
				const url = `${environment.apiSettings.endpoint}checkreset?v=${route.queryParams.v}`;
				return this.dataService.httpGET(url).pipe(
					take(1),
					mergeMap(data => {
						if(data) {
							return of(data);
						}else{
							return EMPTY
						}	
					})
				);
			}else{
				return EMPTY;
			}
  	}
}