import { GridColumn } from 'smart-webcomponents-angular/grid';

export interface IGridDefiniton {
	actionList: IMenuDefinition[];
	printList: IMenuDefinition[];
	queryList: IMenuDefinition[];
	viewList?: IMenuDefinition[];
	viewData: IView;
	tabList: IGridDefTab[];
  defaultTab: number;
}

export interface IMenuDefinition {
	label?: string;
	value: string;
	html?: string;
	name?: string;
	disabled?: boolean;
	separator?: boolean;
	items?: IMenuDefinition[];
}

export interface IView {
	id?: string,
	name: string,
	fk_user: string,
	handle: string,
	type: number,
	default: boolean,
	detail: IViewDetail;
	interface_user?: Partial<IUser>;
}

export interface IViewDetail {
	editColumns: IColumn[];
	columns: GridColumn[];
	datafields: IDataField[];
}

export interface IDataField {
	name: string;
	dataType: string;
	map?: string;
}

export interface IColumn {
	id: string;
	header: string;
	fieldName: string;
	fieldNumber: number;
	table: string;
	relation?: string;
	fieldType: string;
  displayFormat: string;
	width: number;
	widthUnit: string;
	alignment: string;
	min: boolean;
	max: boolean;
	sum: boolean;
	avg: boolean;
	attribute?: string;
	displayTable?: string;
}

export interface IUser {
	id: string;
	fk_account: string;
	name: string;
	email: string;
	type: string;
	apiKey: string;
	detail: any;
	permissions: any;

	selectTag?: string;
}

export interface IUserSettings {
	id: string;
	email: string;
	username: string;
	type: string;
	prefs: {
		lang: string;
		sidebarAccess: any;
	}
	fk_client: string;
}

export interface IRelateCount {
	table: string;
	listing: string;
	label: string;
	count: number;
}

export interface IBrowseState {
	viewId: string;
	tabId: number;
	lastQuery: IQueryData;
	selectToken: string;
	scrollIndex: number;
	searchHistory: IMenuDefinition[];
  refreshSelection: boolean;
}

export interface IQueryLine {
    field: string;
    operator: string;
    value: any;

    bracket?: string;
    conjunction?: string;
    attribute?: string;
}

export interface IQueryData {
    targetResource: string;
    query: IQueryLine[];
    querywitharray?: { field: string, values: any[] } 
}

export interface IUserQuery {
  id?: string,
	name: string,
	fk_user: string,
	handle: string,
	type: number,
	default: boolean,
	detail: { query: IQueryData };
}

export interface IUserQueryResponse {
    response: IUserQuery[];
}

export interface ITableDefinition {
    dataClass?: string;
    relationName?: string;
    fields: IFieldDefinition[];
}

export interface IFieldDefinition {
    name: string;
    type: string;
    kind: string;
    unique: boolean;
    invisible: boolean;
    indexed?: boolean;
    length?: number;
    relatedDataClass?: string;
}

export interface IPropertyList {
	table: string;
	relation: string;
	fields: IField[];
}

export interface IStructureTable {
	tableName: string;
	tableNum: number;
	fields: IField[];
}

export interface IField {
	autoFilled?: boolean;
	fieldName: string;
	fieldNumber: number;
	fieldType?: number;
	filterName?: string;
	indexed?: boolean;
	keywordIndexed?: boolean;
	mandatory?: boolean;
	name: string;
	type: string;
	kind: string;
	relation?: string;
	relatedDataClass?: string;
	inverseName?: string;
}

export interface ITabs{
	id?: string,
	name: string,
	fk_user: string,
	handle: string,
	type: number,
	default: boolean,
	detail: ITabsDetail;
	interface_user?: Partial<IUser>;
};

export interface ITabsDetail {
  defaultTab: number;
	tabs: ITabData[];
};

export interface ITabData {
	id: number;
	name: string;
	type: string;
	fieldNum: number;
	value: string;
	queryId: string;

	queryName?: string;
	fieldName?: string;
};

export interface IGridDefTab {
	id: number;
	name: string;
	type: string;
	fieldNum: number;
	value: string;
	queryId: string;
	fieldName: string;
	recordCount: number;
}

export interface IDataListButton {
  code: string;
  label?: string;
  icon?: string;
  enabled?: boolean;
  callback?: Function;
};

export interface INavData {
  name: string;
  url: string;
  icon: string;
  children?: INavData[];
};
