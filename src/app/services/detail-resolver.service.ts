import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import {
  Router,
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, EMPTY, of } from 'rxjs';
import { environment } from './../../environments/environment';
import { mergeMap, take } from 'rxjs/operators';
import { MessageBoxService } from './message-box.service';

@Injectable({
  providedIn: 'root',
})
export class DetailResolverService implements Resolve<any> {
  constructor(private dataService: DataService, private router: Router, private messageBox: MessageBoxService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Observable<never> {
		let id = route.paramMap.get('id')
    if (id) {
      let target = '';
      if (route.routeConfig) {
        if (route.routeConfig.path) {
          target = route.routeConfig.path.replace('-detail', '');
          target = target.replace('/:id', '');
        }
      }
      let originalTarget = target;

      if(target === 'error-report') target = 'errorReport';
      if(target === 'host-brand') target = 'hostBrand';

      let queryString = '';

      switch (target) {
        case 'task': {
          queryString ='&fields=*,task_taskContact.*,task_taskContact.taskContact_contact.*';
          break;
        }
        case 'host': {
          queryString =
          '&fields=*,host_hostBrand.*,host_hostBrand.hostBrand_brand.name';
        }
      }

      const url = `${environment.apiSettings.endpoint}${target}?id=${id}${queryString}`;
      return this.dataService.httpGET(url).pipe(
        take(1),
        mergeMap((data) => {
          if (data) {
            if(data.response) {
              if(data.response[target]) {
                console.log(data);
                return of(data);
              }else {
                //Good response from server, but record not found, reroute to listing page and display error message
                this.messageBox.showError('Record not found!', 'The record you are trying to access has likely been deleted / merged with another');
                this.router.navigate([ originalTarget ]);
                return EMPTY;
              };
            };
          }
          this.router.navigate([ '404' ]);
          return EMPTY;
        })
      );
    } else {
			this.router.navigate([ '404' ]);
      return EMPTY;
    }
  }
}
