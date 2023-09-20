import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GridComponent } from 'smart-webcomponents-angular/grid';

@Component({
  selector: 'app-grid-wrapper',
  templateUrl: './grid-wrapper.component.html',
  styleUrls: ['./grid-wrapper.component.scss']
})
export class GridWrapperComponent implements OnInit {

  @Input('gridWrapperInput') input!: IGridWrapperInput;
  @ViewChild('smartGrid', { static: false, read: GridComponent }) smartGrid!: GridComponent;

  public smartTheme = environment.smartTheme;

  public columns = [];
  public gridSource = {};

  constructor() { }

  ngOnInit(): void {
  }

  gridDoubleClick(event: any): void {
    if(this.input.doubleClickCallback) this.input.doubleClickCallback(event);
  };

  gridSort(event: any): void {
    console.log(event);
    if(this.input.gridSortCallback) this.input.gridSortCallback(event);
  };

  gridRowClass = (index: number, data: any) => {
    let response = '';

    if(this.input.rowClassCallback) response = this.input.rowClassCallback(index, data);

    if(response == '') {
      if (index % 2 === 0) {
        return 'row-alt';
      } else {
        return 'row-default';
      };
    }

    return response;
  };

}

export interface IGridWrapperInput {
  theme: string;
  dataSource: any;
  scrolling: string;
  columns: any[];
  selection: any;
  behavior: any;
  appearance: any;
  sorting: any;
  gridSortCallback?: Function;
  doubleClickCallback?: Function;
  rowClassCallback?: Function;
};
