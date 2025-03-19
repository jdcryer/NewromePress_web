
import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Observable, EMPTY, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { mergeMap, take } from 'rxjs/operators';
import { Router, Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class DashboardResolverService implements Resolve<any> {
  constructor(private dataService: DataService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Observable<never> {

    let url = `${environment.apiSettings.endpoint}dashboarddata`;

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
