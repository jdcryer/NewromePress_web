import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { IChoiceList, ModalSelectGenericComponent } from '../modal-select-generic/modal-select-generic.component';
import { GridComponent, Smart, GridColumn } from 'smart-webcomponents-angular/grid';
import { SmartViewEditorComponent } from '../smart-view-editor/smart-view-editor.component';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { IView, IUserSettings, IQueryData, IQueryLine } from 'src/app/interfaces/smart-data-list';
import { DataService } from 'src/app/services/data.service';
import { MessageBoxService } from 'src/app/services/message-box.service';

@Component({
  selector: 'app-admin-views',
  templateUrl: './admin-views.component.html',
  styleUrls: ['./admin-views.component.scss']
})
export class AdminViewsComponent implements OnInit, OnDestroy {

  @ViewChild('gridView', { static: false, read: GridComponent }) gridView!: GridComponent;
	@ViewChild('viewEditor', { static: true, read: SmartViewEditorComponent }) viewEditor!: SmartViewEditorComponent;
	@ViewChild('modalResourceSelect', { static: true, read: ModalSelectGenericComponent }) modalResourceSelect!: ModalSelectGenericComponent;

  public filterName: string = '';
	public filterUsername: string = '';
	public filterHandle: string = '';
	public handleLookup: IChoiceList[] = [ 
    { value: 'task', displayText: 'Task' },
  ];

  public targetResource: string = 'task';
  public smartTheme: string = environment.smartTheme;

  private componentSubs = new Subscription();
  private viewData: IView[] = [];

  constructor(private dataService: DataService, private messageBox: MessageBoxService) { }

  public gridViewSource = new Smart.DataAdapter({
    mapChar: '.',
    datafields: [
      { name: 'id', type: 'string' },
			{ name: 'name', type: 'string' },
			{ name: 'handle', type: 'string' },
			{ name: 'default', type: 'boolean' },
			{ name: 'fk_user', type: 'string' },
			{ name: 'detail', type: 'object' },
			{ name: 'username', type: 'string', map: 'interface_user.name' }
    ],
    id: 'id',
    dataSource: []
  });
  public gridViewColumns: GridColumn[] = [
		{ label: 'Name', dataField: 'name', width: '40%' },
		{ label: 'Owner', dataField: 'username', width: '30%' },
		{ label: 'Handle', dataField: 'handle', width: '15%' },
		{ label: 'Default', dataField: 'default', template: 'checkBox' }
  ];
  public gridSettings = {
    sorting: {
      enabled: true
    },
    appearance: {
      alternationStart: 0,
      alternationCount: 2
    },
    behavior: {
      columnResizeMode: 'growAndShrink'
    },
    selection: {
      enabled: true,
      defaultSelection: true,
      mode: 'one'
    }
  };

  ngOnInit(): void {
    this.refreshViewGrid();
  };

  ngOnDestroy() {
		this.componentSubs.unsubscribe();
  };
  
  filterChanged(): void {
    this.refreshViewGrid();
  };

  gridDoubleClick(event: any): void {
    this.viewEditor.openModal(event.detail.row.data.id, 'editview', event.detail.row.data.handle);
  };

  viewEditComplete(event: any): void {
    this.refreshViewGrid();
  };

  resourceSelected(resource: string): void {
		this.modalResourceSelect.modal('hide');
		this.viewEditor.openModal('', 'newview', resource);
  };
  
  btImport(): void {

  }
  btExport(): void {

  }
  btDuplicate(): void {
    this.gridView.getSelectedRowIndexes().then(rows => {
      if (rows.length > 0) {
        let index = -1;
        for(let i = 0; i < rows.length; i++) { if(rows[i]) index = rows[i] };
        this.viewEditor.openModal(this.viewData[index].id, 'dupeview', this.viewData[index].handle);
      }else {
        this.messageBox.showWarning("Please first select the View to duplicate");
      }
    });
  };

  btNewView(): void {
    this.modalResourceSelect.open();
  };

  btDeleteView(): void {
    this.gridView.getSelectedRowIndexes().then(rows => {
      if (rows.length > 0) {
        let index = -1;
        for(let i = 0; i < rows.length; i++) { if(rows[i]) index = rows[i] };
        const msg = `Are you sure you wish to delete the view ${this.viewData[index].name}?`;
        if(confirm(msg)) {
          this.dataService.deleteData('interface', this.viewData[index].id, (response: any) => {
            this.messageBox.showSuccess('View Deleted');
            this.refreshViewGrid();
          });	
        }
      }else {
        this.messageBox.showWarning("Please first select the View to delete");
      }
    });
  };

  refreshViewGrid(): void {
    let query: IQueryData = { targetResource: 'interface', query: [] };

		let qLine: IQueryLine = { field: 'type', operator: '=', value: 1 };
		query.query.push(qLine);

		if(this.filterName != '') {
			let qLine: IQueryLine = { field: 'name', operator: '=', value: `${this.filterName}@`, conjunction: '&' };
			query.query.push(qLine);
		}

		if(this.filterHandle != '') {
			let qLine: IQueryLine = { field: 'handle', operator: '=', value: this.filterHandle, conjunction: '&' };
			query.query.push(qLine);
		}

		if(this.filterUsername != '') {
			if((this.filterUsername === 'system') || (this.filterUsername === 'System')) {
				let qLine: IQueryLine = { field: 'fk_user', operator: '=', value: ``, conjunction: '&' };
				query.query.push(qLine);	
			}else {
				let qLine: IQueryLine = { field: 'interface_user', attribute: 'name', operator: '=', value: `${this.filterUsername}@`, conjunction: '&' };
				query.query.push(qLine);	
			}
		}

		this.dataService.getData('interface', '', (response: any) => {
			this.viewData = response.response.interface;
			if(this.viewData != null) {
				this.viewData.forEach((element) => {
					if(!element.interface_user) element.interface_user = { name: 'System' };
				});
      }
      this.gridView.clearSelection();

      let tempGridSource = new Smart.DataAdapter({
        mapChar: '.',
        dataFields: [
          { name: 'id', type: 'string' },
          { name: 'name', type: 'string' },
          { name: 'handle', type: 'string' },
          { name: 'default', type: 'boolean' },
          { name: 'fk_user', type: 'string' },
          { name: 'detail', type: 'object' },
          { name: 'username', type: 'string', map: 'interface_user.name' }
        ],
        id: 'id',
        dataSource: this.viewData
      });
      this.gridView.dataSource = tempGridSource;
		}, null, query);
  };

}
