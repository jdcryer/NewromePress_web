import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Router, Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, EMPTY, of } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  	providedIn: 'root'
})
export class LangResolverService implements Resolve<any> {

  	constructor(private dataService: DataService, private router: Router, private translate: TranslateService) { }

  	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Observable<never> {
		let prop: any = '';
		if(route) prop = route?.routeConfig?.path?.toLocaleUpperCase();

		return this.translate.get(prop).pipe(
			take(1),
			mergeMap(data => {
				if(data) {
					return of(data);
				}else{
					// this.router.navigate(['errorreport']); //Route to error screen?
					return EMPTY;
				}
			})
		);
  	}
}
