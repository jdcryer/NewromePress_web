import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';
import {
  IView,
  IUser,
  IPropertyList,
  IField,
  IUserSettings,
  IColumn,
  IDataField,
} from 'src/app/interfaces/smart-data-list';
import {
  GridComponent,
  Smart,
  GridColumn,
} from 'smart-webcomponents-angular/grid';
import { SmartViewEditorColumnComponent } from '../smart-view-editor-column/smart-view-editor-column.component';
import { environment } from 'src/environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from 'src/app/services/data.service';
import { Subscription } from 'rxjs';
import { matchRuleShort } from 'src/app/generic-functions';

@Component({
  selector: 'app-smart-view-editor',
  templateUrl: './smart-view-editor.component.html',
  styleUrls: ['./smart-view-editor.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SmartViewEditorComponent implements OnInit, OnDestroy {
  @ViewChild('gridFields', { static: false, read: GridComponent }) gridFields: GridComponent;
  @ViewChild('gridColumns', { static: false, read: GridComponent }) gridColumns: GridComponent;
  @ViewChild('columnEdit', { static: false, read: SmartViewEditorColumnComponent }) columnEdit: SmartViewEditorColumnComponent;

  @Output() viewEditComplete = new EventEmitter();

  @Input('targetResource') targetResource: string = '';
  @Input('adminEdit') adminEdit: boolean = false;

  // public VIEWEDITOR: { TITLE: 'View Management', CANCEL: 'Cancel', RESET: 'Reset', OK: 'OK', SAVECLOSE: 'Save & Close', DEFAULT: 'Default View', VIEWNAME: 'View Name', USER: 'User' };
  public viewData: IView = {
    name: '',
    fk_user: '',
    default: false,
    type: 1,
    handle: this.targetResource,
    detail: { editColumns: [], columns: [], datafields: [] },
  };
  public displayColumns: any[] = []
  public propertyList: IPropertyList[] = [];
  public displayFields: IField[] = [];
  public smartTheme: string = environment.smartTheme;
  public vb_showColumnDetail: boolean = false;
  public usersLookup: Partial<IUser>[] = [];
  public selectedUser: Partial<IUser> = { id: '', selectTag: 'System' };
  public fieldMenuList = [];
  public gridAppearance = {
    alternationCount: 2,
    alternationStart: 0,
  };
  public gridColumnsBehavior = {
    allowRowReorder: true,
  };
  public gridColumnsAppearance = {
    alternationCount: 2,
    alternationStart: 0,
    showRowHeaderDragIcon: true,
    showRowHeader: true,
  };
  public gridSelection = {
    enabled: true,
    mode: 'one',
  };
  public gridHeight = '400px';

  private componentSubs: Subscription = new Subscription();
  private selectedTableIndex: number = 0;
  private userData: IUserSettings;

  constructor(
    private translate: TranslateService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.userData = this.dataService.getStoredData('userSettings');
  }

  ngAfterViewInit() {
    this.componentSubs.add(
      this.dataService.getData(
        'propertyList',
        `table=${this.targetResource}`,
        (data) => {
          this.buildPropertyList(this.targetResource, data.fields);
        },
        null
      )
    );
    if (this.adminEdit) {
      this.usersLookup.push({ id: '', selectTag: 'System' });
      this.getUsers(1);
    }
  }

  ngOnDestroy() {
    this.componentSubs.unsubscribe();
  }

  /**
   * Opens modal window after reseting values according to given viewId / Action
   * @param viewId UUID of the view to edit / dupe. Pass as empty string when creating new
   * @param action Action view editor is performing, supports 'newview', 'editview', 'dupeview'
   */
  public openModal( viewId: string | undefined = '', action: 'newview' | 'editview' | 'dupeview', newTarget: string = ''): void {
    if (newTarget != '') {
      this.propertyList = [];
      this.displayFields = [];
      this.targetResource = newTarget;
      this.componentSubs.add(
        this.dataService.getData(
          'propertyList',
          `table=${this.targetResource}`,
          (data) => {
            this.buildPropertyList(this.targetResource, data.fields);
            this.openModal(viewId, action);
          },
          null
        )
      );
    } else {
      this.vb_showColumnDetail = false;
      if (action === 'newview') {
        this.viewData = {
          name: `New View for ${this.targetResource}`,
          fk_user: this.dataService.getStoredData('userSettings').id,
          default: false,
          type: 1,
          handle: this.targetResource,
          detail: {
            columns: [],
            datafields: [],
            editColumns: [],
          },
        };
        if (this.adminEdit) this.viewData.fk_user = '';

        // this.gridColumnsSource.dataSource = this.viewData.detail.editColumns;
        this.updateColumnDisplay();
        this.populateFields([]);
        this.modal('show');
      } else {
        this.dataService.getData(
          'interface',
          `id=${viewId}`,
          (data) => {
            this.viewData = data.response['interface'][0];
            if (action === 'dupeview') {
              this.viewData.name = `${this.viewData.name} - Copy`;
              this.viewData.fk_user = this.adminEdit ? '' : this.userData.id;
              delete this.viewData.id;
            }
            if (this.adminEdit) {
              let idx = this.usersLookup.findIndex((element) => {
                return element.id === this.viewData.fk_user;
              });
              if (idx >= 0) this.selectedUser = this.usersLookup[idx];
            }
            // this.gridColumnsSource.dataSource = this.viewData.detail.editColumns;
            this.updateColumnDisplay();
            this.populateFields(this.viewData.detail.editColumns);
            this.modal('show');
          },
          null
        );
      }
    }
  }

  /**
   * Opens / Closes window according to param
   * @param action Action to take, accepted values: 'show', 'hide'
   */
  public modal(action: 'show' | 'hide'): void {
    $('#view-editor-modal').modal(action);
  }

  public selectTableChanged(event: any) {
    let selOptions = event.target.selectedOptions;
    if (selOptions.length > 0) {
      this.selectedTableIndex = selOptions[0].index;
      this.populateFields();
    }
  }

  public gridFieldsDoubleClick(event: any) {
    let index = this.displayFields.findIndex((e) => {
      return e.name === event.detail.id;
    });
    if (index >= 0) {
      let rowData = this.displayFields[index];

      let rowId = '';
      if(rowData.relation) {
        rowId = `${this.propertyList[this.selectedTableIndex].table}-${rowData.relation}-${rowData.fieldNumber}`;
      }else {
        rowId = `${this.propertyList[this.selectedTableIndex].table}-${rowData.fieldNumber}`;
      };
      // If Object field, create unique field id as multiple instances of the same field can be added to a view
      if(rowData.type === 'object') {
        let idFound = false;
        let counter = 0;
        do {
          let tempId = `${rowId}-${counter}`;
          let found = false;
          this.gridColumns.rows.forEach(column => {
            if(column.data.id == tempId) found = true;
          });
          if(!found) { 
            rowId = tempId
            idFound = true;
          };
          counter++;
        } while(!idFound);
      };

      let column: IColumn = {
        id: rowId,
        header: rowData.fieldName,
        fieldName: rowData.fieldName,
        fieldNumber: rowData.fieldNumber,
        table: this.propertyList[this.selectedTableIndex].table,
        fieldType: rowData.type,
        displayFormat: '',
        displayTable: '',
        relation: '',
        attribute: '',
        width: 10,
        widthUnit: '%',
        alignment: 'left',
        sum: false,
        min: false,
        max: false,
        avg: false,
      };
      if (rowData.relation) {
        column.relation = rowData.relation;
        column.displayTable = rowData.relation;
      }else {
        column.displayTable = this.propertyList[this.selectedTableIndex].table
      };
      if (rowData.type === 'object') column.attribute = '';
      console.log(column);

      // this.viewData.detail.editColumns.push(column);
      this.gridColumns.addRow(column, true, () => {
        this.gridColumns.clearSelection();
        this.gridFields.clearSelection();
  
        this.populateFields();  
      });

    }
    //need to check for `relation` property on field for the sake of `map` datafield property
    //need to somehow hide fields that are already in columns
  }

  public updateColumnDisplay(): void {

    this.gridColumnsSource = new Smart.DataAdapter({
      dataFields: [
        'id: string',
        'header: string',
        'fieldName: string',
        'fieldNumber: number',
        'table: string',
        'fieldType: string',
        'displayFormat: string',
        'displayTable: string',
        'width: number',
        'widthUnit: string',
        'alignment: string',
        'sum: bool',
        'min: bool',
        'max: bool',
        'avg: bool',
        'relation: string',
        'attribute: string',
      ],
      datatype: 'json',
      id: 'id',
      dataSource: this.viewData.detail.editColumns,
    });


    // this.displayColumns = [];
    // this.gridColumns.rows.forEach(e => {
    //   let element = e.data;
    //   let displayColumn = element;
    //   if(element.relation)
    //     displayColumn.displayTable = `${element.relation}`;
    //   else
    //     displayColumn.displayTable = `${element.table}`;
    //   this.displayColumns.push(displayColumn);
    // });
    // // this.gridColumnsSource.dataSource = this.displayColumns;
    // this.gridColumnsSource = new Smart.DataAdapter({
    //   datafields: [
    //     { name: 'id', type: 'string' },
    //     { name: 'header', type: 'string' },
    //     { name: 'fieldName', type: 'string' },
    //     { name: 'displayTable', type: 'string' }
    //   ],
    //   datatype: 'json',
    //   id: 'id',
    //   dataSource: this.displayColumns,
    // });
  }

  public gridColumnsDoubleClick(event: any) {
    //open modal containing column options
    let index = this.gridColumns.rows.findIndex((e) => {
      return e.data.id === event.detail.id;
    });
    if (index >= 0) {
      this.columnEdit.loadData(this.gridColumns.rows[index].data, index);
      this.vb_showColumnDetail = true;
    }
  }

  public selectUserChange(event: any): void {}

  public btSaveClick(event: any): void {
    //Post view to server, pass to parent to apply to current grid
    //Loop editColumns and build columns and datafields for use by jqxGrid

    this.viewData.detail.columns = [];
    this.viewData.detail.datafields = [];
    this.viewData.detail.editColumns = [];
    const regex = />/gi;
    const regexTS = /TS/g;
    this.gridColumns.forEachRow((e) => {

      let editColumn: IColumn = {
        id: e.data.id,
        header: e.data.header,
        fieldName: e.data.fieldName,
        fieldNumber: e.data.fieldNumber,
        table: e.data.table,
        fieldType: e.data.fieldType,
        displayFormat: e.data.displayFormat,
        displayTable: e.data.displayTable,
        relation: e.data.relation,
        attribute: e.data.attribute,
        width: e.data.width,
        widthUnit: e.data.widthUnit,
        alignment: e.data.alignment,
        sum: e.data.sum,
        min: e.data.min,
        max: e.data.max,
        avg: e.data.avg,
      };

      this.viewData.detail.editColumns.push(editColumn);
      let datafield: IDataField = { name: '', dataType: '' };
      let column: Partial<GridColumn> = {};
      if(editColumn.attribute && editColumn.attribute !== '') {
        datafield.dataType = 'string';
      }else {
        datafield.dataType = editColumn.fieldType;
      }

      //If fieldname ends with TS, e.g. 'createdTS', set data type to date to allow date formatting to work.
      if(new RegExp(regexTS).test(editColumn.fieldName)) datafield.dataType = 'date';

      column.label = editColumn.header;
      column.width = `${editColumn.width}${editColumn.widthUnit}`;
      column.cellsAlign = editColumn.alignment;
      
      if(datafield.dataType == 'bool') column.template = 'checkBox';
      if(editColumn.displayFormat != '') column.cellsFormat = editColumn.displayFormat;

      if (editColumn.relation && editColumn.attribute && editColumn.attribute !== '') {
        datafield.name = `${editColumn.relation.replace(regex, '.')}.${editColumn.fieldName}.${editColumn.attribute}`;
        datafield.map = `${editColumn.relation}.${editColumn.fieldName}.${editColumn.attribute}`;
        column.dataField = `${editColumn.relation.replace(regex, '.')}.${editColumn.fieldName}.${editColumn.attribute}`;
      } else if (editColumn.attribute && editColumn.attribute !== '') {
        datafield.name = `${editColumn.fieldName}.${editColumn.attribute}`;
        datafield.map = `${editColumn.fieldName}.${editColumn.attribute}`;
        column.dataField = `${editColumn.fieldName}.${editColumn.attribute}`;
      } else if (editColumn.relation) {
        datafield.name = `${editColumn.relation.replace(regex, '.')}.${editColumn.fieldName}`;
        datafield.map = `${editColumn.relation.replace(regex, '.')}.${editColumn.fieldName}`;
        column.dataField = `${editColumn.relation.replace(regex, '.')}.${editColumn.fieldName}`;
      } else {
        datafield.name = editColumn.fieldName;
        column.dataField = editColumn.fieldName;
      }

      if(editColumn.relation) {
        let index = this.viewData.detail.datafields.findIndex(e => { return e.name === editColumn.relation });
        if(index === -1) {
          let relateDatafield = { name: editColumn.relation.replace(regex, '.'), dataType: 'any' };
          this.viewData.detail.datafields.push(relateDatafield);
        }
      }

      if(editColumn.attribute && editColumn.attribute !== '') {
        let name = '';
        if(editColumn.relation) {
          name = `${editColumn.relation.replace(regex, '.')}.${editColumn.fieldName}`;
        }else {
          name = editColumn.fieldName;
        }
        let index = this.viewData.detail.datafields.findIndex(e => { return e.name === name });
        if(index === -1) {
          let relateDatafield = { name: name, dataType: 'any' };
          this.viewData.detail.datafields.push(relateDatafield);
        }
      };

      this.viewData.detail.columns.push(column);
      this.viewData.detail.datafields.push(datafield);
    });

    if (this.adminEdit && this.selectedUser.id) {
      this.viewData.fk_user = this.selectedUser.id;
    }

    //Post View
    this.dataService.postData(
      'interface',
      this.viewData,
      (data) => {
        this.viewEditComplete.emit(data);
      },
      null
    );

    this.modal('hide');
  }

  public btAddClick(event: any): void {
    //Intended to allow adding of custom fields, like i.LEVEL's ESM InStock for [Stock]
  }

  public btRemoveClick(event: any): void {
    this.gridColumns.getSelectedRowIds().then((rows) => {
      if(rows.length > 0) {
        let index = this.gridColumns.rows.findIndex(ele => { return ele.id === rows[0] });
        const msg = `Are you sure you wish to delete the column ${this.gridColumns.rows[index].data.header}?`;
        if (confirm(msg)) {
          this.gridColumns.deleteRow(this.gridColumns.rows[index].data.id!, () => {
            this.gridColumns.clearSelection();
            this.gridFields.clearSelection();
            this.populateFields();
          });
          // this.viewData.detail.editColumns.splice(index, 1);
          // this.updateColumnDisplay();
        }
      };
    });
  }
  public gridColumnRowReorder(event: any): void {
    console.log(this.gridColumns.rows);

    // let newIndex = event.detail.newIndex;
    // let index = event.detail.index;
    // if(newIndex > index) newIndex++;
    // if((index + 1) === newIndex) newIndex++;

    // this.viewData.detail.editColumns.splice(newIndex, 0, this.viewData.detail.editColumns[index]);
    // if(newIndex > index) {
    //   this.viewData.detail.editColumns.splice(index, 1);
    // } else {
    //   this.viewData.detail.editColumns.splice(index + 1, 1);
    // }
    // console.log(this.viewData.detail.editColumns);
  };

  public columnEditComplete(event: any): void {
    if (event) this.gridColumns.updateRow(event.data.id, event.data);
    this.vb_showColumnDetail = false;
  }

  private buildPropertyList( resource: string, fields: IField[], relation: string = '') {
    let propList: IPropertyList = { table: resource, relation: relation, fields: [] };

    fields.forEach((element) => {
      switch(element.kind) {
        case 'storage': {
          let field: IField = {
            fieldName: element.fieldName,
            name: element.name,
            kind: element.kind,
            type: element.type,
            fieldNumber: element.fieldNumber,
          };
          if (relation) field.relation = relation;
          propList.fields.push(field);

          break;
        };
        case 'relatedEntity': {
          break;
        };
        case 'calculated': {
          let field: IField = {
            fieldName: element.fieldName,
            name: element.name,
            kind: element.kind,
            type: element.type,
            fieldNumber: -1,
          };
          if (relation) field.relation = relation;
          propList.fields.push(field);

          break;
        };
      };

      if (element.kind === 'storage') {
        
      } else if (element.kind === 'relatedEntity') {
        this.componentSubs.add(
          this.dataService.getData(
            'propertyList',
            `table=${element.relatedDataClass}`,
            (data) => {
              if (element.relatedDataClass)
                this.buildPropertyList(
                  element.relatedDataClass,
                  data.fields,
                  relation !== '' ? `${relation}>${element.fieldName}` : element.fieldName
                );
            },
            null
          )
        );
      }
    });
    let index = this.propertyList.findIndex((element) => {
      return ((element.table === propList.table) && (element.relation === propList.relation));
    });
    if (index === -1) this.propertyList.push(propList);
    if (resource === this.targetResource) {
      this.selectedTableIndex = 0;
      // this.populateFields();
    }
  }

  private populateFields(editColumns?: IColumn[]): void {
    this.displayFields = [];
    let loopColumns: any[] = [];
    if(editColumns) loopColumns = editColumns
    else {
      this.gridColumns.rows.forEach(row => {
        console.log(row);
        let column: IColumn = {
          id: row.data.id,
          header: row.data.header,
          fieldName: row.data.fieldName,
          fieldNumber: row.data.fieldNumber,
          table: row.data.table,
          fieldType: row.data.fieldType,
          displayFormat: row.data.displayFormat,
          displayTable: row.data.displayTable,
          relation: row.data.relation,
          attribute: row.data.attribute,
          width: row.data.width,
          widthUnit: row.data.widthUnit,
          alignment: row.data.alignment,
          sum: row.data.sum,
          min: row.data.min,
          max: row.data.max,
          avg: row.data.avg,
        };
        loopColumns.push(column);
      });
    };

    console.log(loopColumns);
    this.propertyList[this.selectedTableIndex].fields.forEach((field) => {
      let idx = loopColumns.findIndex((e) => {
        if(this.propertyList[this.selectedTableIndex].relation) {
          if(field.kind == 'storage') {
            return (
              field.fieldNumber == e.fieldNumber &&
              this.propertyList[this.selectedTableIndex].table === e.table &&
              this.propertyList[this.selectedTableIndex].relation === e.relation
            );
          }else {
            return (
              field.fieldName == e.fieldName &&
              this.propertyList[this.selectedTableIndex].table === e.table &&
              this.propertyList[this.selectedTableIndex].relation === e.relation
            );
          }
        }else {
          if(field.kind == 'storage') {
            return (
              field.fieldNumber == e.fieldNumber &&
              this.propertyList[this.selectedTableIndex].table === e.table
            );
          }else {
            return (
              field.fieldName == e.fieldName &&
              this.propertyList[this.selectedTableIndex].table === e.table
            );
          };
        }
      });

      if (idx == -1 || field.type == 'object') {
        this.displayFields.push(field);
      }

    });
    this.gridFieldsSource.dataSource = new Smart.DataAdapter({
      dataFields: [
        { name: 'name', type: 'string' },
        { name: 'fieldName', type: 'string' },
        { name: 'kind', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'relation', type: 'string' },
        { name: 'fieldNumber', type: 'int' },
      ],
      datatype: 'json',
      id: 'name',
      dataSource: [],
    });
    this.gridFieldsSource.dataSource = new Smart.DataAdapter({
      dataFields: [
        { name: 'name', type: 'string' },
        { name: 'fieldName', type: 'string' },
        { name: 'kind', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'relation', type: 'string' },
        { name: 'fieldNumber', type: 'int' },
      ],
      datatype: 'json',
      id: 'name',
      dataSource: this.displayFields,
    });
  }

  private getUsers(page: number) {
    this.dataService.getData(
      'user',
      `pagesize=1000&page=${page}`,
      (response) => {
        if (response.response.user) {
          let users = response.response.user;
          users.forEach((element) => {
            element.selectTag = `${element.name} - ${element.email}`;
          });
          this.usersLookup = this.usersLookup.concat(users);
          if (response.pageCount > page) this.getUsers(page++);
        }
      }
    );
  }

  public gridFieldsSource = new Smart.DataAdapter({
    dataFields: [
      { name: 'name', type: 'string' },
      { name: 'fieldName', type: 'string' },
      { name: 'kind', type: 'string' },
      { name: 'type', type: 'string' },
      { name: 'relation', type: 'string' },
      { name: 'fieldNumber', type: 'int' },
    ],
    datatype: 'json',
    id: 'name',
    dataSource: this.displayFields,
  });

  public gridFieldsColumns: GridColumn[] = [
    { label: 'Field Name', dataField: 'name', width: '100%' },
  ];

  public gridColumnsSource = new Smart.DataAdapter({
    dataFields: [
      'id: string',
      'header: string',
      'fieldName: string',
      'fieldNumber: number',
      'table: string',
      'fieldType: string',
      'displayFormat: string',
      'displayTable: string',
      'width: number',
      'widthUnit: string',
      'alignment: string',
      'sum: bool',
      'min: bool',
      'max: bool',
      'avg: bool',
      'relation: string',
      'attribute: string',
    ],
    datatype: 'json',
    id: 'id',
    dataSource: [],
  });

  public gridColumnsColumns: GridColumn[] = [
    { label: 'Header', dataField: 'header' },
    { label: 'Field Name', dataField: 'fieldName' },
    { label: 'Source Table', dataField: 'displayTable' }
  ];
}
