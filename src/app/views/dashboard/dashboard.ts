import { Component, OnInit, Input } from '@angular/core';
import { IChartOptions } from 'src/app/interfaces/dashboard';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';

@Component({
	selector: 'app-dashboard-component',
	templateUrl: './dashboard.html',
	styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {

	@Input('dashboardData') dashboardData: any;
	@Input('baseTop10Options') baseTop10Options: Partial<IChartOptions>;

	public bShowDashboardData = false;
	public toDate : Date = new Date();
	public fromDate : Date = new Date();
	
	private componentSubs = new Subscription();

	constructor(private dataService: DataService) { }

	ngOnInit() {
		let toDate = new Date();//Gets the current date
		let fromDate = toDate.setDate(1);//Sets from date to the start of the current month.

		// this.dataService.getData('company', 'fields=id,name&order_by=name;>&dashboardType=web', (response) => {
		// 	this.companies = response.response.company;
		// });
	}

	ngOnDestroy() {
		//this.componentSubs.unsubscribe();
	}

	selectDateChange(): void {
		let queryString = `fromDate=${this.fromDate}&toDate=${this.toDate}`;
		this.dataService.getData('dashboarddata', queryString, (response) => {
			this.dashboardData = response;
			this.bShowDashboardData = true
			console.log(this.dashboardData);
		});
	}
	
}
