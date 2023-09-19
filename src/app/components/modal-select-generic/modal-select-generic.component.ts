import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal-select-generic',
  templateUrl: './modal-select-generic.component.html',
  styleUrls: ['./modal-select-generic.component.scss']
})
export class ModalSelectGenericComponent implements OnInit {
  
  @Input('choiceList') choiceList: IChoiceList[] = [];
	@Input('windowTitle') windowTitle: string = '';
  @Input('reference') reference: string = 'select-modal-generic';

	@Output() valueSelected = new EventEmitter(); 

	public selectValue = '';
	public okDisabled = true;

	constructor() { }

	ngOnInit() {
	}

	public modal(action: 'hide' | 'show'): void {
		$(`#${this.reference}`).modal(action);
	}

	open(): void {
		this.selectValue = '';
		this.okDisabled = true;
		this.modal('show');
	}

	selectChange(event: any): void {
		this.okDisabled = (this.selectValue === '');
	}

	btOkClick(event: any): void {
		this.valueSelected.emit(this.selectValue);
	}

	btCancelClick(event: any): void {
		this.modal('hide');
	}
}

export interface IChoiceList {
	value: any;
	displayText: string;
}
