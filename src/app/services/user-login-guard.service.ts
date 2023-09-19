import { Injectable, Component } from "@angular/core";
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, Router } from '@angular/router';
import { DataService } from './data.service';

@Injectable({
	providedIn: 'root',
})
export class UserLoginGuard implements CanActivate {
	constructor(private router: Router, private dataService: DataService) {};
	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
		if(!this.dataService.getStoredData('loggedIn')) this.router.navigate(['login']);
		return true;
	}
}