import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { GridComponent, GridColumn, Smart } from 'smart-webcomponents-angular/grid';
import { environment } from 'src/environments/environment';
import { IUserSettings, ITabs, ITabData, IUserQuery, IField, IStructureTable, IQueryData } from 'src/app/interfaces/smart-data-list';
import { Subscription, isObservable } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { TranslateService } from '@ngx-translate/core';
import { ILookupValue, ILookupMapping, ILookupList } from 'src/app/interfaces/table-definitions';
import { isFunction } from 'jquery';
import { MessageBoxService } from 'src/app/services/message-box.service';

@Component({
  selector: 'app-smart-tabs-editor',
  templateUrl: './smart-tabs-editor.component.html',
  styleUrls: ['./smart-tabs-editor.component.scss']
})
export class SmartTabsEditorComponent implements OnInit {

  @Output() tabsUpdated = new EventEmitter();
  @Input('targetResource') targetResource: string;
  @ViewChild('gridTabs', { static: false, read: GridComponent }) gridTabs: GridComponent;

  public smartTheme = environment.smartTheme;
  public gridHeight = '400px';
  public tabData: ITabs;
  public selectedTab: ITabData = {
    id: 0, name: '', queryId: '', fieldNum: 0, value: '', type: ''
  };
  public showTabDetail: boolean = false;

  public userQueries: IUserQuery[] = [];
  public fields: IField[] = [];
  public valuesList: ILookupValue[] = [];
  public types: string[] = [
    'Lookup',
    'Custom Query',
  ];
  public gridSettings = {
    appearance: {
      alternationCount: 2,
      alternationStart: 0,
      showRowHeaderDragIcon: true,
      showRowHeader: true,  
    },
    selection: {
      enabled: true,
      mode: 'one',  
    },
    behavior: {
      allowRowReorder: true,
    }
  }

  public hasError = {
    name: false,
    type: false,
    fieldNum: false,
    value: false,
    queryId: false,
  };

  public errorText = {
    name: '',
    type: '',
    fieldNum: '',
    value: '',
    queryId: '',
  };

  private displayTabs: ITabData[] = [];
  private componentSubs: Subscription = new Subscription();
  private userSettings: IUserSettings;
  private newTab: boolean = false;
  private lookupMappings: ILookupMapping[] = [];
  private lookupLists: ILookupList[] = [];

  private gridTabsDataFields = [
    { name: 'id', dataType: 'number' },
    { name: 'name', dataType: 'string' },
    { name: 'type', dataType: 'string' },
    { name: 'fieldNum', dataType: 'number' },
    { name: 'fieldName', dataType: 'string' },
    { name: 'value', dataType: 'string' },
    { name: 'queryId', dataType: 'string' },
    { name: 'queryName', dataType: 'string' }
  ];
  public gridTabsSource = new Smart.DataAdapter({
    dataFields: this.gridTabsDataFields,
    datatype: 'json',
    id: 'id',
    dataSource: []
  });
  public gridTabsColumns: GridColumn[] = [
    { label: 'Name', dataField: 'name', width: '30%' },
    { label: 'Type', dataField: 'type', width: '15%' },
    { label: 'Field', dataField: 'fieldName', width: '15%' },
    { label: 'Value', dataField: 'value', width: '20%' },
    { label: 'Query Name', dataField: 'queryName' },
  ];

  constructor(private dataService: DataService, private translate: TranslateService, private messageBox: MessageBoxService) { }

  ngOnInit(): void {
    this.userSettings = this.dataService.getStoredData('userSettings');

    this.tabData = {
      name: '',
      fk_user: this.userSettings.id,
      type: 3,
      handle: this.targetResource,
      default: true,
      detail: {
        defaultTab: -1,
        tabs: []
      }
    };

    //Attempt to get tab data for this table for current user
    let queryString = `fk_user=${this.userSettings.id}&handle=${this.targetResource}&type=3`;
    this.dataService.getData('interface', queryString, (response) => {
      if(response.response.interface) {
        if(response.response.interface.length > 0) {
          this.tabData = response.response.interface[0];
          if(!this.tabData.detail.defaultTab) this.tabData.detail.defaultTab = -1;
        }
      }
    });

    this.refreshLookups();
  }

  ngOnDestroy() {
    this.componentSubs.unsubscribe();
  }

  public open(tabData?: ITabs, targetResource?: string): void {
    //Refresh some lookups on open
    if(typeof targetResource !== 'undefined') this.targetResource = targetResource;

    //Get User Queries
    let queryString = `fk_user=${this.userSettings.id}&handle=${this.targetResource}&type=2`;
    this.dataService.getData('interface', queryString, (response) => {
      if(response.response.interface)
        if(response.response.interface.length > 0)
          this.userQueries = response.response.interface;
    });

    if(typeof tabData !== 'undefined') {
      this.refreshLookups();
      this.tabData = tabData;
      this.updateTabsDisplay();
      this.modal('show');
    }else {
      queryString = `fk_user=${this.userSettings.id}&handle=${this.targetResource}&type=3`;
      this.dataService.getData('interface', queryString, (response) => {
        if(response.response.interface) {
          if(response.response.interface.length > 0) {
            this.tabData = response.response.interface[0];
          }
        }
        this.updateTabsDisplay();
        this.modal('show');
      });
    }
  }

  public modal(action: 'show' | 'hide'): void {
    $('#tabs-editor-modal').modal(action);
  }

  refreshLookups(): void {
    this.fields = [];

    this.dataService.getData('structure', '' , (response) => {
      let tables: IStructureTable[] = response.tables;
      let index = tables.findIndex(ele => { return ele.tableName === this.targetResource });
      if(index >= 0) {
        //Get lookup mappings
        this.dataService.getData('lookupMapping', `tableNum=${tables[index].tableNum}`, (response) => {
          if(response.response.lookupMapping) {
            this.lookupMappings = response.response.lookupMapping;
            let lookupListIds: string[] = [];
            //Loop lookup mappings to build fields array
            this.lookupMappings.forEach(mapping => {
              let fieldIndex = tables[index].fields.findIndex(ele => { return ele.fieldNumber === mapping.fieldNum });
              if(fieldIndex >= 0) {
                this.fields.push(tables[index].fields[fieldIndex]);
                if(lookupListIds.indexOf(mapping.fk_lookupList) === -1) lookupListIds.push(mapping.fk_lookupList);
              }
            });

            //Get the Lookup lists we need
            let query: IQueryData = { 
              targetResource: 'lookupList', query: [], 
              querywitharray: { field: 'id', values: lookupListIds } 
            };
            this.dataService.getData('lookupList', '', (response) => {
              this.lookupLists = response.response.lookupList;

              //Get User Queries
              let queryString = `fk_user=${this.userSettings.id}&handle=${this.targetResource}&type=2`;
              this.dataService.getData('interface', queryString, (response) => {
                if(response.response.interface)
                  if(response.response.interface.length > 0)
                    this.userQueries = response.response.interface;
                this.updateTabsDisplay();
              });
            }, null, query);
          }
        });
      };
    });
  };

  gridTabsRowReorder(event: any) {

  };
  gridTabsDoubleClick(event: any) {
    let index = this.tabData.detail.tabs.findIndex((e) => {
      return e.id === event.detail.id;
    });
    if(index >= 0) {
      this.selectedTab = this.tabData.detail.tabs[index];
      if(this.selectedTab.type == 'Lookup') {
        let mappingIndex = this.lookupMappings.findIndex(ele => { return ele.fieldNum === this.selectedTab.fieldNum });
        if(mappingIndex >= 0) {
          let lookupIndex = this.lookupLists.findIndex(ele => { return ele.id === this.lookupMappings[mappingIndex].fk_lookupList });
          this.valuesList = this.lookupLists[lookupIndex].detail.values;
        } else {
          this.valuesList = [];
        }
      }else {
        this.valuesList = [];
      };
      this.showTabDetail = true;
      this.newTab = false;
    };
  };

  updateTabsDisplay(): void {
    this.displayTabs = [];
    this.tabData.detail.tabs.forEach(tab => {
      if(tab.type === 'Lookup') {
        let index = this.fields.findIndex(ele => { return ele.fieldNumber === tab.fieldNum });
        if(index >= 0) tab.fieldName = this.fields[index].fieldName;
      }else {
        let index = this.userQueries.findIndex(ele => { return ele.id === tab.queryId });
        if(index >= 0) tab.queryName = this.userQueries[index].name;
      }
      this.displayTabs.push(tab);
    });

    this.gridTabsSource = new Smart.DataAdapter({
      dataFields: this.gridTabsDataFields,
      datatype: 'json',
      id: 'id',
      dataSource: this.displayTabs
    });
  };

  btRemoveClick(event: any) {
    this.gridTabs.getSelectedRowIndexes().then((rows) => {
      if (rows.length > 0) {
        let index = -1;
        for(let i = 0; i < rows.length; i++) { if(rows[i] != undefined) index = rows[i] };
        if(index >= 0) {
          const msg = `Are you sure you wish to delete the tab ${this.tabData.detail.tabs[index].name}?`;
          if(confirm(msg)) {
            this.tabData.detail.tabs.splice(index, 1);
            this.updateTabsDisplay();
          };
        };
      };
    });
  };

  btAddClick(event: any) {
    let id = 1;
    if(this.tabData.name == 'systemtabs') id = 1000;
    let idOK = false;
    while(!idOK) {
      let index = this.tabData.detail.tabs.findIndex(ele => { return ele.id === id });
      if(index === -1) idOK = true;
      else id++;
    }

    this.selectedTab = {
      id: id,
      name: '',
      type: 'Lookup',
      fieldNum: 0,
      value: '',
      queryId: ''
    };

    this.newTab = true;
    this.showTabDetail = true;
  };
  btSaveClick(event: any) {
    this.gridTabs.getVisibleRows().then(rows => {
      this.tabData.detail.tabs = [];
      rows.forEach(element => {
        let tab: ITabData = {
          id: element.data.id,
          name: element.data.name,
          type: element.data.type,
          fieldNum: element.data.fieldNum,
          value: element.data.value,
          queryId: element.data.queryId
        };
        this.tabData.detail.tabs.push(tab);
      });

      //post
      this.dataService.postData('interface', this.tabData, (response) => {
        this.messageBox.showSuccess('Tabs Saved');
        this.modal('hide');
        //Emit event to force data listing tabs to update
        this.tabsUpdated.emit();
      });
    });
  };

  btCancelTabEdit(): void {
    this.showTabDetail = false;
  };
  btSaveTabEdit(): void {

    for(const property in this.hasError) {
      this.validateField(property);
    };

    let error = false;
    for(const property in this.hasError) {
      error = error || this.hasError[property];
    };

    if(error) {
      this.messageBox.showError('Error found in Tab Data');
    }else {
      if(this.newTab) {
        this.tabData.detail.tabs.push(this.selectedTab);
      }else {
        let index = this.tabData.detail.tabs.findIndex(ele => { return ele.id === this.selectedTab.id });
        this.tabData.detail.tabs[index] = this.selectedTab;
      }
      this.updateTabsDisplay();
      this.showTabDetail = false;
    }
  };

  validateField(field: string) {
    this.hasError[field] = false;
    this.errorText[field] = '';

    switch(field) {
      case 'name' : {
        if(this.selectedTab.name === '') {
          this.hasError.name = true;
          this.errorText.name = 'Name is required';
        };
        break;
      }
      case 'type' : {
        if(this.selectedTab.type === '') {
          this.hasError.type = true;
          this.errorText.type = 'Type is required';
        };
        break;
      }
      case 'fieldNum' : {
        if((this.selectedTab.fieldNum === 0) && (this.selectedTab.type === 'Lookup')){
          this.hasError.fieldNum = true;
          this.errorText.fieldNum = 'Field is required';
        };
        break;
      }
      case 'value' : {
        if((this.selectedTab.value === '') && (this.selectedTab.type === 'Lookup')){
          this.hasError.value = true;
          this.errorText.value = 'Value is required';
        };
        break;
      }
      case 'queryId' : {
        if((this.selectedTab.queryId === '') && (this.selectedTab.type === 'Custom Query')){
          this.hasError.queryId = true;
          this.errorText.queryId = 'Value is required';
        };
        break;
      }
    };
  };

  selectChanged(field: string) {
    switch(field) {
      case 'type': {
        this.selectedTab.value = '';
        this.selectedTab.fieldNum = 0;
        this.selectedTab.queryId = '';
        break;
      }
      case 'field': {
        //Field changed, clear value and load relevant lookup list
        this.selectedTab.value = '';
        
        let mappingIndex = this.lookupMappings.findIndex(ele => { return ele.fieldNum === this.selectedTab.fieldNum });
        if(mappingIndex >= 0) {
          let lookupIndex = this.lookupLists.findIndex(ele => { return ele.id === this.lookupMappings[mappingIndex].fk_lookupList });
          this.valuesList = this.lookupLists[lookupIndex].detail.values;
        } else {
          this.valuesList = [];
        }
        break;
      }
      case 'value': {
        //If this Tab Name is still blank, set it to the value
        if(this.selectedTab.value != '') {
          if(this.selectedTab.name == '') {
            let valueIndex = this.valuesList.findIndex(ele => { return ele.id === this.selectedTab.value });
            this.selectedTab.name = this.valuesList[valueIndex].value;
            this.hasError.name = false;
            this.errorText.name = '';
          }
        }
        break;
      }
      case 'query': {
        if(this.selectedTab.queryId != '') {
          if(this.selectedTab.name == '') {
            let queryIndex = this.userQueries.findIndex(ele => { return ele.id === this.selectedTab.queryId });
            this.selectedTab.name = this.userQueries[queryIndex].name;
            this.hasError.name = false;
            this.errorText.name = '';
          };
        };
        break;
      }
    };
  }

}
