import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { param } from 'jquery';
import { dateToDateString, dtStringToDate } from 'src/app/generic-functions';
import { IScheduleParameter } from '../admin-scheduler/admin-scheduler.component';

@Component({
	selector: 'app-admin-scheduler-parameter',
	templateUrl: './admin-scheduler-parameter.component.html',
	styleUrls: ['./admin-scheduler-parameter.component.scss']
})
export class AdminSchedulerParameterComponent implements OnInit {

	@Input('disabledAdmin') disabledAdmin: boolean = true;
	@Input('myIndex') myIndex!: number;
	@Input('paramData') paramData!: IScheduleParameter;

	@Output() deleteClicked = new EventEmitter()
	@Output() valueChange = new EventEmitter()

	public dateValue: string = '';

	constructor() { }

	ngOnInit() {
		if(this.paramData.type == 'date'){
			let date = new Date(this.paramData.value);
			this.dateValue = dateToDateString(date);
		}
	}

	dateValueChange(event: any): void {
		let date = dtStringToDate(this.dateValue);
		this.paramData.value = date.toISOString().substring(0, 19);
		this.valueChange.emit();
	}

	btDeleteClick(): void {
		this.deleteClicked.emit(this.myIndex);
	}

	inputChanged(event: any): void {
		this.valueChange.emit();
	}

	typeChanged(event: any): void {
		this.valueChange.emit();
		//If bool type selected, convert value to bool
		if(this.paramData.type === 'boolean') {
			if((this.paramData.value === 'True') || (this.paramData.value === 'true')) {
				this.paramData.value = true;
			}else {
				this.paramData.value = false;
			}
		}
	}
}
