import { Component, OnInit, ViewChild } from '@angular/core';
import { SmartTabsEditorComponent } from '../smart-tabs-editor/smart-tabs-editor.component';
import { GridColumn, GridComponent, Smart } from 'smart-webcomponents-angular/grid';
import { IChoiceList, ModalSelectGenericComponent } from '../modal-select-generic/modal-select-generic.component';
import { IQueryData, IQueryLine, ITabs, IUserSettings } from 'src/app/interfaces/smart-data-list';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DataService } from 'src/app/services/data.service';
import { MessageBoxService } from 'src/app/services/message-box.service';

@Component({
  selector: 'app-admin-tabs',
  templateUrl: './admin-tabs.component.html',
  styleUrls: ['./admin-tabs.component.scss']
})
export class AdminTabsComponent implements OnInit {

  @ViewChild('gridTabs', { static: false, read: GridComponent }) gridTabs: GridComponent;
	@ViewChild('tabEditor', { static: true, read: SmartTabsEditorComponent }) tabEditor: SmartTabsEditorComponent;
	@ViewChild('modalResourceSelect', { static: true, read: ModalSelectGenericComponent }) modalResourceSelect: ModalSelectGenericComponent;

  public filterName: string = '';
	public filterUsername: string = '';
	public filterHandle: string = '';
	public handles = [ 'change', 'ticket' ];
	public handleLookup: IChoiceList[] = [ 
    { value: 'ticket', displayText: 'Ticket' },
    { value: 'change', displayText: 'Change' },
    { value: 'company', displayText: 'Company' },
    { value: 'host', displayText: 'Host' },
    { value: 'hostBrand', displayText: 'Host-Brand' },
    { value: 'errorReport', displayText: 'Ticket' },
  ];

  public targetResource: string = 'ticket';
  public smartTheme: string = environment.smartTheme;

  private userSettings: IUserSettings;
  private componentSubs = new Subscription();
  private tabData: ITabs[] = [];

  public gridTabsDataFields = [
    { name: 'id', dataType: 'string' },
    { name: 'name', dataType: 'string' },
    { name: 'handle', dataType: 'string' },
    { name: 'default', dataType: 'boolean' },
    { name: 'fk_user', dataType: 'string' },
    { name: 'detail', dataType: 'object' },
    { name: 'interface_user', dataType: 'object' },
    { name: 'username', dataType: 'string', map: 'interface_user.username' }
  ];
  public gridTabsSource = new Smart.DataAdapter({
    mapChar: '.',
    dataFields: this.gridTabsDataFields,
    id: 'id',
    dataSource: []
  });
  public gridTabsColumns: GridColumn[] = [
    { label: 'Handle', dataField: 'handle', width: '50%' },
		{ label: 'Owner', dataField: 'username', width: '50%' },
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

  constructor(private dataService: DataService, private messageBox: MessageBoxService) { }

  ngOnInit(): void {
    this.refreshTabGrid();
  };

  ngOnDestroy() {
		this.componentSubs.unsubscribe();
  };

  filterChanged(): void {
    this.refreshTabGrid();
  };

  gridDoubleClick(event: any): void {
    let index = this.tabData.findIndex(e => { return e.id == event.detail.id });
    this.tabEditor.open(this.tabData[index], this.tabData[index].handle);
  };

  btNew(): void {
    this.modalResourceSelect.open();
  };
  btDelete(): void {
    this.gridTabs.getSelectedRowIndexes().then(rows => {
      if (rows.length > 0) {
        let index = -1;
        for(let i = 0; i < rows.length; i++) { if(rows[i]) index = rows[i] };
        const msg = `Are you sure you wish to delete the tab set ${this.tabData[index].handle}?`;
        if(confirm(msg)) {
          this.dataService.deleteData('interface', this.tabData[index].id, (response) => {
            this.messageBox.showSuccess('Tabs Deleted');
            this.refreshTabGrid();
          });	
        }
      }else {
        this.messageBox.showWarning("Please first select the Tabs to delete");
      }
    });
  };

  tabEditComplete(event: any): void {
    this.refreshTabGrid();
  };
  resourceSelected(resource: any): void {
    this.modalResourceSelect.modal('hide');
    let tabData = {
      name: 'systemtabs',
      fk_user: '',
      type: 3,
      handle: resource,
      default: true,
      detail: {
        defaultTab: -1,
        tabs: []
      }
    };
    this.tabEditor.open(tabData, resource);

  };

  refreshTabGrid(): void {
    let query: IQueryData = { targetResource: 'interface', query: [] };

    let qLine: IQueryLine = { field: 'type', operator: '=', value: 3 };
		query.query.push(qLine);

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

    this.dataService.getData('interface', '', (response) => {
			this.tabData = response.response.interface;
			if(this.tabData != null) {
				this.tabData.forEach((element) => {
					if(!element.interface_user) element.interface_user = { name: 'System' };
				});
      }
      this.gridTabs.clearSelection();

      let tempGridSource = new Smart.DataAdapter({
        mapChar: '.',
        dataFields: this.gridTabsDataFields,
        id: 'id',
        dataSource: this.tabData
      });
      this.gridTabs.dataSource = tempGridSource;
		}, null, query);


  };

}
