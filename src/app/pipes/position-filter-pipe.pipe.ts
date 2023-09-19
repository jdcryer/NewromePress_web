
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'positionfilter',
	pure: false
})
export class PositionFilterPipe implements PipeTransform {
	transform(items: any[], filter: any): any {
		if(!items || !filter) return items;

		return items.filter(item => item.position.indexOf(filter.position) !== -1);
	}
}
