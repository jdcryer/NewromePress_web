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

	public bShowDashboardData = false;
	public toDate = '';
	public fromDate = '';
	public dashboardData: any;

	public top10ProdOptions: Partial<IChartOptions>;
	private componentSubs = new Subscription();

	public baseTop10Options: Partial<IChartOptions> = {
		series: [
			{ name: 'Value', type: 'column', data: [] },
			{ name: 'Quantity', type: 'column', data: [] }
		],
		chart: {
			height: 400,
			type: 'bar',
			stacked: false,
			zoom: {
				enabled: true,
				type: 'x',  
				autoScaleYaxis: false,  
				zoomedArea: {
					fill: {
						color: '#90CAF9',
						opacity: 0.4
					},
					stroke: {
						color: '#0D47A1',
						opacity: 0.4,
						width: 1
					}
				}
			}
		},
		dataLabels: { enabled: false },
		title: {
			text: 'Top Products (Last Week)',
			align: 'left',
			style: {
				fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
				fontWeight: '500',
				fontSize: '21px'
			}
		},
		xaxis: {
			categories: [],
			labels: { rotateAlways: true }
		},
		yaxis: [
			{
				axisTicks: { show: true },
				axisBorder: {
					show: true,
					color: '#008FFB'
				},
				labels: { style: { colors: '#008FFB' } },
				title: {
					text: 'Value',
					style: { color: '#008FFB' }
				},
				tooltip: { enabled: true }
			},
			{
				opposite: true,
				decimalsInFloat: 0,
				axisTicks: { show: true },
				axisBorder: {
					show: true,
					color: '#00E396'
				},
				labels: { style: { colors: '#00E396' } },
				title: {
					text: 'Quantity',
					style: { color: '#00E396' }
				},
				tooltip: { enabled: true }
			}
		],
		tooltip: {
			fixed: {
				enabled: true,
				position: "topLeft", // topRight, topLeft, bottomRight, bottomLeft
				offsetY: 30,
				offsetX: 60
			}
		},
		legend: {
			show: false,
			horizontalAlign: "left",
			offsetX: 40
		}
	};

	constructor(private dataService: DataService, private route: ActivatedRoute) { }

	ngOnInit() {
		let date = new Date()
    	date.setDate(1);
		this.fromDate = dateToDateString(date); //Sets from date to the start of the current month.
    	this.toDate = dateToDateString(new Date()); //Gets the current date

    	this.route.data.subscribe((data: any) => {
      //data returned by API call in resolver
		this.dashboardData = data.dashData;
	  
		this.top10ProdOptions = JSON.parse(JSON.stringify(this.baseTop10Options));
		console.log(this.baseTop10Options)	  
      	this.applyDashboardData()
		//console.log(this.dashboardData);
		console.log(this.top10ProdOptions)	  

    });
	}

	ngOnDestroy() {
		//this.componentSubs.unsubscribe();
	}

	selectDateChange(): void {
		let queryString = `fromDate=${this.fromDate}&toDate=${this.toDate}`;
		this.dataService.getData('dashboarddata', queryString, (response) => {
		this.dashboardData = response;
      	this.applyDashboardData();
			//this.bShowDashboardData = true
			console.log(this.dashboardData);
		});
	};

  applyDashboardData() {

	this.top10ProdOptions = JSON.parse(JSON.stringify(this.baseTop10Options));
	//this.top10ProdOptions = this.baseTop10Options;
	if (this.top10ProdOptions) {
		if (this.top10ProdOptions.series) {
			this.top10ProdOptions.series[0].data = this.dashboardData.topProducts.map(a => a.value);
				this.top10ProdOptions.series[1].data = this.dashboardData.topProducts.map(a => a.qty);
				console.log("series OK")	  
				console.log(this.top10ProdOptions.series[0].data)	  
				console.log(this.top10ProdOptions.series[1].data)	  
			}
		if (this.top10ProdOptions.xaxis) {
			this.top10ProdOptions.xaxis.categories = this.dashboardData.topProducts.map(a => a.code);
			console.log("axis OK")	  
			console.log(this.top10ProdOptions.xaxis.categories)	  
		}
	}
	// console.log(JSON.parse(JSON.stringify(this.baseTop10Options)))	  
	console.log(this.baseTop10Options)	  
	console.log(this.top10ProdOptions)	  
	// console.log(this.dashboardData.topProducts.map(a => a.value))
	// console.log(this.dashboardData.topProducts.map(a => a.qty))
	// console.log(this.dashboardData.topProducts.map(a => a.code))
	
  };

}
