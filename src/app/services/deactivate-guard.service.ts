import { Injectable, Component } from "@angular/core";
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
	providedIn: 'root',
})
export class CanDeactivateGuard implements CanDeactivate<Component> {

	canDeactivate(comp: Component, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState: RouterStateSnapshot): boolean {
		if(comp["pendingChanges"]) {
			return confirm("You have unsaved changes, are you sure you wish to leave without saving?");
		}
		return true;
	}
}