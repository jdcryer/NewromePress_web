import { Component, OnInit, ViewChild } from '@angular/core';
import { GridComponent, GridColumn, Smart } from 'smart-webcomponents-angular/grid';
import { IClient, ILookupList, newLookupList, ILookupValue, ILookupMapping, newLookupMapping } from 'src/app/interfaces/table-definitions';
import { environment } from 'src/environments/environment';
import { DataService } from 'src/app/services/data.service';
import { MessageBoxService } from 'src/app/services/message-box.service';
import { IUserSettings, IQueryData, IQueryLine, IField, IStructureTable } from 'src/app/interfaces/smart-data-list';

@Component({
  selector: 'app-admin-lookups',
  templateUrl: './admin-lookups.component.html',
  styleUrls: ['./admin-lookups.component.scss']
})
export class AdminLookupsComponent implements OnInit {

  @ViewChild('gridLookup', { static: true, read: GridComponent }) gridLookup: GridComponent;
  @ViewChild('gridValue', { static: true, read: GridComponent }) gridValue: GridComponent;
  @ViewChild('gridLookupMapping', { static: true, read: GridComponent }) gridLookupMapping: GridComponent;

  public smartTheme: string = environment.smartTheme;
  public clients: IClient[] = [];

  public editDisabled: boolean = true;
  public selectedLookup: ILookupList;
  public selectedLookupIndex: number = -1;
  public selectedLookupMapping: ILookupMapping;
  public filterClient: string = '';
  public filterType: string = '';
  public lookupLists: ILookupList[] = [];
  public lookupMappings: ILookupMapping[] = [];
  public pendingChanges = false;
  public lastSelectedLookupId: string = '';

  public editDisabledMapping: boolean = true;
  public tables: IStructureTable[] = [];
  public fields: IField[] = [];
  public pendingChangesMapping: boolean = false;

  private userSettings: IUserSettings;

  constructor(private dataService: DataService, private messageBox: MessageBoxService) { }

  private gridLookupDataFields = [
    { name: 'id', dataType: 'string' },
    { name: 'fk_client', dataType: 'string' },
    { name: 'lookupList_client', dataType: 'any' },
    { name: 'clientName', dataType: 'string', map: 'lookupList_client.name' },
    { name: 'name', dataType: 'string' },
    { name: 'detail', dataType: 'object' },
  ];
  public gridLookupSource = new Smart.DataAdapter({
    mapChar: '.',
    dataFields: this.gridLookupDataFields,
    id: 'id',
    dataSource: []
  });
  public gridLookupColumns: GridColumn[] = [
		{ label: 'Client', dataField: 'clientName', width: '50%' },
    { label: 'Name', dataField: 'name', width: '50%' },
  ];

  public gridValueDataFields = [
    { name: 'id', dataType: 'string' },
    { name: 'value', dataType: 'string' },
  ];
  public gridValueSource = new Smart.DataAdapter({
    mapChar: '.',
    dataFields: this.gridValueDataFields,
    id: 'id',
    dataSource: []
  });
  public gridValueColumns: GridColumn[] = [
    { label: 'ID', dataField: 'id', width: '30%', allowEdit: true },
		{ label: 'Value', dataField: 'value', width: '70%', allowEdit: true },
  ];

  private gridLookupMappingDataFields = [
    { name: 'id', dataType: 'string' },
    { name: 'lookupMapping_lookupList', dataType: 'object' },
    { name: 'lookupListName', dataType: 'string', map: 'lookupMapping_lookupList.name' },
    { name: 'tableNum', dataType: 'number' },
    { name: 'fieldNum', dataType: 'number' },
    { name: 'tableName', dataType: 'string' },
    { name: 'fieldName', dataType: 'string' },
    { name: 'fk_lookupList', dataType: 'string' },
  ];
  public gridLookupMappingSource = new Smart.DataAdapter({
    mapChar: '.',
    datafields: this.gridLookupMappingDataFields,
    id: 'id',
    dataSource: []
  });
  public gridLookupMappingColumns: GridColumn[] = [
    { label: 'Lookup List', dataField: 'lookupListName', width: '40%' },
    { label: 'Table', dataField: 'tableName', width: '30%' },
    { label: 'Field', dataField: 'fieldName', width: '30%' }
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
    },
    editing: {
      enabled: true
    }
  };

  ngOnInit(): void {
    this.userSettings = this.dataService.getStoredData('userSettings');
    this.selectedLookup = newLookupList();
    this.selectedLookupMapping = newLookupMapping();

    this.dataService.getData('client', '', (response) => {
      this.clients = response.response.client;
    });

    this.dataService.getData('structure', '', (response) => {
      this.tables = response.tables;
    });
  }

  ngAfterViewInit(): void {};

  gridLookupAfterInit = (event: any) => {};

  refreshLookupGrid(): void {
    let query: IQueryData = { targetResource: 'lookupList', query: [] };
    
    if(this.filterClient !== '') {
      let qLine: IQueryLine = { field: 'fk_client', operator: '=', value: this.filterClient };
      query.query.push(qLine);
    };

    let queryString = 'fields=*,lookupList_client.name';

    this.dataService.getData('lookupList', queryString, (response) => {
      this.gridLookup.clearSelection();
      this.editDisabled = true;
      this.pendingChanges = false;
      this.selectedLookup = newLookupList();
      this.selectedLookupIndex = -1;
      this.lookupLists = response.response.lookupList;

      this.gridLookupSource = new Smart.DataAdapter({
        mapChar: '.',
        dataFields: this.gridLookupDataFields,
        id: 'id',
        dataSource: response.response.lookupList,
      });
      this.gridValueSource = new Smart.DataAdapter({
        mapChar: '.',
        dataFields: this.gridValueDataFields,
        id: 'id',
        dataSource: []
      });
    }, null, query);


    query = { targetResource: 'lookupMapping', query: [] };
    
    if(this.filterClient !== '') {
      let qLine: IQueryLine = { field: 'lookupMapping_lookupList', attribute: 'fk_client', operator: '=', value: this.filterClient };
      query.query.push(qLine);
    };

    queryString = 'fields=*,lookupMapping_lookupList.name';

    this.dataService.getData('lookupMapping', queryString, (response) => {
      this.gridLookupMapping.clearSelection();
      this.editDisabledMapping = true;
      this.pendingChangesMapping = false;
      this.selectedLookupMapping = newLookupMapping();
      this.lookupMappings = response.response.lookupMapping;

      this.lookupMappings.forEach(map => {
        let index = this.tables.findIndex(e => { return e.tableNum === map.tableNum });
        map.tableName = '';
        map.fieldName = '';
        if(index >= 0) { 
          map.tableName = this.tables[index].tableName;
          let fieldIndex = this.tables[index].fields.findIndex(e => { return e.fieldNumber === map.fieldNum });
          if(fieldIndex >= 0) map.fieldName = this.tables[index].fields[fieldIndex].name;
        }
      });
      this.gridLookupMappingSource = new Smart.DataAdapter({
        mapChar: '.',
        dataFields: this.gridLookupMappingDataFields,
        id: 'id',
        dataSource: this.lookupMappings
      });
    });

  };

  filterChanged(): void {
    this.refreshLookupGrid();
  };

  gridLookupSelect(event: any): void {
    this.selectedLookup = this.lookupLists[event.detail.row.index];
    this.selectedLookupIndex = event.detail.row.index;

    this.gridValueSource = new Smart.DataAdapter({
      mapChar: '.',
      dataFields: this.gridValueDataFields,
      id: 'id',
      dataSource: this.selectedLookup.detail.values
    });
    this.pendingChanges = false;
    this.editDisabled = false;
  };

  gridValueChange(event: any): void {
    this.pendingChanges = true;
  };

  valueChanged(): void {
    this.pendingChanges = true;
  };

  btNewLookup(): void {
    this.gridLookup.clearSelection();
    this.selectedLookup = newLookupList();
    this.selectedLookup.fk_client = this.filterClient;
    this.editDisabled = false;

    //Clear values list
    this.gridValueSource = new Smart.DataAdapter({
      mapChar: '.',
      dataFields: this.gridValueDataFields,
      id: 'id',
      dataSource: this.selectedLookup.detail.values
    });
  };

  btDeleteLookup(): void {
    this.gridLookup.getSelectedRowIndexes().then(rows => {
      if(rows.length > 0) {
        let index = -1;
        for(let i = 0; i < rows.length; i++) { if(rows[i]) index = rows[i] };
        const msg = `Are you sure you wish to delete the lookup list ${this.lookupLists[index].name}?`;
        if(confirm(msg)) {
          this.dataService.deleteData('lookupList', this.lookupLists[index].id, (response) => {
            this.messageBox.showSuccess('Lookup List Deleted');
            this.refreshLookupGrid();
          });	
        }
      }else {
        this.messageBox.showWarning('Please first select the Lookup to delete');
      }
    });
  };

  btAddValue(): void {
    let newValue: ILookupValue = {
      id: `${this.gridValue.rows.length + 1}`,
      value: 'New Value'
    };
    this.gridValue.addRow(newValue, true, (row) => {
      // this.gridValue.selectRows([ newValue.id ]);
      this.gridValue.beginEdit(newValue.id, 'value');
    });
    this.pendingChanges = true;
  };

  btDeleteValue(): void {
    this.gridValue.getSelectedRowIndexes().then(rows => {
      if(rows.length > 0) {
        let index = -1;
        for(let i = 0; i < rows.length; i++) { if(rows[i]) index = rows[i] };
        this.gridValue.getRowByIndex(index).then(row => {
          const msg = `Are you sure you wish to delete the value ${row.data.value}?`;
          if(confirm(msg)) {
            this.gridValue.deleteRow(row.data.id);
          }
        });
      }else {
        this.messageBox.showWarning('Please first select the Value to delete');
      }
    });
  };

  btAddMapping(): void {
    this.gridLookupMapping.clearSelection();
    this.selectedLookupMapping = newLookupMapping();
    this.editDisabledMapping = false;
  };

  btDeleteMapping(): void {
    this.gridLookupMapping.getSelectedRowIndexes().then(rows => {
      if(rows.length > 0) {
        let index = -1;
        for(let i = 0; i < rows.length; i++) { if(rows[i]) index = rows[i] };
        const msg = `Are you sure you wish to delete the lookup mapping ${this.lookupMappings[index].tableName} - ${this.lookupMappings[index].fieldName}?`;
        if(confirm(msg)) {
          this.dataService.deleteData('lookupMapping', this.lookupMappings[index].id, (response) => {
            this.messageBox.showSuccess('Lookup Mapping Deleted');
            this.refreshLookupGrid();
          });	
        }
      }else {
        this.messageBox.showWarning('Please first select the Mapping to delete');
      }
    });
  };

  btSaveLookup(): void {
    let values: ILookupValue[] = [];

    this.gridValue.rows.forEach(row => {
      let value = {
        id: row.data.id,
        value: row.data.value
      };
      values.push(value);
    });

    this.selectedLookup.detail.values = values;

    this.dataService.postData('lookupList', this.selectedLookup, (response) => {
      this.lastSelectedLookupId = response.id;
      this.messageBox.showSuccess('Lookup List Saved');
      this.refreshLookupGrid();
    });
  };

  gridLookupMappingSelect(event: any): void {
    this.selectedLookupMapping = this.lookupMappings[event.detail.row.index];
    this.editDisabledMapping = false;
    this.pendingChangesMapping = false;

    //update fields list
    let index = this.tables.findIndex(e => { return e.tableNum === this.selectedLookupMapping.tableNum });
    this.fields = this.tables[index].fields;
  };

  valueChangedMapping(type: string = ''): void {
    if(type === 'table') {
      this.selectedLookupMapping.fieldNum = 0;
      this.selectedLookupMapping.fieldName = '';
      let index = this.tables.findIndex(e => { return e.tableNum === this.selectedLookupMapping.tableNum });
      this.fields = this.tables[index].fields;
    }

    this.pendingChangesMapping = true;
  };

  btSaveLookupMapping(): void {
    this.dataService.postData('lookupMapping', this.selectedLookupMapping, (response) => {
      this.messageBox.showSuccess('Lookup Mapping Saved');
      this.refreshLookupGrid();
    });
  };
}
