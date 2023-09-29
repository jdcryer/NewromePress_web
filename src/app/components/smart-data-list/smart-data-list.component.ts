import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  Output,
  EventEmitter,
  ViewChild,
  HostListener,
  ViewContainerRef,
  ElementRef,
} from '@angular/core';
import { DataService } from './../../services/data.service';
import { environment } from 'src/environments/environment';
import {
  IGridDefiniton,
  IRelateCount,
  IMenuDefinition,
  IBrowseState,
  IQueryLine,
  IView,
  IUserSettings,
  IGridDefTab,
  IQueryData,
  IDataListButton,
} from 'src/app/interfaces/smart-data-list';
import { MenuComponent } from 'node_modules/smart-webcomponents-angular/menu';
import { DataAdapterVirtualDataSourceDetails } from 'smart-webcomponents-angular';
import { minResult } from 'src/app/generic-functions';
import { GridComponent, Smart } from 'smart-webcomponents-angular/grid';
import { QueryEditorComponent } from '../query-editor/query-editor.component';
import { SmartViewEditorComponent } from '../smart-view-editor/smart-view-editor.component';
import { MessageBoxService } from 'src/app/services/message-box.service';
import { Router } from '@angular/router';
import { SmartTabsEditorComponent } from '../smart-tabs-editor/smart-tabs-editor.component';
import { GridDirective } from './grid-directive.directive';
import { GridWrapperComponent } from 'src/app/components/grid-wrapper/grid-wrapper.component';

@Component({
  selector: 'app-smart-data-list',
  templateUrl: './smart-data-list.component.html',
  styleUrls: ['./smart-data-list.component.scss'],
})
export class SmartDataListComponent implements OnInit, OnDestroy {
  @ViewChild('menuAction', { static: true, read: MenuComponent }) menuAction: MenuComponent;
  @ViewChild('menuPrint', { static: true, read: MenuComponent }) menuPrint: MenuComponent;
  @ViewChild('menuQuery', { static: true, read: MenuComponent }) menuQuery: MenuComponent;
  @ViewChild('menuView', { static: true, read: MenuComponent }) menuView: MenuComponent;
  @ViewChild('menuSimpleSearch', { static: true, read: MenuComponent }) menuSimpleSearch: MenuComponent;
  @ViewChild('menuRelate', { static: true, read: MenuComponent }) menuRelate: MenuComponent;
  @ViewChild('smartGrid', { static: false, read: GridComponent }) smartGrid: GridComponent;
  @ViewChild('viewEditor', { static: true, read: SmartViewEditorComponent }) viewEditor: SmartViewEditorComponent;
  @ViewChild('queryEditor', { static: true, read: QueryEditorComponent }) queryEditor: QueryEditorComponent;
  @ViewChild('tabsEditor', { static: true, read: SmartTabsEditorComponent }) tabsEditor: SmartTabsEditorComponent;
  @ViewChild('placeHolder', { static: true, read: ViewContainerRef }) private _placeHolder: ElementRef;
  @ViewChild(GridDirective, { static: true }) dataGrid!: GridDirective;

  @Input('newDisabled') newDisabled: boolean = false;
  @Input('simpleFilterFields') simpleFilterFields: string[] = [];
  @Input('doubleClickCallback') doubleClickCallback: Function;
  @Input('rowClassCallback') rowClassCallback: Function;
  @Input('sortPropertyOverride') sortPropertyOverride: Function;
  @Input('newCallback') newCallback: Function;
  @Input('targetResource') targetResource: string;
  @Input('baseQueryString') baseQueryString: string = '';
  @Input('baseSortString') baseSortString: string = '';
  @Input('hideTabBar') hideTabBar: boolean = false;
  @Input('hideFilterInput') hideFilterInput: boolean = false;
  @Input('hideRecordCount') hideRecordCount: boolean = false;
  @Input('buttons') buttons: IDataListButton[] = [];

  @Input('gridDef') set _gridDef(value: IGridDefiniton) {
    this.gridDef = value;
    if (this.gridDef.viewList) {
      this.gridDef.viewList.forEach((element) => {
        if (element.value === this.gridDef.viewData.id) {
          element.label = `<i style="float: right" class="far fa-check"></i>${element.name}`;
        } else {
          if (element.name)
            element.label = `<span style="margin-left: 14px">${element.name}</span>`;
        }
      });
    }
    // this.applyView(this.gridDef.viewData.id);
    this.gridSource.datafields = this.gridDef.viewData.detail.datafields;
    this.selectedTab = this.gridDef.tabList[0];
  }

  @Output() actionSelected = new EventEmitter();
  @Output() printSelected = new EventEmitter();
  @Output() querySelected = new EventEmitter();

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.rTime = new Date();
    if (this.timeout === false) {
      this.timeout = true;
      setTimeout(this.resizeend, this.delta);
    }
  }

  public smartTheme = environment.smartTheme;
  public recordCount: number = 0;
  public recordsFound: string = `Recs: 0`;
  public simpleFilterValue: string = '';
  public simpleFilterHistory: IMenuDefinition[] = [];
  public relateCount: IRelateCount[] = [];
  public relateMenuSource: IMenuDefinition[] = [];
  public selectedTabId: number = -1;
  public gridHeight = `${minResult(window.innerHeight - environment.usedHeight, 250 )}px`;

  private userData: IUserSettings;
  private browseState: IBrowseState;
  private loadToken: boolean;
  private autoscroll: boolean;
  private timeout = false;
  private rTime: Date;
  private delta: number = 200;
  private sorting: boolean;
  private atag_Link: HTMLAnchorElement;
  private selectedTab: IGridDefTab;
  private gridWrapper: GridWrapperComponent;
  private customSortString: string = '';

  public gridDef: IGridDefiniton = {
    actionList: [],
    printList: [],
    queryList: [],
    viewData: {
      id: '',
      name: '',
      fk_user: '',
      handle: '',
      type: 1,
      default: false,
      detail: { datafields: [], columns: [], editColumns: [] },
    },
    tabList: [],
    defaultTab: -1,
  };

  constructor(
    private dataService: DataService,
    private messageBox: MessageBoxService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.baseQueryString = this.baseQueryString === '' ? `relateCount=true` : `${this.baseQueryString}&relateCount=true`;
    this.browseState = this.dataService.getStoredData(`${this.targetResource}browseState`);
    this.createGrid();
    if (!this.browseState) {

      this.browseState = {
        lastQuery: { targetResource: this.targetResource, query: [] },
        selectToken: '',
        scrollIndex: 0,
        viewId: '',
        tabId: -1,
        searchHistory: [],
        refreshSelection: false,
      };
      let index = this.gridDef.tabList.findIndex(ele => { return ele.id === this.gridDef.defaultTab });
      if(index >= 0) {
        this.selectedTabId = this.gridDef.defaultTab;
        this.selectedTab = this.gridDef.tabList[index];
        this.browseState.tabId = this.selectedTabId;
        this.applySelectedTab();
      }

    } else {

      this.autoscroll = this.browseState.scrollIndex !== 0;
      let index = this.gridDef.tabList.findIndex(ele => { return ele.id === this.browseState.tabId });
      if(index >= 0) {
        this.selectedTabId = this.browseState.tabId;
        this.selectedTab = this.gridDef.tabList[index];
      }
      if(this.browseState.refreshSelection) {
        this.applySelectedTab();
        this.browseState.refreshSelection = false;
      }else {
        this.loadToken = true;
      }

    }
    this.queryEditor.init(
      this.browseState.lastQuery,
      environment.apiSettings.endpoint
    );
    this.userData = this.dataService.getStoredData('userSettings');
    this.simpleFilterHistory = this.browseState.searchHistory;
    this.atag_Link = document.getElementById('atag_Link') as HTMLAnchorElement;

    const usedHeight = (this.hideTabBar) ? (environment.usedHeight - 39) : environment.usedHeight;
    this.gridHeight = `${minResult(window.innerHeight - usedHeight, 250 )}px`;
  }

  ngAfterViewInit(): void {
    if (this.loadToken) {
      let queryString = this.baseQueryString;
      if(this.baseSortString != '') queryString += (queryString == '') ? `${this.baseSortString}` : `&${this.baseSortString}`;

      this.dataService.getData(
        this.targetResource,
        `${this.baseQueryString}&selectToken=${this.browseState.selectToken}`,
        this.gridSetToken,
        null,
        null,
        true
      );
    }
  };

  getGridData = (
    details: DataAdapterVirtualDataSourceDetails,
    resultCallbackFunction: any
  ) => {
    let url = `${environment.apiSettings.endpoint}${this.targetResource}`;

    let queryString = '?';
    if (this.browseState.selectToken)
      queryString += `selectToken=${this.browseState.selectToken}`;
    if (this.gridDef.viewData.id)
      queryString += `${queryString !== '?' ? '&' : ''}viewId=${
        this.gridDef.viewData.id
      }`;
    if (details.first)
      queryString += `${queryString !== '?' ? '&' : ''}startIndex=${details.first}`;
    if (details.last)
      queryString += `${queryString !== '?' ? '&' : ''}endIndex=${details.last}`;

    // console.log(details);
    // if(details.sorting) {
    //   if(details.sorting.length > 0) {
    //     let sortString = '';
    //     for(let element in details.sorting) {
    //       let property = element;
    //       if(this.sortPropertyOverride) property = this.sortPropertyOverride(element);
    //       let dir = (details.sorting[element].sortOrder == 'asc') ? '>' : '<';
    //       if(sortString !== '') sortString += ';';
    //       sortString += `${property};${dir}`
    //     }
    //     if(sortString !== '') queryString += `${queryString !== '?' ? '&' : ''}order_by=${sortString}`
    //   }else {
    //     if(this.baseSortString) queryString += `${queryString !== '?' ? '&' : ''}order_by=${this.baseSortString}`
    //   }
    // }else {
    //   if(this.baseSortString) queryString += `${queryString !== '?' ? '&' : ''}order_by=${this.baseSortString}`
    // }

    if (queryString !== '?') url += queryString;

    this.dataService.httpGET(url).subscribe((data: any) => {
      resultCallbackFunction({
        dataSource: data.response[this.targetResource],
      });
    });
  };

  virtualDataSource = (
    resultCallbackFunction: any,
    details: DataAdapterVirtualDataSourceDetails
  ) => {
    this.getGridData(details, resultCallbackFunction);
  };

  gridSetToken = (response: any) => {
    this.browseState.selectToken = response.selectToken;

    this.relateCount = response.relateCount;
    this.recordCount = response.recordsFound;
    this.recordsFound = `Recs: ${response.recordsFound}`;
    this.buildRelateMenu();

    // if (!this.sorting) this.smartGrid.clearSelection();
    // else this.sorting = false;

    // let tempGridSource = new Smart.DataAdapter({
    //   mapChar: '.',
    //   dataFields: this.gridDef.viewData.detail.datafields,
    //   id: 'id',
    //   virtualDataSourceCache: false,
    //   virtualDataSource: this.virtualDataSource,
    //   virtualDataSourceLength: response.recordsFound,
    // });
    // this.smartGrid.dataSource = tempGridSource;

    if (!this.sorting) this.gridWrapper.smartGrid.clearSelection();
    else this.sorting = false;

    this.gridWrapper.input.dataSource = new Smart.DataAdapter({
      mapChar: '.',
      dataFields: this.gridDef.viewData.detail.datafields,
      id: 'id',
      virtualDataSourceCache: false,
      virtualDataSource: this.virtualDataSource,
      virtualDataSourceLength: response.recordsFound,
    });
  };

  gridSetTokenNoRefresh = (response: any) => {
    this.browseState.selectToken = response.selectToken;

    this.relateCount = response.relateCount;
    this.recordCount = response.recordsFound;
    this.recordsFound = `Recs: ${response.recordsFound}`;
    this.buildRelateMenu();

    if (!this.sorting) this.gridWrapper.smartGrid.clearSelection();
    else this.sorting = false;

    this.gridWrapper.smartGrid.refreshSort();

  };

  public gridSource = new Smart.DataAdapter({
    mapChar: '.',
    dataFields: [],
    id: 'id',
    dataSource: []
  });

  public gridSettings = {
    sorting: {
      enabled: true,
      mode: 'many'
    },
    appearance: {
      // alternationStart: 0,
      // alternationCount: 2
    },
    behavior: {
      columnResizeMode: 'growAndShrink'
    },
    selection: {
      enabled: true,
      allowRowSelection: false,
      // defaultSelection: true,
      checkBoxes: {
        enabled: true,
        selectAllMode: 'all',
      }
    }
  };

  ngOnDestroy(): void {
    this.dataService.setStoredData(
      `${this.targetResource}browseState`,
      this.browseState
    );
  }

  btNewClicked(event: any): void {
    this.newCallback();
  }
  btShowAllClicked(event: any): void {
    console.log(this.selectedTab);
    if(this.hideTabBar) {
      this.selectedTabId = -1;
      let index = this.gridDef.tabList.findIndex(e => { return e.id == this.selectedTabId });
      this.selectedTab = this.gridDef.tabList[index];
    }
    this.applySelectedTab();
  }
  btShowSubsetClicked(event: any): void {
    this.applySubset('subset');
  }
  btOmitSubsetClicked(event: any): void {
    this.applySubset('omitset');
  }
  btQueryClicked(event: any): void {
    this.queryEditor.open();
  }

  applySubset(type: 'omitset' | 'subset'): void {
    // this.smartGrid.ensureVisible(0);
    this.gridWrapper.smartGrid.getSelectedRowIndexes().then((rows) => {
    // this.smartGrid.getSelectedRowIndexes().then((rows) => {
      let rowIndexes: number[] = [];
      rows.forEach((e) => {
        if (e === 0 || e) rowIndexes.push(e);
      });
      const subSetRequest = { subset: rowIndexes };
      // const queryString = `selectToken=${this.browseState.selectToken}${this.baseQueryString != '' ? `&${this.baseQueryString}` : ``}`;
      const queryString = this.buildQueryString(`selectToken=${this.browseState.selectToken}`);
      this.dataService.getSubsetToken(
        this.targetResource,
        queryString,
        this.gridSetToken,
        null,
        subSetRequest,
        type
      );
    });
  }

  buildRelateMenu(): void {
    this.relateMenuSource = [];
    this.relateCount.forEach(count => {
      let bAdd = true;
      if(this.userData.prefs.sidebarAccess) {
        if(this.userData.prefs.sidebarAccess[count.listing] !== undefined) bAdd = this.userData.prefs.sidebarAccess[count.listing];
      };
      if(bAdd) {
        let menuItem: IMenuDefinition = {
          value: count.table, label: `${count.label} [${count.count}]`, disabled: (count.count === 0)
        };
        this.relateMenuSource.push(menuItem);
      }
    });
  };

  gridDoubleClick = (event: any) => {
    if(this.doubleClickCallback) {
      this.doubleClickCallback(event.detail.row.data);
    }else {
      this.router.navigate([ `${this.targetResource}/${this.targetResource}-detail/${event.detail.row.data.id}` ]);
    }
  };

  gridSort = (event: any) => {
    //Create customSortString and get new token.
    this.customSortString = '';

    if(event.detail) {
      if(event.detail.data) {
        let sortString = '';

        event.detail.data.forEach(sortLine => {
          let datafield = sortLine.dataField;
          if(this.sortPropertyOverride) datafield = this.sortPropertyOverride(datafield);
          const dir = (sortLine.sortOrder == 'asc') ? '>' : '<';
          sortString += (sortString == '') ? '' : ';';
          sortString += `${datafield};${dir}`;
        });
        if(sortString != '') this.customSortString = `order_by=${sortString}`;
      };
    };

    switch(this.selectedTab.type) {
      case 'Lookup': {
        const queryString = this.buildQueryString(`${this.selectedTab.fieldName}=${this.selectedTab.value}`);
        this.dataService.getData(this.targetResource, queryString, this.gridSetTokenNoRefresh, null, null, true);
        break;
      }
      case 'Custom Query': {
        const queryString = this.buildQueryString(`queryId=${this.selectedTab.queryId}`);
        this.dataService.getData(this.targetResource, queryString, this.gridSetTokenNoRefresh, null, null, true);
        break;
      }
      case 'all': {
        const queryString = this.buildQueryString();
        this.dataService.getData(this.targetResource, queryString, this.gridSetTokenNoRefresh, null, null, true);
        break;
      }
      case 'searchresult': {
        const queryString = this.buildQueryString();
        this.dataService.getData(this.targetResource, queryString, this.gridSetTokenNoRefresh, null, this.browseState.lastQuery, true);
        break;
      }
    }

    // this.applySelectedTab();
  };

  btMenuClicked(event: MouseEvent, type: string): void {
    let targetElement = event.target;
    if (targetElement) {
      if (targetElement['localName'] == 'i') targetElement = targetElement['parentElement']['parentElement'];
      let target = <Element>targetElement;
      let rect = target.getBoundingClientRect();
      switch (type) {
        case 'query': {
          this.menuQuery.open(rect.left, rect.top + rect.height + window.scrollY);
          break;
        }
        case 'action': {
          this.menuAction.open(rect.left, rect.top + rect.height + window.scrollY);
          break;
        }
        case 'view': {
          this.menuView.open(rect.left, rect.top + rect.height + window.scrollY);
          break;
        }
        case 'print': {
          this.menuPrint.open(rect.left, rect.top + rect.height + window.scrollY);
          break;
        }
        case 'relate': {
          this.menuRelate.open(rect.left, rect.top + rect.height + window.scrollY);
          break;
        }
        case 'simpleSearch': {
          this.menuSimpleSearch.open(rect.left, rect.top + rect.height + window.scrollY);
          break;
        }
      }
    }
  }

  simpleFilterChange(): void {
    if (this.simpleFilterValue !== '') {
      //Add filter value to history
      let index = this.simpleFilterHistory.findIndex((element) => {
        return element.value == this.simpleFilterValue;
      });
      if (index == -1)
        this.simpleFilterHistory.push({
          label: this.simpleFilterValue,
          value: this.simpleFilterValue,
        });
      this.menuSimpleSearch.dataSource = [];
      this.menuSimpleSearch.dataSource = this.simpleFilterHistory;
      this.browseState.searchHistory = this.simpleFilterHistory;

      //run query
      this.selectedTabId = -2;
      let queryString = this.buildQueryString(`simpleFilter=${this.simpleFilterValue}`);
      this.dataService.getData(
        this.targetResource,
        queryString,
        this.gridSetToken,
        null,
        null,
        true
      );

    }
  }

  private buildQueryString(queryString: string = ''): string {

    if(this.baseQueryString != '') queryString += (queryString == '') ? this.baseQueryString : `&${this.baseQueryString}`;
    if(this.customSortString != '') {
      queryString += (queryString == '') ? this.customSortString : `&${this.customSortString}`;
    }else {
      if(this.baseSortString != '') queryString += (queryString == '') ? this.baseSortString : `&${this.baseSortString}`;
    };

    return queryString;
  };

  async menuItemClick(event: any, target: string) {
    this.gridWrapper.smartGrid.getSelectedRowIndexes().then(async (rows) => {
    // this.smartGrid.getSelectedRowIndexes().then(async (rows) => {
      let rowIndexes: number[] = [];
      rows.forEach((e) => {
        if (e === 0 || e) rowIndexes.push(e);
      });

      let page = 1;
      let totalPages = 1;
      let selectedData = [];
      const pageSize = 1000;
      const subSetRequest = { subset: rowIndexes };
      if (target === 'action' || target === 'print' || target === 'relate') {
        do {
          let queryString = `page=${page}&pagesize=${pageSize}&selectToken=${
            this.browseState.selectToken
          }${this.baseQueryString != '' ? `&${this.baseQueryString}` : ``}`;
          let response = await this.dataService.getSubsetData(
            this.targetResource,
            queryString,
            subSetRequest,
            'subset'
          );
          totalPages = response.response.pageCount;
          if (response.response[this.targetResource])
            selectedData = selectedData.concat(
              ...response.response[this.targetResource]
            );
          page++;
        } while (page <= totalPages);
      }

      let eventData = {
        param: event.detail.value,
        data: selectedData,
      };

      switch (target) {
        case 'action': {
          this.actionSelected.emit(eventData);
          break;
        }
        case 'print': {
          this.printSelected.emit(eventData);
          break;
        }
        case 'view': {
          switch (eventData.param) {
            case 'newview': {
              this.viewEditor.openModal('', 'newview');
              break;
            }
            case 'editview': {
              if (this.gridDef.viewData.fk_user === this.userData.id) {
                this.viewEditor.openModal(
                  this.gridDef.viewData.id,
                  eventData.param
                );
              } else {
                this.messageBox.showWarning(
                  'Cannot Edit View',
                  'This view was created by another user. Try duplicating!'
                );
              }
              break;
            }
            case 'dupeview': {
              this.viewEditor.openModal(
                this.gridDef.viewData.id,
                eventData.param
              );
              break;
            }
            case 'deleteview': {
              if (this.gridDef.viewData.fk_user === this.userData.id) {
                if (
                  confirm(
                    `Are you sure you wish to delete the view ${this.gridDef.viewData.name}?`
                  )
                ) {
                  if (this.gridDef.viewData.id) {
                    this.dataService.deleteData(
                      'interface',
                      this.gridDef.viewData.id,
                      (data) => {
                        this.messageBox.showSuccess('View Deleted');
                        this.applyView();
                      },
                      null
                    );
                  }
                }
              } else {
                this.messageBox.showWarning(
                  'Cannot Delete View',
                  'This view was created by another user!'
                );
              }
              break;
            }
            case 'exportview':
            case 'excel':
            case 'csv': {
              if (!(eventData.param == 'exportview')) {
                let queryStr = `selectToken=${this.browseState.selectToken}&viewId=${this.gridDef.viewData.id}&format=${eventData.param}`;
                this.dataService.getData('exportView', queryStr, (response) => {
                  if (response.success) {
										this.messageBox.showSuccess('Export Queued', 'You will receive a notification when the export is ready for download');
                  }else {
										this.messageBox.showSuccess('Export Failed', response.error);
									};
                });
              }
              break;
            }
            default: {
              if (this.gridDef.viewData.id !== eventData.param)
                this.applyView(eventData.param);
            }
          }
          break;
        }
        case 'query': {
          if (event.detail.value === 'query') {
            //Open advanced Query editor
            this.queryEditor.open();
          } else {
            //Callback to parent
            this.querySelected.emit(eventData);
          }
          break;
        }
        case 'simpleSearch': {
          this.simpleFilterValue = eventData.param;
          // let queryString = `simpleFilter=${this.simpleFilterValue}`;
          // if (this.baseQueryString != '') queryString += `&${this.baseQueryString}`;
          const queryString = this.buildQueryString(`simpleFilter=${this.simpleFilterValue}`);
          this.dataService.getData(
            this.targetResource,
            queryString,
            this.gridSetToken,
            null,
            null,
            true
          );
          break;
        }
        case 'relate': {
          let relateIdx = this.relateCount.findIndex(element => { return element.table === eventData.param });
          let targetBrowseState = this.dataService.getStoredData(`${eventData.param}browseState`);
          if(!targetBrowseState) {
            targetBrowseState = {
              lastQuery: { targetResource: this.targetResource, query: [] },
              selectToken: '',
              scrollIndex: 0,
              viewId: '',
              searchHistory: []
            }
          }else {
            targetBrowseState.scrollIndex = 0;
          }

          //Get selectToken for target table
          this.dataService.getData(eventData.param, `relateToken=${this.browseState.selectToken}&sourceTable=${this.targetResource}`, (response) => {
            targetBrowseState.selectToken = response.selectToken;
            this.dataService.setStoredData(`${eventData.param}browseState`, targetBrowseState);
            this.router.navigate([ this.relateCount[relateIdx].listing ]);
          }, null, null, true);
          break;
        }
      }
    });
  }

  resizeend = () => {
    if (+new Date() - +this.rTime < this.delta) {
      setTimeout(this.resizeend, this.delta);
    } else {
      this.timeout = false;
      const usedHeight = (this.hideTabBar) ? (environment.usedHeight - 39) : environment.usedHeight;
      this.gridHeight = `${minResult(window.innerHeight - usedHeight, 250 )}px`;
    }
  };

  queryComplete(event: IQueryLine[]): void {
    if (event) {
      this.selectedTabId = -2;
      let index = this.gridDef.tabList.findIndex(e => { return e.id == this.selectedTabId });
      this.selectedTab = this.gridDef.tabList[index];
      this.browseState.lastQuery.query = event;
      const queryString = this.buildQueryString();
      this.dataService.getData(
        this.targetResource,
        queryString,
        this.gridSetToken,
        null,
        this.browseState.lastQuery,
        true
      );
    }
  }

  public doQuery(queryData: IQueryData, reloadQuery: boolean = false) {
    this.selectedTabId = -2;
    let index = this.gridDef.tabList.findIndex(e => { return e.id == this.selectedTabId });
    this.selectedTab = this.gridDef.tabList[index];
    this.browseState.lastQuery = queryData;
    if(reloadQuery) this.queryEditor.loadQuery(queryData);
    const queryString = this.buildQueryString();
    this.dataService.getData(
      this.targetResource,
      queryString,
      this.gridSetToken,
      null,
      this.browseState.lastQuery,
      true
    );
  };

  btEditTabsClick(): void {
    this.tabsEditor.open();
  };

  viewEditComplete(event: IView): void {
    if (event) this.applyView(event.id);
  };

  tabClicked(event: any): void {
    let index = this.gridDef.tabList.findIndex(ele => { return ele.id === event.nextId });
    this.selectedTab = this.gridDef.tabList[index];
    this.browseState.tabId = this.selectedTab.id;
    this.applySelectedTab();
  }

  applySelectedTab(): void {
    switch(this.selectedTab.type) {
      case 'Lookup': {
        const queryString = this.buildQueryString(`${this.selectedTab.fieldName}=${this.selectedTab.value}`);
        this.dataService.getData(this.targetResource, queryString, this.gridSetToken, null, null, true);
        break;
      }
      case 'Custom Query': {
        const queryString = this.buildQueryString(`queryId=${this.selectedTab.queryId}`);
        this.dataService.getData(this.targetResource, queryString, this.gridSetToken, null, null, true);
        break;
      }
      case 'all': {
        const queryString = this.buildQueryString();
        this.dataService.getData(this.targetResource, queryString, this.gridSetToken, null, null, true);
        break;
      }
      case 'searchresult': {
        const queryString = this.buildQueryString();
        this.dataService.getData(this.targetResource, queryString, this.gridSetToken, null, this.browseState.lastQuery, true);
        break;
      }
    }
  };

  public refreshListing(): void {
    this.gridWrapper.smartGrid.clearSelection();
    this.applySelectedTab();
  };

  private applyView(viewId: string = ''): void {
    const queryString = `table=${this.targetResource}${
      viewId ? `&viewId=${viewId}` : ``
    }`;
    this.dataService.getData(
      `gridDef`,
      queryString,
      (data) => {
        this.gridDef = data;
        // this.viewUpdate = true;
        if (this.gridDef.viewList) {
          this.gridDef.viewList.forEach((element) => {
            if (element.value === this.gridDef.viewData.id) {
              element.label = `<i style="float: right" class="far fa-check"></i>${element.name}`;
            } else {
              if (element.name)
                element.label = `<span style="margin-left: 14px">${element.name}</span>`;
            }
          });
        }

        this.menuView.dataSource = this.gridDef.viewList;
        this.browseState.viewId = viewId;
        this.createGrid();
      },
      null
    );
  }

  createGrid() {
    const viewContainerRef = this.dataGrid.viewContainerRef;
    console.log(this.dataGrid);
    viewContainerRef.clear();

    const grid = viewContainerRef.createComponent<GridWrapperComponent>(GridWrapperComponent);

    let input = {
      theme: this.smartTheme,
      dataSource: new Smart.DataAdapter({
        mapChar: '.',
        dataFields: this.gridDef.viewData.detail.datafields,
        id: 'id',
        virtualDataSourceCache: false,
        virtualDataSource: this.virtualDataSource,
        virtualDataSourceLength: this.recordCount,
      }),
      scrolling: 'virtual',
      columns: this.gridDef.viewData.detail.columns,
      selection: this.gridSettings.selection,
      behavior: this.gridSettings.behavior,
      appearance: this.gridSettings.appearance,
      sorting: this.gridSettings.sorting,
      gridSortCallback: this.gridSort,
      doubleClickCallback: this.gridDoubleClick,
      rowClassCallback: this.rowClassCallback,
    };

    grid.instance.input = input;
    this.gridWrapper = grid.instance;
  };

  genericButtonClicked(event: any): void {
    let target = event.target;
    while(target.localName !== 'button') {
      target = target.parentNode;
    }

    let index = this.buttons.findIndex(e => { return e.code === target.id });
    if(index >= 0) {
      if(this.buttons[index].callback) this.buttons[index].callback?.(target.id);
    }
  };

  tabsUpdate(event: any): void {
    this.applyView(this.browseState.viewId);
  };
}
