import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'app-admin-scheduler-day-button',
	templateUrl: './admin-scheduler-day-button.component.html',
	styleUrls: ['./admin-scheduler-day-button.component.scss']
})
export class AdminSchedulerDayButtonComponent implements OnInit {

	@Input() bDisabled: boolean = false;
	@Input() value!: number;
	@Input() label!: string;
	@Input('selectedDays') set selectedDays(value: number[]){
		this._selectedDays = value;
		this.refreshClass();
	}

	@Output() clicked = new EventEmitter();

	public buttonClass = 'btn btn-primary';
	private _selectedDays: number[] = [];

	constructor() { }

	ngOnInit() {
	}

	refreshClass() {
		this.buttonClass = (this._selectedDays.indexOf(this.value) >= 0) ? 'btn btn-primary mr-1' : 'btn btn-outline-primary mr-1';
	}

	buttonClicked() {
		this.clicked.emit(this.value);
	}
}
