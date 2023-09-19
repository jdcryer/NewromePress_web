import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Output, EventEmitter, ViewChild, HostListener } from '@angular/core';
import { Observable } from 'rxjs';
import * as bootstrap from "bootstrap";
import { TranslateService } from '@ngx-translate/core';
import { DataService } from 'src/app/services/data.service';
import { IUserSettings, IMenuDefinition, IUserQuery, ITableDefinition, IQueryData, IQueryLine, IUserQueryResponse } from 'src/app/interfaces/smart-data-list';
import { MenuComponent, MenuItem } from 'node_modules/smart-webcomponents-angular/menu'
import { environment } from 'src/environments/environment';
import { MessageBoxService } from 'src/app/services/message-box.service';

@Component({
    templateUrl: 'query-editor.component.html',
    selector: 'app-query-editor-v2',
    styleUrls: [ 'query-editor.component.scss' ]
})
export class QueryEditorComponent implements OnInit {
	@Output() queryComplete = new EventEmitter();
	
	@HostListener('window:keyup', ['$event'])
	keyEvent(event: KeyboardEvent) {
		if((event.key == 'Enter') && (this.modalOpen)) {
			this.buttonOkClick({});
		}
	}

	@ViewChild('menuQuery', { static: false, read: MenuComponent }) menuQuery: MenuComponent;
	@ViewChild('menuSave', { static: false, read: MenuComponent }) menuSave: MenuComponent;

	public displayPage: number = 1;
	public selectedQuery: IUserQuery;
	public smartTheme = environment.smartTheme;
	public queryData: IQueryData = { targetResource: '', query: [  ] };
	public tableDef: ITableDefinition;
	public relatedTableDef: ITableDefinition[] = [];
	public queryButtons = { TITLE: 'Query editor', CANCEL: 'Cancel', RESET: 'Reset', OK: 'OK', NAME: 'Name' };

	public queryMenu: IMenuDefinition[] = [];
	public saveMenu: IMenuDefinition[] = [];
	private userQueries: IUserQuery[] = [];
	private userSettings: IUserSettings;
	private newQuery: IUserQuery = { name: '', type: 2, fk_user: '', handle: '', default: false, detail: { query: { targetResource: '', query: [] } } };
	private baseUrl: string = '';
	private lastSelectedId: string = '';
	private modalOpen = false;

	constructor(private http: HttpClient, private translate: TranslateService, 
		private dataService: DataService, private messageBox: MessageBoxService) { }
	
	ngOnInit(): void { 
		this.userSettings = this.dataService.getStoredData('userSettings');
		this.translate.get("QUERYEDITOR").subscribe((data) => {
			this.queryButtons = data;
		});
		this.selectedQuery = this.deepCopy(this.newQuery);
	}

	/**
	 * Inits query window for a given resource.
	 * Optionally accepts existing query to load in interface
	 * @param queryData A previously ran query to load in the interface
	 * @param baseUrl base API endpoint for obtaining TableDefinition
	 */
	public init(queryData: IQueryData, baseUrl: string){
		this.baseUrl = baseUrl;
		this.getTableDefinition(queryData);
		this.getUserQueries(queryData.targetResource);
	}

	/**
	 * Opens / Closes window according to param
	 * @param action Action to take, accepted values: 'show', 'hide'
	 */
	public modal(action: 'show' | 'hide'): void {
		$('#query-editor-modal').modal(action);
	}

	public open(): void {
		this.modalOpen = true;
		this.displayPage = 1;
		this.modal('show');
	}

	public lineConjunctionChange(event: any): void {
		if(event.index === (this.queryData.query.length - 1)){
			const field = (event.val === 'Or') ? this.queryData.query[event.index].field : this.tableDef.fields[0].name;
			this.queryData.query.push({ field: field, operator: '=', value: '', bracket: 'n' });
		}
	}

	public lineDeleteClick(index: number): void {
		if(this.queryData.query.length > 1){
			this.queryData.query.splice(index, 1);
			this.queryData.query[this.queryData.query.length - 1].conjunction = '';
		}
	}

	public buttonCancelClick(event: any): void {
		this.modalOpen = false;
		this.modal('hide');
	}

	public buttonResetClick(event: any): void {
		this.selectedQuery = this.deepCopy(this.newQuery);
		this.queryData.query = [ { field: (this.tableDef.fields.length > 0) ? this.tableDef.fields[0].name : '', operator: '=', value: '', bracket: 'n' } ];
	}

	public buttonOkClick(event: any): void {
		//Loop queryLines, need to move around conjunction, manage `contains` etc...
		let returnData: IQueryLine[] = [];
		let okToContinue = true;
		let lCount = 0;
		let rCount = 0;

		this.queryData.query.forEach((element, idx) => {
			let temp = { field: element.field, operator: element.operator, bracket: element.bracket, value: element.value, conjunction: '', attribute: (element.attribute) ? element.attribute : '' };
			if(element.bracket === 'r'){
				rCount++;
			}else if(element.bracket === 'l'){
				lCount++;
			}

			if(idx > 0) {
				let lastElement = this.queryData.query[idx - 1];
				if(lastElement.conjunction === 'And') { 
					temp.conjunction = '&';
				}else if(lastElement.conjunction === 'Or') {
					temp.conjunction = '|';
				}else if(lastElement.conjunction === 'Except') {
					temp.conjunction = '#';
				}
			}
			returnData.push(temp);
		});

		okToContinue = (rCount === lCount);
		//Emit query to parent component
		if(okToContinue){
			this.queryComplete.emit(returnData);
			this.modalOpen = false;
			this.modal('hide');
		}else{
			//error message
			alert("Mismatched number of Open and Close brackets!");
		}
	}

	public menuQueryItemClick(event: any) {
	  let param = event.detail.value;
		if((param !== 'na') && (param !== '')) {
			let index = this.userQueries.findIndex((element) => {
				return (element.id === param);
			});
			if(index >= 0) {
				this.selectedQuery = this.userQueries[index];
				this.loadQuery(this.userQueries[index].detail.query, true);
			}
		}
	}

	public menuSaveItemClick(event: any) {
		switch(event.detail.value) {
			case 'save': {
				this.selectedQuery.detail.query = this.queryData;
				this.lastSelectedId = '';
				this.displayPage = 2;
				break;
			}
			case 'savenew': {
				let newQuery: IUserQuery = this.deepCopy(this.newQuery);
				newQuery.name = (this.selectedQuery.name !== '') ? this.selectedQuery.name + ' Copy' : 'New Query';
				newQuery.fk_user = this.userSettings.id;
				newQuery.handle = this.queryData.targetResource;
				newQuery.detail.query = this.queryData;
				this.lastSelectedId = (this.selectedQuery.id != null) ? this.selectedQuery.id : '';
				this.selectedQuery = this.deepCopy(newQuery);
				this.displayPage = 2;
				break;
			}
		}
	}

	public buttonCancelSaveClick(event: any): void {
		if(this.lastSelectedId !== '') {
			let index = this.userQueries.findIndex((element) => {
				return (element.id === this.lastSelectedId);
			});
			if(index >= 0) this.selectedQuery = this.userQueries[index];
		}else {
			if(this.selectedQuery.id == null) {
				this.selectedQuery = this.deepCopy(this.newQuery);
			}
		}
		this.displayPage = 1;
	}

	public buttonOkSaveClick(event: any): void {
    //transform conjunctions before save
    let queryLines: IQueryLine[] = [];
    let postData: IUserQuery = {
      name: this.selectedQuery.name,
      fk_user: this.selectedQuery.fk_user,
      handle: this.selectedQuery.handle,
      type: this.selectedQuery.type,
      default: this.selectedQuery.default,
      detail: { query: { targetResource: this.selectedQuery.detail.query.targetResource, query: [] } }
    };
    if(this.selectedQuery.id) postData.id = this.selectedQuery.id;
    this.selectedQuery.detail.query.query.forEach((element, idx) => {
      let temp = { field: element.field, operator: element.operator, bracket: element.bracket, value: element.value, conjunction: '', attribute: (element.attribute) ? element.attribute : '' };

			if(idx > 0) {
				let lastElement = this.selectedQuery.detail.query.query[idx - 1];
				if(lastElement.conjunction === 'And') { 
					temp.conjunction = '&';
				}else if(lastElement.conjunction === 'Or') {
					temp.conjunction = '|';
				}else if(lastElement.conjunction === 'Except') {
					temp.conjunction = '#';
				}
			}
			queryLines.push(temp);
    });
    postData.detail.query.query = queryLines;
    //this.selectedQuery.detail.query.query = queryLines;

		//Post selectedQuery
		this.dataService.postData('interface', postData, (response) => {
			this.messageBox.showSuccess("Query Saved!");
			this.selectedQuery = response;
			this.getUserQueries(this.queryData.targetResource);
			this.displayPage = 1;
		});
	}

	public buttonLoadClick (event: any): void { 
		let targetElement = event.target;
		if(targetElement["localName"] == 'i') targetElement = targetElement["parentElement"];
		let target = <Element> targetElement;
		let rect = target.getBoundingClientRect();
		this.menuQuery.open(rect.left, rect.top + rect.height + window.scrollY);
	}
	public buttonSaveClick (event: any): void { 
		let saveItem = { label: 'Save', value: 'save', disabled: false };
		let saveAsItem = { label: 'Save as New', value: 'savenew', disabled: false };

		if(this.selectedQuery.id == null) {
			saveItem.disabled = true;
		}else {
			if(this.selectedQuery.fk_user !== this.userSettings.id) {
				saveItem.disabled = true; 
			}
		}

		this.saveMenu = [];
		this.saveMenu.push(saveItem);
		this.saveMenu.push(saveAsItem);
		// this.menuSave.dataSource = [];
		this.menuSave.dataSource = this.saveMenu;
		
		let targetElement = event.target;
		if(targetElement["localName"] == 'i') targetElement = targetElement["parentElement"];
		let target = <Element> targetElement;
		let rect = target.getBoundingClientRect();
		this.menuSave.open(rect.left, rect.top + rect.height + window.scrollY);
	}

	public buttonDeleteClick (event: any): void { 
		if(this.selectedQuery.id != null) {
			if(confirm(`Are you sure you wish to delete the query ${this.selectedQuery.name}?`)) {
				this.dataService.deleteData('interface', this.selectedQuery.id, (response) => {
					this.messageBox.showSuccess('Query Deleted!');
					this.selectedQuery = this.deepCopy(this.newQuery);
					this.getUserQueries(this.queryData.targetResource);
				});
			}
		}else {
			this.messageBox.showWarning('No Query Selected!');
		}
	}

	private httpGet(url): Observable<ITableDefinition>{
		return this.http.get<ITableDefinition>(url);
	}

	private httpGetQueries(url): Observable<IUserQueryResponse>{
		return this.http.get<IUserQueryResponse>(url);
	}

	private getTableDefinition(queryData: IQueryData){
		const url = `${this.baseUrl}propertyList?table=${queryData.targetResource}`;
		this.httpGet(url).subscribe(data => {
			this.tableDef = data;
			this.loadQuery(queryData);

			//Loop tableDef fields, get def for each related entity
			this.tableDef.fields.forEach(field => {
				if((field.kind === 'relatedEntity') || (field.kind === 'relatedEntities')) {
					let url2 = `${this.baseUrl}propertyList?table=${field.relatedDataClass}`;
					this.httpGet(url2).subscribe(data => {
						this.relatedTableDef.push({ relationName: field.name ,dataClass: field.relatedDataClass, fields: data.fields });
					});
				}
			});
		},
		error => {
			console.log(error);
		});
	}

	private getUserQueries(targetResource: string): void {
		const url = `${this.baseUrl}userQueries?table=${targetResource}`;
		this.httpGetQueries(url).subscribe(data => {
			this.userQueries = data.response;
			
			//Build Query Menu

			let yourQueries: IMenuDefinition[] = [];
			let publicQueries: IMenuDefinition[] = [];
			this.queryMenu = [];

			this.userQueries.forEach((element) => {
				let option = { label: element.name, value: (element.id) ? element.id : '' };
				if(element.fk_user === this.userSettings.id) {
					yourQueries.push(option);
				}else {
					publicQueries.push(option);
				}
			});
			if((yourQueries.length === 0) && (publicQueries.length === 0)) {
				this.queryMenu.push({ label: 'None Available', value: 'na', disabled: true });
			}else {
				if(yourQueries.length === 0) yourQueries.push({ label: 'None Available', value: 'na', disabled: true });
				if(publicQueries.length === 0) publicQueries.push({ label: 'None Available', value: 'na', disabled: true });

				this.queryMenu.push({ label: 'Your Queries', value: 'na', items: yourQueries });
				this.queryMenu.push({ label: 'Public Queries', value: 'na', items: publicQueries });
			}
			// this.menuQuery.dataSource = [];
			this.menuQuery.dataSource = this.queryMenu;
		},
		error => {
			console.log(error);
		});
	}

	public loadQuery(queryData: IQueryData, processConjunction: boolean = true) {
		this.queryData = this.deepCopy(queryData);
		if(this.queryData.query.length == 0){
			this.queryData.query.push({ field: (this.tableDef.fields.length > 0) ? this.tableDef.fields[0].name : '', operator: '=', value: '', bracket: 'n' });
		}else{
			if(processConjunction) {
				// this.selectedQuery = this.deepCopy(this.newQuery);

				this.queryData.query.forEach((element, index) => {
					const next = index + 1;
					element.conjunction = (next < this.queryData.query.length) ? this.queryData.query[next].conjunction : ''; //TODO: Convert conjunction from `|` to `Or` etc
					if(element.conjunction === '|'){
						element.conjunction = 'Or';
					}else if(element.conjunction === '&'){
						element.conjunction = 'And';
					}else if(element.conjunction === '#'){
						element.conjunction = 'Except';
					}
				});
			}
		}
	}

	private deepCopy(a: any): any{
		let b = {}, params = Object.getOwnPropertyNames(a);
		params.forEach(p => { 
			if(p === 'query'){
				b[p] = a[p].map(aEle => Object.assign({}, aEle));
			}else{
				b[p] = a[p];
			} 
		});
		return b;
	}
}
export let test = [];
