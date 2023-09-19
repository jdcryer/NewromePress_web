
import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Observable, EMPTY, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { mergeMap, take } from 'rxjs/operators';
import { Router, Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class LookupResolverService implements Resolve<any> {
	constructor(private dataService: DataService) {}

	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Observable<never> {
		let path = '';

		if (route.routeConfig) {
			if (route.routeConfig.path) {
				path = route.routeConfig.path.replace('-listing', '');
				path = path.replace('-detail', '');
				path = path.replace('/:id', '');
			}
		}

		let list = '';
		switch(path) {
			case 'change' : {
				list = 'change;priority,change;status,change;area';
				break;
			}
			case 'ticket' : {
				list = 'ticket;priority,ticket;state,ticket;queue,ticket;progress,ticket;cause';
				break;
			}
      case 'company': {
        list = 'company;companyType';
        break;
      }
		}

		let url = `${environment.apiSettings.endpoint}lookups?list=${list}`;

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
	};


};