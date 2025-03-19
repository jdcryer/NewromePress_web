import { Component, OnInit, Input } from '@angular/core';
import { IChartOptions } from 'src/app/interfaces/dashboard';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { dateToDateString } from 'src/app/generic-functions';

@Component({
	selector: 'app-dashboard-component',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

	@Input('dashboardData') dashboardData: any;
	@Input('baseTop10Options') baseTop10Options: Partial<IChartOptions>;

	public bShowDashboardData = false;
	public toDate = '';
	public fromDate = '';

	private componentSubs = new Subscription();

	constructor(private dataService: DataService, private route: ActivatedRoute) { }

	ngOnInit() {
		let date = new Date()
    date.setDate(1);
		this.fromDate = dateToDateString(date); //Sets from date to the start of the current month.
    this.toDate = dateToDateString(new Date()); //Gets the current date

    this.route.data.subscribe((data: any) => {
      //data returned by API call in resolver

      this.applyDashboardData()



    });
	}

	ngOnDestroy() {
		//this.componentSubs.unsubscribe();
	}

	selectDateChange(): void {
		let queryString = `fromDate=${this.fromDate}&toDate=${this.toDate}`;
		this.dataService.getData('dashboarddata', queryString, (response) => {
      this.applyDashboardData();
			this.dashboardData = response;
			this.bShowDashboardData = true
			console.log(this.dashboardData);
		});
	};

  applyDashboardData() {

  };

}
