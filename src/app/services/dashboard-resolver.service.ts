
import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Observable, EMPTY, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { mergeMap, take } from 'rxjs/operators';
import { Router, Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { dateToDateString } from 'src/app/generic-functions';

@Injectable({
  providedIn: 'root',
})
export class DashboardResolverService implements Resolve<any> {
  constructor(private dataService: DataService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Observable<never> {

    let date = new Date()
    date.setDate(1);
		let fromDate = dateToDateString(date); //Sets from date to the start of the current month.
    let toDate = dateToDateString(new Date()); //Gets the current date
    // let queryString = `fromDate=${this.fromDate}&toDate=${this.toDate}`;
    let url = `${environment.apiSettings.endpoint}dashboarddata?fromDate=${fromDate}&toDate=${toDate}`;

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
