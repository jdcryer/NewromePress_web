import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { IColumn } from 'src/app/interfaces/smart-data-list';

@Component({
  selector: 'app-smart-view-editor-column',
  templateUrl: './smart-view-editor-column.component.html',
  styleUrls: ['./smart-view-editor-column.component.scss']
})
export class SmartViewEditorColumnComponent implements OnInit {

  @Output() editComplete = new EventEmitter();

	public VIEWCOLUMNEDITOR = { TITLE: 'Column Settings', OK: 'OK', CANCEL: 'Cancel',
		HEADER: 'Header', AGGREGATE: 'Aggregates', SUM: 'Sum', MIN: 'Min', MAX: 'Max', 
		AVG: 'Average', ALIGNLEFT: 'Left', ALIGNCENTER: 'Center', ALIGNRIGHT: 'Right',
		ALIGNMENT: 'Alignment', WIDTH: 'Width', WIDTHUNIT: 'Unit', ATTRIBUTE: 'Attribute',
    DISPLAYFORMAT: 'Display Format'
	};
	private componentSubs: Subscription = new Subscription();
	public columnData: IColumn = { id: '', header: '', fieldName: '', fieldNumber: 0, table: '', fieldType: '', displayFormat: '', width: 0, widthUnit: '', alignment: '', min: false, max: false, sum: false, avg: false, attribute: '' };
	private selectedIndex: number = 0;

	constructor(private translate: TranslateService) { }

	ngOnInit() {
		this.componentSubs.add(this.translate.get('VIEWCOLUMNEDITOR').subscribe((data) => {
			this.VIEWCOLUMNEDITOR = data;
		}));
	}

	public loadData(data: IColumn, index: number): void {
		this.selectedIndex = index;
		this.columnData = data;
	}

	public btCancelClick(event: any): void {
		this.editComplete.emit(null);		
	}

	public btOkClick(event: any): void {
		this.editComplete.emit({ data: this.columnData, index: this.selectedIndex });
	}

	public onAlignmentChange(event: string): void {
		this.columnData.alignment = event;
	}

  infoClick(): void {
    window.open('https://www.htmlelements.com/angular/demos/grid/column-formatting/#toc-cellsformat_string', '_blank');
  };
}
